import { useNavigate } from '@tanstack/react-router'
import { getSession } from '@/server/actions/auth.actions'
import type { SessionUser } from '@/types/dto'
import { ROLE_DASHBOARD_PATHS } from '@/types/roles'

/** Hook to get current user session - call from route loaders */
export async function fetchSession(): Promise<SessionUser | null> {
  return getSession()
}

/** Redirect to role-based dashboard */
export function useDashboardRedirect() {
  const navigate = useNavigate()

  return (user: SessionUser) => {
    const path = ROLE_DASHBOARD_PATHS[user.role] || '/dashboard'
    navigate({ to: path })
  }
}
