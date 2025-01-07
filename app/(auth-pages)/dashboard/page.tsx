/* eslint-disable @typescript-eslint/restrict-template-expressions */
'use client'
import { Sidebar } from '@/components/index'
import TwoColTableLoading from '@/components/Loading/TwoColTableLoading'
import { useSupabase } from '@/context/SupabaseProvider'
import { AccountTypes } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
  const { session, systemUsers } = useSupabase()
  const router = useRouter()

  const user: AccountTypes = systemUsers.find(
    (u: { id: string }) => u.id === session.user.id
  )

  useEffect(() => {
    if (user?.type === 'Scholar') {
      router.push(`/profile/${session.user.id}`)
    } else {
      router.push(`/`)
    }
  }, [user])

  return (
    <>
      <Sidebar>
        <></>
      </Sidebar>
      <div>
        <TwoColTableLoading />
      </div>
    </>
  )
}
