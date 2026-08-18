import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables in .env.local')
}

// Safe client creator function
export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}

// Singleton instance for general use
export const supabase = typeof window !== 'undefined' ? createClient() : (null as any);

const STORAGE_KEY = 'pencil_pilot_user_data_v1';

export interface ChallengeStep {
  id: string;
  text: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rewardPoints: number;
  estimatedTime: string;
  goal: string;
  iconType: string;
  steps: ChallengeStep[];
}

export interface UserDataState {
  totalPoints: number;
  completedChallengeIds: string[];
  progress: Record<string, any>;
  lastDailyScanRewardDate: string | null;
}

const defaultUserData: UserDataState = {
  totalPoints: 150,
  completedChallengeIds: [],
  progress: {},
  lastDailyScanRewardDate: null,
};

// Fetch specific user data using their ID/Name
export async function getUserData(userId: string = 'Harjass'): Promise<UserDataState> {
  if (typeof window === 'undefined') return defaultUserData;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return {
          totalPoints: data.total_points ?? 150,
          completedChallengeIds: data.completed_challenges ?? [],
          progress: data.challenge_progress ?? {},
          lastDailyScanRewardDate: data.last_daily_scan_reward ?? null,
        };
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to LocalStorage:', err);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultUserData;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUserData));
  return defaultUserData;
}

// Save specific user data with debug logs
export async function saveUserData(data: UserDataState, userId: string = 'Harjass'): Promise<void> {
  console.log("➡️ saveUserData function chala! Data:", data);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("✅ LocalStorage mein save ho gaya");
  }

  if (supabase) {
    try {
      console.log("☁️ Supabase ko data bhej rahe hain... ID:", userId);
      const { data: resData, error } = await supabase.from('profile').upsert({
        id: userId,
        total_points: data.totalPoints,
        completed_challenges: data.completedChallengeIds,
        challenge_progress: data.progress,
        last_daily_scan_reward: data.lastDailyScanRewardDate,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('❌ Supabase save error:', error);
      } else {
        console.log('🎉 Supabase par successfully save ho gaya!', resData);
      }
    } catch (err) {
      console.error('💥 Failed to sync user data to Supabase:', err);
    }
  } else {
    console.warn('⚠️ Supabase client available nahi hai!');
  }
}

// Fetch all profiles for the Leaderboard
export async function getLeaderboardData() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .order('total_points', { ascending: false });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return [];
  }
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'eye-drawing',
    title: 'Eye Drawing Challenge',
    description: 'Master realistic eye shapes, highlights, iris details, and natural eyelash sweeps.',
    difficulty: 'Easy',
    rewardPoints: 50,
    estimatedTime: '15 mins',
    goal: 'Draw a realistic eye with correct iris depth, specular highlights, and natural eyelash curves.',
    iconType: 'eye',
    steps: [
      { id: 'step-1', text: 'Outline the main almond shape of the eye.' },
      { id: 'step-2', text: 'Sketch the inner iris circle and center pupil.' },
      { id: 'step-3', text: 'Define the upper eyelid crease and inner tear duct.' },
      { id: 'step-4', text: 'Shade the pupil dark while preserving a crisp light reflection highlight.' },
      { id: 'step-5', text: 'Add curved eyelash strokes extending outwards from eyelid margins.' },
      { id: 'step-6', text: 'Add subtle shadow gradients along the upper sclera (white of eye).' },
    ],
  },
  {
    id: 'face-proportion',
    title: 'Face Proportion Challenge',
    description: 'Learn standard facial feature guidelines using vertical and horizontal axis lines.',
    difficulty: 'Medium',
    rewardPoints: 50,
    estimatedTime: '20 mins',
    goal: 'Construct a proportioned front-facing head oval with accurately aligned eyes, nose, and mouth.',
    iconType: 'face',
    steps: [
      { id: 'step-1', text: 'Draw an egg-shaped head oval and divide it vertically in half.' },
      { id: 'step-2', text: 'Place horizontal centerline for eye placement.' },
      { id: 'step-3', text: 'Divide lower half into nose line and chin line.' },
      { id: 'step-4', text: 'Place mouth line midway between nose base and chin.' },
      { id: 'step-5', text: 'Align eyes exactly 1 eye-width apart across the central eye line.' },
      { id: 'step-6', text: 'Position ears between top eyebrow line and bottom of nose.' },
      { id: 'step-7', text: 'Refine jaw contours and cheekbones.' },
    ],
  },
  {
    id: 'hand-sketch',
    title: 'Hand Sketch Challenge',
    description: 'Break down complex hand structures into simplified 3D geometric shapes.',
    difficulty: 'Hard',
    rewardPoints: 50,
    estimatedTime: '25 mins',
    goal: 'Construct an anatomically correct hand sketch starting from palm block to fingertips.',
    iconType: 'hand',
    steps: [
      { id: 'step-1', text: 'Draw a basic hand outline.' },
      { id: 'step-2', text: 'Mark finger positions.' },
      { id: 'step-3', text: 'Add finger proportions.' },
      { id: 'step-4', text: 'Refine the palm structure.' },
      { id: 'step-5', text: 'Add details and nails.' },
      { id: 'step-6', text: 'Improve line quality.' },
      { id: 'step-7', text: 'Add shadows.' },
      { id: 'step-8', text: 'Finalize the sketch.' },
    ],
  },
  {
    id: 'perspective-room',
    title: 'Perspective Room Challenge',
    description: 'Construct a 3D interior room drawing using one-point perspective techniques.',
    difficulty: 'Medium',
    rewardPoints: 50,
    estimatedTime: '30 mins',
    goal: 'Create a room interior with accurate depth lines converging at a single vanishing point.',
    iconType: 'perspective',
    steps: [
      { id: 'step-1', text: 'Draw a horizontal eye-level line and place a central vanishing point.' },
      { id: 'step-2', text: 'Draw a centered rectangle for the back room wall.' },
      { id: 'step-3', text: 'Connect back wall corners to vanishing point to project side walls, floor, and ceiling.' },
      { id: 'step-4', text: 'Sketch floor grid lines converging toward the vanishing point.' },
      { id: 'step-5', text: 'Add rectangular furniture bounding boxes following perspective lines.' },
      { id: 'step-6', text: 'Draw side windows and door frames using vertical and perspective guides.' },
      { id: 'step-7', text: 'Refine final line weights and add cast ambient shadows.' },
    ],
  },
  {
    id: 'shading-practice',
    title: 'Shading Practice Challenge',
    description: 'Render smooth value transitions, core shadows, and reflected light on a 3D sphere.',
    difficulty: 'Easy',
    rewardPoints: 50,
    estimatedTime: '15 mins',
    goal: 'Shade a sphere to display realistic 5-value lighting from key light to cast shadow.',
    iconType: 'shading',
    steps: [
      { id: 'step-1', text: 'Draw a clean circle outline and designate an upper light source angle.' },
      { id: 'step-2', text: 'Lightly map out highlight, midtone, core shadow, and cast shadow boundaries.' },
      { id: 'step-3', text: 'Apply uniform smooth midtone shading with gentle pencil pressure.' },
      { id: 'step-4', text: 'Darken the core shadow region opposite to light direction.' },
      { id: 'step-5', text: 'Leave soft reflected light along the lower outer rim edge.' },
      { id: 'step-6', text: 'Render a crisp, dark cast shadow on the ground surface below.' },
    ],
  },
];