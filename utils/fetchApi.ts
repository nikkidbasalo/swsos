import type { AccountTypes, excludedItemsTypes, GranteeTypes } from '@/types'
import { createBrowserClient } from '@supabase/ssr'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
export async function fetchPrograms(
  type: string,
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase.from('sws_programs').select('*', { count: 'exact' })

    if (type !== '') {
      query = query.eq('type', type)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }
    return { data, count }
  } catch (error) {
    console.error('fetch programs error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchGrades(
  userId: string,
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('sws_grades')
      .select('*,period:evaluation_period_id(*)', {
        count: 'exact'
      })
      .eq('user_id', userId)

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }
    return { data, count }
  } catch (error) {
    console.error('fetch grades error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchLiquidations(
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('sws_liquidations')
      .select('*', { count: 'exact' })

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }
    return { data, count }
  } catch (error) {
    console.error('fetch liquidations error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchPeriods(perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('sws_evaluation_periods')
      .select('*', { count: 'exact' })

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }
    return { data, count }
  } catch (error) {
    console.error('fetch periods error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchApplications(
  filters: {
    filterKeyword?: string
    filterStatus?: string
  },
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('sws_applications')
      .select('*, program:program_id(*)', { count: 'exact' })

    if (filters.filterKeyword && filters.filterKeyword !== '') {
      // Search match
      query = query.or(
        `firstname.ilike.%${filters.filterKeyword}%,middlename.ilike.%${filters.filterKeyword}%,lastname.ilike.%${filters.filterKeyword}%`
      )
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }
    return { data, count }
  } catch (error) {
    console.error('fetch liquidations error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchGrantees(
  filters: {
    filterProgramIds?: string[]
    filterProgram?: string
    filterInstitute?: string
    filterKeyword?: string
    filterStatus?: string
    filterYear?: string
    filterGender?: string
  },
  ref: string,
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('sws_users')
      .select('*, institute:institute_id(*),program:program_id(*)', {
        count: 'exact'
      })
      .not('program_id', 'is', null)
      .eq('type', 'Scholar')

    if (ref !== '') {
      query = query.eq('program_id', ref)
    }

    // filter name
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      // Search match
      query = query.or(
        `firstname.ilike.%${filters.filterKeyword}%,middlename.ilike.%${filters.filterKeyword}%,lastname.ilike.%${filters.filterKeyword}%`
      )
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    } else {
      query = query.eq('status', 'Active')
    }

    // filter program
    if (filters.filterProgram && filters.filterProgram !== '') {
      query = query.eq('program_id', filters.filterProgram)
    }
    // filter institute
    if (filters.filterInstitute && filters.filterInstitute !== '') {
      query = query.eq('institute_id', filters.filterInstitute)
    }

    // filter program ids
    if (filters.filterProgramIds) {
      query = query.in('program_id', filters.filterProgramIds)
    }

    // filter gender
    if (filters.filterGender && filters.filterGender !== '') {
      query = query.eq('gender', filters.filterGender)
    }

    // filter year
    if (filters.filterYear && filters.filterYear !== '') {
      query = query.eq('year_level_status', filters.filterYear)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }
    return { data, count }
  } catch (error) {
    console.error('fetch grantees error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchAllowances(
  filters: {
    filterProgram?: string
    filterPeriod?: string
  },
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('sws_allowances')
      .select('*, user:user_id(*),program:program_id(*)', { count: 'exact' })

    // filter program
    if (filters.filterProgram && filters.filterProgram !== '') {
      query = query.eq('program_id', filters.filterProgram)
    }

    // filter period
    if (filters.filterPeriod && filters.filterPeriod !== '') {
      query = query.eq('period', filters.filterPeriod)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }
    return { data, count }
  } catch (error) {
    console.error('fetch allowances error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchEvaluations(
  filters: {
    filterProgramIds?: string[]
    filterProgram?: string
    filterInstitute?: string
    filterPeriod?: string
    filterStatus?: string
    filterPaymentStatus?: string
  },
  perPageCount: number,
  rangeFrom: number
) {
  try {
    // filter institute
    const userIds: string[] = []
    if (filters.filterInstitute && filters.filterInstitute !== '') {
      const { data } = await supabase
        .from('sws_users')
        .select()
        .eq('institute_id', filters.filterInstitute)

      if (data) {
        data.forEach((u: GranteeTypes) => {
          userIds.push(u.id)
        })
      }
    }

    let query = supabase
      .from('sws_grades')
      .select(
        '*, user:user_id(*,institute:institute_id(*)),program:program_id(*),period:evaluation_period_id(*)',
        { count: 'exact' }
      )

    // filter program
    if (filters.filterProgram && filters.filterProgram !== '') {
      query = query.eq('program_id', filters.filterProgram)
    }

    // filter program ids
    if (filters.filterProgramIds) {
      query = query.in('program_id', filters.filterProgramIds)
    }

    // filter period
    if (filters.filterPeriod && filters.filterPeriod !== '') {
      query = query.eq('evaluation_period_id', filters.filterPeriod)
    }
    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    }

    // filter Payment Status
    if (filters.filterPaymentStatus) {
      if (filters.filterPaymentStatus === 'Paid') {
        query = query.eq('is_paid', true)
      }
      if (filters.filterPaymentStatus === 'Unpaid') {
        query = query.eq('is_paid', false)
      }
    }

    if (filters.filterInstitute && filters.filterInstitute !== '') {
      query = query.in('user_id', userIds)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }
    return { data, count }
  } catch (error) {
    console.error('fetch allowances error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchAnnoucements(
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('sws_announcements')
      .select('*', { count: 'exact' })

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }
    return { data, count }
  } catch (error) {
    console.error('fetch announcements error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchInstitutes(perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase.from('sws_institutes').select('*', { count: 'exact' })

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }
    return { data, count }
  } catch (error) {
    console.error('fetch institutes error', error)
    return { data: [], count: 0 }
  }
}
export async function fetchBoardinghouse(
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('sws_boardinghouses')
      .select('*', { count: 'exact' })

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }
    return { data, count }
  } catch (error) {
    console.error('fetch institutes error', error)
    return { data: [], count: 0 }
  }
}

export async function searchActiveEmployees(
  searchTerm: string,
  excludedItems: excludedItemsTypes[]
) {
  let query = supabase
    .from('sws_users')
    .select()
    .eq('status', 'Active')
    .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

  // Search match
  query = query.or(
    `firstname.ilike.%${searchTerm}%,middlename.ilike.%${searchTerm}%,lastname.ilike.%${searchTerm}%`
  )

  // Excluded already selected items
  excludedItems.forEach((item) => {
    query = query.neq('id', item.id)
  })

  // Limit results
  query = query.limit(3)

  const { data, error } = await query

  if (error) console.error(error)

  return data ?? []
}

export async function logError(
  transaction: string,
  table: string,
  data: string,
  error: string
) {
  await supabase.from('error_logs').insert({
    system: 'sws',
    transaction,
    table,
    data,
    error
  })
}

export async function fetchErrorLogs(perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('error_logs')
      .select('*', { count: 'exact' })
      .eq('system', 'sws')

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchAccounts(
  filters: {
    filterStatus?: string
    filterType?: string
    filterKeyword?: string
  },
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase.from('sws_users').select('*', { count: 'exact' })
    // .neq('email', 'berlcamp@gmail.com')

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    }

    if (filters.filterKeyword && filters.filterKeyword !== '') {
      // Search match
      query = query.or(
        `firstname.ilike.%${filters.filterKeyword}%,middlename.ilike.%${filters.filterKeyword}%,lastname.ilike.%${filters.filterKeyword}%`
      )
    }

    // filter type
    if (filters.filterType && filters.filterType !== '') {
      query = query.eq('type', filters.filterType)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data: userData, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    const data: AccountTypes[] = userData

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}
