// Инициализация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBk4nxZ1ldNQUCxsbgaeYTkm9stq0o9o2Q",
    authDomain: "deygram-e4814.firebaseapp.com",
    projectId: "deygram-e4814",
    storageBucket: "deygram-e4814.appspot.com",
    messagingSenderId: "591207353726",
    appId: "1:591207353726:web:d20f5e648d3daf86fcb72f"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
