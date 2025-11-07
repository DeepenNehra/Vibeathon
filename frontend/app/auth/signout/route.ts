import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Sign out from Supabase
  await supabase.auth.signOut()

  // Clear all cookies
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  // Create response with redirect
  const response = NextResponse.redirect(new URL('/auth', request.url))
  
  // Delete all Supabase-related cookies
  allCookies.forEach((cookie) => {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      response.cookies.delete(cookie.name)
    }
  })

  return response
}
