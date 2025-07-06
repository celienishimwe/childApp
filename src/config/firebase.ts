import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCekTZvxHLv5bAvZo1n1pBtjQ05XI-a6M",
  authDomain: "child-project-dashboard-b7265.firebaseapp.com",
  projectId: "child-project-dashboard-b7265",
  storageBucket: "child-project-dashboard-b7265.firebasestorage.app",
  messagingSenderId: "971808378091",
  appId: "1:971808378091:web:6fa47aa20e632d836f02ae",
  measurementId: "G-02JXYQ1PEN"
};  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth }; 