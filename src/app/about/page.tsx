import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Pencil Pilot | AI Drawing Scan & Art Critique by Harjass Digga',
  description: 'Discover Pencil Pilot, a professional AI-driven drawing scan and art critique platform created by Harjass Digga to help artists accelerate their creative growth.',
  keywords: ['Harjass Digga', 'Pencil Pilot', 'drawing scan', 'art critique tool', 'AI art feedback', 'Harjas Gallery'],
  openGraph: {
    title: 'About Pencil Pilot | AI Drawing Scan & Art Critique',
    description: 'Empowering artists with AI-driven drawing scans and precise critiques. Created by Harjass Digga.',
    url: 'https://pencilpilot.com/about',
    siteName: 'Pencil Pilot',
    type: 'website',
  },
}

export default function AboutPage() {
  const instagramUrl = "https://instagram.com/harjas_gallery"
  const instagramHandle = "@harjas_gallery"

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-black text-slate-900 text-lg tracking-tight">Pencil Pilot</span>
        </Link>
        <Link 
          href="/"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition-all"
        >
          Back to Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-8 my-12 space-y-12">
        
        {/* App & Drawing Scan Section (Top for SEO & Main Motive) */}
        <div className="space-y-6">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">About Pencil Pilot & Drawing Scan</h1>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <p className="text-base text-slate-700 font-medium leading-relaxed">
              <strong>Pencil Pilot</strong> is a cutting-edge, AI-driven platform built for artists striving for perfection. 
              Our core feature, the advanced <strong>drawing scan</strong> tool, evaluates your sketches with data-backed precision, 
              offering instant professional insights on proportions, shading, and technique.
            </p>
            <p className="text-base text-slate-700 font-medium leading-relaxed">
              Our main motive is to shorten the learning curve for creators everywhere by combining modern artificial intelligence 
              with traditional art mastery, giving you clear, actionable feedback right from your browser.
            </p>
          </div>
        </div>

        {/* Creator / Founder Section (Moved Down) */}
        <div className="space-y-6">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">About the Founder</h2>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <p className="text-base text-slate-700 font-medium leading-relaxed">
              Hi, I am <strong>Harjass Digga</strong>, the founder of <strong>Harjas Gallery</strong>. 
              My vision behind Pencil Pilot was to bridge the gap between hard work and intelligent direction for artists 
              who want continuous growth.
            </p>
            <p className="text-base text-slate-700 font-medium leading-relaxed">
              By blending my personal passion for art with powerful AI technology, I designed this platform to help you 
              elevate your artwork through objective critique.
            </p>
          </div>
        </div>

        {/* Get in Touch Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[2.5rem] shadow-xl text-white space-y-6 text-center">
          <h2 className="text-2xl font-black">Get in touch with Harjass Digga</h2>
          <p className="text-blue-100 font-medium text-sm">
            Want to collaborate, give feedback, or check out my latest art works at Harjas Gallery? Connect on Instagram.
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