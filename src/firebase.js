// ═══════════════════════════════════════════════════════════════
//  FIREBASE КОНФИГУРАЦИЯСЫ
//  1. console.firebase.google.com → Жоба → Project Settings
//  2. Your apps → Web app (</>)  → firebaseConfig-ті көшір
//  3. Төмендегі мәндерді ауыстыр
//  4. Build → Realtime Database → Create → Test mode
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
