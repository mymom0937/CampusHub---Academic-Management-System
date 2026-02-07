import { createFileRoute, Outlet } from '@tanstack/react-router'

/** Layout route for /instructor/courses/* — just passes through to child routes */
export const Route = createFileRoute('/instructor/courses')({
  component: () => <Outlet />,
})
