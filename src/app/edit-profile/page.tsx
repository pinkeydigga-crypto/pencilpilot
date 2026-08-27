'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { ArrowLeft, Save, Sparkles, User, Camera } from 'lucide-react';
import Image from 'next/image';

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    artStyle: 'Sketching',
    skillLevel: 'Beginner',
    goal: 'Improve Anatomy',
    language: 'Hinglish'
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;

      if (session) {
        setUserId(session.user.id);
        await fetchProfile(session.user.id);
      } else {
        if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      }
    });

    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          setUserId(session.user.id);
          await fetchProfile(session.user.id);
        } else if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Session check error:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    getInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function fetchProfile(uid: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (data) {
        setFormData({
          name: data.name || '',
          username: data.username || '',
          artStyle: data.art_style || 'Sketching',
          skillLevel: data.skill_level || 'Beginner',
          goal: data.goal || 'Improve Anatomy',
          language: data.language || 'Hinglish'
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !supabase) return;

    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          username: formData.username,
          art_style: formData.artStyle,
          skill_level: formData.skillLevel,
          goal: formData.goal,
          language: formData.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center font-sans">
        <div className="text-slate-600 font-extrabold animate-pulse text-sm">Loading profile settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6] font-sans text-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative flex items-center justify-center">
              <Image 
                src="https://cdn.corenexis.com/f/tloOLJdZaNP.png" 
                alt="DoodleFox Logo" 
                fill 
                unoptimized
                className="object-contain"
              />
            </div>
            <span className="font-bold text-sm text-slate-800">DoodleFox</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Customize your artist profile details and learning preferences.</p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-2xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF8Id00] focus:ring-2 focus:ring-orange-100 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Username</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Primary Art Style</label>
                <select 
                  name="artStyle" 
                  value={formData.artStyle} 
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-100 transition"
                >
                  <option value="Sketching">Sketching</option>
                  <option value="Anime / Manga">Anime / Manga</option>
                  <option value="Portrait">Portrait</option>
                  <option value="Digital Art">Digital Art</option>
                  <option value="Watercolour">Watercolour</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Skill Level</label>
                <select 
                  name="skillLevel" 
                  value={formData.skillLevel} 
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-100 transition"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Pro">Pro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Primary Goal</label>
                <select 
                  name="goal" 
                  value={formData.goal} 
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-100 transition"
                >
                  <option value="Improve Anatomy">Improve Anatomy</option>
                  <option value="Master Shading">Master Shading</option>
                  <option value="Better Line Art">Better Line Art</option>
                  <option value="Character Design">Character Design</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Language Preference</label>
                <select 
                  name="language" 
                  value={formData.language} 
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-100 transition"
                >
                  <option value="Hinglish">Hinglish</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#FF8A00] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#e07900] transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}