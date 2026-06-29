// ═══════════════════════════════════════════════════════════════
//  FIREBASE КОНФИГУРАЦИЯСЫ
//  1. console.firebase.google.com → Жаңа жоба жасаңыз
//  2. Project Settings → Web App → SDK snippet → Copy config
//  3. Төмендегі мәндерді ауыстырыңыз
//  4. Realtime Database → Create → Test mode (30 күн)
// ═══════════════════════════════════════════════════════════════
export const FIREBASE_CONFIG = {
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

// db and firebase functions are loaded dynamically in TechCupChat
export let db = null;
export let fbRef = null;
export let fbPush = null;
export let fbOnValue = null;
export let fbQuery = null;
export let fbLimitToLast = null;

export async function initFirebase() {
  if (!FIREBASE_READY) return false;
  try {
    const { initializeApp } = await import("firebase/app");
    const { getDatabase, ref, push, onValue, query, limitToLast } =
      await import("firebase/database");
    const app = initializeApp(FIREBASE_CONFIG);
    db            = getDatabase(app);
    fbRef         = ref;
    fbPush        = push;
    fbOnValue     = onValue;
    fbQuery       = query;
    fbLimitToLast = limitToLast;
    return true;
  } catch {
    return false;
  }
}
