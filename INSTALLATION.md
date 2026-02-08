# Installation & Testing Guide

## Quick Start

### 1. Load Extension in Chrome

1. Open **Google Chrome** browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle switch in top-right corner)
4. Click **Load unpacked** button
5. Navigate to and select the `english_learning` folder
6. The extension should now appear in your extensions list!

### 2. Pin Extension to Toolbar (Optional)

1. Click the **puzzle piece icon** in Chrome toolbar
2. Find "English Learning for Kids"
3. Click the **pin icon** to pin it to toolbar

### 3. Configure Settings

1. Click the extension icon in toolbar (or go to `chrome://extensions/` and click "Details" → "Extension options")
2. Choose your preferences:
   - **Timer Interval**: Start with 1 minute for testing, then use 5+ minutes
   - **Question Mode**: Younger kids (Hebrew) or Older kids (English)
   - **Difficulty**: Easy (recommended to start)
   - **Audio**: Enable text-to-speech
3. Click **Save Settings**

### 4. Test the Extension

1. Click **"Show Question Now"** button in settings to test immediately
2. Or wait for the timer interval (questions will popup automatically)
3. Answer the question and see the confetti animation!

## Testing Checklist

### Basic Functionality
- [ ] Extension loads without errors
- [ ] Settings page opens and saves preferences
- [ ] "Show Question Now" button triggers popup
- [ ] Popup displays question with 4 answer options
- [ ] Clicking an answer shows correct/incorrect feedback
- [ ] Confetti animation plays for correct answers
- [ ] "Continue" button closes popup

### Text-to-Speech
- [ ] Question is read aloud automatically (if enabled)
- [ ] Speaker button (🔊) replays the word
- [ ] "Test Voice" in settings works
- [ ] Speech rate and volume adjustments work

### Media Pausing
- [ ] Go to YouTube and play a video
- [ ] Trigger a question with "Show Question Now"
- [ ] YouTube video pauses when popup appears
- [ ] Video resumes after answering question

### Timer/Alarm
- [ ] Set interval to 1 minute for testing
- [ ] Save settings
- [ ] Wait 1 minute - popup should appear automatically
- [ ] Test with browser active (not minimized)

### Statistics
- [ ] Answer several questions (mix of correct/incorrect)
- [ ] Open settings and check statistics are updated
- [ ] Accuracy percentage calculates correctly
- [ ] Reset button clears all stats

## Troubleshooting

### Extension Won't Load
- **Issue**: Error when loading unpacked extension
- **Solution**: Make sure you selected the correct folder (`english_learning`)
- **Check**: manifest.json file should be at root of selected folder

### No Sound/Text-to-Speech Not Working
- **Issue**: Words are not spoken aloud
- **Solution**: 
  1. Check system volume is not muted
  2. Enable text-to-speech in extension settings
  3. Test with "Test Voice" button
  4. Some systems may need to download voices (check Chrome settings)

### Popup Doesn't Appear
- **Issue**: Timer doesn't trigger popups
- **Solution**:
  1. Check "Enable automatic questions" is checked in settings
  2. Verify timer interval is set
  3. Look for errors in Chrome DevTools (right-click extension → Inspect)
  4. Make sure Chrome is active (not idle)

### YouTube Video Won't Pause
- **Issue**: Media keeps playing during question
- **Solution**:
  1. Refresh the YouTube page
  2. Make sure content script is loaded (check console)
  3. Try with a different video
  4. Some sites may use different video players

### Images Not Loading
- **Issue**: Pictures don't show in older kids mode
- **Solution**:
  1. Check internet connection (images are from Unsplash)
  2. Try refreshing the popup
  3. Check browser console for network errors

### Settings Don't Save
- **Issue**: Settings reset after closing
- **Solution**:
  1. Click "Save Settings" button
  2. Look for "Settings saved!" confirmation message
  3. Check Chrome storage permissions

## Development/Debugging

### View Console Logs

**Background Script:**
1. Go to `chrome://extensions/`
2. Find "English Learning for Kids"
3. Click "Inspect views: Service Worker"
4. Check Console tab for logs

**Popup Script:**
1. When popup is open, right-click inside it
2. Select "Inspect"
3. Check Console tab

**Content Script:**
1. Open any webpage
2. Press F12 to open DevTools
3. Check Console tab for content script logs

### Common Console Messages
- `English Learning for Kids extension installed` - Background script loaded
- `Question alarm created: every X minutes` - Timer set successfully
- `Popup loaded` - Popup initialized
- `Paused video: X` - Media successfully paused

### Manual Testing Commands

Open DevTools Console on any page and try:
```javascript
// Trigger question manually
chrome.runtime.sendMessage({action: 'triggerQuestion'})

// Check storage
chrome.storage.local.get(null, (data) => console.log(data))

// Clear storage (reset everything)
chrome.storage.local.clear()
```

## Updating the Extension

After making code changes:
1. Go to `chrome://extensions/`
2. Find "English Learning for Kids"
3. Click the **refresh icon** (circular arrow)
4. Test your changes

## Uninstalling

To remove the extension:
1. Go to `chrome://extensions/`
2. Find "English Learning for Kids"
3. Click **Remove**
4. Confirm removal

All data (settings, statistics) will be deleted.

## Performance Tips

- Start with longer intervals (5+ minutes) to avoid interruptions
- Use "Easy" difficulty for younger children
- Test with 1-minute interval first, then adjust
- Monitor statistics to track progress
- Disable during important video calls or work

## Next Steps

Once basic testing is complete:
1. Test with real kids to get feedback
2. Adjust vocabulary difficulty as needed
3. Add more words to `data/vocabulary.json`
4. Customize colors/fonts in CSS files
5. Consider adding more features from Phase 2

## Getting Help

If you encounter issues:
1. Check this troubleshooting guide
2. Review console logs for errors
3. Check GitHub Issues (if available)
4. Verify all files are present and unchanged

---

**Happy Learning! 🎉**
