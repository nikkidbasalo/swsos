'use client'
import { Announcements, Jobs, TopBarDark } from '@/components/index'
import TrackerBox from '@/components/TrackerBox'
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
            <div className="bg-gray-700 pb-10 pt-32 px-6 md:flex items-start md:space-x-4 justify-center">
              <div className="bg-gray-100 p-4 rounded-lg border md:w-[420px] md:max-w-[420px]">
                <Jobs />
              </div>
              <div className="bg-gray-100 p-4 rounded-lg border mt-10 md:mt-0 md:max-w-[420px] lg:w-[620px] lg:max-w-[620px]">
                <Announcements />
              </div>
            </div>
            <div className="border-b">
              <TrackerBox />
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
