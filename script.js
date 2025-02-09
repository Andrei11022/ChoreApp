// Import Firebase modules from CDN (v9 modular SDK)
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

// Your Firebase configuration (from your Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyAGTB891SnGawECG2i1CjSGs9meS__XWCI",
  authDomain: "choreapp-bb612.firebaseapp.com",
  projectId: "choreapp-bb612",
  storageBucket: "choreapp-bb612.firebasestorage.app",
  messagingSenderId: "218426582617",
  appId: "1:218426582617:web:c77411e59f068baa167348",
  measurementId: "G-WBZ7MTHRMZ"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Get DOM Elements
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");

const choreForm = document.getElementById("chore-form");
const choreInput = document.getElementById("chore-input");
const choreList = document.getElementById("chore-list");

// Authentication Event Listeners
loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  signInWithEmailAndPassword(auth, email, password)
    .catch((error) => console.error("Login error:", error.message));
});

signupBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  createUserWithEmailAndPassword(auth, email, password)
    .catch((error) => console.error("Signup error:", error.message));
});

logoutBtn.addEventListener("click", () => {
  signOut(auth).catch((error) => console.error("Sign out error:", error.message));
});

// Render a single chore in the UI
function renderChore(choreData, choreId) {
  const li = document.createElement("li");
  li.setAttribute("data-id", choreId);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = choreData.completed || false;
  checkbox.addEventListener("change", async () => {
      const choreRef = doc(db, "chores", choreId);
      await updateDoc(choreRef, { completed: checkbox.checked });
      li.classList.toggle("completed", checkbox.checked);
  });
  const span = document.createElement("span");
  span.textContent = choreData.text;

  // NEW: Add date span
  const dateSpan = document.createElement("span");
  dateSpan.textContent = choreData.dueDate ? `Due: ${choreData.dueDate}` : '';
  dateSpan.className = "due-date";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete";
  deleteBtn.addEventListener("click", async () => {
      const choreRef = doc(db, "chores", choreId);
      await deleteDoc(choreRef);
      choreList.removeChild(li);
  });

  li.append(checkbox, span, dateSpan, deleteBtn); // NEW: Added dateSpan
  if (checkbox.checked) li.classList.add("completed");
  choreList.appendChild(li);
}


// Load chores from Firestore for the authenticated user
async function loadChores(userId) {
  choreList.innerHTML = "";
  const q = query(collection(db, "chores"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    renderChore(docSnap.data(), docSnap.id);
  });
}

// Add new chore to Firestore on form submission
choreForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  try {
      const docRef = await addDoc(collection(db, "chores"), {
          userId: user.uid,
          text: choreInput.value,
          dueDate: document.getElementById('due-date').value, // NEW: Added due date
          completed: false,
          createdAt: new Date()
      });
      renderChore({ 
          text: choreInput.value, 
          dueDate: document.getElementById('due-date').value, // NEW: Added due date
          completed: false 
      }, docRef.id);
      choreInput.value = "";
      document.getElementById('due-date').value = ""; // NEW: Clear date input
  } catch (error) {
      console.error("Error adding chore:", error.message);
  }
});

// Monitor Authentication State and adjust UI accordingly
onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.style.display = "none";
    appSection.style.display = "block";
    loadChores(user.uid);
  } else {
    authSection.style.display = "block";
    appSection.style.display = "none";
  }
});
