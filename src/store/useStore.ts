import { create } from 'zustand';

export type UserProfile = {
  uid: string;
  displayName: string;
  field: string;
  avatar: string;
  createdAt: any;
  totalSessions: number;
  totalMinutes: number;
  points: number;
  level: number;
  energyScore: number;
};

export type SessionState = {
  id: string | null;
  type: 'solo' | 'battle' | null;
  participants: string[];
  status: 'active' | 'completed' | 'abandoned' | null;
  startTime: any | null;
  targetDuration: number;
  opponent?: UserProfile | null;
};

interface AppState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  
  session: SessionState;
  setSession: (session: Partial<SessionState>) => void;
  clearSession: () => void;
  
  cameraEnabled: boolean;
  setCameraEnabled: (enabled: boolean) => void;
  
  currentRoom: string;
  setCurrentRoom: (room: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  session: {
    id: null,
    type: null,
    participants: [],
    status: null,
    startTime: null,
    targetDuration: 25,
    opponent: null,
  },
  setSession: (updates) => set((state) => ({ session: { ...state.session, ...updates } })),
  clearSession: () => set({ session: { id: null, type: null, participants: [], status: null, startTime: null, targetDuration: 25, opponent: null } }),
  
  cameraEnabled: true,
  setCameraEnabled: (enabled) => set({ cameraEnabled: enabled }),
  
  currentRoom: 'Silent Library',
  setCurrentRoom: (room) => set({ currentRoom: room }),
}));
