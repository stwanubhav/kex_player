/* ============================================================
   🎬 CONFIGURATION - Edit this file to change videos
   ============================================================ */

const PLAYER_CONFIG = {
    // ============================================================
    // 📹 VIDEO SOURCES - Add your video URLs here
    // ============================================================
    videoUrls: [
        // Primary source (will try this first)
        'https://www.dropbox.com/scl/fi/gb5ivkvjfaozs1bu4n8do/trailer-_your_name._-_makoto_shinkai-720p.mp4?rlkey=hs9a2slw5dqor6qp9g29ttyhq&st=k8tnk4m5&raw=1',
        // Fallback source (if primary fails)
        'https://www.dropbox.com/scl/fi/gb5ivkvjfaozs1bu4n8do/trailer-_your_name._-_makoto_shinkai-720p.mp4?rlkey=hs9a2slw5dqor6qp9g29ttyhq&dl=1'
    ],
    
    // ============================================================
    // 🎨 VIDEO METADATA
    // ============================================================
    title: '✨ Your Name',
    posterUrl: 'assets/poster.jpg',  // Path to poster image
    
    // ============================================================
    // 📝 SUBTITLES
    // ============================================================
    subtitles: [
        { name: 'English', src: 'assets/subs/english.vtt', default: true },
        { name: 'Japanese', src: 'assets/subs/japanese.vtt', default: false }
    ],
    
    // ============================================================
    // ⚙️ PLAYER SETTINGS
    // ============================================================
    autoPlay: false,          // Auto-play on load
    volume: 0.8,              // 0 to 1
    startTime: 0,             // Start position in seconds
    themeColor: '#8652bb',    // Default theme color
    enableWatchParty: true,   // Show watch party feature
    enableCast: true,         // Show Chromecast feature
    thumbsGenerate: true,     // Enable thumbnail generation
    
    // ============================================================
    // 🎯 QUALITY OPTIONS
    // ============================================================
    qualities: [
        { label: 'Auto', value: 'auto' },
        { label: '1080p', value: '1080p' },
        { label: '720p', value: '720p' },
        { label: '480p', value: '480p' },
        { label: '360p', value: '360p' }
    ]
};

// ============================================================
// 📝 HOW TO CHANGE VIDEO:
// ============================================================
// 1. Replace the URLs in videoUrls array above
// 2. Update the title and poster if needed
// 3. That's it! No other changes needed
// ============================================================
