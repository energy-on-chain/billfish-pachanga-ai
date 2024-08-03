import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

var firebaseConfig = null;
if (process.env.REACT_APP_NODE_ENV === "staging") {
  firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY_STAGING,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_STAGING,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID_STAGING,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_STAGING,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_STAGING,
    appId: process.env.REACT_APP_FIREBASE_APP_ID_STAGING,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_STAGING
  };
} else if (process.env.REACT_APP_NODE_ENV === "production") {
  firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY_PRODUCTION,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_PRODUCTION,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID_PRODUCTION,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_PRODUCTION,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_PRODUCTION,
    appId: process.env.REACT_APP_FIREBASE_APP_ID_PRODUCTION,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_PRODUCTION
  };
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();

