/* =========================================
   FIREBASE CONFIGURATION
========================================= */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getAuth,
    setPersistence,
    browserLocalPersistence
} from
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

/* =========================================
   FIREBASE PROJECT CONFIG
========================================= */

const firebaseConfig = {
    apiKey: "AIzaSyBNGsvP-hSiNqhxhmj668h9xVRTkLjgl4w",
    authDomain: "bookshop-f5a51.firebaseapp.com",
    projectId: "bookshop-f5a51",
    storageBucket: "bookshop-f5a51.firebasestorage.app",
    messagingSenderId: "407886016678",
    appId: "1:407886016678:web:eaded6220b1947cb5c4467",
    measurementId: "G-CENR0DW2JW"
};

/* =========================================
   INITIALIZE FIREBASE
========================================= */

const app = initializeApp(firebaseConfig);

/* =========================================
   AUTHENTICATION & DATABASE
========================================= */

export const auth = getAuth(app);

export const db = getFirestore(app);

/* =========================================
   PERSIST LOGIN SESSION
========================================= */

export const authPersistence = setPersistence(
    auth,
    browserLocalPersistence
);

