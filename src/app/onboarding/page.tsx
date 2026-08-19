'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    instagram: '',
    username: '',
    name: '',
    email: '',
    password: ''
  })

  const handleNext = () => {
    setErrorMessage('')
    if (step === 4 && !formData.instagram.trim()) {
      setErrorMessage('Instagram handle is required.')
      return
    }
    if (step < 5) setStep(step + 1)
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
            instagram: formData.instagram,
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          name: formData.name,
          username: formData.username,
          email: formData.email,
          art_style: formData.artStyle || 'Sketching',
          language: formData.language || 'Hinglish',
          skill_level: formData.skillLevel || 'Beginner',
          goal: formData.goal || 'Improve Anatomy',
          instagram: formData.instagram,
          updated_at: new Date(),
        })

        if (profileError) throw profileError
      }

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
    <div className="min-h-screen bg-[#2563EB] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Dots Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />

      {/* Main Container Wrapper */}
      <div className="max-w-xl w-full relative pt-10">

        {/* Side Waving Robot Mascot */}
        <div className="absolute -top-6 -left-4 sm:-left-10 z-20 flex items-center gap-2 pointer-events-none">
          <div className="w-16 h-16 relative flex items-center justify-center drop-shadow-lg">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,2 43,14 57,14" fill="#F59E0B" />
              <rect x="47" y="14" width="6" height="6" fill="white" />
              <rect x="15" y="20" width="70" height="46" rx="23" fill="white" />
              <rect x="22" y="26" width="56" height="34" rx="14" fill="#1E3A8A" />
              <path d="M 35 43 Q 39 37 43 43" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 57 43 Q 61 37 65 43" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
              <circle cx="28" cy="72" r="7" fill="white" />
              <circle cx="72" cy="72" r="7" fill="white" />
              <rect x="38" y="66" width="24" height="10" rx="5" fill="#93C5FD" />
            </svg>
          </div>
          <div className="bg-white text-blue-600 px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-md tracking-wide uppercase relative">
            Welcome!
            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white rotate-45 rounded-xs" />
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-white/20 p-8 shadow-2xl shadow-blue-950/40 space-y-6 relative z-10">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-wider text-blue-600 uppercase">
              QUESTION {step} OF 5
            </span>
            <span className="text-xs font-extrabold text-slate-400">
              {Math.round((step / 5) * 100)}% COMPLETED
            </span>
          </div>

          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100/80">
            <p className="text-xs text-slate-700 font-semibold leading-relaxed text-center">
              {step === 1 && "Select your primary art style so I can give you custom critique."}
              {step === 2 && "Tell me your current skill level to adjust feedback depth."}
              {step === 3 && "What is your main drawing goal right now?"}
              {step === 4 && "Share your Instagram handle so we can connect & feature your work!"}
              {step === 5 && "Almost done! Enter your account details to save your profile."}
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
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
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
                        ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-md scale-[1.02]' 
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
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}

          {/* STEP 2: Skill Level */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
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
                        ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-md scale-[1.01]' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handlePrev} className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-sm transition-all">Back</button>
                <button type="button" onClick={handleNext} className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-xl transition-all">Continue</button>
              </div>
            </div>
          )}

          {/* STEP 3: Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
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
                        ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-md scale-[1.01]' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handlePrev} className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-sm transition-all">Back</button>
                <button type="button" onClick={handleNext} className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-xl transition-all">Continue</button>
              </div>
            </div>
          )}

          {/* STEP 4: Instagram Profile */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                What is your Instagram handle?
              </h2>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Instagram Handle <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                  <input 
                    type="text" 
                    required
                    value={formData.instagram}
                    onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                    placeholder="your.art.handle"
                    className="w-full pl-9 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-slate-50/50 text-slate-800"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handlePrev} className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-sm transition-all">Back</button>
                <button type="button" onClick={handleNext} className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-xl transition-all">Continue</button>
              </div>
            </div>
          )}

          {/* STEP 5: Credentials & Save */}
          {step === 5 && (
            <form onSubmit={handleCompleteSignup} className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Save your account details
              </h2>
              
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                <input 
                  type="text" 
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="e.g. alex_artist"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-slate-50/50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Your Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Alex Artist"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-slate-50/50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Working Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="e.g. alex@example.com"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-slate-50/50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-slate-50/50 text-slate-800"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handlePrev} className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-sm transition-all">Back</button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-xl transition-all text-sm disabled:opacity-50"
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