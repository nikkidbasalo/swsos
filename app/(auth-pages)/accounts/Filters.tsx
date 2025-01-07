import { CustomButton } from '@/components/index'
import { MagnifyingGlassIcon, TagIcon } from '@heroicons/react/20/solid'
import React, { useState } from 'react'

interface FilterDistrictTypes {
  setFilterKeyword: (keyword: string) => void
  setFilterStatus: (status: string) => void
  setFilterType: (status: string) => void
}

const Filters = ({
  setFilterKeyword,
  setFilterType,
  setFilterStatus
}: FilterDistrictTypes) => {
  const [keyword, setKeyword] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [type, setType] = useState<string>('')

  const handleApply = () => {
    if (
      keyword.trim() === '' &&
      type.trim() === '' &&
      selectedStatus.trim() === ''
    )
      return

    setFilterKeyword(keyword) // pass keyword to parent
    setFilterType(type) // pass keyword to parent
    setFilterStatus(selectedStatus) // pass keyword to parent
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (
      keyword.trim() === '' &&
      type.trim() === '' &&
      selectedStatus.trim() === ''
    )
      return

    setFilterKeyword(keyword) // pass keyword to parent
    setFilterType(type) // pass keyword to parent
    setFilterStatus(selectedStatus) // pass keyword to parent
  }

  // clear all filters
  const handleClear = () => {
    setFilterKeyword('')
    setKeyword('')
    setFilterType('')
    setType('')
    setFilterStatus('')
    setSelectedStatus('')
  }

  return (
    <div className="">
      <div className="flex items-center">
        <form onSubmit={handleSubmit} className="items-center">
          <div className="app__filter_container">
            <MagnifyingGlassIcon className="w-4 h-4 mr-1" />
            <input
              placeholder="Search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="app__filter_input"
            />
          </div>
          <div className="app__filter_container">
            <TagIcon className="w-4 h-4 mr-1 text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="app__filter_select"
            >
              <option value="">Choose Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="app__filter_container">
            <TagIcon className="w-4 h-4 mr-1 text-gray-500" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="app__filter_select"
            >
              <option value="">Choose Account Type</option>
              <option value="Scholar">Scholar</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
        </form>
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <CustomButton
          containerStyles="app__btn_green"
          title="Apply Filter"
          btnType="button"
          handleClick={handleApply}
        />
        <CustomButton
          containerStyles="app__btn_gray"
          title="Clear Filter"
          btnType="button"
          handleClick={handleClear}
        />
      </div>
    </div>
  )
}

export default Filters
