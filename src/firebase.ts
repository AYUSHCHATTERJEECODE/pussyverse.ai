import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBBz6NeVpEZ3o2SBFugu49d6pLD6hZHZ6k",
  authDomain: "beaming-rigging-ld2jw.firebaseapp.com",
  projectId: "beaming-rigging-ld2jw",
  storageBucket: "beaming-rigging-ld2jw.firebasestorage.app",
  messagingSenderId: "949936371201",
  appId: "1:949936371201:web:e2ebd5d7a0fefc45f73200"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the database ID from the configuration
const db = getFirestore(app, "ai-studio-6ab64382-63c8-4016-a8fc-74c7511b1ca9");
const auth = getAuth(app);

export { app, db, auth };
