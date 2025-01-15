'use client'

import { useSupabase } from '@/context/SupabaseProvider'
import { AccountTypes, EvaluationPeriodTypes, GradeTypes } from '@/types'
import { useEffect, useState } from 'react'
import Title from '../Title'
import ProfileDetails from './ProfileDetails'
import ScholarDashboard from './ScholarDashboard'

export default function ProfileDashboard({
  userData,
  refresh
}: {
  userData: AccountTypes
  refresh: () => void
}) {
  //
  const [showEditModal, setShowEditModal] = useState(false)
  const [allowances, setAllowances] = useState<GradeTypes[] | []>([])
  const [periods, setPeriods] = useState<EvaluationPeriodTypes[] | []>([])

  const { supabase } = useSupabase()

  const handleEdit = () => {
    setShowEditModal(true)
  }

  useEffect(() => {
    ;(async () => {
      const { data: allowancesData } = await supabase
        .from('sws_grades')
        .select('*, period:evaluation_period_id(*)')
        .eq('user_id', userData.id)

      setAllowances(allowancesData)

      const { data: periodsData } = await supabase
        .from('sws_evaluation_periods')
        .select()

      setPeriods(periodsData)
    })()
  }, [])

  return (
    <>
      <div>
        <div className="app__title">
          <Title title="Profile" />
        </div>

        {/* Main Content */}
        <div className="w-full px-2 pt-4 bg-gray-100">
          <div className="container mx-auto p-2 lg:grid lg:grid-cols-1 lg:gap-2">
            <div className="px-2 mb-2 text-right">
              <span
                onClick={handleEdit}
                className="text-sm font-semibold text-blue-600 cursor-pointer"
              >
                Edit Profile
              </span>
            </div>
            <div className="">
              <ScholarDashboard refresh={refresh} userData={userData} />
            </div>
          </div>

          {/* Add/Edit Modal */}
          {showEditModal && (
            <ProfileDetails
              userData={userData}
              hideModal={() => setShowEditModal(false)}
              refresh={refresh}
            />
          )}
        </div>
      </div>
    </>
  )
}
