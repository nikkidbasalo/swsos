import type { AccountTypes, excludedItemsTypes } from '@/types'
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

    query = query.eq('type', type)

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

export async function fetchGrantees(
  ref: string,
  perPageCount: number,
  rangeFrom: number
) {
  try {
    let query = supabase
      .from('sws_grantees')
      .select('*, program:program_id(*)', { count: 'exact' })

    query = query.eq('program_id', ref)

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
  filters: { filterStatus?: string },
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
