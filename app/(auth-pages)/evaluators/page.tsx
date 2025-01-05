'use client'
import {
  Sidebar,
  TableRowLoading,
  Title,
  Unauthorized
} from '@/components/index'
import EvaluationSidebar from '@/components/Sidebars/EvaluationSidebar'
import TopBar from '@/components/TopBar'
import { superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { ProgramTypes, UserAccessTypes } from '@/types'
import { fetchPrograms } from '@/utils/fetchApi'
import React, { useEffect, useState } from 'react'

const Page: React.FC = () => {
  const { hasAccess } = useFilter()
  const { session, supabase } = useSupabase()

  const [programs, setPrograms] = useState<ProgramTypes[]>([])

  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<UserAccessTypes[]>([])

  const fetchData = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('sws_system_access')
        .select('*, sws_user:user_id(*)')
        .eq('type', 'evaluator')
        .order('id', { ascending: true })

      setList(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProgram = async (
    userId: string,
    programId: string,
    isChecked: boolean
  ) => {
    try {
      // Update in Supabase
      const userAccess: UserAccessTypes | undefined = list.find(
        (user: UserAccessTypes) => user.user_id === userId
      )
      if (!userAccess) return

      const updatedProgramIds = isChecked
        ? [...(userAccess.program_ids || []), programId] // Treat null as an empty array
        : (userAccess.program_ids || []).filter((id) => id !== programId) // Handle null safely

      // Update in Supabase
      const { error } = await supabase
        .from('sws_system_access')
        .update({ program_ids: updatedProgramIds })
        .eq('user_id', userId)

      if (error) throw new Error(error.message)

      // Update local state
      await fetchData()
    } catch (error) {
      console.error('Error updating program access:', error)
    }
  }

  // Featch data
  useEffect(() => {
    ;(async () => {
      const result = await fetchPrograms('', 999, 0)
      setPrograms(result.data)
    })()

    void fetchData()
  }, [])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (
    !hasAccess('staff') &&
    !hasAccess('settings') &&
    !superAdmins.includes(session.user.email)
  )
    return <Unauthorized />

  return (
    <>
      <Sidebar>
        <EvaluationSidebar />
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="Evaluators" />
          </div>

          {/* Main Content */}
          <div>
            <table className="app__table">
              <thead className="app__thead">
                <tr>
                  <th className="app__th pl-4"></th>
                  <th className="app__th pl-4">Evalator</th>
                  <th className="app_th">Program</th>
                </tr>
              </thead>
              <tbody>
                {!isDataEmpty &&
                  list.map((item, index) => (
                    <tr key={index} className="app__tr">
                      <th className="app__tdapp__th_firstcol"></th>
                      <td className="app__td">
                        <div className="space-y-1">
                          <div className="font-bold">
                            {item.sws_user?.lastname},{' '}
                            {item.sws_user?.firstname}{' '}
                            {item.sws_user?.middlename}
                          </div>
                        </div>
                      </td>
                      <td className="app_td">
                        <div>
                          {programs.map((program) => (
                            <div key={program.id}>
                              <label className="space-x-2">
                                <input
                                  type="checkbox"
                                  checked={(item.program_ids || []).includes(
                                    program.id
                                  )} // Ensure a boolean value
                                  onChange={(e) =>
                                    handleToggleProgram(
                                      item.user_id,
                                      program.id,
                                      e.target.checked
                                    )
                                  }
                                />
                                <span>{program.name}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                {loading && <TableRowLoading cols={3} rows={2} />}
              </tbody>
            </table>
            {!loading && isDataEmpty && (
              <div className="app__norecordsfound">No records found.</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
export default Page
