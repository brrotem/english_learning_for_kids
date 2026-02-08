// Settings Page Script

let currentSettings = {};
let currentStats = {};

// Load settings when page loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadStats();
  setupEventListeners();
});

// Load settings from storage
async function loadSettings() {
  const data = await chrome.storage.local.get('settings');
  
  currentSettings = data.settings || {
    timerInterval: 5,
    questionMode: 'younger',
    difficulty: 'easy',
    enableAlarms: true,
    ttsEnabled: true,
    ttsRate: 0.8,
    ttsVolume: 1.0
  };
  
  // Populate form fields
  document.getElementById('timerInterval').value = currentSettings.timerInterval;
  document.getElementById('questionMode').value = currentSettings.questionMode;
  document.getElementById('difficulty').value = currentSettings.difficulty;
  document.getElementById('enableAlarms').checked = currentSettings.enableAlarms;
  document.getElementById('ttsEnabled').checked = currentSettings.ttsEnabled;
  document.getElementById('ttsRate').value = currentSettings.ttsRate;
  document.getElementById('ttsVolume').value = currentSettings.ttsVolume;
  
  updateRangeDisplays();
}

// Load statistics from storage
async function loadStats() {
  const data = await chrome.storage.local.get('stats');
  
  // Ensure stats object exists and has cumulative/daily structure
  let stats = data.stats;
  const today = new Date().toISOString().slice(0,10);
  if (!stats) {
    stats = {
      totalQuestions: 0,
      correctAnswers: 0,
      streak: 0,
      lastQuestionDate: null,
      wordHistory: [],
      cumulative: {
        totalQuestions: 0,
        correctAnswers: 0,
        successRate: { firstTryCorrect: 0, totalAnswered: 0 }
      },
      daily: {
        date: today,
        totalQuestions: 0,
        correctAnswers: 0,
        successRate: { firstTryCorrect: 0, totalAnswered: 0 }
      }
    };
    await chrome.storage.local.set({ stats });
  }

  // If daily.date is stale, reset daily counters
  stats.daily = stats.daily || { date: today, totalQuestions: 0, correctAnswers: 0, successRate: { firstTryCorrect: 0, totalAnswered: 0 } };
  if (stats.daily.date !== today) {
    stats.daily.date = today;
    stats.daily.totalQuestions = 0;
    stats.daily.correctAnswers = 0;
    stats.daily.successRate = { firstTryCorrect: 0, totalAnswered: 0 };
    await chrome.storage.local.set({ stats });
  }

  currentStats = stats;
  displayStats();
}

// Display statistics
function displayStats() {
  // For now, show cumulative (all-time) stats in the settings page as "today"
  const cumulative = currentStats.cumulative || {
    totalQuestions: currentStats.totalQuestions || 0,
    correctAnswers: currentStats.correctAnswers || 0,
    successRate: (currentStats.successRate || { firstTryCorrect: 0, totalAnswered: 0 })
  };

  document.getElementById('totalQuestions').textContent = cumulative.totalQuestions;
  document.getElementById('correctAnswers').textContent = cumulative.correctAnswers;

  const accuracy = cumulative.totalQuestions > 0
    ? Math.round((cumulative.correctAnswers / cumulative.totalQuestions) * 100)
    : 0;
  document.getElementById('accuracy').textContent = accuracy + '%';

  // Calculate first-try success rate from cumulative
  const successRate = cumulative.successRate && cumulative.successRate.totalAnswered > 0
    ? Math.round((cumulative.successRate.firstTryCorrect / cumulative.successRate.totalAnswered) * 100)
    : 0;
  document.getElementById('successRate').textContent = successRate + '%';

  document.getElementById('streak').textContent = currentStats.streak || 0;
}

// Set up event listeners
function setupEventListeners() {
  // Save button
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  
  // Trigger question now
  document.getElementById('triggerNowBtn').addEventListener('click', triggerQuestion);
  
  // Test TTS
  document.getElementById('testTTSBtn').addEventListener('click', testTTS);
  
  // Reset stats
  document.getElementById('resetStatsBtn').addEventListener('click', resetStats);
  
  // Range inputs
  document.getElementById('ttsRate').addEventListener('input', updateRangeDisplays);
  document.getElementById('ttsVolume').addEventListener('input', updateRangeDisplays);
  
  // Auto-save on change
  const inputs = document.querySelectorAll('select, input');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      // Show save reminder (optional)
    });
  });
}

// Update range input displays
function updateRangeDisplays() {
  const rate = document.getElementById('ttsRate').value;
  const volume = document.getElementById('ttsVolume').value;
  
  document.getElementById('ttsRateValue').textContent = rate + 'x';
  document.getElementById('ttsVolumeValue').textContent = Math.round(volume * 100) + '%';
}

// Save settings
async function saveSettings() {
  // Gather settings from form
  const settings = {
    timerInterval: parseInt(document.getElementById('timerInterval').value),
    questionMode: document.getElementById('questionMode').value,
    difficulty: document.getElementById('difficulty').value,
    enableAlarms: document.getElementById('enableAlarms').checked,
    ttsEnabled: document.getElementById('ttsEnabled').checked,
    ttsRate: parseFloat(document.getElementById('ttsRate').value),
    ttsVolume: parseFloat(document.getElementById('ttsVolume').value)
  };
  
  // Save to storage
  await chrome.storage.local.set({ settings });
  currentSettings = settings;
  
  // Notify background script to update alarm
  await chrome.runtime.sendMessage({ action: 'updateSettings' });
  
  // Show success message
  showSaveMessage();
  
  console.log('Settings saved:', settings);
}

// Show save confirmation
function showSaveMessage() {
  const message = document.getElementById('saveMessage');
  message.classList.remove('hidden');
  
  setTimeout(() => {
    message.classList.add('hidden');
  }, 2000);
}

// Trigger question immediately
async function triggerQuestion() {
  await chrome.runtime.sendMessage({ action: 'triggerQuestion' });
  
  // Optional: Close settings page
  // window.close();
}

// Test text-to-speech
function testTTS() {
  const rate = parseFloat(document.getElementById('ttsRate').value);
  const volume = parseFloat(document.getElementById('ttsVolume').value);
  
  const utterance = new SpeechSynthesisUtterance('Hello! This is a test of the text to speech voice.');
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.volume = volume;
  
  const voices = speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    v.name.includes('Google') && v.lang === 'en-US'
  ) || voices.find(v => v.lang.startsWith('en'));
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

// Reset statistics
async function resetStats() {
  const confirmed = confirm('Are you sure you want to reset all statistics? This cannot be undone.');
  
  if (confirmed) {
    const stats = {
      totalQuestions: 0,
      correctAnswers: 0,
      streak: 0,
      lastQuestionDate: null,
      wordHistory: []
    };
    
    await chrome.storage.local.set({ stats });
    currentStats = stats;
    displayStats();
    
    alert('Statistics have been reset!');
  }
}

// Load voices when available
speechSynthesis.onvoiceschanged = () => {
  const voices = speechSynthesis.getVoices();
  console.log('Available voices:', voices.length);
};
