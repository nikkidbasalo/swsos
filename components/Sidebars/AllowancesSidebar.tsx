'use client'
import { useSupabase } from '@/context/SupabaseProvider'
import { CurrencyDollarIcon } from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'

const AllowancesSidebar = () => {
  const currentRoute = usePathname()

  const { session } = useSupabase()

  return (
    <>
      <ul className="pt-8 mt-4 space-y-2 border-t border-gray-700">
        <li>
          <div className="flex items-center text-gray-500 items-centers space-x-1 px-2">
            <CurrencyDollarIcon className="w-4 h-4" />
            <span>Allowances</span>
          </div>
        </li>
      </ul>
    </>
  )
}

export default AllowancesSidebar
