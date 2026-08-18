"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Trophy, 
  Flame, 
  Award, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Sparkles,
  Clock,
  Target,
  Check
} from 'lucide-react';

export default function ChallengesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>("");

  const [totalXp, setTotalXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);
  const [rank, setRank] = useState<number>(1);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  
  // View state: 'hub' or 'learning'
  const [activeView, setActiveView] = useState<'hub' | 'learning'>('hub');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(true);

  // 6 Step Eye Tutorial Data
  const eyeSteps = [
    {
      step: 1,
      title: "Basic Eye Shape",
      instruction: "Create a simple almond-shaped outline as shown in the reference guide to establish overall proportions.",
      tips: ["Keep both sides symmetrical", "Use light, flexible pencil strokes"],
      svgType: "outline"
    },
    {
      step: 2,
      title: "Add Iris",
      instruction: "Sketch a clean circle inside the almond shape for the iris and a smaller center dot for the pupil.",
      tips: ["Ensure proper center alignment", "Keep lines light and erasable"],
      svgType: "iris"
    },
    {
      step: 3,
      title: "Add Eyelids",
      instruction: "Draw the upper eyelid crease curve above the almond shape to establish anatomical depth.",
      tips: ["Match the curve to the upper slope", "Keep the transition smooth"],
      svgType: "eyelids"
    },
    {
      step: 4,
      title: "Add Eyelashes",
      instruction: "Flick outward light strokes along the top and bottom lash lines to form natural tapered eyelashes.",
      tips: ["Make upper lashes longer and thicker", "Flick wrist outward quickly"],
      svgType: "eyelashes"
    },
    {
      step: 5,
      title: "Add Shading",
      instruction: "Shade gradient tones inside the iris and add soft structural shadows under the upper lid for realism.",
      tips: ["Leave a tiny white dot unshaded for light reflection", "Blend softly with a blending stump"],
      svgType: "shading"
    },
    {
      step: 6,
      title: "Final Realistic Eye",
      instruction: "Clean up unwanted guidelines, darken pupil accents, and finalize your complete realistic eye drawing!",
      tips: ["Check overall contrast", "Sign your completed artwork"],
      svgType: "final"
    }
  ];

  // User & Profile Data Loader
  const processUserData = async (user: any) => {
    if (!user) return;

    const currentUserId = user.id;
    setUserId(currentUserId);

    // Check / Create Profile
    const defaultName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Artist';

    let { data: userData, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .maybeSingle();

    if (fetchErr) {
      console.error("Profile fetch error:", fetchErr.message);
    }

    if (!userData) {
      const { data: newProfile, error: createErr } = await supabase
        .from('profiles')
        .upsert({
          id: currentUserId,
          name: defaultName,
          xp: 0,
          total_xp: 0,
          streak: 0,
          completed_challenges: []
        }, { onConflict: 'id' })
        .select()
        .single();

      if (createErr) console.error("Profile creation error:", createErr.message);
      if (newProfile) userData = newProfile;
    }

    if (userData) {
      const xpVal = userData.xp !== undefined && userData.xp !== null ? userData.xp : (userData.total_xp || 0);
      setTotalXp(xpVal);
      setStreak(userData.streak || 0);
      setLastActivityDate(userData.last_activity_date || null);
      const comp = userData.completed_challenges || [];
      setCompletedChallenges(comp);
      if (comp.includes('eye-drawing-1min')) {
        setIsCompleted(true);
      }
    }

    // Fetch Leaderboard
    setLoadingLeaderboard(true);
    const { data: lbData, error: lbError } = await supabase
      .from('profiles')
      .select('*');

    if (lbError) console.error("Error fetching leaderboard:", lbError.message);

    if (lbData) {
      const normalizedLb = lbData.map((u: any) => ({
        ...u,
        xp: u.xp !== undefined && u.xp !== null ? u.xp : (u.total_xp || 0)
      })).sort((a: any, b: any) => b.xp - a.xp);

      setLeaderboard(normalizedLb);
      const userIndex = normalizedLb.findIndex((u: any) => u.id === currentUserId);
      if (userIndex !== -1) {
        setRank(userIndex + 1);
      }
    }
    setLoadingLeaderboard(false);
  };

  // Safe Session Verification & Real-time Auth Monitoring
  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log("🔔 Auth Event Triggered:", event, "User ID:", session?.user?.id);

      if (session?.user) {
        if (isMounted) {
          await processUserData(session.user);
          setLoading(false);
        }
      } else {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
          console.warn("⚠️ No active session found! Redirecting to login...");
          if (isMounted) {
            setLoading(false);
            router.push('/login');
          }
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  // Handle completing challenge
  const handleFinishChallenge = async () => {
    if (!userId) return;

    if (isCompleted) {
      setActiveView('hub');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const todayDate = new Date(today);
    const lastActivity = lastActivityDate ? new Date(lastActivityDate) : null;
    
    let newStreak = streak;

    if (!lastActivity) {
      newStreak = 1; 
    } else {
      const diffTime = Math.abs(todayDate.getTime() - lastActivity.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        newStreak = streak === 0 ? 1 : streak;
      } else if (diffDays === 1) {
        newStreak = streak + 1;
      } else {
        newStreak = 1;
      }
    }

    const newXp = totalXp + 100;
    const updatedCompleted = [...completedChallenges, 'eye-drawing-1min'];
    
    setTotalXp(newXp);
    setStreak(newStreak);
    setLastActivityDate(today);
    setCompletedChallenges(updatedCompleted);
    setIsCompleted(true);
    setActiveView('hub');

    if (supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            id: userId,
            xp: newXp,
            total_xp: newXp,
            streak: newStreak,
            last_activity_date: today,
            completed_challenges: updatedCompleted 
          }, { 
            onConflict: 'id' 
          });

        if (error) console.error("Supabase upsert error:", error.message);
        
        const { data: lbData } = await supabase
          .from('profiles')
          .select('*');

        if (lbData) {
          const normalizedLb = lbData.map((u: any) => ({
            ...u,
            xp: u.xp !== undefined && u.xp !== null ? u.xp : (u.total_xp || 0)
          })).sort((a: any, b: any) => b.xp - a.xp);

          setLeaderboard(normalizedLb);
          const userIndex = normalizedLb.findIndex((u: any) => u.id === userId);
          if (userIndex !== -1) setRank(userIndex + 1);
        }
      } catch (err) {
        console.error("Unexpected error saving XP:", err);
      }
    }
  };

  const renderStepIllustration = (type: string) => {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <svg viewBox="0 0 200 120" className="w-48 h-32 drop-shadow-sm">
          <path d="M20 60 C 60 15, 140 15, 180 60 C 140 105, 60 105, 20 60 Z" fill="none" stroke="#2563EB" strokeWidth="3" />
          {(type !== 'outline') && (
            <>
              <circle cx="100" cy="60" r="28" fill={type === 'shading' || type === 'final' ? "#1E40AF" : "none"} stroke="#2563EB" strokeWidth="2" opacity={type === 'shading' || type === 'final' ? "0.2" : "1"} />
              <circle cx="100" cy="60" r="12" fill="#1E3A8A" />
              <circle cx="93" cy="53" r="3.5" fill="#FFFFFF" />
            </>
          )}
          {(['eyelids', 'eyelashes', 'shading', 'final'].includes(type)) && (
            <path d="M35 42 C 75 22, 125 22, 165 42" fill="none" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" />
          )}
          {(['eyelashes', 'shading', 'final'].includes(type)) && (
            <g stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round">
              <line x1="45" y1="50" x2="38" y2="38" />
              <line x1="65" y1="36" x2="62" y2="23" />
              <line x1="85" y1="32" x2="86" y2="17" />
              <line x1="115" y1="32" x2="114" y2="17" />
              <line x1="135" y1="36" x2="138" y2="23" />
              <line x1="155" y1="50" x2="162" y2="38" />
            </g>
          )}
          {(['shading', 'final'].includes(type)) && (
            <>
              <path d="M20 60 C 60 105, 140 105, 180 60 C 140 85, 60 85, 20 60 Z" fill="#93C5FD" opacity="0.4" />
              <circle cx="100" cy="60" r="28" fill="url(#grad)" opacity="0.6" />
              <defs>
                <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity="1" />
                </radialGradient>
              </defs>
            </>
          )}
          {type === 'final' && (
            <path d="M20 60 C 60 15, 140 15, 180 60 C 140 105, 60 105, 20 60 Z" fill="none" stroke="#1E3A8A" strokeWidth="3.5" />
          )}
        </svg>
      </div>
    );
  };

  // Show clean spinner while checking authentication state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-white font-bold flex items-center gap-3 shadow-xl">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs tracking-wider uppercase">Checking Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-blue-600 to-blue-800 text-slate-900 p-4 md:p-10 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Navigation Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-md flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold border border-blue-100 flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Challenges & Leaderboard</h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">Master drawing skills and compete on the community leaderboard.</p>
            </div>
          </div>
          <button 
            onClick={() => { router.push('/dashboard'); }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
        </div>

        {activeView === 'hub' ? (
          <>
            {/* Hero Stats Card */}
            <div className="bg-blue-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-blue-800 space-y-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-3 max-w-lg text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 bg-blue-800 text-blue-200 border border-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Learning Path
                </div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">Improve Your Drawing Skills</h1>
                <p className="text-blue-200 text-xs md:text-sm leading-relaxed">
                  Complete challenges, earn XP and maintain your daily streak synchronized to your Supabase profile.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-blue-950/80 p-4 rounded-2xl border border-blue-800 w-full md:w-auto">
                <div className="text-center px-3 py-1">
                  <span className="text-[10px] text-blue-300 uppercase font-bold block">Rank</span>
                  <span className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
                    <Award className="w-3.5 h-3.5" /> #{rank}
                  </span>
                </div>
                <div className="text-center px-3 py-1 border-l border-blue-800">
                  <span className="text-[10px] text-blue-300 uppercase font-bold block">Total XP</span>
                  <span className="text-base font-black text-emerald-400 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5" /> {totalXp}
                  </span>
                </div>
                <div className="text-center px-3 py-1 border-t border-blue-800 pt-2">
                  <span className="text-[10px] text-blue-300 uppercase font-bold block">Completed</span>
                  <span className="text-base font-black text-blue-300 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {completedChallenges.length}
                  </span>
                </div>
                <div className="text-center px-3 py-1 border-l border-t border-blue-800 pt-2">
                  <span className="text-[10px] text-blue-300 uppercase font-bold block">Streak</span>
                  <span className="text-base font-black text-orange-400 flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {streak}d
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Challenge Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Featured Masterclass
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center pt-2 md:pt-0">
                <div className="w-28 h-24 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 flex-shrink-0 overflow-hidden shadow-inner">
                  <svg viewBox="0 0 200 120" className="w-24 h-16">
                    <path d="M20 60 C 60 15, 140 15, 180 60 C 140 105, 60 105, 20 60 Z" fill="none" stroke="#2563EB" strokeWidth="4" />
                    <circle cx="100" cy="60" r="24" fill="#3B82F6" opacity="0.2" stroke="#2563EB" strokeWidth="2" />
                    <circle cx="100" cy="60" r="10" fill="#1E3A8A" />
                    <circle cx="94" cy="54" r="3" fill="#FFFFFF" />
                  </svg>
                </div>

                <div className="space-y-2 flex-1 text-center md:text-left">
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">Beginner Level</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">+100 XP Reward</span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 5 Minutes
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-black text-slate-900">Eye Drawing Under 1 Minute</h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    Learn to draw a realistic eye step-by-step through guided learning modules and professional reference breakdowns.
                  </p>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-2 items-center">
                  <button
                    onClick={() => { setActiveView('learning'); setCurrentStep(0); }}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md transition text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isCompleted ? 'Review Challenge' : 'Start Challenge'} <ArrowRight className="w-4 h-4" />
                  </button>
                  {isCompleted && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Completed (+100 XP Claimed)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* LEADERBOARD SECTION */}
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> Leaderboard Rankings
                </h3>
                <span className="text-xs text-blue-400 font-bold">Live Supabase Sync</span>
              </div>

              {loadingLeaderboard ? (
                <div className="text-center py-10 text-xs text-slate-400 font-medium">
                  Loading leaderboard from database...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-2xl text-center">
                  <p className="text-sm text-slate-300 font-bold">No artists ranked yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* TOP 3 PODIUM SECTION */}
                  {leaderboard.length >= 1 && (
                    <div className="flex justify-center items-end gap-2 sm:gap-3 pt-6 pb-4">
                      {/* 2nd Place (Left) */}
                      {leaderboard[1] && (
                        <div className="flex flex-col items-center space-y-2 w-24 sm:w-28">
                          <div className="relative">
                            <div className="w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-md">
                              {(leaderboard[1]?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="absolute -top-3 -right-1 text-base">🥈</span>
                          </div>
                          <div className="text-center truncate w-full">
                            <h4 className="font-bold text-xs text-slate-200 truncate">{leaderboard[1]?.name || 'User'}</h4>
                            <p className="text-[10px] text-slate-400">Level {Math.floor((leaderboard[1]?.xp || 0) / 100) + 1}</p>
                          </div>
                          <div className="bg-slate-800/90 border border-slate-700 rounded-xl py-2 px-3 w-full text-center shadow-inner">
                            <span className="text-slate-300 font-black text-xs block">{leaderboard[1]?.xp || 0}</span>
                            <span className="text-[9px] text-slate-400 uppercase tracking-wider">pts</span>
                          </div>
                        </div>
                      )}

                      {/* 1st Place (Center) */}
                      {leaderboard[0] && (
                        <div className="flex flex-col items-center space-y-2 w-28 sm:w-32 -mt-6">
                          <div className="relative">
                            <div className="w-14 h-14 bg-amber-500 border-2 border-amber-300 rounded-2xl flex items-center justify-center font-black text-slate-950 text-xl shadow-lg">
                              {(leaderboard[0]?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl">🥇</span>
                          </div>
                          <div className="text-center truncate w-full">
                            <h4 className="font-extrabold text-sm text-white truncate">{leaderboard[0]?.name || 'User'}</h4>
                            <p className="text-[10px] text-amber-300 font-semibold">Level {Math.floor((leaderboard[0]?.xp || 0) / 100) + 1}</p>
                          </div>
                          <div className="bg-amber-500/10 border border-amber-400/40 rounded-xl py-2.5 px-3 w-full text-center shadow-inner">
                            <span className="text-amber-400 font-black text-sm block">{leaderboard[0]?.xp || 0}</span>
                            <span className="text-[9px] text-amber-300 uppercase tracking-wider">pts</span>
                          </div>
                        </div>
                      )}

                      {/* 3rd Place (Right) */}
                      {leaderboard[2] && (
                        <div className="flex flex-col items-center space-y-2 w-24 sm:w-28">
                          <div className="relative">
                            <div className="w-12 h-12 bg-amber-900/60 border-2 border-amber-700 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-md">
                              {(leaderboard[2]?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="absolute -top-3 -right-1 text-base">🥉</span>
                          </div>
                          <div className="text-center truncate w-full">
                            <h4 className="font-bold text-xs text-slate-200 truncate">{leaderboard[2]?.name || 'User'}</h4>
                            <p className="text-[10px] text-slate-400">Level {Math.floor((leaderboard[2]?.xp || 0) / 100) + 1}</p>
                          </div>
                          <div className="bg-slate-800/90 border border-slate-700 rounded-xl py-2 px-3 w-full text-center shadow-inner">
                            <span className="text-amber-600 font-black text-xs block">{leaderboard[2]?.xp || 0}</span>
                            <span className="text-[9px] text-slate-400 uppercase tracking-wider">pts</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4TH RANK ONWARDS LIST SECTION */}
                  <div className="space-y-2 pt-2">
                    {leaderboard.slice(3).map((user, idx) => {
                      const rankNum = idx + 4;
                      const isCurrentUser = user.id === userId;
                      return (
                        <div 
                          key={user.id || idx} 
                          className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                            isCurrentUser 
                              ? 'bg-blue-950 border-blue-500 shadow-md ring-1 ring-blue-500' 
                              : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                        }`}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 truncate">
                            <span className="font-black text-amber-500 text-sm w-6 flex-shrink-0">#{rankNum}</span>
                            <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                              {(user.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2 truncate">
                                <h4 className="font-bold text-sm text-white truncate">
                                  {user.name || `Artist #${rankNum}`}
                                </h4>
                                {isCurrentUser && (
                                  <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">
                                Level {Math.floor((user.xp || 0) / 100) + 1} Artist
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 pl-2">
                            <span className="font-black text-white text-sm block">
                              {user.xp || 0}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                              pts
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* LEARNING STEP-BY-STEP VIEW */
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase">
                  Step {currentStep + 1} of {eyeSteps.length}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{eyeSteps[currentStep].title}</h3>
              </div>
              <button 
                onClick={() => setActiveView('hub')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl transition"
              >
                Exit Challenge
              </button>
            </div>

            {/* Step Illustration */}
            <div className="w-full h-56 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center shadow-inner">
              {renderStepIllustration(eyeSteps[currentStep].svgType)}
            </div>

            {/* Instructions & Tips */}
            <div className="space-y-4">
              <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed">
                {eyeSteps[currentStep].instruction}
              </p>

              <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Pro Tips:</h4>
                <ul className="space-y-1">
                  {eyeSteps[currentStep].tips.map((tip, idx) => (
                    <li key={idx} className="text-xs text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition"
              >
                Previous Step
              </button>

              {currentStep < eyeSteps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => Math.min(eyeSteps.length - 1, prev + 1))}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await handleFinishChallenge();
                  }}
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Finish & Claim +100 XP
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
