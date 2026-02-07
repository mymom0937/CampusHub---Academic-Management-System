import { createFileRoute, Outlet } from '@tanstack/react-router'

/** Layout route for /admin/courses/* — just passes through to child routes */
export const Route = createFileRoute('/admin/courses')({
  component: () => <Outlet />,
})
