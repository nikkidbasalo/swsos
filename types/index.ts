import type { MouseEventHandler, ReactNode } from 'react'

export interface SelectUserNamesProps {
  settingsData: any[]
  multiple: boolean
  type: string
  handleManagerChange: (newdata: any[], type: string) => void
  title: string
}

export interface UserAccessTypes {
  user_id: string
  type: string
  sws_user: Employee
}

export interface searchUser {
  firstname: string
  middlename: string
  lastname: string
  uuid?: string
  id: string
}

export interface namesType {
  firstname: string
  middlename: string
  lastname: string
  position_type: string
  avatar_url: string
  id: string
}

export interface CustomButtonTypes {
  isDisabled?: boolean
  btnType?: 'button' | 'submit'
  containerStyles?: string
  textStyles?: string
  title: string
  rightIcon?: ReactNode
  handleClick?: MouseEventHandler<HTMLButtonElement>
}

export interface NotificationTypes {
  id: string
  message: string
  created_at: string
  url: string
  type: string
  user_id: string
  reference_id?: string
  reference_table: string
  is_read: boolean
}

export interface Employee {
  id: string
  firstname: string
  middlename: string
  lastname: string
  gender: string
  password: string
  email: string
  status?: string
  confirmed: string
}

export interface AccountDetailsForm {
  firstname: string
  middlename: string
  lastname: string
  email: string
}

export interface Employee {
  id: string
  firstname: string
  middlename: string
  lastname: string
  gender: string
  password: string
  email: string
  status?: string
  type: string
  avatar_url: string
  confirmed: string
}

export interface ProgramTypes {
  id: string
  name: string
  type: string
  funds: string
  confirmed: string
}

export interface GranteeTypes {
  id: string
  fullname: string
  id_number: string
  program_id: string
  year_granted: string
  program: ProgramTypes
  confirmed: string
}

export interface excludedItemsTypes {
  id: string
}
