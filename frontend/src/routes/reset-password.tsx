import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'))

// 인증 가드를 두지 않는다 — 메일 링크의 복구 토큰으로 들어오는 경로이고,
// 세션 유무는 페이지 안에서 판단해 "링크 만료" 안내를 보여준다.
export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})
