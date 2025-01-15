'use client'

import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { EyeSlashIcon } from '@heroicons/react/20/solid'
import axios from 'axios'
import { EyeIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface UpdatePasswordTypes {
  newPassword: string
  confirmPassword: string
}
export default function LoginSettings({ userId }: { userId: string }) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<UpdatePasswordTypes>()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { setToast } = useFilter()
  const { supabase, session } = useSupabase()

  const [showPassword, setShowPassword] = useState(false)
  const [showFirstPassword, setShowFirstPassword] = useState(false)

  const toggleFirstPasswordVisibility = () => {
    setShowFirstPassword(!showFirstPassword)
  }
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handlePasswordChange = async (data: {
    newPassword: string
    confirmPassword: string
  }) => {
    if (loading) return

    setLoading(true)
    setMessage('')

    if (data.newPassword !== data.confirmPassword) {
      setMessage('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('sws_users')
        .update({
          temp_password: 'Password changed by User'
        })
        .eq('id', userId)

      if (error) throw new Error(error.message)
    } catch (e) {
      console.error(e)
    }

    if (userId === session.user.id) {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      })
      if (error) {
        console.error(error)
        setMessage(`Error: ${error.message}`)
      } else {
        setToast('success', 'Password successfully changed')
        setMessage('Password updated successfully')
        reset({
          newPassword: '',
          confirmPassword: ''
        })
      }
    } else {
      axios
        .post('/api/updatepass', {
          user_id: userId,
          new_password: data.newPassword
        })
        .then(function () {
          setToast('success', 'Password successfully changed')
          setMessage('Password updated successfully')
          reset({
            newPassword: '',
            confirmPassword: ''
          })
        })
        .catch(function (error) {
          console.error(error)
          setMessage(`Error: ${error.message}`)
        })
    }

    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit(handlePasswordChange)}>
        <div className="mb-4">
          <label className="app__label_standard">New Password</label>
          <div className="relative">
            <input
              type={showFirstPassword ? 'text' : 'password'}
              {...register('newPassword', {
                required: 'New password is required'
              })}
              className="app__input_standard w-full pr-10"
            />
            <button
              type="button"
              onClick={toggleFirstPasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              aria-label="Toggle password visibility"
            >
              {showFirstPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-xs">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="app__label_standard">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword', {
                required: 'Please confirm your password'
              })}
              className="app__input_standard w-full pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {message && message === 'Password updated successfully' && (
          <p className="text-sm mt-2 text-green-500">{message}</p>
        )}
        {message && message !== 'Password updated successfully' && (
          <p className="text-sm mt-2 text-red-500">{message}</p>
        )}

        <button
          type="submit"
          className="app__btn_green mt-4"
          disabled={loading}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}
