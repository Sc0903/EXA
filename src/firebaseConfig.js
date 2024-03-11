// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // Importa Firebase Storage
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCAlB3gHFzJpvUKlbWhmGmWDliZo112GwM",
  authDomain: "restaurant-df80f.firebaseapp.com",
  projectId: "restaurant-df80f",
  storageBucket: "restaurant-df80f.appspot.com",
  messagingSenderId: "635472852333",
  appId: "1:635472852333:web:b6444c0317f407b6451664",
  measurementId: "G-VCMJ5XNRZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 
const storage = getStorage(app); // Inicializa Firebase Storage

export { db, storage }; // Exporta Firestore y Storage

