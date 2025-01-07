'use client'

import { AccountTypes } from '@/types'
import Link from 'next/link'
import { useState } from 'react'
import Title from '../Title'
import ProfileDetails from './ProfileDetails'

export default function ProfileDashboard({
  userData,
  refresh
}: {
  userData: AccountTypes
  refresh: () => void
}) {
  //
  const [showEditModal, setShowEditModal] = useState(false)

  const handleEdit = () => {
    setShowEditModal(true)
  }
  return (
    <>
      <div>
        <div className="app__title">
          <Title title="Scholar Profile" />
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
                Other Information
              </div>
              <div className="items-center">
                <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                  <div className="text-xs text-gray-500">Reference 1</div>
                  <div className="text-xs text-gray-700 font-bold">
                    {userData.reference_name_1} | {userData.reference_address_1}{' '}
                    | {userData.reference_contact_1}
                  </div>
                </div>
                <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                  <div className="text-xs text-gray-500">Reference 2</div>
                  <div className="text-xs text-gray-700 font-bold">
                    {userData.reference_name_2} | {userData.reference_address_2}{' '}
                    | {userData.reference_contact_2}
                  </div>
                </div>
                <div className="inline-flex flex-col text-center border-r px-2 space-y-2">
                  <div className="text-xs text-gray-500">Reference 3</div>
                  <div className="text-xs text-gray-700 font-bold">
                    {userData.reference_name_3} | {userData.reference_address_3}{' '}
                    | {userData.reference_contact_3}
                  </div>
                </div>
              </div>
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
