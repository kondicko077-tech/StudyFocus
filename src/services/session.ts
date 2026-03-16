import { doc, setDoc, updateDoc, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const createSoloSession = async (userId: string, targetDuration: number) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const sessionRef = doc(db, 'sessions', sessionId);
  
  await setDoc(sessionRef, {
    type: 'solo',
    participants: [userId],
    status: 'active',
    startTime: serverTimestamp(),
    targetDuration,
    results: {}
  });
  
  return sessionId;
};

export const listenToSession = (sessionId: string, onUpdate: (data: any) => void) => {
  return onSnapshot(doc(db, 'sessions', sessionId), (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data());
    }
  });
};

export const completeSession = async (sessionId: string, userId: string, results: any) => {
  const sessionRef = doc(db, 'sessions', sessionId);
  
  // Using dot notation to update a specific user's results in the map
  await updateDoc(sessionRef, {
    [`results.${userId}`]: results,
    status: 'completed',
    endTime: serverTimestamp()
  });
  
  // Also update user stats
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const newPoints = (userData.points || 0) + results.pointsEarned;
    const newLevel = Math.floor(newPoints / 500) + 1;
    
    await updateDoc(userRef, {
      totalSessions: (userData.totalSessions || 0) + 1,
      totalMinutes: (userData.totalMinutes || 0) + (results.duration || 0),
      points: newPoints,
      level: newLevel,
      // Simple energy score update logic
      energyScore: Math.min(100, Math.max(0, (userData.energyScore || 50) + (results.focusPercentage > 70 ? 5 : -5)))
    });
  }
};

export const abandonSession = async (sessionId: string) => {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, {
    status: 'abandoned',
    endTime: serverTimestamp()
  });
};
