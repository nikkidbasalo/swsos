'use client'
import { useSupabase } from '@/context/SupabaseProvider'
import { AcademicCapIcon } from '@heroicons/react/20/solid'
import { Cog6ToothIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const EvaluationSidebar = () => {
  const currentRoute = usePathname()

  const { session } = useSupabase()

  return (
    <>
      <ul className="pt-8 mt-4 space-y-2 border-t border-gray-700">
        <li>
          <div className="flex items-center text-gray-500 items-centers space-x-1 px-2">
            <AcademicCapIcon className="w-4 h-4" />
            <span>Evaluation & Monitoring</span>
          </div>
        </li>
        <li>
          <Link
            href="/evaluation"
            className={`app__menu_link ${
              currentRoute === '/evaluation' ? 'app_menu_link_active' : ''
            }`}
          >
            <span className="flex-1 ml-3 whitespace-nowrap">Evaluations</span>
          </Link>
        </li>
        <li className="pt-5">
          <div className="flex items-center text-gray-500 items-centers space-x-1 px-2">
            <Cog6ToothIcon className="w-4 h-4" />
            <span>Settings</span>
          </div>
        </li>
        <li>
          <Link
            href="/evaluationperiods"
            className={`app__menu_link ${
              currentRoute === '/evaluationperiods'
                ? 'app_menu_link_active'
                : ''
            }`}
          >
            <span className="flex-1 ml-3 whitespace-nowrap">
              Evaluation Periods
            </span>
          </Link>
        </li>
      </ul>
    </>
  )
}

export default EvaluationSidebar
