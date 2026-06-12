import { initializeApp, getApps } from "firebase/app";

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

export { app };
