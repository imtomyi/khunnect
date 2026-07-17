// ════════════════════════════════════════════════════════════════
// mapMajors / formatDepartments 검증
//   npm run test:majors
//
// 핵심: Supabase 조인은 순서를 보장하지 않는다. 정렬이 없으면 복수전공자의
// 학과가 조회마다 뒤바뀌므로 "주전공이 먼저"를 반드시 지켜야 한다.
// ════════════════════════════════════════════════════════════════
import { mapMajors, formatDepartments } from '../majors'

let pass = 0
let fail = 0
const check = (name: string, cond: boolean, detail = '') => {
  if (cond) {
    pass++
    console.log(`✅ ${name}`)
  } else {
    fail++
    console.log(`❌ ${name} ${detail}`)
  }
}

// ── 피그마의 김성백 케이스: '산업디자인학과, 경제학과 · 2022년 졸업' ──
// 조인이 복수전공을 먼저 돌려주는 상황을 재현한다
const shuffled = [
  { type: 'double_major', graduation_year: 2022, departments: { name: '경제학과' } },
  { type: 'major', graduation_year: 2022, departments: { name: '산업디자인학과' } },
]
const r = mapMajors(shuffled)
check('복수전공 둘 다 보존', r.departments.length === 2, JSON.stringify(r.departments))
check('주전공이 먼저 (조인 순서 무시)', r.departments[0] === '산업디자인학과', r.departments[0])
check(
  '피그마와 동일 표기',
  formatDepartments(r.departments) === '산업디자인학과, 경제학과',
  String(formatDepartments(r.departments)),
)
check('졸업연도 추출', r.graduationYear === 2022)

// ── 주 > 복수 > 부 우선순위 ──
const three = mapMajors([
  { type: 'minor', departments: { name: 'C' } },
  { type: 'double_major', departments: { name: 'B' } },
  { type: 'major', graduation_year: 2023, departments: { name: 'A' } },
])
check('주>복수>부 정렬', three.departments.join(',') === 'A,B,C', three.departments.join(','))

// ── 엣지 케이스 ──
check(
  '단일 전공',
  mapMajors([{ type: 'major', graduation_year: 2021, departments: { name: 'X' } }]).departments.join('') === 'X',
)
check('빈 배열', mapMajors([]).departments.length === 0)
check('null 안전', mapMajors(null).departments.length === 0)
check('undefined 안전', mapMajors(undefined).departments.length === 0)
check(
  '객체(비배열) 형태',
  mapMajors({ type: 'major', departments: { name: 'Y' } }).departments[0] === 'Y',
)
check('학과명 없는 행 제외', mapMajors([{ type: 'major', departments: null }]).departments.length === 0)
check('빈 배열 표기는 undefined', formatDepartments([]) === undefined)
check(
  '주전공에 졸업연도 없으면 다음 유효값 사용',
  mapMajors([
    { type: 'major', departments: { name: 'A' } },
    { type: 'minor', graduation_year: 2020, departments: { name: 'B' } },
  ]).graduationYear === 2020,
)
check(
  '알 수 없는 type은 뒤로 정렬',
  mapMajors([
    { type: 'unknown_type', departments: { name: 'Z' } },
    { type: 'major', departments: { name: 'A' } },
  ]).departments.join(',') === 'A,Z',
)

console.log(`\n총 ${pass + fail} · 통과 ${pass} · 실패 ${fail}`)
console.log(fail === 0 ? '🎉 전공 매핑 정상' : '⚠️ 실패 존재')
process.exit(fail === 0 ? 0 : 1)
