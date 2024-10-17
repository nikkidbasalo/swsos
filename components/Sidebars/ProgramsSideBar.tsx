'use client'
import { programsTypes } from '@/constants'
import { AcademicCapIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const ProgramsSideBar = () => {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') // Get the "page" query parameter

  return (
    <>
      <ul className="pt-8 mt-4 space-y-2 border-t border-gray-700">
        <li>
          <div className="flex items-center text-gray-500 items-centers space-x-1 px-2">
            <AcademicCapIcon className="w-4 h-4" />
            <span>Modules</span>
          </div>
        </li>
        {Object.entries(programsTypes).map(([key, value]) => (
          <li key={key}>
            <Link
              href={`/programs?type=${key}`}
              className={`app__menu_link !text-xs ${
                type === key ? 'app_menu_link_active' : ''
              }`}
            >
              <span className="flex-1 ml-3 whitespace-nowrap">{value}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export default ProgramsSideBar
