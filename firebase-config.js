// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCJeE2bd_Y3l1Q19jsWrnYwttZ_SHHssaA",
  authDomain: "mustafa-dairy.firebaseapp.com",
  projectId: "mustafa-dairy",
  storageBucket: "mustafa-dairy.appspot.com",
  messagingSenderId: "727616627428",
  appId: "1:727616627428:web:cb691fb786f77a69c342f1",
  measurementId: "G-E13H2GC55B"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();