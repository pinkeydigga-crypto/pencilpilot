'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (session && !error) {
        localStorage.setItem('isLoggedIn', 'true')
        router.push('/dashboard')
      } else {
        console.error('Callback Auth Error:', error?.message)
        router.push('/onboarding')
      }
    }

    handleCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-600 font-medium text-sm">Completing login...</p>
    </div>
  )
}