/* eslint-disable @typescript-eslint/restrict-template-expressions */
'use client'

import { Sidebar, Title, TopBar } from '@/components/index'
import TwoColTableLoading from '@/components/Loading/TwoColTableLoading'
import LoginSettings from '@/components/LoginSettings'
import Grades from '@/components/Profile/Grades'
import ProfileDashboard from '@/components/Profile/ProfileDashboard'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { AccountTypes } from '@/types'
import { generateReferenceCode } from '@/utils/text-helper'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { type ChangeEvent, useEffect, useState } from 'react'
import Avatar from 'react-avatar'
import { BsCamera } from 'react-icons/bs'

export default function Page({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false)
  const [isFound, setIsFound] = useState(true)
  const [userData, setUserData] = useState<AccountTypes | null>(null)

  const userId = params.id
  const searchParams = useSearchParams()
  const page = searchParams.get('page')

  // Avatar
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')

  // counters
  const [myctoCount, setMyctoCount] = useState('')

  const { supabase, session } = useSupabase()
  const { hasAccess } = useFilter()

  const router = useRouter()

  const handleUploadPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        setUploading(true)

        // delete the existing user avatar on supabase storage
        const { data: files, error: error3 } = await supabase.storage
          .from('sws_public')
          .list(`user_avatar/${userId}`)
        if (error3) throw new Error(error3.message)
        if (files.length > 0) {
          const filesToRemove = files.map(
            (x: { name: string }) => `user_avatar/${userId}/${x.name}`
          )
          const { error: error4 } = await supabase.storage
            .from('sws_public')
            .remove(filesToRemove)
          if (error4) throw new Error(error4.message)
        }

        // upload the new avatar
        const file = e.target.files?.[0]
        const newFileName = generateReferenceCode()
        const customFilePath =
          `user_avatar/${userId}/${newFileName}.` +
          (file.name.split('.').pop() as string)
        const { error } = await supabase.storage
          .from('sws_public')
          .upload(`${customFilePath}`, file, {
            cacheControl: '3600',
            upsert: true
          })
        if (error) throw new Error(error.message)

        // get the newly uploaded file public path
        await handleFetchAvatar(customFilePath)
      } catch (error) {
        console.error('Error uploading file:', error)
      } finally {
        router.refresh()
        setUploading(false)
      }
    }
  }

  const handleFetchAvatar = async (path: string) => {
    try {
      // get the public avatar url
      const { data, error } = await supabase.storage
        .from('sws_public')
        .getPublicUrl(`${path}`)

      if (error) throw new Error(error.message)

      // update avatar url on sws_users table
      const { error2 } = await supabase
        .from('sws_users')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId)

      if (error2) throw new Error(error2.message)

      setAvatarUrl(data.publicUrl)
    } catch (error) {
      console.error('Error fetching avatar:', error)
    }
  }

  useEffect(() => {
    const fetchAccountDetails = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('sws_users')
          .select('*')
          .eq('id', userId)
          .limit(1)
          .maybeSingle()

        if (data) {
          setAvatarUrl(data?.avatar_url)
          setUserData(data)
          setIsFound(true)
        } else {
          setIsFound(false)
        }
        if (error) throw new Error(error.message)
      } catch (e) {
        console.error('fetch error: ', e)
      } finally {
        setLoading(false)
      }
    }

    void fetchAccountDetails()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isFound) {
    notFound()
  }

  return (
    <>
      <Sidebar>
        {!loading && userData && (
          <>
            <div className="px-2 mt-12">
              <div>
                {avatarUrl && avatarUrl !== '' ? (
                  <div className="flex items-center justify-center relative">
                    <div className="relative rounded-full overflow-hidden h-32 w-32 border border-gray-300">
                      <Image
                        src={avatarUrl}
                        layout="fill"
                        objectFit="cover"
                        alt="profile image"
                        className="rounded"
                      />
                    </div>
                    {userId === session.user.id && (
                      <div className="absolute bottom-2 right-12">
                        <input
                          type="file"
                          onChange={handleUploadPhoto}
                          className="hidden"
                          id="file-input"
                          accept="image/*"
                        />
                        {!uploading ? (
                          <div className="text-gray-300 bg-gray-700 rounded-full p-1">
                            <label
                              htmlFor="file-input"
                              className="cursor-pointer"
                            >
                              <BsCamera className="w-5 h-5" />
                            </label>
                          </div>
                        ) : (
                          <span className="py-px px-1 text-xs text-white">
                            Uploading...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Avatar
                      round={false}
                      size="100"
                      name={userData.firstname}
                      className="rounded-full"
                    />
                  </div>
                )}
              </div>
              <div className="text-center mt-2 capitalize text-sm text-gray-200 font-bold">
                {userData.firstname} {userData.middlename} {userData.lastname}
              </div>
              <div className="text-center mt-1 text-xs text-gray-400">
                {userData.email}
              </div>

              {/* Menu */}
              <ul className="pt-8 mt-4 space-y-2 border-gray-700">
                <li>
                  <Link
                    href={`/profile/${userId}`}
                    className={`app__profile_menu_link ${
                      !page || page === '' ? 'bg-gray-700' : ''
                    }`}
                  >
                    <span className="flex-1 ml-3 whitespace-nowrap">
                      Profile Details
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/profile/${userId}?page=grades`}
                    className={`app__profile_menu_link ${
                      page === 'grades' ? 'bg-gray-700' : ''
                    }`}
                  >
                    <span className="flex-1 ml-3 whitespace-nowrap">
                      Scholar Evaluations
                    </span>
                  </Link>
                </li>
                {(hasAccess('settings') || userId === session.user.id) && (
                  <li>
                    <Link
                      href={`/profile/${userId}?page=loginsettings`}
                      className={`app__profile_menu_link ${
                        page === 'loginsettings' ? 'bg-gray-700' : ''
                      }`}
                    >
                      <span className="flex-1 ml-3 whitespace-nowrap">
                        Login Settings
                      </span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </Sidebar>
      <TopBar />
      <div className="app__main">
        {loading && <TwoColTableLoading />}
        {!loading && (
          <div>
            {(!page || page === '') && userData && (
              <ProfileDashboard userData={userData} />
            )}
            {page && page === 'grades' && (
              <>
                <div className="app__title">
                  <Title title="Scholar Evaluations" />
                </div>
                <div className="mt-4 mx-2">
                  {userData && <Grades userData={userData} />}
                </div>
              </>
            )}
            {page && page === 'loginsettings' && userId === session.user.id && (
              <>
                <div className="app__title">
                  <Title title="Update Password" />
                </div>
                <div className="mt-4 mx-2">
                  <LoginSettings userId={userId} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
