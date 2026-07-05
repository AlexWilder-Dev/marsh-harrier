import { NextResponse } from 'next/server'
import { getSanityClient } from '@/lib/sanity'

export const revalidate = 300

const QUERY = `*[_type == "openingHours"] | order(order asc) {
  day,
  order,
  openHour,
  openSuffix,
  closeHour,
  closeSuffix,
  kitchenHours,
  note
}`

export async function GET() {
  try {
    const hours = await getSanityClient().fetch(QUERY)
    return NextResponse.json(hours)
  } catch (err) {
    console.error('Failed to fetch opening hours from Sanity:', err)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
