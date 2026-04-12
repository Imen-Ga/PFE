// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCRXDqs0oN_MkXqbnCRm8v8c9ZnaNjoY4",
  authDomain: "reconnaissance-376fb.firebaseapp.com",
  projectId: "reconnaissance-376fb",
  storageBucket: "reconnaissance-376fb.firebasestorage.app",
  messagingSenderId: "859145168566",
  appId: "1:859145168566:web:a930b3fc87c78774b26817",
  measurementId: "G-3G4ZBP0KJ2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app);
export const db = getFirestore(app);
