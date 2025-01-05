import { CustomButton } from '@/components/index'
import { InstituteTypes, ProgramTypes } from '@/types'
import { MagnifyingGlassIcon, TagIcon } from '@heroicons/react/20/solid'
import React, { useState } from 'react'

interface FilterTypes {
  setFilterKeyword: (keyword: string) => void
  setFilterProgram: (status: string) => void
  setFilterGender: (gender: string) => void
  setFilterYear: (year: string) => void
  setFilterInstitute: (year: string) => void
  programs: ProgramTypes[]
  institutes: InstituteTypes[]
}

const Filters = ({
  setFilterKeyword,
  setFilterProgram,
  setFilterGender,
  setFilterYear,
  setFilterInstitute,
  programs,
  institutes
}: FilterTypes) => {
  const [keyword, setKeyword] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [year, setYear] = useState<string>('')
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [selectedInstitute, setSelectedInstitute] = useState<string>('')

  const handleApply = () => {
    if (
      keyword.trim() === '' &&
      selectedProgram.trim() === '' &&
      selectedInstitute.trim() === '' &&
      gender.trim() === '' &&
      year.trim() === ''
    )
      return

    setFilterKeyword(keyword) // pass keyword to parent
    setFilterProgram(selectedProgram) // pass keyword to parent
    setFilterInstitute(selectedInstitute) // pass keyword to parent
    setFilterGender(gender) // pass  to parent
    setFilterYear(year) // pass  to parent
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (
      keyword.trim() === '' &&
      selectedProgram.trim() === '' &&
      selectedInstitute.trim() === '' &&
      gender.trim() === '' &&
      year.trim() === ''
    )
      return

    setFilterKeyword(keyword) // pass keyword to parent
    setFilterProgram(selectedProgram) // pass keyword to parent
    setFilterInstitute(selectedInstitute) // pass keyword to parent
    setFilterGender(gender) // pass  to parent
    setFilterYear(year) // pass  to parent
  }

  // clear all filters
  const handleClear = () => {
    setFilterKeyword('')
    setKeyword('')
    setFilterProgram('')
    setSelectedProgram('')
    setFilterInstitute('')
    setSelectedInstitute('')
    setFilterYear('')
    setYear('')
    setFilterGender('')
    setGender('')
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
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="app__filter_select"
            >
              <option value="">Choose Scholarship Program</option>
              {programs?.map((p, i) => (
                <option key={i} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="app__filter_container">
            <TagIcon className="w-4 h-4 mr-1 text-gray-500" />
            <select
              value={selectedInstitute}
              onChange={(e) => setSelectedInstitute(e.target.value)}
              className="app__filter_select"
            >
              <option value="">Choose Institute</option>
              {institutes?.map((p, i) => (
                <option key={i} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="app__filter_container">
            <TagIcon className="w-4 h-4 mr-1 text-gray-500" />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="app__filter_select"
            >
              <option value="">Choose Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="app__filter_container">
            <TagIcon className="w-4 h-4 mr-1 text-gray-500" />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="app__filter_select"
            >
              <option value="">Choose Year Level</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
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
