import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useStore, UserProfile } from './store/useStore';

import Auth from './components/Auth';
import Home from './pages/Home';
import Matchmaking from './pages/Matchmaking';
import Session from './pages/Session';
import PostSession from './pages/PostSession';
import Profile from './pages/Profile';

export default function App() {
  const { user, setUser } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Listen to user profile
        const unsubscribeProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          }
          setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [setUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6B4EE6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matchmaking" element={<Matchmaking />} />
        <Route path="/session/:id" element={<Session />} />
        <Route path="/post-session/:id" element={<PostSession />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
