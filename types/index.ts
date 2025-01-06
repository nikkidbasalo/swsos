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
  program_ids: string[]
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
export interface GradeTypes {
  id: string
  grade_id: string
  period_id: string
  period: EvaluationPeriodTypes
  user_id: string
  user: GranteeTypes
  program_id: string
  program: ProgramTypes
  institute_id: string
  institute: InstituteTypes
  file_path: string
  remarks: string
  status: string
  lowest_grade: string
  allowance: string
  allowance_type: string
  is_paid: boolean
  confirmed: string
}
export interface EvaluationPeriodTypes {
  id: string
  description: string
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
  institute_id: string
  institute: InstituteTypes
  confirmed: string
  control_number: string
  employee_number: string
  function: string
  email: string
  lastname: string
  firstname: string
  middlename: string
  tes_award_number: string
  gender: string
  birthday: string
  degree_program: string
  year_level_status: string
  remarks: string
  added_to_system: string
  status: string
}

export interface excludedItemsTypes {
  id: string
}

export interface AccountTypes {
  id: string
  fullname: string
  id_number: string
  program_id: string
  year_granted: string
  program: ProgramTypes
  institute_id: string
  institute: InstituteTypes
  control_number: string
  employee_number: string
  function: string
  email: string
  lastname: string
  firstname: string
  middlename: string
  tes_award_number: string
  gender: string
  birthday: string
  degree_program: string
  year_level_status: string
  remarks: string
  added_to_system: string
  type: string
  password: string
  department: string
  avatar_url: string
  created_by: string
  status: string
  temp_password: string
  confirmed: string
}

export interface InstituteTypes {
  id: string
  name: string
}

export interface ApplicationTypes {
  id: string
  program_id: string
  program: ProgramTypes
  lastname: string
  firstname: string
  middlename: string
  name_ext: string
  birthday: string
  age: string
  gender: string
  civil_status: string
  contact_number: string
  present_address: string
  permanent_address: string
  father: string
  mother: string
  guardian: string
  parent_address: string
  father_occupation: string
  mother_occupation: string
  guardian_occupation: string
  shs: string
  shs_principal: string
  shs_address: string
  shs_school_type: string
  shs_year_graduated: string
  shs_honor: string
  reference_name_1: string
  reference_name_2: string
  reference_name_3: string
  reference_address_1: string
  reference_address_2: string
  reference_address_3: string
  reference_contact_1: string
  reference_contact_2: string
  reference_contact_3: string
  file_path: string
  status: string
  reference_code: string
  email: string
  temporary_password: string
  confirm: string
}

export interface AllowancesTypes {
  id: string
  user_id: string
  user: AccountTypes
  program_id: string
  program: ProgramTypes
  period: string
  amount: string
}

export interface GranteeSummaryTypes {
  program_name: string
  total_users: number
  total_allowance: string
  total_paid: string
  total_unpaid: string
}
