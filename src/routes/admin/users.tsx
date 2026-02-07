import { createFileRoute, Outlet } from '@tanstack/react-router'

/** Layout route for /admin/users/* — just passes through to child routes */
export const Route = createFileRoute('/admin/users')({
  component: () => <Outlet />,
})
