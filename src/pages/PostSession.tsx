import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, Brain, Target, ArrowRight, Sparkles } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store/useStore';
import { generatePostSessionInsights } from '../services/gemini';

export default function PostSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useStore();
  
  const [results, setResults] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(true);

  useEffect(() => {
    // Trigger confetti on load
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6B4EE6', '#1DD3B0', '#FF6B35']
    });

    const fetchResults = async () => {
      if (!id || !user) return;
      try {
        const sessionRef = doc(db, 'sessions', id);
        const sessionSnap = await getDoc(sessionRef);
        
        if (sessionSnap.exists()) {
          const data = sessionSnap.data();
          const userResults = data.results?.[user.uid];
          setResults(userResults);
          
          if (userResults) {
            // Generate AI insights
            const generatedInsights = await generatePostSessionInsights(userResults);
            setInsights(generatedInsights);
          }
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoadingInsights(false);
      }
    };

    fetchResults();
  }, [id, user]);

  if (!results) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6B4EE6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white p-6 pb-24 overflow-y-auto">
      <header className="text-center mb-10 mt-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-20 h-20 bg-gradient-to-br from-[#6B4EE6] to-[#1DD3B0] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(107,78,230,0.4)]"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold font-sans tracking-tight mb-2">Session Complete!</h1>
        <p className="text-gray-400">Great job staying focused.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A202C] p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center"
        >
          <Target className="w-8 h-8 text-[#1DD3B0] mb-3" />
          <div className="text-3xl font-bold mb-1">{results.focusPercentage}%</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Focus Score</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A202C] p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center"
        >
          <Sparkles className="w-8 h-8 text-[#FF6B35] mb-3" />
          <div className="text-3xl font-bold mb-1">+{results.pointsEarned}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Points Earned</div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-[#1A202C] to-[#0F1419] rounded-2xl p-6 border border-[#6B4EE6]/30 relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Brain className="w-32 h-32" />
        </div>
        
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <Brain className="w-5 h-5 text-[#6B4EE6]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#6B4EE6]">Gemini AI Insights</h2>
        </div>

        {loadingInsights ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#6B4EE6] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-400">Analyzing your focus patterns...</p>
          </div>
        ) : insights ? (
          <div className="relative z-10 space-y-6">
            <p className="text-lg font-medium leading-relaxed">"{insights.summary}"</p>
            
            <div>
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Observations</h3>
              <ul className="space-y-2">
                {insights.observations.map((obs: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1DD3B0] mt-1.5 shrink-0" />
                    {obs}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#6B4EE6]/10 p-4 rounded-xl border border-[#6B4EE6]/20">
              <h3 className="text-xs text-[#6B4EE6] uppercase tracking-wider mb-2 font-bold">Pro Tip</h3>
              <p className="text-sm text-gray-200">{insights.tip}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Could not generate insights for this session.</p>
        )}
      </motion.div>

      <div className="fixed bottom-6 left-6 right-6">
        <button 
          onClick={() => navigate('/')}
          className="w-full bg-white text-[#0F1419] hover:bg-gray-200 font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          Back to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
