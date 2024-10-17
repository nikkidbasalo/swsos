/* eslint-disable @typescript-eslint/restrict-template-expressions */
'use client'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { HomeIcon, UserIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

const MainMenu = () => {
  const { hasAccess } = useFilter()
  const { session }: { session: any } = useSupabase()

  return (
    <div className="py-1 relative">
      <div className="px-6 mt-2 text-gray-700 text-xl font-semibold">Menu</div>
      <div className="px-4 py-2 overflow-y-auto h-[calc(100vh-170px)]">
        <div className="lg:flex lg:space-x-2 lg:space-y-0 space-y-2 justify-center lg:flex-row-reverse">
          <div className="px-2 py-4 lg:w-96 border text-gray-600 rounded-lg bg-white shadow-md flex flex-col space-y-2">
            <Link href="/modules">
              <div className="app__menu_item">
                <div className="pt-1">
                  <HomeIcon className="w-8 h-8" />
                </div>
                <div>
                  <div className="app__menu_item_label">Modules</div>
                  <div className="app__menu_item_label_description">
                    Scholarship Programs
                  </div>
                </div>
              </div>
            </Link>
            <div className="pt-4">
              <hr />
            </div>
            {hasAccess('settings') && (
              <>
                <Link href="/settings/system">
                  <div className="app__menu_item">
                    <div className="pt-1">
                      <UserIcon className="w-8 h-8" />
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
