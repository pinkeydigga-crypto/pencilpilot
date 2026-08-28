"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Sparkles, Loader2, Check } from 'lucide-react';

const AVATAR_OPTIONS = [
  { id: 'artist', label: 'Artist Fox', bg: 'artist' },
  { id: 'doodle', label: 'Doodle Creator', bg: 'doodle' },
  { id: 'sketch', label: 'Sketch Master', bg: 'sketch' },
  { id: 'creative', label: 'Creative Soul', bg: 'creative' },
  { id: 'fox', label: 'Sly Fox', bg: 'fox' },
  { id: 'paints', label: 'Paint Palette', bg: 'paints' },
];

const getCartoonAvatar = (seed: string) => {
  const safeSeed = AVATAR_OPTIONS.some(o => o.bg === seed) ? seed : 'artist';
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(safeSeed)}&backgroundColor=ffe5cc,ffdfbf,ffd5dc,d1d4f9`;
};

export default function EditProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    avatarUrl: 'artist'
  });

  useEffect(() => {
    async function fetchUserAndProfile() {
      if (!supabase) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUserId(user.id);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setFormData({
            name: data.name || '',
            username: data.username || '',
            avatarUrl: data.avatar_seed || 'artist'
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserAndProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !supabase) return;

    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: formData.name.trim(),
          username: formData.username.trim(),
          avatar_seed: formData.avatarUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF8A00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-[#F1F3F6] text-slate-900 p-6 md:p-10 flex flex-col items-center">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Top Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 text-[#FF8A00] rounded-xl flex items-center justify-center font-bold border border-orange-100 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1E2A44]">Edit Profile</h2>
              <p className="text-[11px] text-slate-500">Customize your public artist identity.</p>
            </div>
          </div>

          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          
          {message.text && (
            <div className={`p-4 rounded-2xl text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          {/* Avatar Preview & Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Choose Avatar Style</label>
            
            <div className="flex justify-center pb-2">
              <div className="relative">
                <img 
                  src={getCartoonAvatar(formData.avatarUrl)} 
                  alt="Avatar Preview" 
                  className="w-24 h-24 rounded-3xl border-4 border-[#FF8A00] shadow-md bg-orange-50 object-cover p-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {AVATAR_OPTIONS.map((item) => {
                const isSelected = formData.avatarUrl === item.bg;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: item.bg })}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                      isSelected 
                        ? 'border-[#FF8A00] bg-orange-50/60 ring-2 ring-orange-400 shadow-sm' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <img src={getCartoonAvatar(item.bg)} alt={item.label} className="w-12 h-12 rounded-xl bg-white p-0.5 object-cover" />
                    <span className="text-[11px] font-bold text-slate-700 truncate w-full text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Display Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your artist name"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FF8A00] focus:bg-white transition"
            />
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Username</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="username"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FF8A00] focus:bg-white transition"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isSaving}
            className="w-full bg-[#FF8A00] hover:bg-[#e07900] text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {isSaving ? 'Saving Changes...' : 'Save Profile'}
          </button>

        </form>

      </div>
    </div>
  );
}