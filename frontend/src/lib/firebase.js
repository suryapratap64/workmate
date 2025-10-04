// frontend/src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Basic validation: fail fast if required env vars are missing so callers
// don't end up with an undefined `auth` and obscure runtime errors.
const required = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
];
const missing = required.filter((k) => !import.meta.env[k]);
if (missing.length) {
  console.error(
    "Missing required Firebase Vite env vars:",
    missing,
    "\nCurrent values:",
    {
      VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
      VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    }
  );
  throw new Error(
    `Firebase config missing required env vars: ${missing.join(
      ", "
    )}. Please add them to frontend/.env and restart the dev server.`
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAgvCbLTGVQY1WAxlJJTTkvxWL4wVCSHUY",
//   authDomain: "workmate-97f3a.firebaseapp.com",
//   projectId: "workmate-97f3a",
//   storageBucket: "workmate-97f3a.firebasestorage.app",
//   messagingSenderId: "722918184899",
//   appId: "1:722918184899:web:63c1464e904513ebd20f76",
//   measurementId: "G-WV5GPQ85WQ"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
