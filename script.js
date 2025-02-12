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

passwordInput.addEventListener("keyup", function(event) {
  if (event.getModifierState("CapsLock")) {
    document.getElementById("caps-warning").style.display = "block";
  } else {
    document.getElementById("caps-warning").style.display = "none";
  }
});

loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  const errorMessage = document.getElementById("error-message");
  
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      errorMessage.style.display = "none";
    })
    .catch((error) => {
      errorMessage.style.display = "block";
      errorMessage.textContent = "Wrong password!";
      console.error("Login error:", error.message);
    });
});

signupBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  const errorMessage = document.getElementById("error-message");
  
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      errorMessage.style.display = "none";
    })
    .catch((error) => {
      errorMessage.style.display = "block";
      errorMessage.textContent = error.code === "auth/email-already-in-use" 
        ? "Email already in use!" 
        : error.message;
    });
});

logoutBtn.addEventListener("click", () => {
  signOut(auth).catch((error) => console.error("Sign out error:", error.message));
});

function renderChore(choreData, choreId) {
  const li = document.createElement("li");
  li.setAttribute("data-id", choreId);
  li.classList.add(`priority-${choreData.priority}`);
  console.log('Priority:', choreData.priority, 'Classes:', li.className);

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

  const dateSpan = document.createElement("span");
  dateSpan.textContent = choreData.dueDate ? `Due: ${choreData.dueDate}` : '';
  dateSpan.className = "due-date";
  const categorySpan = document.createElement("span");
  categorySpan.textContent = choreData.category;
  categorySpan.className = "category-tag";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete";
  deleteBtn.addEventListener("click", async () => {
      const choreRef = doc(db, "chores", choreId);
      await deleteDoc(choreRef);
      choreList.removeChild(li);
  });

  li.append(checkbox, span, dateSpan, categorySpan, deleteBtn);
  if (checkbox.checked) li.classList.add("completed");
  choreList.appendChild(li);
}

async function loadChores(userId) {
  choreList.innerHTML = "";
  const q = query(collection(db, "chores"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    renderChore(docSnap.data(), docSnap.id);
  });
}

choreForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  try {
    const docRef = await addDoc(collection(db, "chores"), {
      userId: user.uid,
      text: choreInput.value,
      dueDate: document.getElementById('due-date').value,
      priority: document.getElementById('priority').value,
      category: document.getElementById('category').value, 
      completed: false,
      createdAt: new Date()
    });

    renderChore({ 
      text: choreInput.value, 
      dueDate: document.getElementById('due-date').value,
      priority: document.getElementById('priority').value,
      category: document.getElementById('category').value, 
      completed: false 
    }, docRef.id);
    choreInput.value = "";
    document.getElementById('due-date').value = ""; 
    document.getElementById('priority').value = "low";
    document.getElementById('category').value = "home";
  } catch (error) {
    console.error("Error adding chore:", error.message);
  }
});

function sortChores(type) {
  const chores = Array.from(document.querySelectorAll('#chore-list li'));
  
  chores.sort((a, b) => {
    switch(type) {
      case 'date':
        return new Date(a.querySelector('.due-date').textContent.slice(5)) - 
               new Date(b.querySelector('.due-date').textContent.slice(5));
      case 'priority':
        const priorities = {high: 3, medium: 2, low: 1};
        return priorities[b.className.split('-')[1]] - 
               priorities[a.className.split('-')[1]];
      case 'category':
        return a.querySelector('.category-tag').textContent.localeCompare(
               b.querySelector('.category-tag').textContent);
    }
  });

  const list = document.getElementById('chore-list');
  list.innerHTML = '';
  chores.forEach(chore => list.appendChild(chore));
}

document.getElementById('sort-date').addEventListener('click', () => sortChores('date'));
document.getElementById('sort-priority').addEventListener('click', () => sortChores('priority'));
document.getElementById('sort-category').addEventListener('click', () => sortChores('category'));

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
