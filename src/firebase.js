// Import necessary functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtvtmAhcVEf-lPCjMpP5I94r7Ys8CIn_s",
  authDomain: "fir-c4282.firebaseapp.com",
  projectId: "fir-c4282",
  storageBucket: "fir-c4282.appspot.com",
  messagingSenderId: "284996255153",
  appId: "1:284996255153:web:6bf13f9e3596d20bb4d190",
  measurementId: "G-BJN65HS8EZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore and Auth instances
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
