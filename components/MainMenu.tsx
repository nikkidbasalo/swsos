/* eslint-disable @typescript-eslint/restrict-template-expressions */
'use client'
import { useFilter } from '@/context/FilterContext'
import {
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ListBulletIcon,
  TableCellsIcon,
  UserIcon
} from '@heroicons/react/20/solid'
import Link from 'next/link'

const MainMenu = () => {
  const { hasAccess } = useFilter()

  if (!hasAccess) {
    return
  }

  return (
    <div className="py-1 relative">
      <div className="px-6 mt-2 text-gray-700 text-xl font-semibold">Menu</div>
      <div className="px-4 py-2 overflow-y-auto h-[calc(100vh-170px)]">
        <div className="lg:flex lg:space-x-2 lg:space-y-0 space-y-2 justify-center lg:flex-row-reverse">
          <div className="px-2 py-4 lg:w-96 border text-gray-600 rounded-lg bg-white shadow-md flex flex-col space-y-2">
            <Link href="/">
              <div className="app__menu_item">
                <div className="pt-1">
                  <ChartBarIcon className="w-8 h-8" />
                </div>
                <div>
                  <div className="app__menu_item_label">Dashboard</div>
                  <div className="app__menu_item_label_description">
                    Dashboard
                  </div>
                </div>
              </div>
            </Link>
            {(hasAccess('settings') || hasAccess('staff')) && (
              <Link href="/modules">
                <div className="app__menu_item">
                  <div className="pt-1">
                    <AcademicCapIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="app__menu_item_label">Modules</div>
                    <div className="app__menu_item_label_description">
                      Scholarship Programs
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {(hasAccess('settings') || hasAccess('staff')) && (
              <Link href="/applications">
                <div className="app__menu_item">
                  <div className="pt-1">
                    <TableCellsIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="app__menu_item_label">Applications</div>
                    <div className="app__menu_item_label_description">
                      Scholarship Applications
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {(hasAccess('settings') ||
              hasAccess('staff') ||
              hasAccess('evaluator')) && (
              <Link href="/evaluationdashboard">
                <div className="app__menu_item">
                  <div className="pt-1">
                    <ListBulletIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="app__menu_item_label">
                      Evaluation & Monitoring
                    </div>
                    <div className="app__menu_item_label_description">
                      Evaluation & Monitoring
                    </div>
                  </div>
                </div>
              </Link>
            )}
            {(hasAccess('settings') || hasAccess('staff')) && (
              <Link href="/liquidations">
                <div className="app__menu_item">
                  <div className="pt-1">
                    <TableCellsIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="app__menu_item_label">Liquidations</div>
                    <div className="app__menu_item_label_description">
                      Liquidations
                    </div>
                  </div>
                </div>
              </Link>
            )}
            <div className="pt-4">
              <hr />
            </div>
            {hasAccess('settings') && (
              <>
                <Link href="/accounts">
                  <div className="app__menu_item">
                    <div className="pt-1">
                      <UserIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="app__menu_item_label">User Accounts</div>
                      <div className="app__menu_item_label_description">
                        User Accounts
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href="/settings/system">
                  <div className="app__menu_item">
                    <div className="pt-1">
                      <Cog6ToothIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="app__menu_item_label">
                        System Settings
                      </div>
                      <div className="app__menu_item_label_description">
                        System Access and Permissions
                      </div>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default MainMenu
