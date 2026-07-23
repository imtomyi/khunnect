#!/usr/bin/env python3
r"""
한글 등 비ASCII가 섞인 SQL을 순수 ASCII로 변환한다.
클립보드→Supabase SQL Editor 붙여넣기에서 한글이 깨지는 문제(이 프로젝트의
반복 이슈)를 원천 차단하기 위해, 모든 문자열 리터럴을 Postgres 유니코드
이스케이프(U&'...')로 바꾼다. 출력은 100% ASCII라 어떤 인코딩 경로에서도
안전하며, Postgres가 실행 시 원래 한글로 복원한다.

사용:  python3 ascii_safe_sql.py input.sql > output.sql

변환 규칙:
- 작은따옴표 문자열 리터럴 중 비ASCII를 포함한 것만 U&'...'로 변환
- 비ASCII 문자 → \XXXX (BMP, 4 hex). BMP 밖(이모지 등)은 \+XXXXXX (6 hex)
- 리터럴 내 백슬래시 → \\  (U& 모드에서 \는 이스케이프 문자)
- 리터럴 내 작은따옴표 → '' (SQL 표준)
- 순수 ASCII 리터럴/주석/DDL은 그대로 둔다
"""
import re
import sys


def to_uescape(s: str) -> str:
    """문자열 s를 U&'...' 리터럴 본문(따옴표 제외)으로 변환."""
    out = []
    for ch in s:
        cp = ord(ch)
        if ch == "\\":
            out.append("\\\\")           # U& 모드에서 백슬래시는 이스케이프 → 두 번
        elif ch == "'":
            out.append("''")             # SQL 표준 따옴표 이스케이프
        elif 0x20 <= cp <= 0x7E:
            out.append(ch)               # 안전한 ASCII 인쇄 문자는 그대로
        elif cp <= 0xFFFF:
            out.append(f"\\{cp:04X}")    # BMP
        else:
            out.append(f"\\+{cp:06X}")   # BMP 밖
    return "".join(out)


# SQL 문자열 리터럴 토크나이저: '' 이스케이프를 포함해 리터럴 경계를 정확히 잡는다.
LITERAL_RE = re.compile(r"'(?:[^']|'')*'")


def strip_comments(sql: str) -> str:
    """문자열 리터럴 밖의 -- 라인 주석을 제거한다 (배포본 전용).
    리터럴 안의 '--'는 보존한다."""
    out = []
    i, n = 0, len(sql)
    in_str = False
    while i < n:
        ch = sql[i]
        if in_str:
            out.append(ch)
            if ch == "'":
                if i + 1 < n and sql[i + 1] == "'":   # '' 이스케이프
                    out.append(sql[i + 1]); i += 2; continue
                in_str = False
            i += 1
        else:
            if ch == "'":
                in_str = True; out.append(ch); i += 1
            elif ch == "-" and i + 1 < n and sql[i + 1] == "-":
                j = sql.find("\n", i)                 # 줄 끝까지 주석 제거
                i = n if j == -1 else j
            else:
                out.append(ch); i += 1
    # 빈 줄 정리
    lines = [ln.rstrip() for ln in "".join(out).splitlines()]
    return "\n".join(ln for ln in lines if ln.strip()) + "\n"


def convert(sql: str) -> str:
    def repl(m: re.Match) -> str:
        raw = m.group(0)
        inner = raw[1:-1].replace("''", "'")   # 실제 문자열 값 복원
        if all(ord(c) < 128 for c in inner):
            return raw                          # ASCII만이면 변환 불필요
        return "U&'" + to_uescape(inner) + "'"
    return LITERAL_RE.sub(repl, sql)


if __name__ == "__main__":
    src = sys.stdin.read() if len(sys.argv) < 2 else open(sys.argv[1], encoding="utf8").read()
    out = convert(strip_comments(src))
    # 안전 검증: 출력이 순수 ASCII인지 확인
    non_ascii = [(i, c) for i, c in enumerate(out) if ord(c) > 127]
    if non_ascii:
        sys.stderr.write(f"경고: 변환 후에도 비ASCII {len(non_ascii)}자 남음 (주석 등)\n")
    sys.stdout.write(out)
