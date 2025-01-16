'use client'

import { CustomButton } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import CsvReader from './CsvReader'

interface ModalProps {
  hideModal: () => void
}

interface ImportFormSchema {
  survey_id: string
  type: string
  barangay: string
}

export default function ImportModal({ hideModal }: ModalProps) {
  const { supabase } = useSupabase()
  const { setToast } = useFilter()
  const [importing, setImporting] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)

  // CSV Reader
  const [csvContents, setCsvContents] = useState<any>(null)

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit
  } = useForm<ImportFormSchema>({
    mode: 'onSubmit'
  })

  const onImportSubmit = async (formdata: ImportFormSchema) => {
    setImporting(true)

    if (csvContents) {
      let insertArray: any = []
      let id_number = ''
      let lastname = ''
      let firstname = ''
      let middlename = ''
      let year = ''
      let program = ''

      // process each row starting 2nd row
      csvContents.data.slice(1).forEach((item: any, i: number) => {
        id_number = item[1]
        lastname = item[2]
        firstname = item[3]
        middlename = item[4]
        year = item[5]
        program = item[6]

        //create insert array
        insertArray.push({
          id_number,
          lastname,
          firstname,
          middlename,
          year_level: year,
          program
        })
      })

      try {
        const { error: error2 } = await supabase
          .from('sws_students')
          .insert(insertArray)

        if (error2) {
          setToast(
            'error',
            'Something, went wrong (error2). Please check if csv has correct format.'
          )
          throw new Error(error2.message)
        }

        // pop up the success message
        setToast('success', 'Successfully saved.')

        hideModal()
      } catch (error) {
        console.error('error', error)
      }

      setImporting(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      hideModal()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapperRef])

  return (
    <>
      <div ref={wrapperRef} className="app__modal_wrapper">
        <div className="app__modal_wrapper2">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="text-md font-bold leading-normal text-gray-800 dark:text-gray-300">
                Import Survey Data
              </h5>
              <CustomButton
                containerStyles="app__btn_gray"
                title="Close"
                btnType="button"
                handleClick={hideModal}
              />
            </div>

            <div className="modal-body relative p-4 overflow-x-scroll">
              <form
                onSubmit={handleSubmit(onImportSubmit)}
                className="app__modal_body"
              >
                <div className="flex flex-col space-y-4">
                  <div className="md:grid gap-4 pt-4">
                    <CsvReader setCsvContents={setCsvContents} />
                    <div className="bg-yellow-100 border border-yellow-200 p-1 mt-1 text-xs">
                      You can download CSV template{' '}
                      <Link
                        href="/template.xlsx"
                        className="font-bold text-blue-600"
                      >
                        here.
                      </Link>
                    </div>
                    <div className="mt-2 text-center">
                      <CustomButton
                        containerStyles="app__btn_blue"
                        title="Import"
                        isDisabled={importing}
                        btnType="submit"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
