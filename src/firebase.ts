import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyASk7AgESpw-EAu29vqO76GEsjZdOOT1d0",
    authDomain: "shadereditor-7b4be.firebaseapp.com",
    projectId: "shadereditor-7b4be",
    storageBucket: "shadereditor-7b4be.appspot.com",
    messagingSenderId: "661004886000",
    appId: "1:661004886000:web:b6347aa8c073921f2e4735",
    measurementId: "G-4EED08NZGW",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
