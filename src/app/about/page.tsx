import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

// SEO Metadata for Google & Social Media
export const metadata: Metadata = {
  title: 'About DoodleFox | Learn Drawing Fun Way & AI Drawing Scan',
  description: 'Discover DoodleFox by Harjas Digga. Learn art through fun challenges in an affordable way and use our AI drawing scan tool for instant sketch analysis and feedback.',
  keywords: ['learn drawing', 'drawing challenges', 'doodle fox', 'ai drawing scan', 'sketch analysis', 'art learning platform'],
  openGraph: {
    title: 'About DoodleFox | Learn Drawing Fun Way & AI Drawing Scan',
    description: 'Discover DoodleFox by Harjas Digga. Learn art through fun challenges in an affordable way and use our AI drawing scan tool for instant sketch analysis.',
    url: 'https://dodofox.com/about', // Apna future domain yahan daal sakte ho baad mein
    siteName: 'DoodleFox',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="max-w-4xl w-full mx-auto py-10 space-y-12 z-10 my-auto">
        
        {/* Top Header & Logo */}
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
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

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#1E2A44]">
            About <span className="text-[#FF8A00]">DoodleFox & AI Scanning</span>
          </h1>
        </div>

        {/* Section 1: Platform & Scanning Feature Overview */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-200 space-y-6">
          <h2 className="text-2xl font-black text-[#1E2A44]">
            Make Drawing Fun, Affordable & Interactive
          </h2>
          
          <p className="text-slate-600 text-lg leading-relaxed font-medium">
            <strong className="text-[#1E2A44]">DoodleFox</strong> is a cutting-edge, fun-filled platform built to make learning art exciting through interactive challenges. Our core vision is to make drawing accessible and interesting in an affordable way for everyone.
          </p>

          <div className="p-6 bg-[#F5F6FA] rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xl font-bold text-[#FF8A00]">
              ✨ Highlight: Instant Drawing Scan & Analysis
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Stuck on proportions or shading? With our advanced <strong className="text-[#1E2A44]">drawing scanning feature</strong>, you can instantly scan your sketches right from your device. Get deep AI-driven analysis, professional feedback, and smart tips to improve your art piece by piece!
            </p>
          </div>
        </div>

        {/* Section 2: Dodo's Intro with Mascot */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-200 flex flex-col md:flex-row items-center gap-8">
          
          {/* Mascot Image */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image 
              src="https://cdn.corenexis.com/f/6Kma2m4j9oq.png" 
              alt="Dodo Mascot" 
              fill 
              unoptimized
              className="object-contain mix-blend-multiply drop-shadow-sm"
            />
          </div>

          {/* Dodo's Speech / Intro */}
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-block bg-[#FF8A00]/10 text-[#FF8A00] font-bold text-xs px-3 py-1 rounded-full">
              Meet Your Guide
            </div>
            <h3 className="text-2xl font-black text-[#1E2A44]">
              Hi, I&apos;m Dodo! 👋
            </h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              I&apos;m here to teach you drawing in a fun way through exciting challenges and creative quests. Let&apos;s level up your sketching skills together!
            </p>
          </div>

        </div>

        {/* Section 3: Founder Info */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-200 space-y-4 text-center">
          <h3 className="text-xl font-black text-[#1E2A44]">
            Meet the Founder
          </h3>
          <p className="text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
            DoodleFox is founded by <strong className="text-[#1E2A44]">Harjas Digga</strong>, a 15-year-old creator passionate about combining art and technology to help artists grow and learn creatively.
          </p>
        </div>

        {/* Back to Home Button */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-[#FF8A00] hover:bg-[#e07900] text-white font-semibold rounded-2xl transition-all duration-200 shadow-[0_4px_0px_#cc6e00] active:translate-y-1 active:shadow-[0_0px_0px_#cc6e00]"
          >
            Back to Home
          </Link>
        </div>

      </div>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center z-10 pt-6 border-t border-slate-200 text-slate-500 text-xs font-medium">
        <p>© {new Date().getFullYear()} DoodleFox. All rights reserved.</p>
      </footer>

    </div>
  )
}