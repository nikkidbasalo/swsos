'use client'
import { useSupabase } from '@/context/SupabaseProvider'
import { Cog6ToothIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SettingsSideBar = () => {
  const currentRoute = usePathname()

  const { session } = useSupabase()

  return (
    <>
      <ul className="pt-8 mt-4 space-y-2 border-t border-gray-700">
        <li>
          <div className="flex items-center text-gray-500 items-centers space-x-1 px-2">
            <Cog6ToothIcon className="w-4 h-4" />
            <span>Homepage</span>
          </div>
        </li>
        <li>
          <Link
            href="/settings/announcements"
            className={`app__menu_link ${
              currentRoute === '/settings/announcements'
                ? 'app_menu_link_active'
                : ''
            }`}
          >
            <span className="flex-1 ml-3 whitespace-nowrap">Announcements</span>
          </Link>
        </li>
        <li>
          <Link
            href="/settings/institutes"
            className={`app__menu_link ${
              currentRoute === '/settings/institutes'
                ? 'app_menu_link_active'
                : ''
            }`}
          >
            <span className="flex-1 ml-3 whitespace-nowrap">Institutes</span>
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
            href="/accounts"
            className={`app__menu_link ${
              currentRoute === '/accounts' ? 'app_menu_link_active' : ''
            }`}
          >
            <span className="flex-1 ml-3 whitespace-nowrap">User Accounts</span>
          </Link>
        </li>
        <li>
          <Link
            href="/settings/system"
            className={`app__menu_link ${
              currentRoute === '/settings/system' ? 'app_menu_link_active' : ''
            }`}
          >
            <span className="flex-1 ml-3 whitespace-nowrap">System Access</span>
          </Link>
        </li>
        {session.user.email === 'berlcamp@gmail.com' && (
          <li>
            <Link
              href="/settings/errorlogs"
              className={`app__menu_link ${
                currentRoute === '/settings/errorlogs'
                  ? 'app_menu_link_active'
                  : ''
              }`}
            >
              <span className="flex-1 ml-3 whitespace-nowrap">Error Logs</span>
            </Link>
          </li>
        )}
      </ul>
    </>
  )
}

export default SettingsSideBar
