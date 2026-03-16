import { doc, setDoc, deleteDoc, onSnapshot, serverTimestamp, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const joinQueue = async (userId: string, sessionLength: number, energyLevel: string) => {
  const queueRef = doc(db, 'queue', userId);
  
  // First, look for an existing waiting user with similar preferences
  const q = query(
    collection(db, 'queue'), 
    where('status', '==', 'waiting'),
    where('sessionLength', '==', sessionLength)
  );
  
  const querySnapshot = await getDocs(q);
  let matchedUserId = null;
  
  for (const docSnap of querySnapshot.docs) {
    if (docSnap.id !== userId) {
      matchedUserId = docSnap.id;
      break;
    }
  }
  
  if (matchedUserId) {
    // Create a new session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionRef = doc(db, 'sessions', sessionId);
    
    await setDoc(sessionRef, {
      type: 'battle',
      participants: [matchedUserId, userId],
      status: 'active',
      startTime: serverTimestamp(),
      targetDuration: sessionLength,
      results: {}
    });
    
    // Update both queue entries to matched
    await updateDoc(doc(db, 'queue', matchedUserId), {
      status: 'matched',
      matchId: sessionId
    });
    
    await setDoc(queueRef, {
      userId,
      sessionLength,
      energyLevel,
      timestamp: serverTimestamp(),
      status: 'matched',
      matchId: sessionId
    });
    
    return sessionId;
  } else {
    // No match found, join queue
    await setDoc(queueRef, {
      userId,
      sessionLength,
      energyLevel,
      timestamp: serverTimestamp(),
      status: 'waiting'
    });
    return null;
  }
};

export const leaveQueue = async (userId: string) => {
  await deleteDoc(doc(db, 'queue', userId));
};

export const listenToQueue = (userId: string, onMatch: (matchId: string) => void) => {
  return onSnapshot(doc(db, 'queue', userId), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.status === 'matched' && data.matchId) {
        onMatch(data.matchId);
      }
    }
  });
};
