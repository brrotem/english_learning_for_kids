// Popup Script - Question Display and Interaction
// Handles question generation, answer validation, and TTS

let currentQuestion = null;
let currentSettings = null;
let currentStats = null;
let vocabulary = null;
let answered = false;
let attempts = 0;
let hasAnsweredCorrectly = false;

// Initialize popup when loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');
  
  try {
    // Load vocabulary, settings, and stats
    await loadData();
    
    // Generate and display question
    await generateQuestion();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-play text-to-speech
    if (currentSettings.ttsEnabled) {
      setTimeout(() => speakWord(), 500);
    }
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError('Failed to load question. Please try again.');
  }
});

// Load vocabulary, settings, and stats from storage
async function loadData() {
  const data = await chrome.storage.local.get(['vocabulary', 'settings', 'stats']);
  
  // Load vocabulary
  if (data.vocabulary) {
    vocabulary = data.vocabulary;
  } else {
    // Load from file if not in storage
    const response = await fetch(chrome.runtime.getURL('data/vocabulary.json'));
    vocabulary = await response.json();
    await chrome.storage.local.set({ vocabulary });
  }
  
  currentSettings = data.settings || {
    questionMode: 'younger',
    difficulty: 'easy',
    ttsEnabled: true,
    ttsRate: 0.8,
    ttsVolume: 1.0
  };
  
  currentStats = data.stats || {
    totalQuestions: 0,
    correctAnswers: 0,
    streak: 0,
    lastQuestionDate: null,
    wordHistory: []
  };
  
  // Update progress display
  updateProgressDisplay();
}

// Generate a new question
async function generateQuestion() {
  answered = false;
  attempts = 0;
  hasAnsweredCorrectly = false;
  
  // Filter words by difficulty
  const availableWords = vocabulary.words.filter(word => {
    if (currentSettings.difficulty === 'easy') {
      return word.difficulty === 'easy';
    } else if (currentSettings.difficulty === 'medium') {
      return word.difficulty === 'easy' || word.difficulty === 'medium';
    } else {
      return true; // all difficulties
    }
  });
  
  if (availableWords.length === 0) {
    showError('No words available for this difficulty level.');
    return;
  }
  
  // Select random word (avoid recent history)
  const recentWords = currentStats.wordHistory.slice(-10).map(h => h.wordId);
  const unusedWords = availableWords.filter(w => !recentWords.includes(w.id));
  const wordsToChooseFrom = unusedWords.length > 0 ? unusedWords : availableWords;
  
  const correctWord = wordsToChooseFrom[Math.floor(Math.random() * wordsToChooseFrom.length)];
  
  // Generate wrong answers from same category
  const wrongAnswers = generateWrongAnswers(correctWord, availableWords);
  
  // Create answers array and shuffle
  const answers = currentSettings.questionMode === 'younger' 
    ? [correctWord.hebrew, ...wrongAnswers.map(w => w.hebrew)]
    : [correctWord.english, ...wrongAnswers.map(w => w.english)];
  
  const shuffledAnswers = shuffleArray(answers);
  const correctIndex = shuffledAnswers.indexOf(
    currentSettings.questionMode === 'younger' ? correctWord.hebrew : correctWord.english
  );
  
  currentQuestion = {
    word: correctWord,
    answers: shuffledAnswers,
    correctIndex: correctIndex,
    wrongWords: wrongAnswers
  };
  
  // Display question
  displayQuestion();
}

// Generate 3 wrong answers from same category
function generateWrongAnswers(correctWord, allWords) {
  const sameCategory = allWords.filter(w => 
    w.category === correctWord.category && w.id !== correctWord.id
  );
  
  if (sameCategory.length < 3) {
    // Not enough words in category, use any words
    const otherWords = allWords.filter(w => w.id !== correctWord.id);
    return shuffleArray(otherWords).slice(0, 3);
  }
  
  return shuffleArray(sameCategory).slice(0, 3);
}

// Display question on screen
function displayQuestion() {
  const questionText = document.getElementById('questionText');
  const imageContainer = document.getElementById('imageContainer');
  const wordImage = document.getElementById('wordImage');
  const answerButtons = document.querySelectorAll('.answer-btn');
  
  if (currentSettings.questionMode === 'younger') {
    // Mode A: Show English word, Hebrew answers
    questionText.innerHTML = `What is <span class="word-highlight">${currentQuestion.word.english}</span>?`;
    imageContainer.classList.add('hidden');
    
    // Set Hebrew answers
    answerButtons.forEach((btn, index) => {
      btn.textContent = currentQuestion.answers[index];
      btn.classList.add('hebrew');
      btn.classList.remove('correct', 'incorrect', 'disabled');
    });
  } else {
    // Mode B: Show image, English answers
    questionText.textContent = 'What is this?';
    
    // Handle image - show if available, hide on error
    const imgUrl = currentQuestion.word.imageUrl;
    if (imgUrl) {
      imageContainer.classList.remove('hidden');
      wordImage.onerror = () => {
        imageContainer.classList.add('hidden');
        questionText.innerHTML = `What is <span class="word-highlight">${currentQuestion.word.hebrew}</span> in English?`;
      };
      wordImage.src = imgUrl;
      wordImage.alt = currentQuestion.word.english;
    } else {
      // No image URL - fall back to text question
      imageContainer.classList.add('hidden');
      questionText.innerHTML = `What is <span class="word-highlight">${currentQuestion.word.hebrew}</span> in English?`;
    }
    
    // Set English answers
    answerButtons.forEach((btn, index) => {
      btn.textContent = currentQuestion.answers[index];
      btn.classList.remove('hebrew', 'correct', 'incorrect', 'disabled');
    });
  }
  
  // Reset all button states
  answerButtons.forEach(btn => {
    btn.classList.remove('correct', 'incorrect', 'disabled');
    btn.disabled = false;
  });
  
  // Hide feedback and next button
  document.getElementById('feedback').classList.add('hidden');
  document.getElementById('nextBtn').classList.add('hidden');
}

// Set up event listeners
function setupEventListeners() {
  // Answer buttons
  const answerButtons = document.querySelectorAll('.answer-btn');
  answerButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => handleAnswer(index));
  });
  
  // Speaker button
  document.getElementById('speakerBtn').addEventListener('click', (e) => {
    e.preventDefault();
    speakWord();
  });
  
  // Next button
  document.getElementById('nextBtn').addEventListener('click', handleNext);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (!answered) {
      if (e.key >= '1' && e.key <= '4') {
        handleAnswer(parseInt(e.key) - 1);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      handleNext();
    }
    
    if (e.key === 's' || e.key === 'r') {
      speakWord();
    }
  });
  
  // Handle window close to reset popup state
  window.addEventListener('beforeunload', () => {
    chrome.runtime.sendMessage({ action: 'popupClosed' });
  });
}

// Handle answer selection
function handleAnswer(selectedIndex) {
  if (answered && hasAnsweredCorrectly) return;
  
  attempts++;
  const isCorrect = selectedIndex === currentQuestion.correctIndex;
  const answerButtons = document.querySelectorAll('.answer-btn');
  
  if (isCorrect) {
    // CORRECT ANSWER
    answered = true;
    hasAnsweredCorrectly = true;
    
    // Update button states
    answerButtons.forEach((btn, index) => {
      btn.classList.add('disabled');
      btn.disabled = true;
      if (index === currentQuestion.correctIndex) {
        btn.classList.add('correct');
      }
    });
    
    // Show feedback
    const feedback = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedbackText');
    feedback.classList.remove('hidden');
    feedback.classList.add('correct');
    feedback.classList.remove('incorrect');
    feedbackText.textContent = '🎉 Excellent! That\'s correct!';
    
    // Show confetti
    launchConfetti();
    
    // Play success sound
    speakWord('Correct!');
    
    // Show next button
    document.getElementById('nextBtn').classList.remove('hidden');
    
    // Update stats (pass attempts for success rate calculation)
    updateStats(true, attempts);
  } else {
    // WRONG ANSWER - Allow retry
    const selectedButton = answerButtons[selectedIndex];
    
    // Show wrong answer animation and sound
    selectedButton.classList.add('incorrect');
    
    // Play error sound
    playErrorSound();
    
    // Shake animation
    selectedButton.style.animation = 'shake 0.5s';
    
    // Remove incorrect styling after animation to allow re-selection
    setTimeout(() => {
      selectedButton.classList.remove('incorrect');
      selectedButton.style.animation = '';
    }, 500);
    
    // Show feedback (but keep buttons enabled)
    const feedback = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedbackText');
    feedback.classList.remove('hidden');
    feedback.classList.add('incorrect');
    feedback.classList.remove('correct');
    feedbackText.textContent = `❌ Try again! Keep trying until you find the right answer.`;
    
    // Speak encouragement
    if (currentSettings.ttsEnabled) {
      setTimeout(() => {
        const encouragements = [
          'Try again!',
          'Not quite, but you can do it!',
          'Keep trying!',
          'Almost there!'
        ];
        const message = encouragements[Math.floor(Math.random() * encouragements.length)];
        speakWord(message);
      }, 300);
    }
  }
}

// Handle next question / close popup
async function handleNext() {
  // Close popup and resume media
  await chrome.runtime.sendMessage({ action: 'closePopup' });
  window.close();
}

// Text-to-speech function
function speakWord(textOverride = null) {
  if (!currentSettings.ttsEnabled && !textOverride) return;
  
  try {
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Create utterance - speak the full question
    let text;
    if (textOverride) {
      text = textOverride;
    } else if (currentSettings.questionMode === 'younger') {
      // For younger kids mode: "What is [word]?"
      text = `What is ${currentQuestion.word.english}?`;
    } else {
      // For older kids mode: "What is this?"
      text = 'What is this?';
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = currentSettings.ttsRate || 0.8;
    utterance.volume = currentSettings.ttsVolume || 1.0;
    
    // Try to use Google voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') && v.lang === 'en-US'
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Text-to-speech error:', error);
  }
}

// Update statistics
async function updateStats(isCorrect, attemptsCount) {
  currentStats.totalQuestions++;
  if (isCorrect) {
    currentStats.correctAnswers++;
  }
  
  // Track success rate (correct on first try)
  if (!currentStats.successRate) {
    currentStats.successRate = {
      firstTryCorrect: 0,
      totalAnswered: 0
    };
  }
  currentStats.successRate.totalAnswered++;
  if (isCorrect && attemptsCount === 1) {
    currentStats.successRate.firstTryCorrect++;
  }
  
  // Update word history with attempts
  currentStats.wordHistory.push({
    wordId: currentQuestion.word.id,
    word: currentQuestion.word.english,
    correct: isCorrect,
    attempts: attemptsCount,
    timestamp: Date.now()
  });
  
  // Keep only last 100 questions in history
  if (currentStats.wordHistory.length > 100) {
    currentStats.wordHistory = currentStats.wordHistory.slice(-100);
  }
  
  // Update streak
  const today = new Date().toDateString();
  if (currentStats.lastQuestionDate !== today) {
    currentStats.streak = 1;
    currentStats.lastQuestionDate = today;
  }
  
  // Save to storage
  await chrome.storage.local.set({ stats: currentStats });
  
  // Update display
  updateProgressDisplay();
}

// Update progress display
function updateProgressDisplay() {
  const progressText = document.getElementById('progressText');
  const accuracy = currentStats.totalQuestions > 0 
    ? Math.round((currentStats.correctAnswers / currentStats.totalQuestions) * 100)
    : 0;
  
  progressText.textContent = `Today: ${currentStats.correctAnswers}/${currentStats.totalQuestions} (${accuracy}%)`;
}

// Confetti animation
function launchConfetti() {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const pieces = [];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
  
  // Create confetti pieces
  for (let i = 0; i < 50; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -10,
      w: Math.random() * 10 + 5,
      h: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: Math.random() * 3 + 2,
      angle: Math.random() * 360,
      rotation: Math.random() * 10 - 5
    });
  }
  
  // Animate confetti
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let stillFalling = false;
    pieces.forEach(piece => {
      piece.y += piece.velocity;
      piece.angle += piece.rotation;
      
      if (piece.y < canvas.height) {
        stillFalling = true;
      }
      
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.angle * Math.PI / 180);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      ctx.restore();
    });
    
    if (stillFalling) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  animate();
}

// Utility: Shuffle array
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Play error sound using Web Audio API
function playErrorSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a "buzzer" error sound
    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

// Show error message
function showError(message) {
  const questionText = document.getElementById('questionText');
  questionText.textContent = message;
  questionText.style.color = '#E74C3C';
}

// Load voices when available
speechSynthesis.onvoiceschanged = () => {
  const voices = speechSynthesis.getVoices();
  console.log('Available voices:', voices.length);
};
