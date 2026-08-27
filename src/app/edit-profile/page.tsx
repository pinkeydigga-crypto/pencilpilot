"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';

const AVATAR_SEEDS = ['artist', 'robot', 'cute', 'pixel', 'friendly', 'cool'];

export default function EditProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    artStyle: '',
    skillLevel: '',
    goal: '',
    avatar_seed: 'artist'
  });

  // 1. Fetch Logged-In User ID Dynamically with Robust Session Handling
  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    // Realtime auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUserId(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    async function verifyUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          setUserId(user.id);
          return;
        }

        // Retry after a short delay if session takes time to load
        setTimeout(async () => {
          const { data: { user: retryUser } } = await supabase.auth.getUser();
          if (retryUser && isMounted) {
            setUserId(retryUser.id);
          } else {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user && isMounted) {
              setUserId(session.user.id);
            } else if (isMounted) {
              // Check if token really exists in storage before kicking out
              let hasToken = false;
              if (typeof window !== 'undefined') {
                hasToken = Object.keys(localStorage).some(key => key.includes('supabase.auth.token') || key.includes('-auth-token'));
              }
              if (!hasToken) {
                router.push('/');
              }
            }
          }
        }, 1500);
      } catch (err) {
        console.error("Auth verify error:", err);
      }
    }

    verifyUser();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // 2. Load Profile Data for Logged-In User
  useEffect(() => {
    async function loadProfile() {
      if (!supabase || !userId) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error loading profile:", error);
      }

      if (data) {
        setFormData({
          name: data.name || '',
          artStyle: data.art_style || '',
          skillLevel: data.skill_level || '',
          goal: data.goal || '',
          avatar_seed: data.avatar_seed || 'artist'
        });
      }
    }
    loadProfile();
  }, [userId]);

  const handleSave = async () => {
    if (!supabase || !userId) {
      alert("User session not ready yet. Please wait a second.");
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name: formData.name,
        art_style: formData.artStyle,
        skill_level: formData.skillLevel,
        goal: formData.goal,
        avatar_seed: formData.avatar_seed
      }, { onConflict: 'id' });
    
    setLoading(false);
    if (!error) {
      router.push('/dashboard');
    } else {
      console.error("Error saving profile details:", error.message, error.details, error.code);
      alert(`Error saving profile: ${error.message || 'Check console'}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] p-6 md:p-10 flex justify-center font-sans text-slate-900">
      <div className="max-w-xl w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-900 cursor-pointer font-medium text-sm transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-[#1E2A44]">Edit Profile</h1>
          <span className="text-xs font-bold text-[#FF8A00] bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">
            DoodleFox Studio
          </span>
        </div>

        {/* Live Avatar Preview */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <img 
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${formData.avatar_seed}`} 
            alt="Avatar" 
            className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 p-1 shadow-sm"
          />
          <div>
            <h3 className="font-bold text-slate-800">{formData.name || 'DoodleFox Artist'}</h3>
            <p className="text-xs text-[#FF8A00] font-medium">Live Avatar Preview</p>
          </div>
        </div>

        {/* Avatar Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-3 text-slate-700">Choose your Avatar</label>
          <div className="grid grid-cols-6 gap-3">
            {AVATAR_SEEDS.map((seed) => (
              <button 
                key={seed}
                type="button"
                onClick={() => setFormData({...formData, avatar_seed: seed})}
                className={`p-1 rounded-2xl border-2 transition cursor-pointer ${formData.avatar_seed === seed ? 'border-[#FF8A00] bg-orange-50 scale-105 shadow-sm' : 'border-slate-100 hover:border-slate-300'}`}
              >
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`} alt="avatar" className="w-full h-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] outline-none text-slate-800 font-medium transition"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Art Style</label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] outline-none text-slate-800 font-medium transition"
              value={formData.artStyle}
              onChange={(e) => setFormData({...formData, artStyle: e.target.value})}
              placeholder="e.g. Sketching, Anime, Portrait"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Skill Level</label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] outline-none text-slate-800 font-medium transition"
              value={formData.skillLevel}
              onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
              placeholder="e.g. Beginner, Intermediate, Pro"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Goal</label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8A00] focus:border-[#FF8A00] outline-none text-slate-800 font-medium transition"
              value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
              placeholder="e.g. Improve Anatomy, Daily Shading Practice"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-8 bg-[#FF8A00] text-white py-3.5 rounded-xl font-bold hover:bg-[#e07900] flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
        >
          {loading ? "Saving Profile..." : <><Save className="w-4 h-4" /> Save Profile Details</>}
        </button>
      </div>
    </div>
  );
}