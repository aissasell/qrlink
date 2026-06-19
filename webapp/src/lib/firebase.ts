import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyBLqiRId8Fk3jd-rDQeRtrq7rTysx3ecyc",
  authDomain: "qrlink-b845b.firebaseapp.com",
  projectId: "qrlink-b845b",
  storageBucket: "qrlink-b845b.firebasestorage.app",
  messagingSenderId: "829321500821",
  appId: "1:829321500821:web:4390e63648a87672a2639c",
  measurementId: "G-SV16PBR9KF"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

if (typeof window !== "undefined") {
  if (process.env.NODE_ENV === "development") {
    // @ts-expect-error - FIREBASE_APPCHECK_DEBUG_TOKEN is not in the type definition
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""),
      isTokenAutoRefreshEnabled: true
    });
  } catch {
    // Ignore if already initialized
  }
}

const auth = getAuth(app);
const db = getFirestore(app);

declare global {
  var __FIREBASE_EMULATOR_CONNECTED__: boolean | undefined;
}

if (process.env.NODE_ENV === 'development' && !global.__FIREBASE_EMULATOR_CONNECTED__) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  global.__FIREBASE_EMULATOR_CONNECTED__ = true;
}

export { app, auth, db };
