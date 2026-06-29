import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// ═══════════════════════════════════════════════════════════════
//  FIREBASE КОНФИГУРАЦИЯСЫ
//  1. console.firebase.google.com → Жаңа жоба жасаңыз
//  2. Project Settings → Web App → SDK snippet → Copy config
//  3. Төмендегі мәндерді ауыстырыңыз
//  4. Realtime Database → Create → Test mode (30 күн)
// ═══════════════════════════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey:            "PASTE_YOUR_API_KEY",
  authDomain:        "PASTE_YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://PASTE_YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId:         "PASTE_YOUR_PROJECT",
  storageBucket:     "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId:             "PASTE_YOUR_APP_ID",
};

export const FIREBASE_READY =
  FIREBASE_CONFIG.apiKey !== "PASTE_YOUR_API_KEY";

let db = null;

if (FIREBASE_READY) {
  const app = initializeApp(FIREBASE_CONFIG);
  db = getDatabase(app);
}

export { db };
