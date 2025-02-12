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

// Menu Controls
const menuBtn = document.getElementById('menu-btn');
const closeMenuBtn = document.getElementById('close-menu');
const sideMenu = document.querySelector('.side-menu');

menuBtn.addEventListener('click', () => {
  sideMenu.classList.add('open');
});

closeMenuBtn.addEventListener('click', () => {
  sideMenu.classList.remove('open');
});

// Pomodoro Timer
let timerInterval;
let timeLeft = 25 * 60; // 25 minutes in seconds
const timerDisplay = document.getElementById('timer');
const startTimerBtn = document.getElementById('start-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const timerType = document.getElementById('timer-type');

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

startTimerBtn.addEventListener('click', () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    startTimerBtn.textContent = 'Start';
  } else {
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft === 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        new Notification('Timer Complete!', { body: 'Time to take a break!' });
      }
    }, 1000);
    startTimerBtn.textContent = 'Pause';
  }
});

resetTimerBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timeLeft = parseInt(timerType.value) * 60;
  updateTimerDisplay();
  startTimerBtn.textContent = 'Start';
});

timerType.addEventListener('change', () => {
  timeLeft = parseInt(timerType.value) * 60;
  updateTimerDisplay();
});

// Tags System
let tags = {};
const addTagBtn = document.getElementById('add-tag-btn');
const tagsContainer = document.getElementById('tags-list');
const tagsSelect = document.getElementById('tags-select');
// Tags Management
addTagBtn.addEventListener('click', () => {
  const name = document.getElementById('new-tag-input').value;
  const color = document.getElementById('tag-color').value;
  if (name) {
    tags[name] = color;
    updateTagsUI();
    document.getElementById('new-tag-input').value = '';
  }
});

function updateTagsUI() {
  // Update tags list in menu
  tagsContainer.innerHTML = '';
  Object.entries(tags).forEach(([name, color]) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = name;
    tag.style.backgroundColor = color;
    tagsContainer.appendChild(tag);
  });

  // Update tags selection in task form
  tagsSelect.innerHTML = '';
  Object.entries(tags).forEach(([name, color]) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `tag-${name}`;
    checkbox.name = 'tags';
    checkbox.value = name;
    
    const label = document.createElement('label');
    label.htmlFor = `tag-${name}`;
    label.textContent = name;
    label.style.backgroundColor = color;
    label.className = 'tag';

    tagsSelect.appendChild(checkbox);
    tagsSelect.appendChild(label);
  });
}

// Charts and Statistics
function updateCharts() {
  const completionCtx = document.getElementById('completion-chart').getContext('2d');
  const categoryCtx = document.getElementById('category-chart').getContext('2d');

  // Weekly completion data
  const completionData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Tasks Completed',
      data: [0, 0, 0, 0, 0, 0, 0], // Will be updated with real data
      backgroundColor: '#008080',
      borderColor: '#663399',
      borderWidth: 1
    }]
  };

  // Category distribution data
  const categoryData = {
    labels: Object.keys(statistics.categoryCount),
    datasets: [{
      data: Object.values(statistics.categoryCount),
      backgroundColor: ['#663399', '#008080', '#ff4444', '#ffa500', '#4CAF50']
    }]
  };

  // Create/update charts
  if (window.completionChart) {
    window.completionChart.destroy();
  }
  if (window.categoryChart) {
    window.categoryChart.destroy();
  }

  window.completionChart = new Chart(completionCtx, {
    type: 'bar',
    data: completionData,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  window.categoryChart = new Chart(categoryCtx, {
    type: 'doughnut',
    data: categoryData,
    options: {
      responsive: true
    }
  });
}
// Theme Toggle
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
const logoutBtn = document.getElementById("logout-btn");
const choreForm = document.getElementById("chore-form");
const choreInput = document.getElementById("chore-input");
const choreList = document.getElementById("chore-list");
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');

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
  
  statistics.categoryCount = {};
  Array.from(choreList.getElementsByClassName('category-tag')).forEach(tag => {
    const category = tag.textContent;
    statistics.categoryCount[category] = (statistics.categoryCount[category] || 0) + 1;
  });
  
  document.getElementById('weekly-completion').textContent = `${statistics.weeklyTasks} tasks completed`;
  document.getElementById('monthly-completion').textContent = `${statistics.monthlyTasks} tasks completed`;
  
  const topCategory = Object.entries(statistics.categoryCount)
    .sort((a, b) => b[1] - a[1])[0];
  document.getElementById('top-category').textContent = topCategory ? topCategory[0] : 'None';
  
  updateCharts();
}

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

  // Add tags if they exist
  if (choreData.tags && choreData.tags.length > 0) {
    const tagsSpan = document.createElement("span");
    tagsSpan.className = "tags-container";
    choreData.tags.forEach(tagName => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = tagName;
      tag.style.backgroundColor = tags[tagName] || '#663399';
      tagsSpan.appendChild(tag);
    });
    li.appendChild(tagsSpan);
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

choreForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  // Get selected tags
  const selectedTags = Array.from(document.querySelectorAll('#tags-select input:checked'))
    .map(checkbox => checkbox.value);

  try {
    const docRef = await addDoc(collection(db, "chores"), {
      userId: user.uid,
      text: choreInput.value,
      dueDate: document.getElementById('due-date').value,
      priority: document.getElementById('priority').value,
      category: document.getElementById('category').value,
      tags: selectedTags,
      completed: false,
      createdAt: new Date()
    });

    renderChore({ 
      text: choreInput.value, 
      dueDate: document.getElementById('due-date').value,
      priority: document.getElementById('priority').value,
      category: document.getElementById('category').value,
      tags: selectedTags,
      completed: false 
    }, docRef.id);
    
    // Reset form
    choreInput.value = "";
    document.getElementById('due-date').value = ""; 
    document.getElementById('priority').value = "low";
    document.getElementById('category').value = "home";
    document.querySelectorAll('#tags-select input').forEach(checkbox => checkbox.checked = false);
  } catch (error) {
    console.error("Error adding chore:", error.message);
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.style.display = "none";
    appSection.style.display = "block";
    loadChores(user.uid);
    updateStatistics();
  } else {
    authSection.style.display = "block";
    appSection.style.display = "none";
  }
});

// Initialize everything
updateTimerDisplay();
updateTagsUI();

