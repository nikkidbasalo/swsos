'use client'
import { LoginBox, TopBarDark } from '@/components/index'
import { useSupabase } from '@/context/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
  const [isLoggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setLoggedIn(true)
        setLoading(false)
      } else {
        setLoggedIn(false)
        setLoading(false)
      }
    })()
  }, [router])
  return (
    <>
      <div className="app__home">
        {loading && (
          <div className="h-screen bg-gray-700 pb-10 pt-32 px-6 md:flex items-start md:space-x-4 justify-center"></div>
        )}
        {!loading && (
          <>
            <TopBarDark isGuest={isLoggedIn ? false : true} />
            <div className="h-screen bg-gray-700 pb-10 pt-32 px-6 md:flex items-start md:space-x-4 justify-center">
              {!isLoggedIn && <LoginBox />}
            </div>
          </>
        )}
        <div className="mt-auto bg-gray-800 p-4 text-white fixed bottom-0 w-full">
          <div className="text-white text-center text-xs">&copy; SWSOS</div>
        </div>
      </div>
    </>
  )
}
