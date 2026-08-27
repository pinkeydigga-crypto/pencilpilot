'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const [formData, setFormData] = useState({
    artStyle: 'Sketching',
    language: 'Hinglish',
    skillLevel: 'Beginner',
    goal: 'Improve Anatomy',
    username: '',
    name: '',
    email: '',
    password: ''
  })

  const handleNext = () => {
    setErrorMessage('')
    if (step < 4) setStep(step + 1)
  }

  const handlePrev = () => {
    setErrorMessage('')
    if (step > 1) setStep(step - 1)
  }

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            username: formData.username,
            art_style: formData.artStyle || 'Sketching',
            language: formData.language || 'Hinglish',
            skill_level: formData.skillLevel || 'Beginner',
            goal: formData.goal || 'Improve Anatomy',
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          name: formData.name,
          username: formData.username,
        })

        if (profileError) throw profileError
      }

      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userName', formData.name)
      localStorage.setItem('userUsername', formData.username)
      localStorage.setItem('userProfile', JSON.stringify(formData))

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Signup Error:', error.message)
      setErrorMessage(error.message || 'Something went wrong during registration.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#E8ECF2] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Minimal, Subtle, Tiny Art Pattern matching reference density & transparency */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-25" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cg fill='none' stroke='%23475569' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Tiny Pencil --%3E%3Cpath d='M40 50l16-16 5 5-16 16-7 2 2-7z'/%3E%3Cpath d='M50 40l5 5'/%3E%3C!-- Tiny Paint Brush --%3E%3Cpath d='M160 45c-1 1-2 3-2 5l-8 8c-1 1-1 3 0 4s3 1 4 0l8-8c1 0 3-1 4-2l-6-7z'/%3E%3Cpath d='M150 58l-5 5c-2 2-2 5 0 7s5 2 7 0l5-5'/%3E%3C!-- Tiny Paint Palette --%3E%3Cpath d='M45 160c-8 0-14 6-14 13s6 11 11 11c3 0 5-2 5-5 0-2-1-3-1-4 0-3 2-5 5-5 5 0 8-4 8-9 0-6-6-9-14-9z'/%3E%3Ccircle cx='40' cy='168' r='1.5' fill='%23475569'/%3E%3Ccircle cx='48' cy='164' r='1.5' fill='%23475569'/%3E%3Ccircle cx='54' cy='170' r='1.5' fill='%23475569'/%3E%3C!-- Another Tiny Pencil diagonal --%3E%3Cpath d='M140 150l16-16 5 5-16 16-7 2 2-7z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '220px 220px'
        }} 
      />

      {/* Main Container Wrapper with proper top padding */}
      <div className="max-w-xl w-full relative pt-20">

        {/* Side Waving Mascot */}
        <div className="absolute top-2 -left-2 sm:-left-6 z-20 flex items-center gap-2 pointer-events-none">
          <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center drop-shadow-md">
            <Image 
              src="https://cdn.corenexis.com/f/9YeR8BOGZFJ.png" 
              alt="DoodleFox Mascot" 
              fill 
              unoptimized
              className="object-contain mix-blend-multiply"
            />
          </div>
          <div className="bg-[#1E2A44] text-white px-3.5 py-1.5 rounded-2xl text-[11px] sm:text-xs font-black shadow-md tracking-wide uppercase relative">
            Welcome to DoodleFox!
            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-[#1E2A44] rotate-45 rounded-xs" />
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/50 space-y-6 relative z-10">
          
          {/* Top Back Button & Progress Bars Indicator */}
          <div className="flex items-center gap-4">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={handlePrev}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-all cursor-pointer shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
            ) : (
              <div className="w-10 shrink-0" />
            )}

            <div className="flex-1 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i <= step ? 'bg-[#FF8A00]' : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-100/80">
            <p className="text-xs text-slate-700 font-semibold leading-relaxed text-center">
              {step === 1 && "Select your primary art style so DoodleFox can give you custom critique."}
              {step === 2 && "Tell us your current skill level to adjust feedback depth."}
              {step === 3 && "What is your main drawing goal right now?"}
              {step === 4 && "Almost done! Enter your account details to save your DoodleFox profile."}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: Art Style */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-[#1E2A44] tracking-tight">
                What is your primary art style?
              </h2>
              <div className="grid grid-cols-2 gap-3.5">
                {['Sketching', 'Portrait', 'Anime / Manga', 'Digital Art'].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFormData({...formData, artStyle: style})}
                    className={`py-4 px-5 rounded-2xl border text-sm font-bold transition-all text-left ${
                      formData.artStyle === style 
                        ? 'border-[#FF8A00] bg-orange-50/50 text-[#FF8A00] shadow-md scale-[1.02]' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
              <button 
                type="button"
                onClick={handleNext}
                className="w-full py-4 bg-[#FF8A00] hover:bg-[#e07900] text-white font-extrabold rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}

          {/* STEP 2: Skill Level */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-[#1E2A44] tracking-tight">
                What is your current skill level?
              </h2>
              <div className="space-y-3">
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({...formData, skillLevel: level})}
                    className={`w-full py-4 px-5 rounded-2xl border text-sm font-bold transition-all text-left ${
                      formData.skillLevel === level 
                        ? 'border-[#FF8A00] bg-orange-50/50 text-[#FF8A00] shadow-md scale-[1.01]' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <button 
                type="button"
                onClick={handleNext}
                className="w-full py-4 bg-[#FF8A00] hover:bg-[#e07900] text-white font-extrabold rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}

          {/* STEP 3: Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-[#1E2A44] tracking-tight">
                What do you want to improve most?
              </h2>
              <div className="space-y-3">
                {['Improve Anatomy', 'Better Shading & Contrast', 'Perspective & Proportion', 'Clean Line Quality'].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setFormData({...formData, goal})}
                    className={`w-full py-4 px-5 rounded-2xl border text-sm font-bold transition-all text-left ${
                      formData.goal === goal 
                        ? 'border-[#FF8A00] bg-orange-50/50 text-[#FF8A00] shadow-md scale-[1.01]' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
              <button 
                type="button"
                onClick={handleNext}
                className="w-full py-4 bg-[#FF8A00] hover:bg-[#e07900] text-white font-extrabold rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}

          {/* STEP 4: Credentials & Save */}
          {step === 4 && (
            <form onSubmit={handleCompleteSignup} className="space-y-4" autoComplete="off">
              <h2 className="text-2xl font-black text-[#1E2A44] tracking-tight">
                Save your account details
              </h2>
              
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                <input 
                  type="text" 
                  required
                  autoComplete="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="e.g. alex_artist"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-[#FF8A00] bg-slate-50/50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Your Full Name</label>
                <input 
                  type="text" 
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Alex Artist"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-[#FF8A00] bg-slate-50/50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Working Email</label>
                <input 
                  type="email" 
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="e.g. alex@example.com"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-[#FF8A00] bg-slate-50/50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <input 
                  type="password" 
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-[#FF8A00] bg-slate-50/50 text-slate-800"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#FF8A00] hover:bg-[#e07900] text-white font-extrabold rounded-2xl shadow-lg transition-all text-sm disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Saving to Supabase...' : 'Save & Go to Dashboard'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  )
}