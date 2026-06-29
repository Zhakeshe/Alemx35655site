// ═══════════════════════════════════════════════════════════════
//  FIREBASE КОНФИГУРАЦИЯСЫ
//  1. console.firebase.google.com → Жоба → Project Settings
//  2. Your apps → Web app (</>)  → firebaseConfig-ті көшір
//  3. Төмендегі мәндерді ауыстыр
//  4. Build → Realtime Database → Create → Test mode
// ═══════════════════════════════════════════════════════════════
export const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBqGKRwfRg_gkBfRom-1TZ9PwetwvpWglY",
  authDomain:        "alemx-30a66.firebaseapp.com",
  databaseURL:       "https://alemx-30a66-default-rtdb.firebaseio.com",
  projectId:         "alemx-30a66",
  storageBucket:     "alemx-30a66.firebasestorage.app",
  messagingSenderId: "771279273328",
  appId:             "1:771279273328:web:f87ba8e48b73cca54c63b5",
};

export const FIREBASE_READY =
  FIREBASE_CONFIG.apiKey !== "PASTE_YOUR_API_KEY";

export let db            = null;
export let fbRef         = null;
export let fbPush        = null;
export let fbOnValue     = null;
export let fbQuery       = null;
export let fbLimitToLast = null;
export let fbSet         = null;
export let fbOnDisconnect = null;

let _initialized = false;

export async function initFirebase() {
  if (!FIREBASE_READY) return false;
  if (_initialized) return true;
  try {
    const { initializeApp } = await import("firebase/app");
    const {
      getDatabase, ref, push, onValue, query,
      limitToLast, set, onDisconnect,
    } = await import("firebase/database");
    const app      = initializeApp(FIREBASE_CONFIG);
    db             = getDatabase(app);
    fbRef          = ref;
    fbPush         = push;
    fbOnValue      = onValue;
    fbQuery        = query;
    fbLimitToLast  = limitToLast;
    fbSet          = set;
    fbOnDisconnect = onDisconnect;
    _initialized   = true;
    return true;
  } catch {
    return false;
  }
}
