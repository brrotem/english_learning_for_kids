// Content Script for Media Pausing
// Injected into all pages to pause/resume videos and audio

let pausedMediaElements = [];

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'pause') {
    pausedMediaElements = pauseAllMedia();
    sendResponse({ 
      success: true, 
      mediaCount: pausedMediaElements.length 
    });
  } else if (message.action === 'resume') {
    resumeAllMedia();
    sendResponse({ success: true });
  }
  
  return true;
});

// Pause all media on the page
function pauseAllMedia() {
  const paused = [];
  
  try {
    // Pause HTML5 videos
    const videos = document.querySelectorAll('video');
    videos.forEach((video, index) => {
      if (!video.paused) {
        video.pause();
        paused.push({ 
          type: 'video', 
          index, 
          element: video,
          currentTime: video.currentTime 
        });
        console.log('Paused video:', index);
      }
    });
    
    // Pause HTML5 audio
    const audios = document.querySelectorAll('audio');
    audios.forEach((audio, index) => {
      if (!audio.paused) {
        audio.pause();
        paused.push({ 
          type: 'audio', 
          index,
          element: audio,
          currentTime: audio.currentTime 
        });
        console.log('Paused audio:', index);
      }
    });
    
    // YouTube specific handling
    if (window.location.hostname.includes('youtube.com')) {
      pauseYouTube(paused);
    }
    
    // Spotify web player
    if (window.location.hostname.includes('spotify.com')) {
      pauseSpotify(paused);
    }
    
  } catch (error) {
    console.error('Error pausing media:', error);
  }
  
  return paused;
}

// Resume all previously paused media
function resumeAllMedia() {
  try {
    pausedMediaElements.forEach(item => {
      if (item.element && item.element.play) {
        item.element.play().catch(err => {
          console.log('Could not resume playback:', err);
        });
      }
    });
    
    // YouTube specific resume
    if (window.location.hostname.includes('youtube.com')) {
      resumeYouTube();
    }
    
    // Spotify specific resume
    if (window.location.hostname.includes('spotify.com')) {
      resumeSpotify();
    }
    
    pausedMediaElements = [];
  } catch (error) {
    console.error('Error resuming media:', error);
  }
}

// YouTube-specific pause function
function pauseYouTube(pausedArray) {
  try {
    // Try to find YouTube player
    const player = document.querySelector('.html5-video-player');
    if (player) {
      const video = player.querySelector('video');
      if (video && !video.paused) {
        video.pause();
        pausedArray.push({ 
          type: 'youtube', 
          element: video,
          wasPlaying: true 
        });
        console.log('Paused YouTube video');
      }
    }
    
    // Alternative: Use YouTube API if available
    if (window.ytPlayer && window.ytPlayer.pauseVideo) {
      window.ytPlayer.pauseVideo();
    }
  } catch (error) {
    console.error('Error pausing YouTube:', error);
  }
}

// YouTube-specific resume function
function resumeYouTube() {
  try {
    const player = document.querySelector('.html5-video-player');
    if (player) {
      const video = player.querySelector('video');
      if (video && video.paused) {
        video.play().catch(err => console.log('Could not resume YouTube:', err));
      }
    }
  } catch (error) {
    console.error('Error resuming YouTube:', error);
  }
}

// Spotify-specific pause function
function pauseSpotify(pausedArray) {
  try {
    const playButton = document.querySelector('[data-testid="control-button-playpause"]');
    if (playButton && playButton.getAttribute('aria-label')?.includes('Pause')) {
      playButton.click();
      pausedArray.push({ type: 'spotify', wasPlaying: true });
      console.log('Paused Spotify');
    }
  } catch (error) {
    console.error('Error pausing Spotify:', error);
  }
}

// Spotify-specific resume function
function resumeSpotify() {
  try {
    const playButton = document.querySelector('[data-testid="control-button-playpause"]');
    if (playButton && playButton.getAttribute('aria-label')?.includes('Play')) {
      playButton.click();
      console.log('Resumed Spotify');
    }
  } catch (error) {
    console.error('Error resuming Spotify:', error);
  }
}

console.log('English Learning content script loaded');
