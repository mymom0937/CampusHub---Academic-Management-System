import { createFileRoute, Outlet } from '@tanstack/react-router'

/** Layout route for /admin/semesters/* — just passes through to child routes */
export const Route = createFileRoute('/admin/semesters')({
  component: () => <Outlet />,
})
