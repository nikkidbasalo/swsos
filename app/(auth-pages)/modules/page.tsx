'use client'
import {
  ProgramsSideBar,
  Sidebar,
  Title,
  Unauthorized
} from '@/components/index'
import TopBar from '@/components/TopBar'
import { superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import Link from 'next/link'

const Page: React.FC = () => {
  const { hasAccess } = useFilter()
  const { session } = useSupabase()

  // Check access from permission settings or Super Admins
  if (
    !hasAccess('staff') &&
    !hasAccess('settings') &&
    !superAdmins.includes(session.user.email)
  )
    return <Unauthorized />

  return (
    <>
      <Sidebar>
        <ProgramsSideBar />
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="Modules" />
          </div>

          <div className="app__content pb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/programs?type=academic"
                className="bg-gray-700 p-4 text-white font-medium text-lg uppercase rounded-xl"
              >
                Academic Scholarship Program
              </Link>
              <Link
                href="/programs?type=lgu-funded"
                className="bg-gray-700 p-4 text-white font-medium text-lg uppercase rounded-xl"
              >
                LGU-funded Scholarship Program
              </Link>
              <Link
                href="/programs?type=internal-grant"
                className="bg-gray-700 p-4 text-white font-medium text-lg uppercase rounded-xl"
              >
                Internal Grant-in-Aid Program
              </Link>
              <Link
                href="/programs?type=external-grant"
                className="bg-gray-700 p-4 text-white font-medium text-lg uppercase rounded-xl"
              >
                External Grant-in-Aid Program
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default Page
