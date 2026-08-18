"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Trophy, 
  Flame, 
  ArrowLeft, 
  Clock, 
  CheckCircle,
  Share2,
  Download,
  X,
  Sparkles
} from 'lucide-react';

interface Profile {
  id: string;
  name: string | null;
  xp: number;
  streak: number;
  completed_challenges?: any[];
  avatar_seed?: string | null;
}

const getCartoonAvatar = (seed: string) => {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed || 'artist')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

// Canvas roundRect Polyfill Helper (Prevents crash on Safari/Mobile)
const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Fetch Current Logged-In User & Profile Direct Fallback
  useEffect(() => {
    async function fetchUser() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, xp, streak, completed_challenges, avatar_seed')
          .eq('id', user.id)
          .maybeSingle();
        if (profile) setUserProfile(profile);
      }
    }
    fetchUser();
  }, []);

  // 2. Fetch Leaderboard profiles sorted by XP
  const fetchLeaderboard = useCallback(async () => {
    if (!supabase) { 
      setLoading(false); 
      return; 
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, xp, streak, completed_challenges, avatar_seed')
      .order('xp', { ascending: false });
    
    if (data && !error) setLeaderboard(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // 3. Real Midnight UTC Countdown (Persistent 24hr Timer)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setUTCHours(23, 59, 59, 999);

      const diff = endOfDay.getTime() - now.getTime();

      if (diff <= 0) {
        fetchLeaderboard();
        return;
      }

      setTimeLeft({
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [fetchLeaderboard]);

  // Current user info
  const currentUserIndex = leaderboard.findIndex(u => u.id === userId);
  const currentUser = currentUserIndex !== -1 ? leaderboard[currentUserIndex] : userProfile;
  const userRank = currentUserIndex !== -1 ? currentUserIndex + 1 : 'N/A';

  // 4. Generate & Draw Canvas Share Card with User Avatar
  useEffect(() => {
    if (!showShareModal || !currentUser || !canvasRef.current) return;

    let isSubscribed = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;

    // Background Blue Gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#2563EB');
    grad.addColorStop(1, '#1D4ED8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative Dots Grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let x = 40; x < 1080; x += 60) {
      for (let y = 40; y < 1080; y += 60) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Brand Title Header
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 48px sans-serif';
    ctx.fillText('Pencil Pilot', 120, 120);
    ctx.fillStyle = '#93C5FD';
    ctx.font = '600 28px sans-serif';
    ctx.fillText('AI Drawing Coach', 120, 160);

    // Tagline
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 82px sans-serif';
    ctx.fillText('Make it', 120, 340);
    ctx.fillText('finally', 120, 440);
    ctx.fillText('click.', 120, 540);

    // Card Container (White)
    const cardX = 540;
    const cardY = 160;
    const cardW = 460;
    const cardH = 760;
    const radius = 40;

    ctx.save();
    ctx.beginPath();
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, radius);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.restore();

    // Card Rank Badge
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    drawRoundRect(ctx, cardX + 40, cardY + 40, 380, 64, 18);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`GLOBAL RANK #${userRank}`, cardX + 230, cardY + 82);

    const drawCardDetails = () => {
      if (!isSubscribed) return;
      ctx.textAlign = 'center';

      // User Name
      ctx.fillStyle = '#0F172A';
      ctx.font = '800 38px sans-serif';
      ctx.fillText(currentUser.name || 'Artist Pilot', cardX + 230, cardY + 295);

      // User XP Badge Box
      ctx.fillStyle = '#FEF3C7';
      ctx.beginPath();
      drawRoundRect(ctx, cardX + 70, cardY + 330, 320, 80, 24);
      ctx.fill();

      ctx.fillStyle = '#D97706';
      ctx.font = '900 40px sans-serif';
      ctx.fillText(`${currentUser.xp || 0} XP`, cardX + 230, cardY + 384);

      // Streak
      ctx.fillStyle = '#475569';
      ctx.font = '700 22px sans-serif';
      ctx.fillText(`🔥 ${currentUser.streak || 0} Day Streak`, cardX + 230, cardY + 460);

      // Footer Brand
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 20px sans-serif';
      ctx.fillText('pencilpilot.com', cardX + 230, cardY + 680);
    };

    // Load & Draw User Avatar Image
    const avatarImg = new Image();
    avatarImg.crossOrigin = 'anonymous';
    avatarImg.src = getCartoonAvatar(currentUser.avatar_seed || currentUser.name || '');

    avatarImg.onload = () => {
      if (!isSubscribed) return;
      const avatarX = cardX + 230;
      const avatarY = cardY + 185;
      const avatarRadius = 55;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#3B82F6';
      ctx.stroke();

      drawCardDetails();
    };

    avatarImg.onerror = () => {
      if (!isSubscribed) return;
      drawCardDetails();
    };

    return () => {
      isSubscribed = false;
    };
  }, [showShareModal, currentUser, userRank]);

  // Download Card as PNG
  const handleDownloadCard = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `pencil-pilot-rank-${userRank || 'status'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-blue-600 to-blue-800 text-slate-900 p-6 md:p-10 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-8">
        
        {/* Top Navigation Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-md flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold border border-amber-100">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Artist Leaderboard</h2>
              <p className="text-[11px] text-slate-500">Global rankings based on XP and completed challenges.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(currentUser || userId) && (
              <button 
                onClick={() => setShowShareModal(true)}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4" /> Share Rank
              </button>
            )}

            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
          </div>
        </div>

        {/* Header & Reset Timer Card */}
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800">
              Competitive Season
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white">Top Community Artists</h1>
            <p className="text-xs text-slate-400">XP rankings update live as challenges are completed.</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-2xl flex items-center gap-3 text-center">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Daily Reset Countdown</span>
              <span className="text-sm font-black text-white font-mono">
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-xl text-xs text-slate-500 font-medium">
            Loading leaderboard rankings...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-xl space-y-2">
            <p className="text-sm font-bold text-slate-800">No artists ranked yet</p>
            <p className="text-xs text-slate-500">Complete challenges to secure the first rank!</p>
          </div>
        ) : (
          <div className="bg-white text-slate-900 p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
            
            {/* TOP 3 PODIUM SECTION */}
            {leaderboard.length >= 1 && (
              <div className="flex justify-center items-end gap-4 pt-12 pb-6 px-4 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-100">
                
                {/* 2nd Place */}
                {leaderboard[1] && (
                  <div className={`flex flex-col items-center space-y-2 w-28 text-center p-3 rounded-2xl border ${leaderboard[1].id === userId ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-400' : 'border-slate-200 bg-white'}`}>
                    <div className="relative">
                      <img 
                        src={getCartoonAvatar(leaderboard[1].avatar_seed || leaderboard[1].name || '')} 
                        alt="avatar" 
                        className="w-14 h-14 rounded-2xl border-2 border-slate-400 shadow-md bg-slate-100 object-cover p-0.5" 
                      />
                      <span className="absolute -top-4 -right-1 text-base">🥈</span>
                    </div>
                    <div className="w-full">
                      <h4 className="font-bold text-xs text-slate-800 truncate">{leaderboard[1]?.name || 'User'}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Level {Math.floor((leaderboard[1]?.xp || 0) / 100) + 1}</p>
                    </div>
                    <div className="bg-slate-100 border border-slate-200 rounded-xl py-1.5 px-2 w-full shadow-inner">
                      <span className="text-slate-700 font-black text-xs block">{leaderboard[1]?.xp || 0}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">pts</span>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {leaderboard[0] && (
                  <div className={`flex flex-col items-center space-y-2 w-32 text-center p-3 rounded-2xl border-2 ${leaderboard[0].id === userId ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-400' : 'border-amber-400 bg-amber-50/20'} -mt-8 shadow-lg`}>
                    <div className="relative">
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl">🥇</div>
                      <img 
                        src={getCartoonAvatar(leaderboard[0].avatar_seed || leaderboard[0].name || '')} 
                        alt="avatar" 
                        className="w-18 h-18 rounded-3xl border-2 border-amber-500 shadow-xl bg-amber-100 object-cover p-0.5" 
                      />
                    </div>
                    <div className="w-full">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">{leaderboard[0]?.name || 'User'}</h4>
                      <p className="text-[10px] text-amber-600 font-bold">Level {Math.floor((leaderboard[0]?.xp || 0) / 100) + 1}</p>
                    </div>
                    <div className="bg-amber-100 border border-amber-300 rounded-xl py-2 px-3 w-full shadow-inner">
                      <span className="text-amber-800 font-black text-sm block">{leaderboard[0]?.xp || 0}</span>
                      <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">pts</span>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {leaderboard[2] && (
                  <div className={`flex flex-col items-center space-y-2 w-28 text-center p-3 rounded-2xl border ${leaderboard[2].id === userId ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-400' : 'border-amber-700/40 bg-white'}`}>
                    <div className="relative">
                      <img 
                        src={getCartoonAvatar(leaderboard[2].avatar_seed || leaderboard[2].name || '')} 
                        alt="avatar" 
                        className="w-14 h-14 rounded-2xl border-2 border-amber-600 shadow-md bg-amber-50 object-cover p-0.5" 
                      />
                      <span className="absolute -top-4 -right-1 text-base">🥉</span>
                    </div>
                    <div className="w-full">
                      <h4 className="font-bold text-xs text-slate-800 truncate">{leaderboard[2]?.name || 'User'}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Level {Math.floor((leaderboard[2]?.xp || 0) / 100) + 1}</p>
                    </div>
                    <div className="bg-slate-100 border border-slate-200 rounded-xl py-1.5 px-2 w-full shadow-inner">
                      <span className="text-amber-700 font-black text-xs block">{leaderboard[2]?.xp || 0}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">pts</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4TH RANK ONWARDS LIST SECTION */}
            {leaderboard.length > 3 && (
              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                  Other Ranked Artists
                </h3>
                <div className="space-y-2.5">
                  {leaderboard.slice(3).map((user, idx) => {
                    const rankNum = idx + 4;
                    const isCurrentUser = user.id === userId;
                    return (
                      <div 
                        key={user.id || idx} 
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                          isCurrentUser 
                            ? 'bg-blue-50 border-2 border-blue-500 shadow-sm' 
                            : 'bg-slate-50 border border-slate-200 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-black text-amber-500 text-sm w-6">#{rankNum}</span>
                          <img 
                            src={getCartoonAvatar(user.avatar_seed || user.name || '')} 
                            alt="avatar" 
                            className="w-10 h-10 rounded-xl bg-blue-100 object-cover border border-slate-200 shadow-sm flex-shrink-0 p-0.5" 
                          />
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                              {user.name || `Artist #${rankNum}`}
                              {isCurrentUser && (
                                <span className="bg-blue-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                  You
                                </span>
                              )}
                            </h4>
                            <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-500" /> {user.streak || 0}d streak</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5"><CheckCircle className="w-3 h-3 text-blue-500" /> {user.completed_challenges?.length || 0} challenges</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900 block">
                            {user.xp || 0}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
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
        )}

      </div>

      {/* SHARE RANK INSTAGRAM CARD MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Share Your Rank</h3>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Canvas Card Preview */}
            <div className="flex justify-center bg-slate-100 rounded-2xl p-2 border border-slate-200 overflow-hidden">
              <canvas ref={canvasRef} className="w-full max-w-[360px] h-auto rounded-xl shadow-md" />
            </div>

            <div className="space-y-2">
              <button 
                onClick={handleDownloadCard}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-indigo-500/20"
              >
                <Download className="w-4 h-4" /> Download Share Card (PNG)
              </button>
              <p className="text-[11px] text-slate-500 text-center">
                Download the image and directly upload it to Instagram Stories or Posts!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}