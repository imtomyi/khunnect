# 교육과정 데이터 — 조사 결과와 스키마 설계

> **목적**: 42개 학과 교육과정을 채우기 전에, 실제 데이터가 어떻게 생겼는지
> 확인한 사실과 그에 맞는 스키마를 확정한다. 현재 모델은 실제 데이터를 담지
> 못하므로, 데이터 수집보다 **스키마 재설계가 선행**이다.
>
> 조사 최종: 2026-07-19

---

## 1. 실물 확인 — 컴퓨터공학과 2024 교육과정 요약표

출처: `ce.khu.ac.kr/.../2024 컴퓨터공학과 교육과정.pdf` (공식, pdftotext로 파싱)

### 졸업요건 기본구조표 (컴퓨터공학과 2024)

| 구분 | 졸업 이수학점 | 전공기초 | 전공필수 | 산학필수 | 전공선택 | 전공 계 |
|---|---|---|---|---|---|---|
| **단일전공** | 130 | 15 | 45 | 12 | 15 | 87 |
| **다전공** | — | 6 | 12 | — | 27 | 54(타전공인정 15 포함) |
| **부전공** | — | — | 15 | — | 6 | 21 |

### 이수구분 (실제)
```
전공기초 · 전공필수 · 산학필수 · 전공선택
```
→ 우리 스키마의 CHECK는 `전공기초/전공필수/전공선택` 3종뿐. **`산학필수` 누락.**

### 부가 졸업조건 (학번 조건부)
- **2008학번 이후**: 전공 영어강좌 3과목 이상 (편입 1과목)
- **2018학년도 이후 신입생**: SW교육 이수
- **졸업논문**: '졸업프로젝트' 이수로 갈음 (졸업논문(컴퓨터공학) 수강 필수)

---

## 2. 현재 스키마의 결함 (이대로는 못 담는다)

```sql
course_catalog(department_id, name, code, type, credits, admission_year)
  -- type CHECK: 전공기초|전공필수|전공선택  ← 산학필수 없음
  -- admission_year: 전부 NULL (연도 구분 미사용)
curriculum_requirements(department_id, basic_credits, required_credits, elective_credits)
  -- department당 1행  ← 연도별·전공유형별 요건 불가
```

| 실제 데이터 | 현재 모델 | 격차 |
|---|---|---|
| 이수구분 4종(산학필수 포함) | 3종 | ❌ CHECK 확장 필요 |
| 졸업 총 이수학점(130) | 없음 | ❌ 컬럼 없음 |
| 단일/다/부전공별 요건 | 단일 1세트만 | ❌ 구조 없음 |
| 입학년도별 교육과정 | dept당 1행 | ❌ 버전 개념 없음 |
| 영어강좌·SW·졸업논문 조건 | 없음 | ⚠️ 범위 밖(후순위) |

---

## 3. 결정된 방향

### D-CURRICULUM-1: 입학년도 범위 버전 (확정 2026-07-19)
"2020~2023 교육과정"처럼 **연도 구간**으로 버전을 묶는다. 개편 전까지 같은
과정을 공유하므로 과목 중복이 없고, 개편 시 새 버전만 추가한다.

### 제안 스키마 (미확정 — 검토 후 마이그레이션)
```sql
curriculum_versions(
  id, department_id,
  year_start, year_end,          -- year_end NULL = 현행
  total_credits,                 -- 졸업 총 이수학점 (예: 130)
  note                           -- 영어강좌/SW/졸업논문 등 부가조건 서술
)

course_catalog(
  version_id → curriculum_versions,   -- department_id 대신 version에 소속
  name, code,
  type CHECK IN (전공기초,전공필수,산학필수,전공선택),  -- 산학필수 추가
  credits, year, semester           -- 개설 학년/학기
)

curriculum_requirements(
  version_id → curriculum_versions,
  track CHECK IN (single, double, minor),   -- 단일/다/부전공
  basic, required, industry, elective       -- 산학필수 분리
)
```
학생 매칭: `user_majors.admission_year` ∈ `[year_start, year_end]` 인 버전 선택.

### 결정 완료 (2026-07-19)
- **D-C2 = 단일전공만 먼저.** 대부분 학생이 단일전공이고 종업요건이 가장 명확.
  다/부전공은 later (구조는 확장 가능하게 두되 데이터는 single만 시드).
- **D-C3 = 부가조건 구조화.** 영어강좌·SW교육·졸업논문을 체크 가능한 요건으로 모델링
  (학점이 아니라 'N과목 이수' / '이수 여부'라 별도 테이블).
- **D-C4**: 기존 소융 데이터(과목25·요건1행) 이관 — 마이그레이션에서 v1 버전으로 감쌈.

### D-C3 부가조건 모델 (구조화)
```sql
curriculum_extra_requirements(
  id, version_id → curriculum_versions,
  kind CHECK IN ('english_lecture','sw_education','thesis','other'),
  label,                 -- 화면 표시용 (예: '전공 영어강좌 3과목 이상')
  count_required INT,    -- 과목 수 요건 (영어강좌 3). 이수여부형은 NULL
  applies_from INT       -- 적용 시작 학번 (예: 2008, 2018). NULL = 전체
)
```
학점 요건과 분리해, `/curriculum`에서 체크박스/카운터로 표시.
`applies_from`으로 "2018학번 이후만" 같은 조건을 학생 admission_year와 대조.

---

## 4. 데이터 소스 (검증된 경로)

- 각 학과 **공식 교육과정 PDF** (예: `ce.khu.ac.kr/resources/.../2024 …교육과정.pdf`)
- `pdftotext -layout`로 표까지 정확히 추출됨 (WebFetch 요약은 파싱 실패 — 로컬 저장 후 pdftotext)
- 파일명·문서 제목에 **연도 명시** → 버전 판별 가능

### 42개 학과 수집 시 주의
- 학과마다 이수구분·학점 구조가 다를 수 있다 (산학필수 없는 학과도 있음)
- **틀린 졸업요건은 학생 졸업을 막는다** → 반드시 원본 PDF 대조, 추측 금지
- 규모: 42학과 × (현행+과거 버전) × 수십 과목 = 수천 행. 학과별로 나눠 진행.

---

## 5. 다음 행동
1. 스키마 재설계 확정 (D-C2·D-C3 결정)
2. `migrations/0007_curriculum_versions.sql` — 새 구조 + 기존 소융 데이터 이관 + test:db
3. 학과별 PDF 파싱 → 시드 (검증 가능한 학과부터: 소융/컴공)
4. `/curriculum`을 version 기반으로 리팩터 (학생 admission_year로 버전 매칭)
