import { initializeApp, getApps, getApp } from "firebase/app"; 
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; 
 
const firebaseConfig = { 
  apiKey: "AIzaSyDIq9n5kNnDNm3Nz7-eXr86vu7kCdFkZjA", 
  authDomain: "zighub.firebaseapp.com", 
  projectId: "zighub", 
  storageBucket: "zighub.firebasestorage.app", 
  messagingSenderId: "516770144849", 
  appId: "1:516770144849:web:992b481754e9193c754e70" 
}; 
 
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig); 
const auth = getAuth(app); 
const db = getFirestore(app); 
const storage = getStorage(app); 
const googleProvider = new GoogleAuthProvider(); 
 
export { app, auth, db, storage, googleProvider };