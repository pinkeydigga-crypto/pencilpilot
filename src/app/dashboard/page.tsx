"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Sparkles, Trophy, ArrowRight, Flame, Home, Camera, Target, Award, User, Settings as SettingsIcon, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [userId, setUserId] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState({
    name: 'Artist',
    username: '',
    artStyle: 'Sketching',
    skillLevel: 'Beginner',
    goal: 'Improve Anatomy',
    language: 'Hinglish'
  });

  const [stats, setStats] = useState({
    totalAnalyses: 0,
    averageScore: 0,
    streak: 3,
    rank: 'Unranked',
    xp: 0
  });

  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUserData() {
      if (!supabase) return;
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile({
          name: profile.name || 'Artist',
          username: profile.username || '',
          artStyle: profile.art_style || 'Sketching',
          skillLevel: profile.skill_level || 'Beginner',
          goal: profile.goal || 'Improve Anatomy',
          language: profile.language || 'Hinglish'
        });
      }

      const { data: analysesData, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching analyses:", error);
        return;
      }

      const userXp = profile ? (profile.xp || profile.total_xp || 0) : 0;

      if (analysesData && analysesData.length > 0) {
        setRecentAnalyses(analysesData);
        const total = analysesData.length;
        const totalScoreSum = analysesData.reduce((acc: number, curr: any) => acc + (Number(curr.score) || 0), 0);
        const avg = Math.round(totalScoreSum / total);
        let calculatedRank = 'Rookie';
        if (total >= 10 && avg >= 75) calculatedRank = 'Pro Artist';
        else if (total >= 5) calculatedRank = 'Intermediate';

        setStats({
          totalAnalyses: total,
          averageScore: isNaN(avg) ? 0 : avg,
          streak: profile?.streak || 3,
          rank: calculatedRank,
          xp: userXp
        });
      } else {
        setStats(prev => ({ ...prev, xp: userXp }));
      }
    }

    fetchUserData();
  }, []);

  const handleNavClick = (id: string) => {
    if (id === 'scan') {
      router.push('/scan');
      return;
    }
    if (id === 'challenges') {
      router.push('/challenges');
      return;
    }
    if (id === 'leaderboard') {
      router.push('/leaderboard');
      return;
    }
    if (id === 'profile') {
      router.push('/edit-profile');
      return;
    }
    setActiveTab(id as any);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex pb-24 md:pb-0">
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 sticky top-0 h-screen select-none">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm p-1.5 border border-blue-100">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 12 L50 28" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
                <polygon points="50,7 45,17 55,17" fill="#EF4444" />
                <rect x="15" y="32" width="70" height="48" rx="16" fill="#2563EB" />
                <circle cx="35" cy="56" r="6" fill="white" />
                <circle cx="65" cy="56" r="6" fill="white" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-slate-900">Pencil Pilot</h1>
              <p className="text-xs text-slate-400 font-medium">AI Drawing Coach</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { id: 'scan', label: 'Start Scanning', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z' },
              { id: 'challenges', label: 'Challenges', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'leaderboard', label: 'Leaderboard', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                    isActive ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR ROBOT */}
        <div className="h-[220px] w-full p-[20px] rounded-[20px] bg-gradient-to-b from-blue-50/60 to-white border border-slate-100 shadow-sm overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="w-[90px] h-[90px] mb-[12px] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="70,12 63,28 77,28" fill="#EF4444" />
              <rect x="66" y="28" width="8" height="6" fill="#CBD5E1" rx="1" />
              <rect x="64" y="34" width="12" height="26" fill="#FBBF24" rx="2" />
              <rect x="30" y="58" width="80" height="62" rx="30" fill="white" stroke="#E2E8F0" strokeWidth="2" />
              <rect x="42" y="70" width="56" height="34" rx="14" fill="#1E3A8A" />
              <path d="M54 84 Q60 89 66 84" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <path d="M74 84 Q80 89 86 84" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="w-full flex flex-col items-center">
            <h4 className="font-bold text-blue-700 text-sm mb-1">Keep practicing!</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[140px]">Every sketch makes you better.</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Good morning, {userProfile.username || userProfile.name}! 👋</h1>
            <p className="text-sm text-slate-500 mt-1">Let's level up your drawing skills today.</p>
          </div>
          
          <div 
            onClick={() => router.push('/edit-profile')}
            className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition"
          >
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow">
              {(userProfile.username || userProfile.name).charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{userProfile.username || userProfile.name}</p>
              <p className="text-xs text-blue-600 font-medium">{userProfile.skillLevel} • {userProfile.artStyle}</p>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">📋</div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{stats.totalAnalyses}</h3>
                  <p className="text-xs font-semibold text-slate-700">Drawings Analyzed</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">⭐</div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{stats.averageScore} / 100</h3>
                  <p className="text-xs font-semibold text-slate-700">Average Score</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">📈</div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{stats.rank}</h3>
                  <p className="text-xs font-semibold text-slate-700">Current Rank</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{stats.xp} XP</h3>
                  <p className="text-xs font-semibold text-slate-700">Current XP</p>
                </div>
              </div>
            </section>

            <section className="bg-[#1f56ff] rounded-[28px] p-10 relative overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-center min-h-[280px] w-full shadow-sm">
              <div className="space-y-3.5 max-w-[450px] z-10">
                <div className="inline-block bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  AI SCAN
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  Start scanning your drawing
                </h2>
                <p className="text-blue-100 text-[15px] font-medium">
                  Upload your drawing and get instant AI feedback with actionable tips.
                </p>
              </div>

              <div className="bg-transparent border border-dashed border-white/30 rounded-[20px] p-6 text-center z-10 w-[300px] h-[200px] flex flex-col justify-center items-center mx-auto lg:mx-0 shrink-0">
                <div className="w-[44px] h-[44px] bg-white rounded-xl mx-auto flex items-center justify-center mb-3 shadow-sm">
                  <svg className="w-5 h-5 text-[#1f56ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h4 className="text-white font-semibold text-sm mb-0.5">Upload your drawing</h4>
                <p className="text-white/70 text-[11px] mb-4">PNG, JPG (Max 20MB)</p>
                
                <button 
                  onClick={() => router.push('/scan')}
                  className="w-full bg-white text-[#1f56ff] py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition shadow-sm cursor-pointer"
                >
                  Start Scanning
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-xl">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Settings</h2>
              <p className="text-sm text-slate-500 mt-1">Manage your account and session preferences.</p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">Account Session</h4>
                  <p className="text-xs text-slate-500">Sign out from your current device session.</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'dashboard' && activeTab !== 'settings' && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <h3 className="text-xl font-bold text-slate-800 capitalize">{activeTab} Section</h3>
            <p className="text-sm text-slate-500">This section is currently under development.</p>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          
          <button 
            onClick={() => handleNavClick('dashboard')}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-1.5 rounded-2xl ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-600' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px]">Home</span>
          </button>

          <button 
            onClick={() => handleNavClick('scan')}
            className="flex flex-col items-center gap-1 transition cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <div className="p-1.5 rounded-2xl">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px]">Scan</span>
          </button>

          <button 
            onClick={() => handleNavClick('challenges')}
            className="flex flex-col items-center gap-1 transition cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <div className="p-1.5 rounded-2xl">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px]">Challenges</span>
          </button>

          <button 
            onClick={() => handleNavClick('leaderboard')}
            className="flex flex-col items-center gap-1 transition cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <div className="p-1.5 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[10px]">Rank</span>
          </button>

          <button 
            onClick={() => handleNavClick('profile')}
            className="flex flex-col items-center gap-1 transition cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <div className="p-1.5 rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px]">Profile</span>
          </button>

        </div>
      </nav>
    </div>
  );
}