import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Swords, User, Zap, Clock, Trophy, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { createSoloSession } from '../services/session';

export default function Home() {
  const { user } = useStore();
  const navigate = useNavigate();

  const handleSolo = async () => {
    try {
      const sessionId = await createSoloSession(user!.uid, 25);
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error creating solo session:', error);
      alert('Failed to start session');
    }
  };

  if (!user) return null;

  const energyColor = user.energyScore > 70 ? 'bg-[#1DD3B0]' : user.energyScore > 40 ? 'bg-[#FF6B35]' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-[#0F1419] text-white p-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full bg-[#1A202C] border border-white/10" />
          <div>
            <h1 className="text-xl font-bold font-sans tracking-tight">{user.displayName}</h1>
            <p className="text-sm text-gray-400">Lvl {user.level} • {user.field}</p>
          </div>
        </div>
        <button onClick={() => navigate('/profile')} className="p-2 bg-[#1A202C] rounded-full hover:bg-white/10 transition-colors">
          <User className="w-5 h-5 text-gray-300" />
        </button>
      </header>

      {/* Energy Score Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A202C] rounded-2xl p-6 mb-6 border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap className="w-24 h-24" />
        </div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Study Energy Score</h2>
        <div className="flex items-end gap-3 mb-4">
          <span className="text-5xl font-bold">{user.energyScore}</span>
          <span className="text-gray-400 mb-1">/ 100</span>
        </div>
        <div className="h-2 w-full bg-[#0F1419] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${user.energyScore}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${energyColor}`}
          />
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#1A202C] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
          <Clock className="w-6 h-6 text-[#1DD3B0] mb-2" />
          <span className="text-2xl font-bold">{user.totalMinutes}</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Minutes</span>
        </div>
        <div className="bg-[#1A202C] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
          <Trophy className="w-6 h-6 text-[#FF6B35] mb-2" />
          <span className="text-2xl font-bold">{user.points}</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Points</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button 
          onClick={handleSolo}
          className="w-full bg-[#1A202C] hover:bg-white/5 border border-white/10 text-white p-4 rounded-2xl flex items-center justify-between transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#6B4EE6]/20 rounded-full flex items-center justify-center group-hover:bg-[#6B4EE6]/30 transition-colors">
              <Play className="w-6 h-6 text-[#6B4EE6]" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg">Solo Session</h3>
              <p className="text-sm text-gray-400">Standard 25m Pomodoro</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => navigate('/matchmaking')}
          className="w-full bg-gradient-to-r from-[#6B4EE6] to-[#5A3FD6] hover:opacity-90 text-white p-4 rounded-2xl flex items-center justify-between transition-opacity shadow-lg shadow-[#6B4EE6]/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg">Focus Battle</h3>
              <p className="text-sm text-white/80">Match with a study partner</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
