'use client'

import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { AccountTypes } from '@/types'
import Title from '../Title'

export default function ProfileDashboard({
  userData
}: {
  userData: AccountTypes
}) {
  const { supabase, session } = useSupabase()
  const { setToast } = useFilter()

  return (
    <>
      <div>
        <div className="app__title">
          <Title title="Scholar Profile" />
        </div>

        {/* Main Content */}
        <div className="w-full px-2 pt-4 bg-gray-100">
          <div className="container mx-auto p-2 lg:grid lg:grid-cols-1 lg:gap-2">
            <div className="bg-white p-4 mb-4 rounded-md shadow-md text-gray-600">
              <div className="text-sm font-semibold px-2 mb-2 text-gray-600">
                Personal Information
              </div>
              <div className="items-center">
                <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="text-xs text-gray-700 font-bold">
                    {userData.lastname} {userData.firstname}{' '}
                    {userData.middlename}
                  </div>
                </div>
                <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="text-xs text-gray-700 font-bold">
                    {userData.email}
                  </div>
                </div>
                <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                  <div className="text-xs text-gray-500">Gender</div>
                  <div className="text-xs text-gray-700 font-bold">
                    {userData.gender}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 mb-4 rounded-md shadow-md text-gray-600">
              <div className="text-sm font-semibold px-2 mb-2 text-gray-600">
                Program Availed
              </div>
              <div className="items-center">
                <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                  <div className="text-xs text-gray-500">Institute</div>
                  <div className="text-xs text-gray-700 font-bold">
                    {userData.institute?.name}
                  </div>
                </div>
                <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                  <div className="text-xs text-gray-500">Program</div>
                  <div className="text-xs text-gray-700 font-bold">
                    {userData.program?.name}
                  </div>
                </div>
                <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                  <div className="text-xs text-gray-500">Year Level</div>
                  <div className="text-xs text-gray-700 font-bold">
                    {userData.year_level_status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
