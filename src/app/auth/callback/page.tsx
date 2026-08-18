"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuthCallback() {
      if (!supabase) return;

      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error.message);
      }
      
      router.push('/dashboard');
    }

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Verifying session...</h2>
        <p className="text-sm text-slate-500 mt-2">Please wait while we redirect you to your dashboard.</p>
      </div>
    </div>
  );
}