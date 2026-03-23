import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

var firebaseConfig = null;
if (import.meta.env.VITE_NODE_ENV === "staging") {
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY_STAGING,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN_STAGING,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID_STAGING,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_STAGING,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID_STAGING,
    appId: import.meta.env.VITE_FIREBASE_APP_ID_STAGING,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID_STAGING
  };
} else if (import.meta.env.VITE_NODE_ENV === "production") {
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY_PRODUCTION,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN_PRODUCTION,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID_PRODUCTION,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_PRODUCTION,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID_PRODUCTION,
    appId: import.meta.env.VITE_FIREBASE_APP_ID_PRODUCTION,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID_PRODUCTION
  };
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();

