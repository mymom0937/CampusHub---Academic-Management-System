import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '@/server/actions/auth.actions'
import { ROLE_DASHBOARD_PATHS } from '@/types/roles'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await getSession()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    // Redirect to role-specific dashboard
    throw redirect({ to: ROLE_DASHBOARD_PATHS[user.role] })
  },
  component: () => null,
})
