import { FilterProvider } from '@/context/FilterContext'
import SupabaseProvider from '@/context/SupabaseProvider'
import { Providers } from '@/GlobalRedux/provider'
import SupabaseListener from '@/utils/supabase-listener'
import { createServerClient } from '@/utils/supabase-server'
import { Toaster } from 'react-hot-toast'
import 'server-only'
import './globals.css'

import type { Employee, UserAccessTypes } from '@/types'
import { logError } from '@/utils/fetchApi'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TCGC SWSOS',
  description: 'TCGC SWSOS'
}

// do not cache this layout
export const revalidate = 0

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()

  const {
    data: { session }
  } = await supabase.auth.getSession()

  let sysUsers: Employee[] | null = []
  let sysAccess: UserAccessTypes[] | null = []

  if (session) {
    try {
      const { data: systemAccess, error } = await supabase
        .from('sws_system_access')
        .select('*, sws_user:user_id(id,firstname,lastname,middlename)')

      if (error) {
        void logError(
          'root layout system access',
          'sws_system_access',
          '',
          error.message
        )
        throw new Error(error.message)
      }

      const { data: systemUsers, error: error2 } = await supabase
        .from('sws_users')
        .select()
        .eq('status', 'Active')

      if (error2) {
        void logError('root layout users', 'sws_users', '', error2.message)
        throw new Error(error2.message)
      }

      sysAccess = systemAccess
      sysUsers = systemUsers
    } catch (err) {
      return 'Something went wrong, please contact the system administrator.'
    }
  }

  return (
    <html lang="en">
      <body className={`relative ${session ? 'bg-white' : 'bg-gray-100'}`}>
        <SupabaseProvider
          systemAccess={sysAccess}
          session={session}
          systemUsers={sysUsers}
        >
          <SupabaseListener serverAccessToken={session?.access_token} />
          {!session && <>{children}</>}
          {session && (
            <Providers>
              <FilterProvider>
                <Toaster />
                {children}
              </FilterProvider>
            </Providers>
          )}
        </SupabaseProvider>
      </body>
    </html>
  )
}
