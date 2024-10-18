'use client'
import { TopBarDark } from '@/components'
import { useSupabase } from '@/context/SupabaseProvider'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page({ params }: { params: { id: string } }) {
  const programId = params.id
  const [isLoggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setLoggedIn(true)
        setLoading(false)
      } else {
        setLoggedIn(false)
        setLoading(false)
      }
    })()
  }, [router])

  return (
    <div className="app__home">
      <TopBarDark isGuest={isLoggedIn ? false : true} />
      <div className="h-auto bg-gray-700 pb-10 pt-20 px-6 md:flex items-start md:space-x-4 justify-center">
        <div className="bg-white mx-1 w-full md:w-[700px] rounded-lg border mb-20">
          <table className="w-full">
            <tbody>
              <tr>
                <td colSpan={2} className="relative text-center">
                  <div className="flex items-center justify-center">
                    <div className="">
                      <Image
                        src="/tcgc_logo.png"
                        alt=""
                        width={100}
                        height={100}
                      />
                    </div>
                  </div>
                  <div className="text-base font-bold uppercase">
                    Tangub City Global College
                  </div>
                  <div className="text-base font-bold uppercase">
                    Scholarship and Welfare Office
                  </div>
                  <div className="text-xs">
                    Lot 289, J. Luna St., Maloro, Tangub City, Misamis
                    Occidental 7214
                  </div>
                  <div className="text-xl font-bold mt-5">
                    ACADEMIC SCHOLARSHIP APPLICATION FORM
                  </div>
                  <hr className="border-black mt-2" />
                </td>
              </tr>
              <tr>
                <td className="text-xs w-1/2 p-4">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className="font-bold border border-black bg-green-200 p-1 text-base"
                        >
                          BIOGRAPHICAL DATA
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          LAST NAME:
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          DATE OF BIRTH
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          FIRSTNAME
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          AGE
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          MIDDLENAME
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          GENDER
                        </td>
                        <td className="font-bold border border-black p-1">
                          <select className="app__select_standard">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          NAME EXTENSION (IF THERES ANY)
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          CIVIL STATUS
                        </td>
                        <td className="font-bold border border-black p-1">
                          <select className="app__select_standard">
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Separated">Separated</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td className="text-xs w-1/2 p-4">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td
                          colSpan={2}
                          className="font-bold border border-black bg-green-200 p-1 text-base"
                        >
                          OTHER PERSONAL INFORMATION
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1 w-1/3">
                          CONTACT NUMBER
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          BOARDING HOUSE/APPARTMENT ADDRESS
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          PERMANENT ADDRESS
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td className="text-xs w-1/2 p-4">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className="font-bold border border-black bg-green-200 p-1 text-base"
                        >
                          PARENTS INFORMATION
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          FATHERS NAME:
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          OCCUPATION
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          MOTHERS MAIDEN NAME
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          OCCUPATION
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          GUARDIAN/BENEFACTORS
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          OCCUPATION
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          PERMANENT ADDRESS
                        </td>
                        <td
                          colSpan={3}
                          className="font-bold border border-black p-1"
                        >
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td className="text-xs w-1/2 p-4">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className="font-bold border border-black bg-green-200 p-1 text-base"
                        >
                          <div>
                            HIGH SCHOOL INFORMATION{' '}
                            <span className="text-xs">
                              (for Entrance Scholarship Applicants Only)
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          SENIOR HIGH SCHOOL
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          PRINCIPAL
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          ADDRESS
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          YEAR GRADUATED
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          TYPE OF SCHOOL
                        </td>
                        <td className="font-bold border border-black p-1">
                          <select className="app__select_standard">
                            <option value="Public">Public</option>
                            <option value="Private">Private</option>
                          </select>
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          HONORS RECEIVED
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td className="text-xs w-1/2 p-4">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td
                          colSpan={6}
                          className="font-bold border border-black bg-green-200 p-1 text-base"
                        >
                          REFERENCES
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          NAME
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          NAME
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          NAME
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          ADDRESS
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          ADDRESS
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          ADDRESS
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          CONTACT #
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          CONTACT #
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                        <td className="font-bold border border-black bg-green-200 p-1">
                          CONTACT #
                        </td>
                        <td className="font-bold border border-black p-1">
                          <input className="app__input_standard" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mx-4 mb-8">
            <hr className="my-6" />
            <div className="w-full">
              <div className="app__label_standard">
                <label className="flex items-center space-x-1">
                  <input type="checkbox" className="" />
                  <span className="font-normal text-xs">
                    By checking this box, you acknowledge that all information
                    is accurate.
                  </span>
                </label>
              </div>
            </div>
            <div className="">
              <button type="submit" className="app__btn_green_sm">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto bg-gray-800 p-4 text-white fixed bottom-0 w-full">
        <div className="text-white text-center text-xs">&copy; SWSOS</div>
      </div>
    </div>
  )
}
