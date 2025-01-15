'use client'
import { Announcements, Jobs, TopBarDark } from '@/components/index'
import TrackerBox from '@/components/TrackerBox'
import { useSupabase } from '@/context/SupabaseProvider'
import { AccountTypes } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
  const [isLoggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()
  const router = useRouter()
  const [userData, setUserData] = useState<AccountTypes | null>(null)
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setLoggedIn(true)

        const { data: userData, error } = await supabase
          .from('sws_users')
          .select(
            '*, institute:institute_id(*),program:program_id(*),applicant:applicant_id(*)'
          )
          .eq('id', data.session.user.id)
          .limit(1)
          .maybeSingle()

        if (data) {
          setUserData(userData)
        }
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
        <TopBarDark isGuest={true} />
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
      </div>
    </>
  )

  // return (
  //   <>
  //     <div className="app__home">
  //       {loading && (
  //         <div className="h-screen bg-gray-700 pb-10 pt-32 px-6 md:flex items-start md:space-x-4 justify-center"></div>
  //       )}
  //       {!loading && (
  //         <>
  //           <TopBarDark isGuest={isLoggedIn ? false : true} />
  //           {!isLoggedIn && (
  //             <>
  //               <div className="bg-gray-700 pb-10 pt-32 px-6 md:flex items-start md:space-x-4 justify-center">
  //                 <div className="bg-gray-100 p-4 rounded-lg border md:w-[420px] md:max-w-[420px]">
  //                   <Jobs />
  //                 </div>
  //                 <div className="bg-gray-100 p-4 rounded-lg border mt-10 md:mt-0 md:max-w-[420px] lg:w-[620px] lg:max-w-[620px]">
  //                   <Announcements />
  //                 </div>
  //               </div>
  //               <div className="border-b">
  //                 <TrackerBox />
  //               </div>
  //             </>
  //           )}
  //           {isLoggedIn && (
  //             <>
  //               {userData?.type !== 'Scholar' && (
  //                 <>
  //                   <div className="bg-gray-700 h-screen pb-10 pt-32 px-6 md:flex items-start md:space-x-4 justify-center">
  //                     <div className="bg-gray-100 p-4 rounded-lg border md:w-[420px] md:max-w-[420px] lg:w-[620px] lg:max-w-[620px]">
  //                       <ChartYearLevel />
  //                     </div>
  //                     <div className="mt-10 grid grid-cols-2 gap-2 md:mt-0 md:max-w-[420px] lg:w-[620px] lg:max-w-[620px]">
  //                       <div className="p-4 bg-gray-100 text-gray-800 rounded-lg border">
  //                         <ActiveScholars />
  //                       </div>
  //                       <div className="p-4 bg-gray-100 text-gray-800 rounded-lg border">
  //                         <AllowanceReleased />
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </>
  //               )}
  //               {userData?.type === 'Scholar' && (
  //                 <div className="bg-gray-700 pb-20 pt-10 px-6">
  //                   <ScholarDashboard
  //                     refresh={() => setRefresh(!refresh)}
  //                     userData={userData}
  //                   />
  //                 </div>
  //               )}
  //             </>
  //           )}
  //         </>
  //       )}
  //       <div className="mt-auto bg-gray-800 p-4 text-white fixed bottom-0 w-full">
  //         <div className="text-white text-center text-xs">&copy; SWSOS</div>
  //       </div>
  //     </div>
  //   </>
  // )
}
