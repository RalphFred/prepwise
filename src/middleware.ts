import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/study',
    '/study/:path*',
    '/exams',
    '/exams/:path*',
    '/analytics',
    '/analytics/:path*',
    '/settings',
    '/settings/:path*',
    '/exams/take',
    '/exams/take/:path*'
  ],
}