import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA4sVKyfhe07LMjsTGYP1hptheXS551NSQ",
  authDomain: "contas-financeiro-app.firebaseapp.com",
  projectId: "contas-financeiro-app",
  storageBucket: "contas-financeiro-app.firebasestorage.app",
  messagingSenderId: "587677645244",
  appId: "1:587677645244:web:87327ee61f36371a6e13b9",
  measurementId: "G-62JFQC6BSE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);