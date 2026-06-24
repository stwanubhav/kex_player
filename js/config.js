/* ============================================================
   🎬 CONFIGURATION - HLS Streaming Setup
   ============================================================ */

const PLAYER_CONFIG = {
    // ============================================================
    // 📹 HLS VIDEO SOURCES - Use .m3u8 URLs
    // ============================================================
    videoUrls: [
        // Primary HLS stream
        'https://absent-tiger-u3uso.lighthouseweb3.xyz/ipfs/bafybeicmascjhnggc2wdhquxltmu44dtwcntx66yb5xjvdzjovdvul42ra/master.m3u8',
        // Fallback MP4 if HLS fails
        'https://rezeplayer.vercel.app/reze/mp4/trailer.mp4'
    ],
    
    // ============================================================
    // 📊 HLS QUALITY SOURCES - Different quality renditions
    // ============================================================
    // Note: With HLS, quality levels are auto-detected from the manifest
    // This is optional for additional manual MP4 fallbacks
    qualitySources: [
        { quality: '1080p', url: 'https://rezeplayer.vercel.app/reze/mp4/trailer-1080p.mp4' },
        { quality: '720p', url: 'https://rezeplayer.vercel.app/reze/mp4/trailer-720p.mp4' },
        { quality: '480p', url: 'https://rezeplayer.vercel.app/reze/mp4/trailer-480p.mp4' },
        { quality: '360p', url: 'https://rezeplayer.vercel.app/reze/mp4/trailer-360p.mp4' }
    ],
    
    // ============================================================
    // 🎨 VIDEO METADATA
    // ============================================================
    title: '✨ Your Name - Trailer',
    posterUrl: 'https://rezeplayer.vercel.app/reze/poster.png',
    
    // ============================================================
    // 📝 SUBTITLES
    // ============================================================
    subtitles: [
        { name: 'English', src: 'https://rezeplayer.vercel.app/reze/subs/eng.vtt', default: true },
        { name: 'Japanese', src: 'https://rezeplayer.vercel.app/reze/subs/ja.vtt', default: false },
        { name: 'French', src: 'https://rezeplayer.vercel.app/reze/subs/french.vtt', default: false },
        { name: 'Russian', src: 'https://rezeplayer.vercel.app/reze/subs/russian.vtt', default: false },
        { name: 'Korean', src: 'https://rezeplayer.vercel.app/reze/subs/koreon.vtt', default: false },
        { name: 'Chinese', src: 'https://rezeplayer.vercel.app/reze/subs/chinese.vtt', default: false },
        { name: 'Arabic', src: 'https://rezeplayer.vercel.app/reze/subs/arabic.vtt', default: false }
    ],
    
    // ============================================================
    // ⚙️ PLAYER SETTINGS
    // ============================================================
    autoPlay: false,          // Set to true for autoplay (browser may block)
    volume: 0.8,              // Default volume (0 to 1)
    startTime: 0,             // Start position in seconds
    themeColor: '#8652bb',    // Default theme color (hex without #)
    enableWatchParty: true,   // Enable watch party feature
    enableCast: true,         // Enable Chromecast feature
    thumbsGenerate: true,     // Enable thumbnail generation
    
    // ============================================================
    // 🎯 QUALITY OPTIONS (Labels for dropdown)
    // ============================================================
    qualities: [
        { label: 'Auto (HD)', value: 'auto' },
        { label: '1080p', value: '1080p' },
        { label: '720p', value: '720p' },
        { label: '480p', value: '480p' },
        { label: '360p', value: '360p' }
    ],
    
    // ============================================================
    // 🔧 HLS SPECIFIC CONFIGURATION
    // ============================================================
    hlsConfig: {
        enableWorker: true,           // Enable web workers for better performance
        lowLatencyMode: true,          // Reduce latency
        backbufferLength: 30,          // Keep 30 seconds of buffer
        maxBufferLength: 60,           // Max buffer in seconds
        maxMaxBufferLength: 120,       // Absolute max buffer
        startLevel: -1,                // -1 = auto, 0 = highest quality
        abrEwmaDefaultEstimate: 5e5,   // Bandwidth estimate
        abrEwmaFastLive: 3,            // Fast EWMA for live streams
        abrEwmaSlowLive: 9,            // Slow EWMA for live streams
        abrEwmaVoD: 6,                 // EWMA for VOD
        abrBandWidthFactor: 0.95,      // Bandwidth factor
        abrBandWidthUpFactor: 1,       // Bandwidth up factor
        abrMaxWithRealBitrate: false,  // Use real bitrate
        maxStarvationDelay: 4,         // Max starvation delay
        maxLoadingDelay: 4,            // Max loading delay
        minAutoBitrate: 0,             // Minimum auto bitrate
        autoLevelCapping: -1,          // Auto level cap
        fragLoadingTimeOut: 20000,     // Fragment load timeout
        manifestLoadingTimeOut: 10000, // Manifest load timeout
        levelLoadingTimeOut: 10000,    // Level load timeout
        progressive: false,            // Progressive download
        enableWebVTT: true,            // Enable WebVTT subtitles
        enableIMSC1: false,            // Enable IMSC1 subtitles
        enableCEA708Captions: false    // Enable CEA708 captions
    }
};

/* ============================================================
   📝 HOW TO USE HLS URLs:
   ============================================================
   1. Replace videoUrls with your .m3u8 URLs
   2. The player will auto-detect HLS and use HLS.js
   3. Quality levels are auto-detected from manifest
   4. Click quality button to switch levels
   5. "Auto" will let HLS decide based on bandwidth
   
   📝 DROPBOX HLS NOTE:
   Dropbox does NOT support HLS streaming (.m3u8 files)
   For HLS, use a proper streaming service like:
   - Cloudinary (with HLS enabled)
   - Vimeo (with HLS)
   - Mux
   - AWS MediaConvert
   - Your own HLS server
   ============================================================ */

// ============================================================
// 📝 EXAMPLE: Using Dropbox MP4 Fallback (No HLS)
// ============================================================
// If you want to use Dropbox (MP4 only):
/*
const PLAYER_CONFIG = {
    videoUrls: [
        'https://www.dropbox.com/scl/fi/gb5ivkvjfaozs1bu4n8do/trailer-_your_name._-_makoto_shinkai-720p.mp4?rlkey=hs9a2slw5dqor6qp9g29ttyhq&st=k8tnk4m5&raw=1',
        'https://www.dropbox.com/scl/fi/gb5ivkvjfaozs1bu4n8do/trailer-_your_name._-_makoto_shinkai-720p.mp4?rlkey=hs9a2slw5dqor6qp9g29ttyhq&dl=1'
    ],
    // ... rest of config
};
*/s
