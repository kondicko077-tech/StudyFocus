import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, X, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { joinQueue, leaveQueue, listenToQueue } from '../services/matchmaking';

export default function Matchmaking() {
  const { user } = useStore();
  const navigate = useNavigate();
  
  const [sessionLength, setSessionLength] = useState<number>(25);
  const [energyLevel, setEnergyLevel] = useState<string>('Medium');
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;
    
    if (isSearching && user) {
      unsubscribe = listenToQueue(user.uid, (matchId) => {
        setMatchFound(true);
        setTimeout(() => {
          navigate(`/session/${matchId}`);
        }, 2000);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isSearching, user, navigate]);

  const handleStartSearch = async () => {
    if (!user) return;
    setIsSearching(true);
    try {
      const matchId = await joinQueue(user.uid, sessionLength, energyLevel);
      if (matchId) {
        // Instant match
        setMatchFound(true);
        setTimeout(() => {
          navigate(`/session/${matchId}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error joining queue:", error);
      setIsSearching(false);
      alert("Failed to join queue. Please try again.");
    }
  };

  const handleCancel = async () => {
    if (!user) return;
    await leaveQueue(user.uid);
    setIsSearching(false);
  };

  if (matchFound) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex flex-col items-center justify-center text-white p-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-[#1DD3B0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-12 h-12 text-[#1DD3B0]" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Match Found!</h1>
          <p className="text-gray-400">Preparing your study room...</p>
        </motion.div>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex flex-col items-center justify-center text-white p-6 relative">
        <button 
          onClick={handleCancel}
          className="absolute top-6 right-6 p-2 bg-[#1A202C] rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative w-32 h-32 mb-8">
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#6B4EE6] rounded-full opacity-20"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute inset-4 bg-[#6B4EE6] rounded-full opacity-40"
          />
          <div className="absolute inset-8 bg-[#6B4EE6] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(107,78,230,0.5)]">
            <Search className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">Finding Opponent...</h2>
        <p className="text-gray-400 mb-8 text-center">Looking for someone studying {user?.field || 'similar topics'} for {sessionLength} minutes.</p>
        
        <div className="text-sm text-gray-500">Estimated wait: &lt; 15s</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white p-6">
      <header className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-[#1A202C] rounded-full hover:bg-white/10 transition-colors mr-4">
          <X className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Battle Setup</h1>
      </header>

      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Session Length</h3>
          <div className="grid grid-cols-3 gap-3">
            {[25, 45, 60].map((len) => (
              <button
                key={len}
                onClick={() => setSessionLength(len)}
                className={`py-3 rounded-xl font-medium transition-colors ${
                  sessionLength === len 
                    ? 'bg-[#6B4EE6] text-white border border-[#6B4EE6]' 
                    : 'bg-[#1A202C] text-gray-400 border border-white/5 hover:bg-white/5'
                }`}
              >
                {len} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Your Energy Level</h3>
          <div className="grid grid-cols-3 gap-3">
            {['Low', 'Medium', 'High'].map((level) => (
              <button
                key={level}
                onClick={() => setEnergyLevel(level)}
                className={`py-3 rounded-xl font-medium transition-colors ${
                  energyLevel === level 
                    ? 'bg-[#1DD3B0] text-[#0F1419] border border-[#1DD3B0]' 
                    : 'bg-[#1A202C] text-gray-400 border border-white/5 hover:bg-white/5'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-6 right-6">
        <button 
          onClick={handleStartSearch}
          className="w-full bg-gradient-to-r from-[#6B4EE6] to-[#5A3FD6] hover:opacity-90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#6B4EE6]/20 transition-opacity flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Find Match
        </button>
      </div>
    </div>
  );
}
