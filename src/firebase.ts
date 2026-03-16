import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const googleProvider = new GoogleAuthProvider();

export const signInAndCreateProfile = async (displayName: string, field: string) => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: displayName || user.displayName || 'Scholar',
      field: field || 'General Studies',
      avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
      createdAt: serverTimestamp(),
      totalSessions: 0,
      totalMinutes: 0,
      points: 0,
      level: 1,
      energyScore: 100
    });
  }
  
  return user;
};
