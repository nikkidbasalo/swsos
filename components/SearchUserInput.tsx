'use client'

import { useSupabase } from '@/context/SupabaseProvider'
import type { AccountTypes } from '@/types'
import { XMarkIcon } from '@heroicons/react/20/solid'
import React, { useEffect, useState } from 'react'
import UserBlock from './UserBlock'

interface PropTypes {
  classNames?: string
  isMultiple?: boolean
  clear?: boolean
  nonTeachingOnly?: boolean
  teachingOnly?: boolean
  handleSelectedUsers: (users: AccountTypes[] | []) => void
  selectedUsers?: AccountTypes[] | []
  excludedIds?: string[] | []
}

export default function SearchUserInput({
  classNames,
  isMultiple,
  clear,
  nonTeachingOnly,
  teachingOnly,
  handleSelectedUsers,
  selectedUsers,
  excludedIds
}: PropTypes) {
  const [searchHead, setSearchHead] = useState('')
  const [searchResults, setSearchResults] = useState<AccountTypes[] | []>([])
  const [selectedItems, setSelectedItems] = useState<AccountTypes[] | []>(
    selectedUsers ?? []
  )

  const { systemUsers }: { systemUsers: AccountTypes[] } = useSupabase()

  const handleSearchUser = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value
    setSearchHead(searchTerm)

    if (searchTerm.trim().length < 3) {
      setSearchResults([])
      return
    }

    // Search user
    const searchWords = e.target.value.split(' ')
    const results = systemUsers.filter((user) => {
      // exclude already selected users
      if (selectedItems.some((obj) => obj.id.toString() === user.id.toString()))
        return false

      // exclude excluded Ids from props
      if (excludedIds?.some((id) => id === user.id.toString())) return false

      const fullName =
        `${user.lastname} ${user.firstname} ${user.middlename}`.toLowerCase()
      return searchWords.every((word) => fullName.includes(word.toLowerCase()))
    })

    setSearchResults(results)
  }

  const handleSelected = (item: AccountTypes) => {
    if (isMultiple) {
      setSelectedItems([...selectedItems, item])
      handleSelectedUsers([...selectedItems, item])
    } else {
      setSelectedItems([item])
      handleSelectedUsers([item])
    }

    setSearchResults([])
    setSearchHead('')
  }
  const handleRemoveSelected = (id: string) => {
    const updatedData = selectedItems.filter((item) => item.id !== id)
    setSelectedItems(updatedData)
    handleSelectedUsers(updatedData)
  }

  useEffect(() => {
    // setSelectedItems([]) //commented this as it will cause problem on edit modals
  }, [clear])

  return (
    <div className={`app__selected_users_container ${classNames ?? ''}`}>
      {selectedItems.length > 0 &&
        selectedItems.map((item, index) => (
          <span key={index} className="app__selected_user">
            {item.firstname} {item.middlename} {item.lastname}
            <XMarkIcon
              onClick={() => handleRemoveSelected(item.id)}
              className="w-4 h-4 ml-2 cursor-pointer"
            />
          </span>
        ))}
      <div
        className={`${
          !isMultiple && selectedItems.length > 0 ? 'hidden' : ''
        } relative inline-flex w-full`}
      >
        <input
          type="text"
          placeholder="Search Name.."
          value={searchHead}
          onChange={async (e) => await handleSearchUser(e)}
          className="app__input_noborder"
        />

        {searchResults.length > 0 && (
          <div className="app__search_user_results_container">
            {searchResults.map((item: AccountTypes, index) => (
              <div
                key={index}
                onClick={() => handleSelected(item)}
                className="app__search_user_results"
              >
                <UserBlock user={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
