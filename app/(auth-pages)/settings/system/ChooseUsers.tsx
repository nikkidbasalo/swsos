/* eslint-disable react-hooks/exhaustive-deps */
import { ConfirmModal, UserBlock } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import type { Employee, UserAccessTypes } from '@/types'
import { logError } from '@/utils/fetchApi'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import uuid from 'react-uuid'

interface ChooseUsersProps {
  multiple: boolean
  type: string
  title: string
  users: UserAccessTypes[]
}

export default function ChooseUsers({
  multiple,
  type,
  users,
  title
}: ChooseUsersProps) {
  const [searchManager, setSearchManager] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [searchManagersResults, setSearchManagersResults] = useState<
    Employee[] | []
  >([])
  const [selectedManagers, setSelectedManagers] = useState<
    UserAccessTypes[] | []
  >([])

  const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false)

  const { systemUsers, supabase }: { systemUsers: Employee[]; supabase: any } =
    useSupabase()
  const { setToast } = useFilter()

  const router = useRouter()

  const handleSearchUser = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchManager('')

    setSearchManager(e.target.value)

    if (e.target.value.trim().length < 3) {
      setSearchManagersResults([])
      return
    }

    // Search user
    const searchWords = e.target.value.split(' ')
    const results = systemUsers.filter((user) => {
      // exclude already selected users
      if (
        selectedManagers.some(
          (obj) => obj.user_id.toString() === user.id.toString()
        )
      )
        return false

      const fullName =
        `${user.lastname} ${user.firstname} ${user.middlename}`.toLowerCase()
      return searchWords.every((word) => fullName.includes(word))
    })

    setSearchManagersResults(results)
  }

  const handleSelected = async (item: Employee) => {
    // Update database
    try {
      if (!multiple) {
        // delete existing recording first
        const { error } = await supabase
          .from('sws_system_access')
          .delete()
          .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)
          .eq('type', type)
        if (error) {
          void logError(
            'Remove user access',
            'sws_system_access',
            '',
            error.message
          )
          setToast(
            'error',
            'Error saving, please reload the page and try again.'
          )
        }
      }

      const insertData = {
        user_id: item.id,
        type,
        org_id: process.env.NEXT_PUBLIC_ORG_ID
      }
      const { error: error2 } = await supabase
        .from('sws_system_access')
        .insert(insertData)

      if (error2) {
        void logError(
          'Add user access',
          'sws_system_access',
          JSON.stringify(insertData),
          error2.message
        )
        setToast('error', 'Error saving, please reload the page and try again.')
      } else {
        // setSelectedManagers
        const newData = {
          sws_user: item,
          user_id: item.id,
          type
        }

        if (multiple) {
          const updatedData = [...selectedManagers, newData]
          setSelectedManagers(updatedData)
        } else {
          const updatedData = [newData]
          setSelectedManagers(updatedData)
        }

        setToast('success', 'Successfully saved')

        router.refresh()
      }
    } catch (err) {
      console.log(err)
    }

    // Resets
    setSearchManagersResults([])

    setSearchManager('')
  }

  const handleRemoveSelected = (id: string) => {
    setSelectedId(id)
    setShowConfirmRemoveModal(true)
  }

  const handleConfirmedRemove = async () => {
    // update database
    const { error } = await supabase
      .from('sws_system_access')
      .delete()
      .eq('user_id', selectedId)
      .eq('type', type)

    if (error) {
      void logError(
        'remove user access',
        'sws_system_access',
        '',
        error.message
      )
      setToast('error', 'Error saving, please reload the page and try again.')
    } else {
      const updatedItems = selectedManagers?.filter(
        (item: UserAccessTypes) => item.user_id.toString() !== selectedId
      )
      setSelectedManagers(updatedItems)
      setSelectedId('')
      setToast('success', 'Successfully saved')
    }

    setShowConfirmRemoveModal(false)
  }

  useEffect(() => {
    const managers = users.filter((user) => user.type === type)
    setSelectedManagers(managers)
  }, [])

  return (
    <div className="app__form_field_container">
      <div className="w-full">
        <div className="app__label_standard">{title}:</div>
        <div className="bg-white p-1 border border-gray-300 rounded-sm">
          <div className="space-x-2">
            {selectedManagers.map((item: UserAccessTypes) => (
              <div key={uuid()} className="mb-1 inline-flex">
                <span className="inline-flex items-center text-sm  border border-gray-400 rounded-sm px-1 bg-gray-300">
                  {item.sws_user.firstname} {item.sws_user.middlename}{' '}
                  {item.sws_user.lastname}
                  <XMarkIcon
                    onClick={() => handleRemoveSelected(item.user_id)}
                    className="w-4 h-4 ml-2 cursor-pointer"
                  />
                </span>
              </div>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search User"
              value={searchManager}
              onChange={async (e) => await handleSearchUser(e)}
              className="app__input_noborder"
            />

            {searchManagersResults.length > 0 && (
              <div className="app__search_user_results_container">
                {searchManagersResults.map((item: Employee, index) => (
                  <div
                    key={index}
                    onClick={async () => await handleSelected(item)}
                    className="app__search_user_results"
                  >
                    <UserBlock user={item} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {showConfirmRemoveModal && (
        <ConfirmModal
          header="Confirmation"
          btnText="Confirm"
          message="Are you sure you want to remove access for this user?"
          onConfirm={handleConfirmedRemove}
          onCancel={() => setShowConfirmRemoveModal(false)}
        />
      )}
    </div>
  )
}
