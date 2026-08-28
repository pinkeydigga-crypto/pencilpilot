'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Sparkles, Trophy, ArrowRight, Flame, Home, Camera, Target, Award, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [userProfile, setUserProfile] = useState({
    name: 'Artist',
    username: '',
    artStyle: 'Sketching',
    skillLevel: 'Beginner',
    goal: 'Improve Anatomy',
    language: 'Hinglish'
  });

  const [stats, setStats] = useState({
    streak: 0,
    rank: 'Unranked',
    xp: 0
  });

  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;

      if (session) {
        setUserId(session.user.id);
        await fetchUserData(session.user.id);
      } else {
        if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      }
    });

    async function checkInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          setUserId(session.user.id);
          await fetchUserData(session.user.id);
        } else {
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession && isMounted) {
              setUserId(retrySession.user.id);
              await fetchUserData(retrySession.user.id);
            } else if (isMounted) {
              setIsLoading(false);
            }
          }, 1500);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    checkInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function fetchUserData(uid: string) {
    try {
      setUserId(uid);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

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

      const { data: analysesData, error: analysesError } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (analysesError) {
        console.error("Error fetching analyses:", analysesError);
      }

      const userXp = profile ? (profile.xp || profile.total_xp || 0) : 0;
      const userStreak = profile ? (profile.streak || 0) : 0;

      // Calculate Leaderboard Rank Dynamically
      let calculatedRank = profile?.rank || 'Unranked';
      
      if (!profile?.rank) {
        const { count, error: rankError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('xp', userXp);

        if (!rankError && count !== null) {
          const rankPosition = count + 1;
          calculatedRank = `#${rankPosition}`;
        }
      }

      if (analysesData && analysesData.length > 0) {
        setRecentAnalyses(analysesData);
      }

      setStats({
        streak: userStreak,
        rank: calculatedRank,
        xp: userXp
      });

    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setIsLoading(false);
    }
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center font-sans">
        <div className="text-slate-600 font-extrabold animate-pulse text-sm">Loading DoodleFox Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6] font-sans text-slate-900 flex pb-24 md:pb-0">
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 sticky top-0 h-screen select-none">
        <div className="space-y-8">
          <div className="flex items-center -ml-2">
            <div className="w-36 h-14 relative flex items-center justify-start">
              <Image 
                src="https://cdn.corenexis.com/f/tloOLJdZaNP.png" 
                alt="DoodleFox Logo" 
                fill 
                unoptimized
                className="object-contain object-left"
              />
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
                    isActive ? 'bg-orange-50 text-[#FF8A00] font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
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

        <div className="h-[220px] w-full p-[20px] rounded-[20px] bg-gradient-to-b from-orange-50/65 to-white border border-orange-100 shadow-sm overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="w-[120px] h-[70px] mb-[10px] relative flex items-center justify-center shrink-0">
            <Image 
              src="https://cdn.corenexis.com/f/tloOLJdZaNP.png" 
              alt="DoodleFox Mascot" 
              fill 
              unoptimized
              className="object-contain"
            />
          </div>
          <div className="w-full flex flex-col items-center">
            <h4 className="font-bold text-[#FF8A00] text-sm mb-1">Keep sketching!</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[140px]">Every artwork makes you a better artist.</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back, {userProfile.username || userProfile.name}! 👋</h1>
            <p className="text-sm text-slate-500 mt-1">Let's level up your drawing skills with DoodleFox AI today.</p>
          </div>
          
          <div 
            onClick={() => router.push('/edit-profile')}
            className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-orange-300 transition"
          >
            <div className="w-10 h-10 bg-[#FF8A00] text-white rounded-xl flex items-center justify-center font-bold text-sm shadow">
              {(userProfile.username || userProfile.name).charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{userProfile.username || userProfile.name}</p>
              <p className="text-xs text-[#FF8A00] font-medium">{userProfile.skillLevel} • {userProfile.artStyle}</p>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{stats.xp} XP</h3>
                  <p className="text-xs font-semibold text-slate-700">Current XP</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{stats.rank}</h3>
                  <p className="text-xs font-semibold text-slate-700">Leaderboard Rank</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-orange-50 text-[#FF8A00] rounded-xl flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{stats.streak} Days</h3>
                  <p className="text-xs font-semibold text-slate-700">Drawing Streak</p>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-r from-[#1E2A44] to-[#2c3e6b] rounded-[28px] p-6 md:p-10 relative overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-center min-h-[280px] w-full shadow-md">
              <div className="space-y-3.5 max-w-[450px] z-10 text-center md:text-left mx-auto md:mx-0">
                <div className="inline-block bg-[#FF8A00] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  AI STUDIO SCAN
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  Start scanning your sketch
                </h2>
                <p className="text-slate-300 text-sm sm:text-[15px] font-medium">
                  Upload your drawing and get instant AI feedback with actionable line and shading tips.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-dashed border-white/30 rounded-[20px] p-5 text-center z-10 w-full max-w-[300px] h-[200px] flex flex-col justify-center items-center mx-auto lg:mx-0 shrink-0 shadow-inner">
                <div className="w-[44px] h-[44px] bg-white rounded-xl mx-auto flex items-center justify-center mb-3 shadow-sm">
                  <svg className="w-5 h-5 text-[#FF8A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h4 className="text-white font-semibold text-sm mb-0.5">Upload your artwork</h4>
                <p className="text-white/70 text-[11px] mb-4">PNG, JPG (Max 20MB)</p>
                
                <button 
                  onClick={() => router.push('/scan')}
                  className="w-full bg-[#FF8A00] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#e07900] transition shadow-sm cursor-pointer"
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
              <p className="text-sm text-slate-500 mt-1">Manage your DoodleFox account and session preferences.</p>
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
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'dashboard' ? 'text-[#FF8A00] font-bold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-1.5 rounded-2xl ${activeTab === 'dashboard' ? 'bg-orange-100 text-[#FF8A00]' : ''}`}>
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