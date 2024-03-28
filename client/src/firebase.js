import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCo94p0vfre9AOqD2uL5V4mb01uHppTVBM",
  authDomain: "mern-estate-80792.firebaseapp.com",
  projectId: "mern-estate-80792",
  storageBucket: "mern-estate-80792.appspot.com",
  messagingSenderId: "931491931591",
  appId: "1:931491931591:web:72cb1453e91ce83fae65e2"
};

export const app = initializeApp(firebaseConfig);