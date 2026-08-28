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

const VALID_AVATARS = ['artist', 'doodle', 'sketch', 'creative', 'fox', 'paints'];

const getCartoonAvatar = (seed: string) => {
  const safeSeed = VALID_AVATARS.includes(seed) ? seed : 'artist';
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(safeSeed)}&backgroundColor=ffe5cc,ffdfbf,ffd5dc,d1d4f9`;
};

// Canvas roundRect Polyfill Helper
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

const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
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

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

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

  const currentUserIndex = leaderboard.findIndex(u => u.id === userId);
  const currentUser = currentUserIndex !== -1 ? leaderboard[currentUserIndex] : (userProfile || leaderboard[0] || null);
  const userRank = currentUserIndex !== -1 ? currentUserIndex + 1 : (userProfile ? 'N/A' : 1);

  useEffect(() => {
    if (!showShareModal || !currentUser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#FF8A00');
    grad.addColorStop(1, '#E07900');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative Dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let x = 40; x < 1080; x += 60) {
      for (let y = 40; y < 1080; y += 60) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const drawEverything = (imgObj: HTMLImageElement | null) => {
      if (imgObj) {
        try {
          ctx.drawImage(imgObj, 120, 90, 280, 85);
        } catch (e) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '900 48px sans-serif';
          ctx.fillText('DoodleFox', 120, 150);
        }
      }

      // Tagline
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 56px sans-serif';
      wrapText(ctx, `Featured on DoodleFox leaderboard with #${userRank} rank!`, 120, 340, 380, 72);

      // White Card Container
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

      // Rank Badge Box inside card
      ctx.fillStyle = '#1E2A44';
      ctx.beginPath();
      drawRoundRect(ctx, cardX + 40, cardY + 40, 380, 64, 18);
      ctx.fill();

      ctx.fillStyle = '#FF8A00';
      ctx.font = '800 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`GLOBAL RANK #${userRank}`, cardX + 230, cardY + 82);

      // User Name
      ctx.fillStyle = '#1E2A44';
      ctx.font = '800 38px sans-serif';
      ctx.fillText(currentUser.name || 'DoodleFox Artist', cardX + 230, cardY + 295);

      // XP Badge Box
      ctx.fillStyle = '#FFF5EB';
      ctx.beginPath();
      drawRoundRect(ctx, cardX + 70, cardY + 330, 320, 80, 24);
      ctx.fill();

      ctx.fillStyle = '#FF8A00';
      ctx.font = '900 40px sans-serif';
      ctx.fillText(`${currentUser.xp || 0} XP`, cardX + 230, cardY + 384);

      // Streak
      ctx.fillStyle = '#64748B';
      ctx.font = '700 22px sans-serif';
      ctx.fillText(`🔥 ${currentUser.streak || 0} Day Streak`, cardX + 230, cardY + 460);

      // Avatar
      const avatarImg = new Image();
      avatarImg.crossOrigin = 'anonymous';
      avatarImg.src = getCartoonAvatar(currentUser.avatar_seed || 'artist');

      avatarImg.onload = () => {
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
        ctx.strokeStyle = '#FF8A00';
        ctx.stroke();
      };
    };

    const headerImg = new Image();
    headerImg.crossOrigin = 'anonymous';
    headerImg.src = 'https://cdn.corenexis.com/f/tloOLJdZaNP.png';

    headerImg.onload = () => drawEverything(headerImg);
    headerImg.onerror = () => drawEverything(null);

  }, [showShareModal, currentUser, userRank]);

  const handleDownloadCard = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `doodlefox-rank-${userRank || 'status'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("Download blocked by browser security restrictions. Try taking a screenshot instead!");
    }
  };

  return (
    <div className="min-h-screen font-sans bg-[#F1F3F6] text-slate-900 p-6 md:p-10 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-8">
        
        {/* Top Navbar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 text-[#FF8A00] rounded-xl flex items-center justify-center font-bold border border-orange-100 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1E2A44]">DoodleFox Leaderboard</h2>
              <p className="text-[11px] text-slate-500">Global rankings based on XP and completed sketches.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowShareModal(true)}
              className="bg-gradient-to-r from-[#FF8A00] to-[#e07900] hover:opacity-95 text-white px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4" /> Share Rank
            </button>

            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
          </div>
        </div>

        {/* Header & Reset Timer Card */}
        <div className="bg-[#1E2A44] text-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A00] bg-orange-950/80 px-3 py-1 rounded-full border border-orange-900/50">
              Live Season
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white">Top DoodleFox Artists</h1>
            <p className="text-xs text-slate-300">XP rankings update live as new drawing challenges are completed.</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-5 py-3 rounded-2xl flex items-center gap-3 text-center">
            <Clock className="w-5 h-5 text-[#FF8A00] flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Daily Reset Countdown</span>
              <span className="text-sm font-black text-white font-mono">
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-200 text-xs text-slate-500 font-medium">
            Loading leaderboard rankings...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-200 space-y-2">
            <p className="text-sm font-bold text-slate-800">No artists ranked yet</p>
            <p className="text-xs text-slate-500">Complete challenges to secure the #1 rank!</p>
          </div>
        ) : (
          <div className="bg-white text-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6 overflow-hidden">
            
            {/* TOP 3 PODIUM SECTION */}
            {leaderboard.length >= 1 && (
              <div className="flex justify-center items-end gap-3 sm:gap-4 pt-6 pb-6 px-2 sm:px-4 bg-gradient-to-b from-orange-50/30 to-white rounded-2xl border border-orange-100/60">
                {leaderboard[1] && (
                  <div className={`flex flex-col items-center space-y-2 w-28 text-center p-3 rounded-2xl border ${leaderboard[1].id === userId ? 'border-[#FF8A00] bg-orange-50/50 ring-2 ring-orange-400' : 'border-slate-200 bg-white'}`}>
                    <div className="relative">
                      <img src={getCartoonAvatar(leaderboard[1].avatar_seed || 'artist')} alt="avatar" className="w-14 h-14 rounded-2xl border-2 border-slate-300 shadow-sm bg-slate-100 object-cover p-0.5" />
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

                {leaderboard[0] && (
                  <div className={`flex flex-col items-center space-y-2 w-32 text-center p-3 rounded-2xl border-2 ${leaderboard[0].id === userId ? 'border-[#FF8A00] bg-orange-50/50 ring-4 ring-orange-400' : 'border-[#FF8A00] bg-orange-50/30'} shadow-md`}>
                    <div className="relative pt-2">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">🥇</div>
                      <img src={getCartoonAvatar(leaderboard[0].avatar_seed || 'artist')} alt="avatar" className="w-18 h-18 rounded-3xl border-2 border-[#FF8A00] shadow-md bg-orange-100 object-cover p-0.5" />
                    </div>
                    <div className="w-full">
                      <h4 className="font-extrabold text-sm text-[#1E2A44] truncate">{leaderboard[0]?.name || 'User'}</h4>
                      <p className="text-[10px] text-[#FF8A00] font-bold">Level {Math.floor((leaderboard[0]?.xp || 0) / 100) + 1}</p>
                    </div>
                    <div className="bg-orange-100/70 border border-orange-200 rounded-xl py-2 px-3 w-full shadow-inner">
                      <span className="text-orange-900 font-black text-sm block">{leaderboard[0]?.xp || 0}</span>
                      <span className="text-[9px] text-[#FF8A00] font-bold uppercase tracking-wider">pts</span>
                    </div>
                  </div>
                )}

                {leaderboard[2] && (
                  <div className={`flex flex-col items-center space-y-2 w-28 text-center p-3 rounded-2xl border ${leaderboard[2].id === userId ? 'border-[#FF8A00] bg-orange-50/50 ring-2 ring-orange-400' : 'border-amber-700/30 bg-white'}`}>
                    <div className="relative">
                      <img src={getCartoonAvatar(leaderboard[2].avatar_seed || 'artist')} alt="avatar" className="w-14 h-14 rounded-2xl border-2 border-amber-600/60 shadow-sm bg-amber-50 object-cover p-0.5" />
                      <span className="absolute -top-4 -right-1 text-base">🥉</span>
                    </div>
                    <div className="w-full">
                      <h4 className="font-bold text-xs text-slate-800 truncate">{leaderboard[2]?.name || 'User'}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Level {Math.floor((leaderboard[2]?.xp || 0) / 100) + 1}</p>
                    </div>
                    <div className="bg-slate-100 border border-slate-200 rounded-xl py-1.5 px-2 w-full shadow-inner">
                      <span className="text-amber-800 font-black text-xs block">{leaderboard[2]?.xp || 0}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">pts</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* REST OF THE LIST */}
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
                            ? 'bg-orange-50/60 border-2 border-[#FF8A00] shadow-sm' 
                            : 'bg-slate-50 border border-slate-200 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-black text-[#FF8A00] text-sm w-6">#{rankNum}</span>
                          <img src={getCartoonAvatar(user.avatar_seed || 'artist')} alt="avatar" className="w-10 h-10 rounded-xl bg-orange-100 object-cover border border-slate-200 shadow-sm flex-shrink-0 p-0.5" />
                          <div>
                            <h4 className="font-bold text-sm text-[#1E2A44] flex items-center gap-2">
                              {user.name || `Artist #${rankNum}`}
                              {isCurrentUser && (
                                <span className="bg-[#FF8A00] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">You</span>
                              )}
                            </h4>
                            <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-500" /> {user.streak || 0}d streak</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5"><CheckCircle className="w-3 h-3 text-[#FF8A00]" /> {user.completed_challenges?.length || 0} sketches</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900 block">{user.xp || 0}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">pts</span>
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

      {/* SHARE RANK CARD MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF8A00]" />
                <h3 className="font-bold text-base text-[#1E2A44]">Share Your Rank</h3>
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
                className="w-full bg-[#FF8A00] hover:bg-[#e07900] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
              >
                <Download className="w-4 h-4" /> Download Share Card (PNG)
              </button>
              <p className="text-[11px] text-slate-500 text-center">
                Download this card and share it on your Instagram Stories or status!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}