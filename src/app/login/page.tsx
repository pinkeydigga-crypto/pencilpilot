'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized')
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error('Login Error:', error.message)
      setErrorMessage(error.message || 'Invalid email or password.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Logo / Brand Header */}
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm p-2">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 2 L50 18" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
              <path d="M43 14 L57 14 L50 2 Z" fill="#f59e0b" />
              <circle cx="50" cy="2" r="2" fill="#ef4444" />
              <rect x="25" y="24" width="50" height="42" rx="14" fill="#3b82f6" />
              <rect x="28" y="27" width="44" height="36" rx="11" fill="#1e3a8a" />
              <rect x="34" y="35" width="32" height="20" rx="6" fill="#0f172a" />
              <circle cx="43" cy="45" r="4" fill="#ffffff" />
              <circle cx="57" cy="45" r="4" fill="#ffffff" />
              <path d="M38 66 L62 66 L65 72 L35 72 Z" fill="#93c5fd" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Pencil Pilot</h1>
            <p className="text-blue-200 text-xs">AI Drawing Coach</p>
          </div>
        </div>

        {/* Floating Card Form with Shine Effect */}
        <div className="relative bg-white rounded-3xl p-8 shadow-2xl space-y-6 overflow-hidden group">
          
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform pointer-events-none" />

          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Pick up right where you left off.</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
              />
            </div>
            <div>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors shadow-sm flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="text-xs text-slate-500 pt-2 text-center">
            <p>
              New here?{' '}
              <Link href="/onboarding" className="text-blue-600 font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}