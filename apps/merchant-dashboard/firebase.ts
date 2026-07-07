import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:
    "AIzaSyAZmIb1BkR4RbXqFikEHIbzHljvWPWQ67c",

  authDomain:
    "shapay-3e9d0.firebaseapp.com",

  projectId: "shapay-3e9d0",

  storageBucket:
    "shapay-3e9d0.firebasestorage.app",

  messagingSenderId:
    "914958555397",

  appId:
    "1:914958555397:web:70bcbbcb0c38dab4cebf6c",

  measurementId:
    "G-7J1C8SQXNV",
};

const app =
  initializeApp(firebaseConfig);

export const auth =
  getAuth(app);