"use client";

import { useState, useEffect, useCallback } from 'react';
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
  Check,
  Layers,
  Zap
} from 'lucide-react';

interface Profile {
  id: string;
  name?: string;
  xp?: number;
  total_xp?: number;
  streak?: number;
  last_activity_date?: string;
  completed_challenges?: string[];
}

interface TutorialStep {
  step: number;
  title: string;
  instruction: string;
  tips: string[];
  imageUrl: string;
}

const EYE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Basic Outlines & Guide Lines",
    instruction: "First, lightly draw an almond shape with a pencil, then add a circle inside for the iris and mark guide lines.",
    tips: ["Keep both sides balanced", "Use very light pencil strokes"],
    imageUrl: "https://cdn.corenexis.com/f/6ihYUzokRln.jpeg"
  },
  {
    step: 2,
    title: "Step 2: Eyelid Crease & Structure",
    instruction: "Draw another curved line above to represent the eyelid crease, and erase any unnecessary inner guidelines.",
    tips: ["Match the curve to the upper slope", "Keep transitions smooth"],
    imageUrl: "https://cdn.corenexis.com/f/S57AQudsj3l.png"
  },
  {
    step: 3,
    title: "Step 3: Iris & Pupil Details",
    instruction: "Draw the pupil inside the iris and start adding light shading inside the iris to create depth.",
    tips: ["Make sure the pupil is centered", "Keep your lines light and easy to erase"],
    imageUrl: "https://cdn.corenexis.com/f/Lvq32gZlqCz.png"
  },
  {
    step: 4,
    title: "Step 4: Highlights & Soft Shading",
    instruction: "Shade the surrounding skin softly, and leave a tiny white dot unshaded to show light reflection.",
    tips: ["Leave a small white dot for light", "Blend smoothly for a natural look"],
    imageUrl: "https://cdn.corenexis.com/f/hq7jUBRMjzk.png"
  },
  {
    step: 5,
    title: "Step 5: Final Realistic Eye & Eyelashes",
    instruction: "Complete the drawing by adding long, natural upper and lower eyelashes. Scan your drawing for analysis.",
    tips: ["Check your overall contrast", "Sign your completed artwork"],
    imageUrl: "https://cdn.corenexis.com/f/jGJJCV2Bi2l.png"
  }
];

const CUBE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: First Corner Lines",
    instruction: "Start by drawing a simple vertical line and a horizontal line meeting at a corner to outline the front face edge.",
    tips: ["Keep lines straight", "Use light pencil pressure"],
    imageUrl: "https://cdn.corenexis.com/f/uYBWh9GWeEE.png"
  },
  {
    step: 2,
    title: "Step 2: Complete the First Square",
    instruction: "Close the square by drawing the remaining top and right side lines to form the front face of the cube.",
    tips: ["Ensure right angles at the corners", "Keep lines clean"],
    imageUrl: "https://cdn.corenexis.com/f/3yBwlyjDQTY.png"
  },
  {
    step: 3,
    title: "Step 3: Draw the Second Offset Square",
    instruction: "Draw a second identical square overlapping behind and slightly offset to form the back-depth perspective.",
    tips: ["Keep the square dimensions identical", "Align placement carefully"],
    imageUrl: "https://cdn.corenexis.com/f/zk8Yd7Nptkv.png"
  },
  {
    step: 4,
    title: "Step 4: Connect the Corners",
    instruction: "Connect the corresponding corners of the front and back squares with diagonal lines to give the shape 3D depth.",
    tips: ["Check parallel alignment", "Make sure all four corners connect"],
    imageUrl: "https://cdn.corenexis.com/f/j2KxbycAJPu.png"
  },
  {
    step: 5,
    title: "Step 5: Clean Up & Final Edges",
    instruction: "Review your structure, darken the visible outer lines, and ensure all perspective edges look solid.",
    tips: ["Darken main structural lines", "Double-check proportions"],
    imageUrl: "https://cdn.corenexis.com/f/21LDoCKkRcS.png"
  },
  {
    step: 6,
    title: "Step 6: Color & Shading",
    instruction: "Complete your 3D cube by adding flat color or gradient shading to distinguish the top, front, and side faces.",
    tips: ["Use different tones for each face", "Keep color smooth and clean"],
    imageUrl: "https://cdn.corenexis.com/f/YYS6Kpptv7X.png"
  }
];

const PORTRAIT_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: The Base Sphere & Cranial Mass",
    instruction: "Start with a light, organic circle representing the cranium. Keep your initial lines loose and feathery to establish overall volume.",
    tips: ["Keep strokes feather-light", "Establish center axis early"],
    imageUrl: "https://cdn.corenexis.com/f/I29zoTSWeLE.png"
  },
  {
    step: 2,
    title: "Step 2: Slicing the Sides & Establishing Planes",
    instruction: "Slice off the sides of the sphere to create the temporal/side planes where the cranium meets the jaw and cheekbone structure.",
    tips: ["Measure proportions carefully", "Keep side planes balanced"],
    imageUrl: "https://cdn.corenexis.com/f/uQX5AsXbFcD.png"
  },
  {
    step: 3,
    title: "Step 3: The Three Equal Divisions & Brow Line",
    instruction: "Project the brow line and centerline forward. Divide the face vertically into three equal sections (1/3 ratio): hairline-to-brow, brow-to-nose, and nose-to-chin.",
    tips: ["Maintain dynamic flow", "Account for tilt perspective"],
    imageUrl: "https://cdn.corenexis.com/f/qi4ja3E9OWf.png"
  },
  {
    step: 4,
    title: "Step 4: Jaw Structure, Ear Placement & Neck",
    instruction: "Outline the jawline extending down from the temporal plane. Position the ear between the brow line and nose base, then anchor the neck structure securely.",
    tips: ["Avoid stiff neck lines", "Let trapezius muscles slope naturally"],
    imageUrl: "https://cdn.corenexis.com/f/F07fBpQIzDQ.png"
  },
  {
    step: 5,
    title: "Step 5: Facial Mapping & Contour Construction",
    instruction: "Map out sockets for the eyes, nose bridge, cheekbones, and lips. Pay attention to foreshortening so the far eye appears narrower.",
    tips: ["Foreshorten the far eye", "Define shadow core edges"],
    imageUrl: "https://cdn.corenexis.com/f/8nRov0zsnTT.png"
  },
  {
    step: 6,
    title: "Step 6: Final Rendering, Shading & Hair Flow",
    instruction: "Refine contours and apply directional shading following muscle structure and hair flow. Add deep shadow cores and highlights for a 3D finish.",
    tips: ["Deepen shadows under jaw & chin", "Keep highlights sharp"],
    imageUrl: "https://cdn.corenexis.com/f/MHi11ZdQQSz.png"
  }
];

export default function ChallengesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>("");

  const [totalXp, setTotalXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  
  const [activeView, setActiveView] = useState<'hub' | 'challenge-flow'>('hub');
  const [selectedCategory, setSelectedCategory] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeChallengeId, setActiveChallengeId] = useState<string>('beginner-cube-drawing');

  const processUserData = useCallback(async (user: { id: string; email?: string; user_metadata?: { full_name?: string } }) => {
    if (!user) return;

    const currentUserId = user.id;
    setUserId(currentUserId);

    const defaultName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Artist';

    let { data: userData, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .maybeSingle();

    if (fetchErr) console.error("Profile fetch error:", fetchErr.message);

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
      
      const comp = Array.isArray(userData.completed_challenges) ? userData.completed_challenges : [];
      setCompletedChallenges(comp);
    }
  }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      setLoading(false);
      router.push('/login');
      return;
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: any } }) => {
      if (session?.user && isMounted) {
        await processUserData(session.user);
        setLoading(false);
      } else {
        setTimeout(() => {
          if (isMounted && loading) {
            setLoading(false);
          }
        }, 1500);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user) {
        if (isMounted) {
          await processUserData(session.user);
          setLoading(false);
        }
      } else {
        if (event === 'SIGNED_OUT') {
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
  }, [router, processUserData, loading]);

  const handleFinishChallenge = async (challengeId: string, rewardXp: number) => {
    if (!userId) return;

    const safeCompleted = Array.isArray(completedChallenges) ? completedChallenges : [];
    const alreadyCompleted = safeCompleted.includes(challengeId);
    
    if (alreadyCompleted) {
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

    const newXp = totalXp + rewardXp;
    const updatedCompleted = [...safeCompleted, challengeId];
    
    setTotalXp(newXp);
    setStreak(newStreak);
    setLastActivityDate(today);
    setCompletedChallenges(updatedCompleted);
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
      } catch (err) {
        console.error("Unexpected error saving XP:", err);
      }
    }
  };

  const renderStepIllustration = (imageUrl?: string) => {
    if (imageUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center p-2">
          <img src={imageUrl} alt="Step reference" className="max-h-80 w-full object-contain rounded-xl shadow-sm" />
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white px-6 py-4 rounded-2xl border border-blue-100 text-slate-900 font-bold flex items-center gap-3 shadow-xl">
          <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs tracking-wider uppercase text-orange-600">Checking Session...</span>
        </div>
      </div>
    );
  }

  const getCurrentStepsList = () => {
    if (activeChallengeId === 'beginner-cube-drawing') return CUBE_STEPS;
    if (activeChallengeId === 'advanced-portrait-loomis') return PORTRAIT_STEPS;
    return EYE_STEPS;
  };

  const currentStepsList = getCurrentStepsList();
  
  const getCurrentChallengeReward = () => {
    if (activeChallengeId === 'beginner-cube-drawing') return 80;
    if (activeChallengeId === 'advanced-portrait-loomis') return 120;
    return 100;
  };

  const currentChallengeReward = getCurrentChallengeReward();
  
  const safeCompletedChallenges = Array.isArray(completedChallenges) ? completedChallenges : [];
  const isCurrentCompleted = safeCompletedChallenges.includes(activeChallengeId);

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 p-4 md:p-10 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Navigation Bar */}
        <div className="bg-white border border-blue-100 p-4 rounded-2xl shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold border border-orange-200 flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Challenges Hub</h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">Master drawing skills and track your personal progress.</p>
            </div>
          </div>
          <button 
            onClick={() => { router.push('/dashboard'); }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-2xl font-bold text-xs transition flex items-center gap-2 cursor-pointer flex-shrink-0 border border-blue-100"
          >
            <ArrowLeft className="w-4 h-4 text-orange-600" /> Dashboard
          </button>
        </div>

        {activeView === 'hub' ? (
          <div className="space-y-8">
            {/* Hero Stats Card */}
            <div className="bg-white text-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border-2 border-blue-900 space-y-6 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-50 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="space-y-3 max-w-lg text-center md:text-left z-10">
                <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-orange-600" /> Learning Path
                </div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">Improve Your Drawing Skills</h1>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Complete challenges across different skill levels, earn XP and maintain your daily streak.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 w-full md:w-auto z-10">
                <div className="text-center px-3 py-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Total XP</span>
                  <span className="text-base font-black text-orange-600 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5" /> {totalXp}
                  </span>
                </div>
                <div className="text-center px-3 py-1 border-l border-blue-100">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Streak</span>
                  <span className="text-base font-black text-orange-600 flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {streak}d
                  </span>
                </div>
                <div className="text-center px-3 py-1 border-t border-blue-100 pt-2 col-span-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Completed Challenges</span>
                  <span className="text-base font-black text-slate-900 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-orange-600" /> {safeCompletedChallenges.length} / 3
                  </span>
                </div>
              </div>
            </div>

            {/* LEVEL SELECTION TABS */}
            <div className="grid grid-cols-3 gap-2 bg-blue-100/60 p-1.5 rounded-2xl border border-blue-200">
              <button
                onClick={() => setSelectedCategory('beginner')}
                className={`py-3 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                  selectedCategory === 'beginner' 
                    ? 'bg-orange-600 text-white shadow-md' 
                    : 'bg-white/80 text-slate-700 hover:bg-white'
                }`}
              >
                <Layers className="w-4 h-4" /> Beginner
              </button>
              <button
                onClick={() => setSelectedCategory('intermediate')}
                className={`py-3 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                  selectedCategory === 'intermediate' 
                    ? 'bg-orange-600 text-white shadow-md' 
                    : 'bg-white/80 text-slate-700 hover:bg-white'
                }`}
              >
                <Zap className="w-4 h-4" /> Intermediate
              </button>
              <button
                onClick={() => setSelectedCategory('advanced')}
                className={`py-3 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                  selectedCategory === 'advanced' 
                    ? 'bg-orange-600 text-white shadow-md' 
                    : 'bg-white/80 text-slate-700 hover:bg-white'
                }`}
              >
                <Trophy className="w-4 h-4" /> Advanced
              </button>
            </div>

            {/* CONDITIONAL CONTENT BASED ON SELECTED TAB */}
            {selectedCategory === 'beginner' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold border border-green-200">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Beginner Level Lessons</h3>
                    <p className="text-xs text-slate-500">Essential fundamentals for starters</p>
                  </div>
                </div>

                {/* Challenge Card: Learn to Draw a Cube */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-blue-900 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-white" /> Beginner Essential
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center pt-2 md:pt-0">
                    <div className="w-28 h-24 bg-blue-50/50 rounded-2xl flex items-center justify-center border border-blue-100 flex-shrink-0 overflow-hidden shadow-inner">
                      <img src="https://cdn.corenexis.com/f/YYS6Kpptv7X.png" alt="Cube Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-2 flex-1 text-center md:text-left">
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-green-200">Beginner</span>
                        <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-orange-200">+80 XP Reward</span>
                        <span className="bg-blue-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 5 Minutes
                        </span>
                      </div>

                      <h4 className="text-xl md:text-2xl font-black text-slate-900">Learn to Draw a 3D Cube</h4>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                        Master basic perspective, intersecting lines, and surface shading to build your foundational 3D drawing skills.
                      </p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-2 items-center">
                      <button
                        onClick={() => { 
                          setActiveChallengeId('beginner-cube-drawing');
                          setActiveView('challenge-flow'); 
                          setCurrentStep(0); 
                        }}
                        className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-black px-6 py-3.5 rounded-2xl shadow-sm transition text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {safeCompletedChallenges.includes('beginner-cube-drawing') ? 'Review Challenge' : 'Start Challenge'} <ArrowRight className="w-4 h-4" />
                      </button>
                      {safeCompletedChallenges.includes('beginner-cube-drawing') && (
                        <span className="text-[10px] text-orange-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Completed (+80 XP Claimed)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'intermediate' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Intermediate Level Lessons</h3>
                    <p className="text-xs text-slate-500">Refine proportions, shading, and depth</p>
                  </div>
                </div>

                {/* Challenge Card: Eye Drawing */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-blue-900 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-white" /> Featured Masterclass
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center pt-2 md:pt-0">
                    <div className="w-28 h-24 bg-blue-50/50 rounded-2xl flex items-center justify-center border border-blue-100 flex-shrink-0 overflow-hidden shadow-inner">
                      <img src="https://cdn.corenexis.com/f/jGJJCV2Bi2l.png" alt="Eye Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-2 flex-1 text-center md:text-left">
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-200">Intermediate</span>
                        <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-orange-200">+100 XP Reward</span>
                        <span className="bg-blue-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 5 Minutes
                        </span>
                      </div>

                      <h4 className="text-xl md:text-2xl font-black text-slate-900">Eye Drawing Under 5 Minutes</h4>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                        Learn to draw a realistic eye step-by-step through guided learning modules and professional reference breakdowns.
                      </p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-2 items-center">
                      <button
                        onClick={() => { 
                          setActiveChallengeId('eye-drawing-1min');
                          setActiveView('challenge-flow'); 
                          setCurrentStep(0); 
                        }}
                        className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-black px-6 py-3.5 rounded-2xl shadow-sm transition text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {safeCompletedChallenges.includes('eye-drawing-1min') ? 'Review Challenge' : 'Start Challenge'} <ArrowRight className="w-4 h-4" />
                      </button>
                      {safeCompletedChallenges.includes('eye-drawing-1min') && (
                        <span className="text-[10px] text-orange-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Completed (+100 XP Claimed)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'advanced' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-200">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Advanced Level Lessons</h3>
                    <p className="text-xs text-slate-500">Complex anatomy & masterclass execution</p>
                  </div>
                </div>

                {/* Challenge Card: Master Face Outline by Loomis Method */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-blue-900 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-white" /> Featured Masterclass
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center pt-2 md:pt-0">
                    <div className="w-28 h-24 bg-blue-50/50 rounded-2xl flex items-center justify-center border border-blue-100 flex-shrink-0 overflow-hidden shadow-inner">
                      <img src="https://cdn.corenexis.com/f/MHi11ZdQQSz.png" alt="Portrait Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-2 flex-1 text-center md:text-left">
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-purple-200">Advanced</span>
                        <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-orange-200">+120 XP Reward</span>
                        <span className="bg-blue-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 10 Minutes
                        </span>
                      </div>

                      <h4 className="text-xl md:text-2xl font-black text-slate-900">Master Face Outline by Loomis Method</h4>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                        Learn advanced 3/4 view portrait construction, facial proportions, and structural shading using the classic Loomis method.
                      </p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-2 items-center">
                      <button
                        onClick={() => { 
                          setActiveChallengeId('advanced-portrait-loomis');
                          setActiveView('challenge-flow'); 
                          setCurrentStep(0); 
                        }}
                        className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-black px-6 py-3.5 rounded-2xl shadow-sm transition text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {safeCompletedChallenges.includes('advanced-portrait-loomis') ? 'Review Challenge' : 'Start Challenge'} <ArrowRight className="w-4 h-4" />
                      </button>
                      {safeCompletedChallenges.includes('advanced-portrait-loomis') && (
                        <span className="text-[10px] text-orange-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Completed (+120 XP Claimed)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* LEARNING STEP-BY-STEP VIEW */
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-blue-900 space-y-6">
            <div className="flex justify-between items-center border-b border-blue-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-lg uppercase">
                  Step {currentStep + 1} of {currentStepsList.length}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">{currentStepsList[currentStep].title}</h3>
              </div>
              <button 
                onClick={() => setActiveView('hub')}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-2xl transition cursor-pointer border border-blue-100"
              >
                Exit Challenge
              </button>
            </div>

            {/* Step Illustration */}
            <div className="w-full h-80 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden p-2">
              {renderStepIllustration(currentStepsList[currentStep].imageUrl)}
            </div>

            {/* Instructions & Tips */}
            <div className="space-y-4">
              <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed">
                {currentStepsList[currentStep].instruction}
              </p>

              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider">Pro Tips:</h4>
                <ul className="space-y-1">
                  {currentStepsList[currentStep].tips.map((tip, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-top border-blue-100">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition cursor-pointer border border-blue-100"
              >
                Previous Step
              </button>

              {currentStep < currentStepsList.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => Math.min(currentStepsList.length - 1, prev + 1))}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-orange-600 text-white hover:bg-orange-700 transition flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await handleFinishChallenge(activeChallengeId, currentChallengeReward);
                  }}
                  className="px-6 py-3 rounded-xl font-black text-xs bg-orange-600 text-white hover:bg-orange-700 transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" /> {isCurrentCompleted ? 'Finish & Return' : `Finish & Claim +${currentChallengeReward} XP`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}