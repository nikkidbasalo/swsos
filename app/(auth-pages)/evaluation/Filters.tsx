import { CustomButton } from '@/components/index'
import { useSupabase } from '@/context/SupabaseProvider'
import { ProgramTypes, UserAccessTypes } from '@/types'
import { fetchPrograms } from '@/utils/fetchApi'
import { MagnifyingGlassIcon, TagIcon } from '@heroicons/react/20/solid'
import React, { useEffect, useState } from 'react'

interface FilterDistrictTypes {
  setFilterKeyword: (keyword: string) => void
  setFilterProgram: (status: string) => void
}

const Filters = ({
  setFilterKeyword,
  setFilterProgram
}: FilterDistrictTypes) => {
  const [keyword, setKeyword] = useState<string>('')
  const [selectedProgram, setSelectedProgram] = useState<string>('')

  const [programs, setPrograms] = useState<ProgramTypes[]>([])

  const { session, systemAccess } = useSupabase()
  const userAccess: UserAccessTypes | undefined = systemAccess.find(
    (user: UserAccessTypes) => user.user_id === session.user.id
  )

  const handleApply = () => {
    if (keyword.trim() === '' && selectedProgram.trim() === '') return

    setFilterKeyword(keyword) // pass keyword to parent
    setFilterProgram(selectedProgram) // pass keyword to parent
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (keyword.trim() === '' && selectedProgram.trim() === '') return

    setFilterKeyword(keyword) // pass keyword to parent
    setFilterProgram(selectedProgram) // pass keyword to parent
  }

  // clear all filters
  const handleClear = () => {
    setFilterKeyword('')
    setKeyword('')
    setFilterProgram('')
    setSelectedProgram('')
  }

  // Featch data
  useEffect(() => {
    ;(async () => {
      const result = await fetchPrograms('', 999, 0)

      if (userAccess && userAccess.program_ids) {
        const filterResult = result.data.filter((program: ProgramTypes) =>
          (userAccess.program_ids || []).includes(program.id)
        )
        setPrograms(filterResult)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
