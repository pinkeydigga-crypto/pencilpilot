'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top / Main Section */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10 my-auto">
        
        {/* Left Side Text & Image Logo */}
        <div className="space-y-6 text-center md:text-left">
          
          {/* Logo Container */}
          <div className="flex justify-center md:justify-start">
            <div className="relative w-64 h-20">
              <Image 
                src="https://cdn.corenexis.com/f/tloOLJdZaNP.png" 
                alt="DoodleFox Logo" 
                fill 
                unoptimized
                className="object-contain"
              />
            </div>
          </div>

          {/* Main Hero Headings */}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-[#1E2A44] text-left">
            Make Every <br />
            <span className="text-[#FF8A00]">Drawing Better.</span>
          </h1>
          
          <p className="text-slate-600 text-xl md:text-2xl font-medium text-left">
            Learn art through fun challenges and get instant AI feedback on your creations with Dodo!
          </p>
        </div>

        {/* Right Side Action Card */}
        <div className="relative max-w-sm w-full mx-auto pt-8">
          
          {/* Mascot & Comic Speech Bubble Container */}
          <div className="absolute -top-10 right-1 z-25 flex flex-col items-end pointer-events-none">
            
            {/* Comic Book Style Speech Bubble */}
            <div className="relative bg-white border-2 border-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#1E2A44] mb-1.5 mr-2 whitespace-nowrap">
              <span className="text-[#1E2A44]">Hi, I&apos;m </span>
              <span className="text-[#FF8A00]">Dodo</span>
              {/* Little triangle tail pointing down towards the mascot */}
              <div className="absolute -bottom-1.5 right-4 w-2 h-2 bg-white border-r-2 border-b-2 border-slate-800 rotate-45"></div>
            </div>

            {/* Mascot Image */}
            <div className="relative w-24 h-24">
              <Image 
                src="https://cdn.corenexis.com/f/6Kma2m4j9oq.png" 
                alt="Dodo Mascot" 
                fill 
                unoptimized
                className="object-contain mix-blend-multiply drop-shadow-sm"
              />
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-4 pt-12 text-center border border-slate-200">
            <Link
              href="/onboarding"
              className="block w-full py-3.5 bg-[#FF8A00] hover:bg-[#e07900] text-white font-semibold rounded-2xl text-center transition-all duration-200 shadow-[0_4px_0px_#cc6e00] active:translate-y-1 active:shadow-[0_0px_0px_#cc6e00]"
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
      <footer className="max-w-5xl w-full mx-auto text-center z-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs font-medium">
        <p>© {new Date().getFullYear()} DoodleFox. All rights reserved.</p>
        <div className="flex gap-6 mt-3 sm:mt-0">
          <Link href="/about" className="hover:underline font-bold text-[#1E2A44]">
            About the Founder
          </Link>
        </div>
      </footer>

    </div>
  )
}