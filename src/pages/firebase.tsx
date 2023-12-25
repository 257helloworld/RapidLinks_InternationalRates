// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBpDpJnqbNxG-rAMEORbLHToYfQNDJC4iM",
  authDomain: "rapidlinks-d9164.firebaseapp.com",
  projectId: "rapidlinks-d9164",
  storgeBucket: "rapidlinks-d9164.appspot.com",
  messagingSenderId: "956642133326",
  appId: "1:956642133326:web:88a3a380606f44d81f4a1f",
  measurementId: "G-CF4FDKC63F",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default getFirestore(app);
