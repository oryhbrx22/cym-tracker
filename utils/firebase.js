// Firebase Initialization
// Using compat build for simpler CDN integration without bundlers

const firebaseConfig = {
  apiKey: "AIzaSyCsQrzsGHZ7o7VY9EKIwSTnrBIi1x7fR_I",
  authDomain: "cym-leaders-web-type-handouts.firebaseapp.com",
  projectId: "cym-leaders-web-type-handouts",
  storageBucket: "cym-leaders-web-type-handouts.firebasestorage.app",
  messagingSenderId: "936994717986",
  appId: "1:936994717986:web:c69063b30ec9d1a840e57b",
  measurementId: "G-HW7HS1NEG1"
};

let db = null;
let analytics = null;

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const app = firebase.app();
    analytics = firebase.analytics();
    db = firebase.firestore();
    console.log("Firebase & Firestore initialized");
} else {
    console.error("Firebase SDK not found");
}

// Export db for use in other files if they were modules, but here we use global `db` variable or window property if needed.
// However, since we are using non-module scripts, `db` variable declared here in global scope (if not inside function) might be accessible 
// if this file is loaded before others.
// To be safe in this script-tag environment, we attach to window.
window.firebaseDB = db;