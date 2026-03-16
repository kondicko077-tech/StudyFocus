import React, { useState } from 'react';
import { signInAndCreateProfile } from '../firebase';
import { motion } from 'motion/react';
import { Brain, Sparkles } from 'lucide-react';

export default function Auth() {
  const [displayName, setDisplayName] = useState('');
  const [field, setField] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInAndCreateProfile(displayName, field);
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Failed to join. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-white flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1A202C] p-8 rounded-2xl shadow-2xl border border-white/5"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#6B4EE6]/20 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-[#6B4EE6]" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 font-sans tracking-tight">FocusBattle</h1>
        <p className="text-gray-400 text-center mb-8">Multiplayer Pomodoro with AI Accountability</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., StudyNinja"
              className="w-full bg-[#0F1419] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6B4EE6] transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Study Field</label>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="e.g., Computer Science, Med School"
              className="w-full bg-[#0F1419] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6B4EE6] transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6B4EE6] hover:bg-[#5A3FD6] text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? 'Joining...' : (
              <>
                <Sparkles className="w-5 h-5" />
                Enter the Zone
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
