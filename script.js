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

// Theme Toggle
const themeSwitch = document.getElementById('theme-switch');
themeSwitch.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeSwitch.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// Custom Categories
let customCategories = {};
const addCategoryBtn = document.getElementById('add-category-btn');
const categorySelect = document.getElementById('category');

addCategoryBtn.addEventListener('click', () => {
  const name = document.getElementById('new-category-input').value;
  const color = document.getElementById('category-color').value;
  if (name) {
    customCategories[name] = color;
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    categorySelect.appendChild(option);
    document.getElementById('new-category-input').value = '';
  }
});

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
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');

// Statistics Tracking
let statistics = {
  weeklyTasks: 0,
  monthlyTasks: 0,
  categoryCount: {}
};

function updateStatistics() {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  
  statistics.weeklyTasks = Array.from(choreList.getElementsByClassName('completed'))
    .filter(li => new Date(li.querySelector('.due-date').textContent.slice(5)) > weekAgo).length;
  
  statistics.monthlyTasks = Array.from(choreList.getElementsByClassName('completed'))
    .filter(li => new Date(li.querySelector('.due-date').textContent.slice(5)) > monthAgo).length;
  
  // Update category statistics
  statistics.categoryCount = {};
  Array.from(choreList.getElementsByClassName('category-tag')).forEach(tag => {
    const category = tag.textContent;
    statistics.categoryCount[category] = (statistics.categoryCount[category] || 0) + 1;
  });
  
  // Update UI
  document.getElementById('weekly-completion').textContent = `${statistics.weeklyTasks} tasks completed`;
  document.getElementById('monthly-completion').textContent = `${statistics.monthlyTasks} tasks completed`;
  
  const topCategory = Object.entries(statistics.categoryCount)
    .sort((a, b) => b[1] - a[1])[0];
  document.getElementById('top-category').textContent = topCategory ? topCategory[0] : 'None';
}

function checkDueDates() {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
  let hasOverdue = false;

  Array.from(choreList.getElementsByTagName('li')).forEach(li => {
    if (li.classList.contains('completed')) return;
    
    const dueDate = new Date(li.querySelector('.due-date').textContent.slice(5));
    li.classList.remove('task-overdue', 'task-upcoming');
    
    if (dueDate < now) {
      li.classList.add('task-overdue');
      hasOverdue = true;
    } else if (dueDate <= threeDaysFromNow) {
      li.classList.add('task-upcoming');
    }
  });

  document.getElementById('overdue-warning').style.display = hasOverdue ? 'block' : 'none';
}

searchInput.addEventListener('input', filterChores);
statusFilter.addEventListener('change', filterChores);

function filterChores() {
  const searchTerm = searchInput.value.toLowerCase();
  const filterValue = statusFilter.value;
  const items = choreList.getElementsByTagName('li');

  Array.from(items).forEach(item => {
    const text = item.querySelector('span').textContent.toLowerCase();
    const isCompleted = item.classList.contains('completed');
    const isOverdue = item.classList.contains('task-overdue');
    const isUpcoming = item.classList.contains('task-upcoming');
    
    const matchesSearch = text.includes(searchTerm);
    const matchesFilter = 
      filterValue === 'all' || 
      (filterValue === 'completed' && isCompleted) || 
      (filterValue === 'pending' && !isCompleted) ||
      (filterValue === 'overdue' && isOverdue) ||
      (filterValue === 'upcoming' && isUpcoming);

    item.style.display = matchesSearch && matchesFilter ? '' : 'none';
  });
  updateProgress();
  updateStatistics();
}

// Rest
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

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = choreData.completed || false;
  checkbox.addEventListener("change", async () => {
    const choreRef = doc(db, "chores", choreId);
    await updateDoc(choreRef, { completed: checkbox.checked });
    li.classList.toggle("completed", checkbox.checked);
    updateProgress();
    updateStatistics();
    checkDueDates();
  });

  const span = document.createElement("span");
  span.textContent = choreData.text;

  const dateSpan = document.createElement("span");
  dateSpan.textContent = choreData.dueDate ? `Due: ${choreData.dueDate}` : '';
  dateSpan.className = "due-date";

  const categorySpan = document.createElement("span");
  categorySpan.textContent = choreData.category;
  categorySpan.className = "category-tag";
  if (customCategories[choreData.category]) {
    categorySpan.style.background = customCategories[choreData.category];
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete";
  deleteBtn.addEventListener("click", async () => {
    const choreRef = doc(db, "chores", choreId);
    await deleteDoc(choreRef);
    choreList.removeChild(li);
    updateProgress();
    updateStatistics();
    checkDueDates();
  });

  li.append(checkbox, span, dateSpan, categorySpan, deleteBtn);
  if (checkbox.checked) li.classList.add("completed");
  choreList.appendChild(li);
  updateProgress();
  checkDueDates();
}

async function loadChores(userId) {
  choreList.innerHTML = "";
  const q = query(collection(db, "chores"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    renderChore(docSnap.data(), docSnap.id);
  });
  updateProgress();
  updateStatistics();
  checkDueDates();
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