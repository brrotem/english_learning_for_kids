// Background Service Worker for English Learning App
// Manages 5-minute alarms and creates popup windows

// Track if popup is currently open
let isPopupOpen = false;
let currentPopupWindowId = null;

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('English Learning for Kids extension installed');
  
  // Set default settings
  const defaultSettings = {
    timerInterval: 5, // minutes
    questionMode: 'younger', // 'younger' or 'older'
    difficulty: 'easy',
    enableAlarms: true,
    ttsEnabled: true,
    ttsRate: 0.8,
    ttsVolume: 1.0
  };
  
  // Save default settings if not already set
  const { settings } = await chrome.storage.local.get('settings');
  if (!settings) {
    await chrome.storage.local.set({ settings: defaultSettings });
  }
  
  // Initialize stats
  const { stats } = await chrome.storage.local.get('stats');
  if (!stats) {
    const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
    await chrome.storage.local.set({ 
      stats: {
        totalQuestions: 0,
        correctAnswers: 0,
        streak: 0,
        lastQuestionDate: null,
        wordHistory: [],
        // cumulative (all-time) stats
        cumulative: {
          totalQuestions: 0,
          correctAnswers: 0,
          successRate: {
            firstTryCorrect: 0,
            totalAnswered: 0
          }
        },
        // daily stats reset at midnight
        daily: {
          date: today,
          totalQuestions: 0,
          correctAnswers: 0,
          successRate: {
            firstTryCorrect: 0,
            totalAnswered: 0
          }
        }
      }
    });
  }
  
  // Create initial alarm
  createQuestionAlarm();
  // Schedule daily reset alarm
  scheduleDailyReset();
});

// Schedule a daily alarm that fires at local midnight and then every 24 hours
function scheduleDailyReset() {
  try {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    chrome.alarms.create('dailyReset', {
      when: nextMidnight.getTime(),
      periodInMinutes: 24 * 60
    });
    console.log('Scheduled dailyReset alarm for', nextMidnight.toString());
  } catch (err) {
    console.error('Could not schedule daily reset alarm:', err);
  }
}

// Create alarm for question popups
async function createQuestionAlarm() {
  const { settings } = await chrome.storage.local.get('settings');
  const interval = settings?.timerInterval || 5;
  
  // Clear existing alarm
  await chrome.alarms.clear('questionAlarm');
  
  // Create new alarm
  if (settings?.enableAlarms !== false) {
    await chrome.alarms.create('questionAlarm', {
      periodInMinutes: interval
    });
    console.log(`Question alarm created: every ${interval} minutes`);
  }
}

// Helper function to check if our popup window exists
async function findExistingPopup() {
  try {
    const allWindows = await chrome.windows.getAll({ populate: true });
    const extensionId = chrome.runtime.id;
    
    for (const win of allWindows) {
      if (win.type === 'popup' && win.tabs) {
        for (const tab of win.tabs) {
          // Check for extension popup URL in various formats
          if (tab.url && (
            tab.url.includes('popup/popup.html') ||
            tab.url.includes(`${extensionId}/popup`) ||
            tab.url.startsWith(`chrome-extension://${extensionId}`)
          )) {
            return win;
          }
        }
      }
    }
  } catch (error) {
    console.log('Error finding popup:', error);
  }
  return null;
}

// Listen for alarm triggers
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'questionAlarm') {
    console.log('Question alarm triggered!');
    
    // Check if popup is already open by verifying window exists
    const existingPopup = await findExistingPopup();
    
    if (existingPopup) {
      console.log('Popup already open, skipping this alarm. Window ID:', existingPopup.id);
      // Update tracking variables
      isPopupOpen = true;
      currentPopupWindowId = existingPopup.id;
      // Focus existing window
      try {
        await chrome.windows.update(existingPopup.id, { focused: true });
      } catch (e) {
        console.log('Could not focus window:', e);
      }
      return;
    }
    
    // Check if user is active (not idle)
    try {
      const idleState = await chrome.idle.queryState(60);
      if (idleState === 'active') {
        showQuestionPopup();
      } else {
        console.log('User is idle, skipping question');
      }
    } catch (error) {
      // If idle API is not available, show popup anyway
      console.log('Idle API not available, showing popup');
      showQuestionPopup();
    }
  }
  else if (alarm.name === 'dailyReset') {
    try {
      const today = new Date().toISOString().slice(0,10);
      const data = await chrome.storage.local.get('stats');
      const stats = data.stats || {};
      stats.daily = stats.daily || {};
      // Reset daily counters
      stats.daily.date = today;
      stats.daily.totalQuestions = 0;
      stats.daily.correctAnswers = 0;
      stats.daily.successRate = stats.daily.successRate || { firstTryCorrect: 0, totalAnswered: 0 };
      stats.daily.successRate.firstTryCorrect = 0;
      stats.daily.successRate.totalAnswered = 0;
      await chrome.storage.local.set({ stats });
      console.log('Daily stats reset at midnight:', today);
    } catch (err) {
      console.error('Error resetting daily stats:', err);
    }
  }
});

// Show question popup window
async function showQuestionPopup() {
  try {
    // Check if popup is already open using helper
    const existingPopup = await findExistingPopup();
    
    if (existingPopup) {
      console.log('Found existing popup window, focusing:', existingPopup.id);
      isPopupOpen = true;
      currentPopupWindowId = existingPopup.id;
      try {
        await chrome.windows.update(existingPopup.id, { focused: true });
      } catch (e) {
        console.log('Could not focus:', e);
      }
      return;
    }
    
    // Set flag immediately to prevent race condition
    isPopupOpen = true;
    
    // Send message to all tabs to pause media
    const tabs = await chrome.tabs.query({ audible: true });
    for (const tab of (tabs || [])) {
      try {
        if (typeof tab.id === 'number') {
          await chrome.tabs.sendMessage(tab.id, { action: 'pause' });
        }
      } catch (error) {
        console.log('Could not pause media in tab:', tab.id, error);
      }
    }
    
    // Create popup window (avoid relying on globals like `screen` in service workers)
    const popupWindow = await chrome.windows.create({
      url: 'popup/popup.html',
      type: 'popup',
      focused: true,
      width: 900,
      height: 700,
      left: 0,
      top: 0
    });
    
    // Update window ID (flag already set above)
    currentPopupWindowId = popupWindow?.id;
    console.log('Question popup created:', popupWindow?.id, 'isPopupOpen:', isPopupOpen);
  } catch (error) {
    console.error('Error showing question popup:', error);
    isPopupOpen = false;
    currentPopupWindowId = null;
  }
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'popupClosed') {
    // Popup is closing
    isPopupOpen = false;
    currentPopupWindowId = null;
    resumeMedia();
    sendResponse({ success: true });
  } else if (message.action === 'closePopup') {
    // Resume media when popup closes
    resumeMedia();
    isPopupOpen = false;
    currentPopupWindowId = null;
    sendResponse({ success: true });
  } else if (message.action === 'updateSettings') {
    // Recreate alarm with new interval
    createQuestionAlarm();
    sendResponse({ success: true });
  } else if (message.action === 'triggerQuestion') {
    // Manual trigger from settings
    showQuestionPopup();
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

// Listen for window close events to reset popup state
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === currentPopupWindowId) {
    console.log('Popup window closed');
    isPopupOpen = false;
    currentPopupWindowId = null;
    resumeMedia();
  }
});

// Resume media in all tabs
async function resumeMedia() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'resume' });
      } catch (error) {
        // Tab might not have content script
      }
    }
  } catch (error) {
    console.error('Error resuming media:', error);
  }
}

// Listen for extension icon click
chrome.action.onClicked.addListener(() => {
  // Open settings page
  chrome.runtime.openOptionsPage();
});
