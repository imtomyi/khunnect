import { Suspense } from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import Footer from '../components/layout/Footer'

export const Route = createRootRoute({
  component: () => (
    <>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      <Footer />
    </>
  ),
})