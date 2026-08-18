'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-600 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top / Main Section */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10 my-auto">
        
        {/* Left Side Text & Logo */}
        <div className="text-white space-y-6 text-center md:text-left">
          
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-center md:justify-start space-x-3">
            {/* Custom SVG Logo Icon for Pencil Pilot */}
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md p-2">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                {/* Robot Head Base */}
                <rect x="6" y="8" width="24" height="18" rx="6" fill="#2563EB" />
                {/* Visor Screen */}
                <rect x="9" y="12" width="18" height="10" rx="3" fill="#1e3a8a" />
                {/* Cute Eyes */}
                <circle cx="14" cy="17" r="2" fill="white" />
                <circle cx="22" cy="17" r="2" fill="white" />
                {/* Pencil Tip Antenna */}
                <polygon points="18,2 15,8 21,8" fill="#F59E0B" />
                <rect x="17" y="0" width="2" height="3" fill="#EF4444" />
              </svg>
            </div>
            
            {/* Brand Name Text */}
            <div className="flex flex-col text-left">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                Pencil Pilot
              </span>
              <span className="text-xs text-blue-200 font-medium tracking-wide mt-1">
                AI Drawing Coach
              </span>
            </div>
          </div>

          {/* Main Hero Headings */}
          <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none">
            Make it finally <br />
            <span className="text-blue-200">click.</span>
          </h1>
          
          <p className="text-blue-100 text-xl md:text-2xl font-medium">
            Instant AI feedback to level up your art.
          </p>
        </div>

        {/* Right Side Action Card */}
        <div className="relative max-w-sm w-full mx-auto">
          
          {/* Animated Mascot */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 animate-bounce">
            <svg viewBox="0 0 100 80" className="w-20 h-16 drop-shadow-md">
              {/* Antenna / Pencil Element */}
              <polygon points="50,0 44,12 56,12" fill="#F59E0B" />
              <rect x="47" y="10" width="6" height="4" fill="white" />

              {/* Head */}
              <rect x="15" y="14" width="70" height="42" rx="21" fill="white" />
              
              {/* Screen / Visor */}
              <rect x="25" y="20" width="50" height="26" rx="13" fill="#1e3a8a" />
              
              {/* Happy Smiling Eyes (^ ^) */}
              <path d="M 36 34 Q 41 26 46 34" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
              <path d="M 54 34 Q 59 26 64 34" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
              
              {/* Peeking Body */}
              <path d="M 38 56 Q 50 50 62 56 L 65 65 L 35 65 Z" fill="#93c5fd" />
              
              {/* Small Circle Hands */}
              <circle cx="30" cy="62" r="6" fill="white" />
              <circle cx="70" cy="62" r="6" fill="white" />
            </svg>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-4 pt-12 text-center border border-blue-100">
            <Link
              href="/onboarding"
              className="block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl text-center transition-all duration-200 shadow-sm active:scale-95"
            >
              Get started
            </Link>

            <Link
              href="/login"
              className="block w-full py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-2xl text-center transition-all duration-200 active:scale-95"
            >
              I already have an account
            </Link>

            <div className="pt-2">
              <p className="text-xs text-slate-400 font-medium">
                Free to start · Ready in 10 seconds
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                By continuing you agree to our <span className="underline cursor-pointer">Terms</span> & <span className="underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Footer with About Link */}
      <footer className="max-w-5xl w-full mx-auto text-center z-10 pt-6 border-t border-blue-500/40 flex flex-col sm:flex-row items-center justify-between text-blue-100 text-xs font-medium">
        <p>© {new Date().getFullYear()} Pencil Pilot. All rights reserved.</p>
        <div className="flex gap-6 mt-3 sm:mt-0">
          <Link href="/about" className="hover:underline font-bold text-white">
            About the Founder
          </Link>
        </div>
      </footer>

    </div>
  )
}