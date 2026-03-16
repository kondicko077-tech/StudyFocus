import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Clock, Flame, Shield, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Profile() {
  const { user } = useStore();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0F1419] text-white p-6">
      <header className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-[#1A202C] rounded-full hover:bg-white/10 transition-colors mr-4">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Profile</h1>
      </header>

      {/* Profile Card */}
      <div className="bg-[#1A202C] rounded-3xl p-8 flex flex-col items-center text-center mb-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#6B4EE6]/20 to-transparent" />
        
        <div className="relative w-24 h-24 mb-4 z-10">
          <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full bg-[#0F1419] border-4 border-[#1A202C]" />
          <div className="absolute -bottom-2 -right-2 bg-[#FF6B35] text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-[#1A202C]">
            Lvl {user.level}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-1 z-10">{user.displayName}</h2>
        <p className="text-[#1DD3B0] font-medium text-sm z-10">{user.field}</p>
        
        <div className="mt-6 flex items-center justify-center gap-6 w-full z-10">
          <div className="text-center">
            <div className="text-2xl font-bold">{user.totalSessions}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Sessions</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(user.totalMinutes / 60)}h</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Studied</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#FF6B35]">{user.points}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Points</div>
          </div>
        </div>
      </div>

      {/* Badges / Achievements */}
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Achievements</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1A202C] p-4 rounded-2xl border border-white/5 flex items-center gap-4 opacity-100">
          <div className="w-12 h-12 bg-[#6B4EE6]/20 rounded-full flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-[#6B4EE6]" />
          </div>
          <div>
            <div className="font-bold text-sm">First Focus</div>
            <div className="text-xs text-gray-400">Completed 1 session</div>
          </div>
        </div>
        
        <div className="bg-[#1A202C] p-4 rounded-2xl border border-white/5 flex items-center gap-4 opacity-50 grayscale">
          <div className="w-12 h-12 bg-[#1DD3B0]/20 rounded-full flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-[#1DD3B0]" />
          </div>
          <div>
            <div className="font-bold text-sm">Battle Won</div>
            <div className="text-xs text-gray-400">Win 1 Focus Battle</div>
          </div>
        </div>
        
        <div className="bg-[#1A202C] p-4 rounded-2xl border border-white/5 flex items-center gap-4 opacity-50 grayscale">
          <div className="w-12 h-12 bg-[#FF6B35]/20 rounded-full flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-[#FF6B35]" />
          </div>
          <div>
            <div className="font-bold text-sm">Scholar</div>
            <div className="text-xs text-gray-400">Reach Level 10</div>
          </div>
        </div>
        
        <div className="bg-[#1A202C] p-4 rounded-2xl border border-white/5 flex items-center gap-4 opacity-50 grayscale">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <div className="font-bold text-sm">Deep State</div>
            <div className="text-xs text-gray-400">100% Focus Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
