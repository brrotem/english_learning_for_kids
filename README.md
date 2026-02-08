# English Learning for Kids - Chrome Extension

A fun, interactive Chrome extension that helps children learn English vocabulary through regular pop-up questions. Features Hebrew translations for younger kids and picture-based learning for older kids.

## 🌟 Features

- **⏰ Automatic Popup Questions**: Questions appear every 5 minutes (customizable)
- **🔄 Retry on Wrong Answers**: Students can try again until they get it right - learning from mistakes!
- **🔊 Full Question Text-to-Speech**: Speaker button reads the complete question for better comprehension
- **📚 Two Learning Modes**:
  - Younger Kids: English word → 4 Hebrew answer options
  - Older Kids: Picture → 4 English word options
- **🔊 Audio Feedback**: Error sounds and encouraging messages for wrong answers
- **⏸️ Media Pausing**: Automatically pauses YouTube videos and other media during questions
- **🚫 Single Popup Policy**: Only one question at a time - no popup spam
- **🎨 Kid-Friendly Interface**: Colorful design with large buttons and animations
- **📊 Advanced Progress Tracking**: Track correct answers, accuracy, first-try success rate, and daily streaks
- **🎉 Confetti Celebrations**: Fun animations for correct answers
- **50+ Vocabulary Words** across multiple categories

## 📦 Installation

### For Development/Testing

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `english_learning` folder
6. The extension will appear in your toolbar!

### For Production

The extension will be available on the Chrome Web Store soon.

## 🚀 Usage

1. **First Time Setup**:
   - Click the extension icon to open settings
   - Choose learning mode (younger/older kids)
   - Adjust timer interval (default: 5 minutes)
   - Configure audio settings

2. **Daily Learning**:
   - Questions will automatically popup at set intervals
   - Click the correct answer
   - Get immediate feedback and confetti for correct answers!
   - Media will automatically resume after answering

3. **Manual Practice**:
   - Open settings and click "Show Question Now" to practice anytime

## ⚙️ Settings

- **Timer Interval**: 1, 3, 5, 7, or 10 minutes
- **Question Mode**: Younger kids (Hebrew) or Older kids (English)
- **Difficulty**: Easy, Medium, Hard
- **Text-to-Speech**: Enable/disable, adjust speed and volume
- **Statistics**: View progress and reset if needed

## 📚 Vocabulary Categories

- 🐱 Animals (10 words)
- 🎨 Colors (8 words)
- 🍎 Food (8 words)
- 🔢 Numbers (10 words)
- 🌳 Nature (5 words)
- 👋 Body Parts (6 words)
- 🪑 Objects (3 words)

**Total: 50 words** (more coming soon!)

## 🛠️ Technical Details

### Built With
- **Manifest V3** (latest Chrome extension standard)
- **Vanilla JavaScript** (no frameworks)
- **Web Speech API** for text-to-speech
- **Chrome APIs**: alarms, storage, scripting, tabs
- **Custom CSS** with Google Fonts

### File Structure
```
english_learning/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for timers
├── content.js            # Media pausing functionality
├── popup/
│   ├── popup.html        # Question interface
│   ├── popup.css         # Styling
│   └── popup.js          # Question logic
├── settings/
│   ├── settings.html     # Settings page
│   ├── settings.css      # Settings styling
│   └── settings.js       # Settings logic
├── data/
│   └── vocabulary.json   # Word database
└── assets/
    └── icons/           # Extension icons
```

### Permissions

The extension requires the following permissions:
- **alarms**: For 5-minute interval timer
- **storage**: Save progress and settings
- **activeTab**: Interact with current tab
- **scripting**: Inject content scripts for media pausing
- **<all_urls>**: Pause media on any website

All data is stored locally - nothing is sent to external servers.

## 🔒 Privacy & Security

- ✅ **No data collection**: All data stays on your device
- ✅ **No external servers**: Completely offline-capable
- ✅ **No analytics**: No tracking or telemetry
- ✅ **Open source**: Review the code yourself
- ✅ **Local storage only**: Uses Chrome's local storage API

## 🎯 Roadmap

### Phase 1 (Current - MVP)
- [x] Basic extension structure
- [x] 5-minute timer with popups
- [x] Younger kids mode with Hebrew answers
- [x] 50 vocabulary words
- [x] Text-to-speech
- [x] Media pausing (YouTube, etc.)
- [x] Kid-friendly UI with confetti

### Phase 2 (Coming Soon)
- [ ] Older kids mode with pictures
- [ ] 200+ vocabulary words with images
- [ ] Enhanced animations and sounds
- [ ] Advanced settings (active hours, whitelist URLs)
- [ ] Detailed progress reports

### Phase 3 (Future)
- [ ] Parent dashboard with password protection
- [ ] Spaced repetition algorithm
- [ ] Custom word lists
- [ ] Achievement system with badges
- [ ] Export progress reports
- [ ] Mobile app version

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Add Vocabulary**: Submit new words with translations
2. **Report Bugs**: Open an issue on GitHub
3. **Suggest Features**: Share your ideas
4. **Translate**: Help translate to other languages
5. **Test**: Test with real kids and provide feedback

## 📝 License

MIT License - Feel free to use, modify, and distribute!

## 👨‍👩‍👧‍👦 For Parents

This extension is designed to be:
- **Safe**: No external connections, no data collection
- **Educational**: Based on proven vocabulary learning methods
- **Non-intrusive**: Customizable intervals, can be paused anytime
- **Engaging**: Colorful design keeps kids motivated
- **Effective**: Regular practice with immediate feedback

### Tips for Best Results
1. Set appropriate timer intervals (don't overwhelm)
2. Review progress weekly with your child
3. Celebrate achievements and streaks
4. Start with "Easy" difficulty and progress gradually
5. Use during computer/tablet time (homework, games, videos)

## 🐛 Known Issues

- Images are currently linked to external URLs (Unsplash) - may require internet connection
- Media resume may not work on all websites (e.g., Netflix, Disney+)
- Some voices may not be available on all systems

## 📧 Support

For questions, issues, or feedback:
- GitHub Issues: [Report a bug]
- Email: [Your email]

## 🙏 Acknowledgments

- Images from [Unsplash](https://unsplash.com) (free stock photos)
- Fonts from [Google Fonts](https://fonts.google.com)
- Inspired by spaced repetition learning methods

---

Made with ❤️ for young learners

**Version:** 1.1.0  
**Last Updated:** February 2026
