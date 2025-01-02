/* eslint-disable @typescript-eslint/restrict-template-expressions */
'use client'
import { Sidebar } from '@/components/index'
import TwoColTableLoading from '@/components/Loading/TwoColTableLoading'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  router.push(`/`)

  return (
    <>
      <Sidebar>
        <></>
      </Sidebar>
      <div>
        <TwoColTableLoading />
      </div>
    </>
  )
}
