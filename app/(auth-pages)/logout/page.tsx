/* eslint-disable @typescript-eslint/restrict-template-expressions */
'use client'
import { Sidebar } from '@/components'
import TwoColTableLoading from '@/components/Loading/TwoColTableLoading'
import { useSupabase } from '@/context/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
  const { supabase, session, systemUsers } = useSupabase()
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (!error) {
      //   // router.push(`/profile/${signInData.user.id}`)
      await supabase.auth.refreshSession()
      router.push('/')
    }
  }

  useEffect(() => {
    void handleLogout()
  }, [])

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
