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

// Global state
let pomodoroStats = {
  totalSessions: 0,
  totalMinutes: 0,
  dailyFocus: {},
  streaks: 0
};

let habitData = {
  streaks: {},
  chains: {},
  suggestions: []
};

let moodData = {
  entries: [],
  productivity: {}
};

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

// Pomodoro Timer Enhanced
let timerInterval;
let timeLeft = 25 * 60;
const timerDisplay = document.getElementById('timer');
const startTimerBtn = document.getElementById('start-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const timerType = document.getElementById('timer-type');
let isTimerRunning = false;
let sessionStartTime = null;

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateFocusScore() {
  const today = new Date().toISOString().split('T')[0];
  const focusScore = Math.round((pomodoroStats.totalMinutes / 60) * 10);
  document.getElementById('focus-rating').textContent = `${focusScore}%`;
  
  // Update heatmap
  if (!pomodoroStats.dailyFocus[today]) {
    pomodoroStats.dailyFocus[today] = 0;
  }
  updateHeatmap();
}
// Pomodoro Timer Functions
startTimerBtn.addEventListener('click', () => {
  if (timerInterval) {
    // Pause timer
    clearInterval(timerInterval);
    timerInterval = null;
    isTimerRunning = false;
    startTimerBtn.textContent = 'Resume';
    if (sessionStartTime) {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 60000);
      pomodoroStats.totalMinutes += sessionDuration;
      updateFocusScore();
    }
  } else {
    // Start timer
    sessionStartTime = Date.now();
    isTimerRunning = true;
    startTimerBtn.textContent = 'Pause';
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft === 0) {
        completePomodoro();
      }
    }, 1000);
  }
});

function completePomodoro() {
  clearInterval(timerInterval);
  timerInterval = null;
  isTimerRunning = false;
  pomodoroStats.totalSessions++;
  pomodoroStats.totalMinutes += parseInt(timerType.value);
  
  const today = new Date().toISOString().split('T')[0];
  pomodoroStats.dailyFocus[today] = (pomodoroStats.dailyFocus[today] || 0) + 1;
  
  updateFocusScore();
  showNotification('Pomodoro Complete!', 'Time for a break!');
  startTimerBtn.textContent = 'Start';
}

resetTimerBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  isTimerRunning = false;
  timeLeft = parseInt(timerType.value) * 60;
  updateTimerDisplay();
  startTimerBtn.textContent = 'Start';
});

timerType.addEventListener('change', () => {
  timeLeft = parseInt(timerType.value) * 60;
  updateTimerDisplay();
});

// Habit Tracking System
function initHabitTracking() {
  const habitContainer = document.getElementById('habit-container');
  const streakDisplay = document.getElementById('streak-display');
  const habitChain = document.getElementById('habit-chain');

  function updateHabitChain() {
    const today = new Date().toISOString().split('T')[0];
    const last30Days = Array.from({length: 30}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    habitChain.innerHTML = '';
    last30Days.forEach(date => {
      const link = document.createElement('div');
      link.className = `chain-link${habitData.chains[date] ? ' completed' : ''}`;
      link.title = date;
      habitChain.appendChild(link);
    });

    // Update streak count
    let currentStreak = 0;
    for (let i = 0; i < last30Days.length; i++) {
      if (habitData.chains[last30Days[i]]) {
        currentStreak++;
      } else {
        break;
      }
    }
    streakDisplay.textContent = `Current Streak: ${currentStreak} days`;
    habitData.streaks = currentStreak;
  }

  function generateHabitSuggestions() {
    const suggestions = [
      "Try to complete tasks at your peak energy time",
      "Break large tasks into smaller chunks",
      "Use the 2-minute rule for quick tasks",
      "Set specific times for checking emails/messages"
    ];
    
    document.getElementById('habit-suggestions').innerHTML = 
      suggestions.map(s => `<div class="suggestion">${s}</div>`).join('');
  }

  updateHabitChain();
  generateHabitSuggestions();
}

// Heatmap Initialization
function initHeatmap() {
  const heatmapContainer = document.getElementById('focus-heatmap');
  const heatmapInstance = h337.create({
    container: heatmapContainer,
    radius: 20,
    maxOpacity: .8,
    minOpacity: .3
  });

  return heatmapInstance;
}

function updateHeatmap() {
  const heatmapInstance = initHeatmap();
  const dataPoints = Object.entries(pomodoroStats.dailyFocus).map(([date, value]) => ({
    x: new Date(date).getDay() * 20,
    y: Math.floor(new Date(date).getDate() / 7) * 20,
    value: value
  }));

  heatmapInstance.setData({
    max: Math.max(...Object.values(pomodoroStats.dailyFocus)),
    data: dataPoints
  });
}
// Mood Tracking System
const moodSelect = document.getElementById('mood-select');
const addMoodBtn = document.getElementById('add-mood');

addMoodBtn.addEventListener('click', () => {
  const mood = parseInt(moodSelect.value);
  const timestamp = new Date();
  moodData.entries.push({ mood, timestamp });
  
  // Link mood with productivity
  const completedToday = Array.from(choreList.getElementsByClassName('completed'))
    .filter(li => {
      const date = li.querySelector('.due-date').textContent.slice(5);
      return date === timestamp.toISOString().split('T')[0];
    }).length;
  
  moodData.productivity[timestamp.toISOString()] = completedToday;
  updateMoodChart();
});

function updateMoodChart() {
  const ctx = document.getElementById('mood-productivity-chart').getContext('2d');
  const last7Days = moodData.entries.slice(-7);
  
  const data = {
    labels: last7Days.map(entry => entry.timestamp.toLocaleDateString()),
    datasets: [{
      label: 'Mood',
      data: last7Days.map(entry => entry.mood),
      borderColor: '#663399',
      fill: false
    }, {
      label: 'Tasks Completed',
      data: last7Days.map(entry => moodData.productivity[entry.timestamp.toISOString()] || 0),
      borderColor: '#008080',
      fill: false
    }]
  };

  if (window.moodChart) window.moodChart.destroy();
  window.moodChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Voice Notes System
const startRecordingBtn = document.getElementById('start-recording');
const recordingsList = document.getElementById('recordings-list');
let mediaRecorder;
let audioChunks = [];

async function initVoiceNotes() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.addEventListener('dataavailable', event => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener('stop', () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      addVoiceNoteToList(audioUrl);
      audioChunks = [];
    });

    startRecordingBtn.addEventListener('click', () => {
      if (mediaRecorder.state === 'inactive') {
        mediaRecorder.start();
        startRecordingBtn.textContent = '⏹️ Stop Recording';
      } else {
        mediaRecorder.stop();
        startRecordingBtn.textContent = '🎤 Record Note';
      }
    });
  } catch (err) {
    console.error('Error accessing microphone:', err);
    startRecordingBtn.disabled = true;
    startRecordingBtn.textContent = 'Microphone access denied';
  }
}

function addVoiceNoteToList(audioUrl) {
  const container = document.createElement('div');
  container.className = 'voice-note';
  
  const audio = document.createElement('audio');
  audio.controls = true;
  audio.src = audioUrl;
  
  const timestamp = document.createElement('span');
  timestamp.textContent = new Date().toLocaleString();
  
  container.append(audio, timestamp);
  recordingsList.prepend(container);
}

// Smart Task Suggestions
function generateSmartSuggestions() {
  const aiSuggestions = document.getElementById('ai-suggestions');
  const energyLevel = document.getElementById('energy-select').value;
  const currentHour = new Date().getHours();
  
  // Get weather (mock data for now)
  const weather = 'sunny'; // Would come from a weather API
  
  let suggestions = [];
  
  if (energyLevel === 'high') {
    suggestions.push('Perfect time for high-priority tasks!');
    if (weather === 'sunny') {
      suggestions.push('Great weather for outdoor tasks!');
    }
  } else if (energyLevel === 'low') {
    suggestions.push('Focus on easier, routine tasks');
    suggestions.push('Consider a short break or meditation');
  }
  
  if (currentHour < 12) {
    suggestions.push('Morning is great for focused work!');
  } else if (currentHour > 14 && currentHour < 17) {
    suggestions.push('Combat afternoon slump with a quick walk');
  }
  
  aiSuggestions.innerHTML = suggestions
    .map(s => `<div class="suggestion">${s}</div>`)
    .join('');
}

// Update suggestions when energy level changes
document.getElementById('energy-select').addEventListener('change', generateSmartSuggestions);
// Enhanced Task Management
function updateProgress() {
  const total = choreList.getElementsByTagName('li').length;
  const completed = choreList.getElementsByClassName('completed').length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const progressCircle = document.querySelector('.progress-circle');
  const progressText = document.querySelector('.progress-text');
  
  progressCircle.style.background = `conic-gradient(#008080 ${percentage}%, #663399 0%)`;
  progressText.textContent = `${percentage}%`;

  // Update habit chain if tasks were completed today
  if (completed > 0) {
    const today = new Date().toISOString().split('T')[0];
    habitData.chains[today] = true;
    updateHabitChain();
  }
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

function showNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }
}

// Initialize all features
function initializeApp() {
  // Request notification permission
  if (Notification.permission !== 'denied') {
    Notification.requestPermission();
  }

  // Initialize all components
  updateTimerDisplay();
  initHabitTracking();
  initVoiceNotes();
  generateSmartSuggestions();
  updateMoodChart();

  // Set up periodic updates
  setInterval(() => {
    checkDueDates();
    generateSmartSuggestions();
  }, 300000); // Every 5 minutes
}

// Event Listeners for existing functionality
passwordInput.addEventListener("keyup", function(event) {
  if (event.getModifierState("CapsLock")) {
    document.getElementById("caps-warning").style.display = "block";
  } else {
    document.getElementById("caps-warning").style.display = "none";
  }
});

// Theme Toggle
const themeSwitch = document.getElementById('theme-switch');
themeSwitch.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeSwitch.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// Add this before loadChores function
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

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete";
  deleteBtn.addEventListener("click", async () => {
    const choreRef = doc(db, "chores", choreId);
    await deleteDoc(choreRef);
    choreList.removeChild(li);
    updateProgress();
  });

  li.append(checkbox, span, dateSpan, categorySpan, deleteBtn);
  if (checkbox.checked) li.classList.add("completed");
  choreList.appendChild(li);
  updateProgress();
}


// Add loadChores function here
async function loadChores(userId) {
  choreList.innerHTML = "";
  const q = query(collection(db, "chores"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    renderChore(docSnap.data(), docSnap.id);
  });
  updateProgress();
}

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


// Firebase Auth Listeners
onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.style.display = "none";
    appSection.style.display = "block";
    loadChores(user.uid);
    initializeApp(); // Initialize all new features when user logs in
  } else {
    authSection.style.display = "block";
    appSection.style.display = "none";
  }
});

// Export functions for use in other modules if needed
export {
  updateProgress,
  checkDueDates,
  showNotification,
  generateSmartSuggestions
};
