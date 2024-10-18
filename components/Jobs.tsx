import { useSupabase } from '@/context/SupabaseProvider'
import type { ProgramTypes } from '@/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Jobs() {
  const { supabase } = useSupabase()
  const [list, setList] = useState<ProgramTypes[]>([])

  const fetchData = async () => {
    try {
      const { data } = await supabase
        .from('sws_programs')
        .select()
        .eq('allow_applicants', true)

      setList(data)
    } catch (e) {
      console.error(e)
    }
  }

  // Featch data
  useEffect(() => {
    setList([])
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="">
      <h4 className="text-lg font-semibold mb-6">Apply For Scholarship</h4>
      {list.length > 0 &&
        list.map((item, index) => (
          <div key={index} className="flex items-start text-sm space-x-4 mb-8">
            <div>{index + 1}.</div>
            <div className="flex flex-col space-y-1">
              <div className="font-bold">{item.name}</div>
              <div className="text-sm">{item.description}</div>
              <div className="pt-2">
                <Link href={`/apply/${item.id}`} className="app__btn_green">
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
