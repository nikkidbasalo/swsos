'use client'

import { useSupabase } from '@/context/SupabaseProvider'
import { AccountTypes, EvaluationPeriodTypes, GradeTypes } from '@/types'
import { format } from 'date-fns'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ProfileDetails from './ProfileDetails'

export default function ScholarDashboard({
  userData,
  refresh
}: {
  userData: AccountTypes
  refresh: () => void
}) {
  //
  const [showEditModal, setShowEditModal] = useState(false)
  const [allowances, setAllowances] = useState<GradeTypes[] | []>([])
  const [otherAccounts, setOtherAccounts] = useState<AccountTypes[] | []>([])
  const [periods, setPeriods] = useState<EvaluationPeriodTypes[] | []>([])

  const { supabase } = useSupabase()

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

      const { data: usersData } = await supabase
        .from('sws_users')
        .select('*,program:program_id(*)')
        .or(`id.eq.${userData.id},user_id.eq.${userData.id}`)

      setOtherAccounts(usersData)
    })()
  }, [])

  return (
    <>
      <div>
        {/* Main Content */}
        <div className="w-full px-2 pt-10">
          <div className="container mx-auto p-2 lg:grid lg:grid-cols-2 lg:gap-2">
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
                {userData.program_id && (
                  <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                    <div className="text-xs text-gray-500">
                      Scholarship Status
                    </div>
                    <div className="text-xs text-gray-700 font-bold">
                      {userData.status === 'Inactive' ? (
                        <span className="app__status_container_red">
                          Inactive
                        </span>
                      ) : (
                        <span className="app__status_container_green">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {userData.program_id && (
                <div className="items-center mt-4">
                  <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                    <div className="text-xs text-gray-500">Sex</div>
                    <div className="text-xs text-gray-700 font-bold">
                      {userData.gender}
                    </div>
                  </div>
                  <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                    <div className="text-xs text-gray-500">Birth Date</div>
                    <div className="text-xs text-gray-700 font-bold">
                      {userData.birthday}
                    </div>
                  </div>
                  <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                    <div className="text-xs text-gray-500">Age</div>
                    <div className="text-xs text-gray-700 font-bold">
                      {userData.age}
                    </div>
                  </div>
                  <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                    <div className="text-xs text-gray-500">Contact Number</div>
                    <div className="text-xs text-gray-700 font-bold">
                      {userData.contact_number}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {userData.program_id && (
              <>
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
                      <div className="text-xs text-gray-500">Programs</div>
                      <div className="text-xs text-gray-700 font-bold">
                        {otherAccounts?.map((user, i) => (
                          <div key={i}>{user.program?.name}</div>
                        ))}
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
                <div className="bg-white p-4 mb-4 rounded-md shadow-md text-gray-600">
                  <div className="text-sm font-semibold px-2 mb-2 text-gray-600">
                    Parents Information
                  </div>
                  <div className="items-center">
                    <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                      <div className="text-xs text-gray-500">Mother</div>
                      <div className="text-xs text-gray-700 font-bold">
                        {userData.mother} | {userData.mother_occupation}
                      </div>
                    </div>
                    <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                      <div className="text-xs text-gray-500">Father</div>
                      <div className="text-xs text-gray-700 font-bold">
                        {userData.father} | {userData.father_occupation}
                      </div>
                    </div>
                    <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                      <div className="text-xs text-gray-500">Guardian</div>
                      <div className="text-xs text-gray-700 font-bold">
                        {userData.guardian} | {userData.guardian_occupation}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 mb-4 rounded-md shadow-md text-gray-600">
                  <div className="text-sm font-semibold px-2 mb-2 text-gray-600">
                    SHS Information
                  </div>
                  <div className="items-center">
                    <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                      <div className="text-xs text-gray-500">
                        Senior High School
                      </div>
                      <div className="text-xs text-gray-700 font-bold">
                        {userData.shs} ({userData.shs_school_type}) |{' '}
                        {userData.shs_address} | {userData.shs_honor}
                      </div>
                    </div>
                    <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                      <div className="text-xs text-gray-500">
                        Requirements Submitted
                      </div>
                      <div className="text-xs text-gray-700 font-bold">
                        {userData.applicant?.file_path && (
                          <Link
                            href={`${userData.applicant?.file_path}`}
                            target="_blank"
                            className="text-blue-600 hover:underline"
                          >
                            {userData.applicant?.file_path.slice(-20)}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 mb-4 rounded-md shadow-md text-gray-600">
                  <div className="text-sm font-semibold px-2 mb-2 text-gray-600">
                    References Information
                  </div>
                  <div className="items-center">
                    <div className="inline-flex flex-col text-center px-2 space-y-2">
                      <div className="text-xs text-gray-500">Reference 1</div>
                      <div className="text-xs text-gray-700 font-bold">
                        {userData.reference_name_1} |{' '}
                        {userData.reference_address_1} |{' '}
                        {userData.reference_contact_1}
                      </div>
                    </div>
                  </div>
                  <div className="items-center mt-2">
                    <div className="inline-flex flex-col text-center px-2 space-y-2">
                      <div className="text-xs text-gray-500">Reference 2</div>
                      <div className="text-xs text-gray-700 font-bold">
                        {userData.reference_name_2} |{' '}
                        {userData.reference_address_2} |{' '}
                        {userData.reference_contact_2}
                      </div>
                    </div>
                  </div>
                  <div className="items-center mt-2">
                    <div className="inline-flex flex-col text-center px-2 space-y-2">
                      <div className="text-xs text-gray-500">Reference 3</div>
                      <div className="text-xs text-gray-700 font-bold">
                        {userData.reference_name_3} |{' '}
                        {userData.reference_address_3} |{' '}
                        {userData.reference_contact_3}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 mb-4 rounded-md shadow-md text-gray-600">
                  <div className="text-sm font-semibold px-2 mb-2 text-gray-600">
                    Evaluation History
                  </div>
                  <div>
                    <table className="app__table">
                      <thead className="app__thead">
                        <tr>
                          <th className="app__th">Evaluation Period</th>
                          <th className="app__th">Status</th>
                          <th className="app__th">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {periods
                          ?.filter(
                            (period) =>
                              !allowances?.some(
                                (allowance) =>
                                  allowance.evaluation_period_id === period.id
                              )
                          )
                          .map((item, index) => (
                            <tr key={index} className="app__tr">
                              <td className="app__td">{item.description}</td>
                              <td className="app__td">
                                <span className="app__status_orange">
                                  No Grades Submitted
                                </span>
                              </td>
                              <td className="app__td">
                                Deadline for grade submission:{' '}
                                {format(
                                  new Date(item.deadline),
                                  'MMMM dd, yyyy'
                                )}
                              </td>
                            </tr>
                          ))}
                        {allowances?.map((item, index) => (
                          <tr key={index} className="app__tr">
                            <td className="app__td">
                              {item.period.description} {item.period.year}
                            </td>
                            <td className="app__td">
                              {item.status === 'Passed' && (
                                <span className="app__status_green">
                                  Passed
                                </span>
                              )}
                              {item.status === 'For Evaluation' && (
                                <span className="app__status_orange">
                                  For&nbsp;Evaluation
                                </span>
                              )}
                              {item.status === 'Failed' && (
                                <span className="app__status_red">Failed</span>
                              )}
                            </td>
                            <td className="app__td">{item.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-4 mb-4 rounded-md shadow-md text-gray-600 col-span-2">
                  <div className="text-sm font-semibold px-2 mb-2 text-gray-600">
                    Allowances Released/Schedule
                  </div>
                  <div>
                    <table className="app__table">
                      <thead className="app__thead">
                        <tr>
                          <th className="app__th">Period</th>
                          <th className="app__th">Amount</th>
                          <th className="app__th">Release Schedule</th>
                          <th className="app__th">Requirements</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allowances?.map((item, index) => (
                          <tr key={index} className="app__tr">
                            <td className="app__td">
                              {item.period.description} {item.period.year}
                            </td>
                            <td className="app__td">
                              {Number(item.allowance).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}{' '}
                              {item.allowance_type}
                            </td>
                            <td className="app__td">
                              {item.period.release_schedule}
                            </td>
                            <td className="app__td">
                              <div className="tiptopeditor mt-2">
                                <div
                                  className="text-sm text-gray-600"
                                  dangerouslySetInnerHTML={{
                                    __html: item.period.requirements
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
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
