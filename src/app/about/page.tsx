'use client'

import { useRouter } from 'next/navigation'

export default function AboutPage() {
  const router = useRouter()
  
  const instagramUrl = "https://instagram.com/harjas_gallery"
  const instagramHandle = "@harjas_gallery"

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <span className="font-black text-slate-900 text-lg tracking-tight">Pencil Pilot</span>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition-all"
        >
          Back to Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-8 my-12 space-y-12">
        
        {/* Creator Section */}
        <div className="space-y-6">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">About the Founder</h1>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <p className="text-base text-slate-700 font-medium leading-relaxed">
              Hi, I am <strong>Harjass Digga</strong>, the founder of <strong>Harjas Gallery</strong>. 
              My vision behind Pencil Pilot was to provide a professional, AI-driven critique tool for artists 
              who strive for perfection and constant growth.
            </p>
            <p className="text-base text-slate-700 font-medium leading-relaxed">
              I believe that technology can significantly shorten the learning curve for budding artists. 
              By combining my passion for art and the power of AI, I created this platform to help you 
              refine your skills through data-backed feedback.
            </p>
          </div>
        </div>

        {/* Get in Touch Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[2.5rem] shadow-xl text-white space-y-6 text-center">
          <h2 className="text-2xl font-black">Get in touch with the Founder</h2>
          <p className="text-blue-100 font-medium text-sm">
            Want to collaborate, give feedback, or check out my latest art works? Connect with me on Instagram.
          </p>
          <a 
            href={instagramUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-sm shadow-lg hover:bg-blue-50 transition-all"
          >
            Visit {instagramHandle}
          </a>
        </div>

      </main>
    </div>
  )
}