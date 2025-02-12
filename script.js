import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGTB891SnGawECG2i1CjSGs9meS__XWCI",
  authDomain: "choreapp-bb612.firebaseapp.com",
  projectId: "choreapp-bb612",
  storageBucket: "choreapp-bb612.firebasestorage.app",
  messagingSenderId: "218426582617",
  appId: "1:218426582617:web:c77411e59f068baa167348",
  measurementId: "G-WBZ7MTHRMZ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

const menuBtn = document.getElementById('menu-btn');
const closeMenuBtn = document.getElementById('close-menu');
const sideMenu = document.querySelector('.side-menu');
const errorMessage = document.getElementById("error-message");
const logoutBtn = document.getElementById("logout-btn");

menuBtn.addEventListener('click', () => {
  sideMenu.classList.add('open');
});

closeMenuBtn.addEventListener('click', () => {
  sideMenu.classList.remove('open');
});

const themeSwitch = document.getElementById('theme-switch');
themeSwitch.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeSwitch.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");

loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      errorMessage.style.display = "none";
    })
    .catch((error) => {
      errorMessage.style.display = "block";
      errorMessage.textContent = "Wrong password!";
    });
});

passwordInput.addEventListener("keyup", function(event) {
  if (event.getModifierState("CapsLock")) {
    document.getElementById("caps-warning").style.display = "block";
  } else {
    document.getElementById("caps-warning").style.display = "none";
  }
});

logoutBtn.addEventListener("click", () => {
  signOut(auth).catch((error) => console.error("Sign out error:", error.message));
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.style.display = "none";
    appSection.style.display = "block";
  } else {
    authSection.style.display = "block";
    appSection.style.display = "none";
  }
});
