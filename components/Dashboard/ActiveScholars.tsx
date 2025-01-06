import { useSupabase } from '@/context/SupabaseProvider'
import { AccountTypes } from '@/types'

export default function ActiveScholars() {
  const {
    systemUsers,
    supabase
  }: { systemUsers: AccountTypes[]; supabase: any } = useSupabase()

  const count = systemUsers.filter(
    (user) =>
      user.type === 'Scholar' &&
      user.status === 'Active' &&
      user.program_id !== null
  ).length

  return (
    <div>
      <div className="text-sm font-bold">Active Scholars</div>
      <div className="text-4xl font-bold text-center">{count}</div>
    </div>
  )
}
