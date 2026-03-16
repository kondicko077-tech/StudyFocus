import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion } from 'motion/react';
import { X, Camera, CameraOff, Brain, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';
import { listenToSession, completeSession, abandonSession } from '../services/session';
import { analyzeFaceFrame } from '../services/gemini';

const ROOMS = {
  'Silent Library': 'bg-gradient-to-br from-[#2D3748] to-[#1A202C]',
  'Rainy Cafe': 'bg-gradient-to-br from-[#4A5568] to-[#2D3748]',
  'Lo-fi Beats': 'bg-gradient-to-br from-[#6B4EE6]/20 to-[#0F1419]',
  'Nature Zen': 'bg-gradient-to-br from-[#1DD3B0]/20 to-[#0F1419]',
  'Night City': 'bg-gradient-to-br from-[#FF6B35]/20 to-[#0F1419]',
};

export default function Session() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, cameraEnabled, setCameraEnabled, currentRoom } = useStore();
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  const [focusStats, setFocusStats] = useState({
    totalFrames: 0,
    focusedFrames: 0,
    distractions: [] as string[],
  });
  
  const webcamRef = useRef<Webcam>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analysisRef = useRef<NodeJS.Timeout | null>(null);

  // Listen to session updates
  useEffect(() => {
    if (!id) return;
    const unsubscribe = listenToSession(id, (data) => {
      setSessionData(data);
      if (data.status === 'abandoned') {
        alert('Session was abandoned.');
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [id, navigate]);

  // Initialize timer when session data loads
  useEffect(() => {
    if (sessionData && !isActive && sessionData.status === 'active') {
      setTimeLeft(sessionData.targetDuration * 60);
      setIsActive(true);
    }
  }, [sessionData, isActive]);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // Face Analysis logic
  const captureAndAnalyze = useCallback(async () => {
    if (!cameraEnabled || !webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const result = await analyzeFaceFrame(imageSrc);
      setFocusStats(prev => ({
        totalFrames: prev.totalFrames + 1,
        focusedFrames: prev.focusedFrames + (result.focused ? 1 : 0),
        distractions: result.distraction_type !== 'none' 
          ? [...prev.distractions, result.distraction_type] 
          : prev.distractions
      }));
    } catch (error) {
      console.error("Analysis error:", error);
    }
  }, [cameraEnabled]);

  useEffect(() => {
    if (isActive && cameraEnabled) {
      // Analyze every 10 seconds
      analysisRef.current = setInterval(captureAndAnalyze, 10000);
    }
    return () => {
      if (analysisRef.current) clearInterval(analysisRef.current);
    };
  }, [isActive, cameraEnabled, captureAndAnalyze]);

  const handleComplete = async () => {
    if (!id || !user) return;
    setIsActive(false);
    
    const focusPercentage = focusStats.totalFrames > 0 
      ? Math.round((focusStats.focusedFrames / focusStats.totalFrames) * 100) 
      : 100; // Default to 100 if camera was off
      
    const pointsEarned = 100 + (focusPercentage > 80 ? 50 : 0) + (sessionData?.type === 'battle' ? 150 : 0);

    const results = {
      duration: sessionData.targetDuration,
      focusPercentage,
      distractionsCount: focusStats.distractions.length,
      pointsEarned,
      timeOfDay: new Date().toLocaleTimeString(),
    };

    try {
      await completeSession(id, user.uid, results);
      navigate(`/post-session/${id}`);
    } catch (error) {
      console.error("Error completing session:", error);
      alert("Error saving session results.");
    }
  };

  const handleAbandon = async () => {
    if (window.confirm('Are you sure you want to leave? You will lose points if you abandon a battle.')) {
      if (id) await abandonSession(id);
      navigate('/');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = sessionData ? ((sessionData.targetDuration * 60 - timeLeft) / (sessionData.targetDuration * 60)) * 100 : 0;

  return (
    <div className={`min-h-screen text-white flex flex-col ${ROOMS[currentRoom as keyof typeof ROOMS] || ROOMS['Silent Library']} transition-colors duration-1000`}>
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-[#1DD3B0]" />
          <span className="font-bold tracking-wider uppercase text-sm">{sessionData?.type === 'battle' ? 'Focus Battle' : 'Solo Focus'}</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCameraEnabled(!cameraEnabled)}
            className={`p-2 rounded-full transition-colors ${cameraEnabled ? 'bg-[#6B4EE6]/20 text-[#6B4EE6]' : 'bg-red-500/20 text-red-500'}`}
          >
            {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </button>
          <button onClick={handleAbandon} className="p-2 bg-white/10 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* Timer Circle */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12">
          {/* Background Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="50%" cy="50%" r="48%" className="stroke-white/10 fill-none stroke-[4]" />
            <motion.circle 
              cx="50%" cy="50%" r="48%" 
              className="stroke-[#1DD3B0] fill-none stroke-[4]"
              strokeDasharray="300%"
              strokeDashoffset={`${300 - (progress * 3)}%`}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="text-center z-10">
            <div className="text-6xl md:text-7xl font-mono font-light tracking-tighter mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-widest">
              {currentRoom}
            </div>
          </div>
        </div>

        {/* Camera View (Picture in Picture) */}
        {cameraEnabled && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-6 right-6 w-32 h-48 md:w-48 md:h-64 bg-black rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl"
          >
            {/* @ts-ignore */}
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] uppercase tracking-wider flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI Active
            </div>
          </motion.div>
        )}

        {/* Opponent Status (if battle) */}
        {sessionData?.type === 'battle' && (
          <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=opponent`} alt="Opponent" className="w-full h-full object-cover opacity-50" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0F1419] rounded-full" />
            </div>
            <div>
              <div className="text-sm font-bold">Opponent</div>
              <div className="text-xs text-[#1DD3B0] flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Focusing
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
