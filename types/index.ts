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
  sws_user: AccountTypes
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

export interface AccountDetailsForm {
  firstname: string
  middlename: string
  lastname: string
  email: string
}

export interface ProgramTypes {
  id: string
  name: string
  description: string
  type: string
  funds: string
  allow_applicants: boolean
  confirmed: string
}
export interface LiquidationTypes {
  id: string
  description: string
  file_path: string
  confirmed: string
}

export interface AnnouncementTypes {
  id: string
  title: string
  description: string
}

export interface GranteeTypes {
  id: string
  fullname: string
  id_number: string
  program_id: string
  year_granted: string
  program: ProgramTypes
  confirmed: string
  control_number: string
  lastname: string
  firstname: string
  middlename: string
  tes_award_number: string
  gender: string
  birthday: string
  degree_program: string
  year_level_status: string
  remarks: string
}

export interface excludedItemsTypes {
  id: string
}

export interface AccountTypes {
  id: string
  firstname: string
  middlename: string
  lastname: string
  status: string
  password: string
  department: string
  avatar_url: string
  email: string
  org_id: string
  created_by: string
  temp_password: string
  confirmed: string
}
