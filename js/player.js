/* ============================================================
   🎬 PRO VIDEO PLAYER - Core Logic (Fully Fixed)
   ============================================================ */

(function() {
    'use strict';
    
    // ============================================================
    // DOM REFERENCES
    // ============================================================
    const container = document.getElementById('playerContainer');
    const video = document.getElementById('mainVideo');
    const posterOverlay = document.getElementById('posterOverlay');
    const posterImage = document.getElementById('posterImage');
    const videoTitle = document.getElementById('videoTitle');
    const controlsOverlay = document.getElementById('controlsOverlay');
    const progressFill = document.getElementById('progressFill');
    const progressBuffer = document.getElementById('progressBuffer');
    const progressContainer = document.getElementById('progressContainer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const subtitleDisplay = document.getElementById('subtitleDisplay');
    const subtitleBtn = document.getElementById('subtitleBtn');
    const subtitleBadge = document.getElementById('subtitleBadge');
    const qualityBtn = document.getElementById('qualityBtn');
    const qualityBadge = document.getElementById('qualityBadge');
    const qualityDropdown = document.getElementById('qualityDropdown');
    const watchPartyBtn = document.getElementById('watchPartyBtn');
    const watchPartyIndicator = document.getElementById('watchPartyIndicator');
    const partyCount = document.getElementById('partyCount');
    const castBtn = document.getElementById('castBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const playButton = document.getElementById('playButton');
    const speedSetting = document.getElementById('speedSetting');
    const autoNextSetting = document.getElementById('autoNextSetting');
    
    // ============================================================
    // STATE
    // ============================================================
    const state = {
        isPlaying: false,
        isMuted: false,
        volume: PLAYER_CONFIG.volume,
        currentTime: 0,
        duration: 0,
        isFullscreen: false,
        subtitleTrack: 0,
        subtitles: [],
        quality: 'auto',
        playbackRate: 1.0,
        themeColor: PLAYER_CONFIG.themeColor,
        autoNext: false,
        watchPartyActive: false,
        partyMembers: 0,
        isDragging: false,
        buffered: 0,
        errorCount: 0,
        currentUrlIndex: 0,
        isRecovering: false,
        posterHidden: false,
        controlsVisible: true,
        controlsTimeout: null,
        isMouseMoving: false,
        mouseMoveTimeout: null,
        isHoveringControls: false
    };
    
    // ============================================================
    // HELPER FUNCTIONS
    // ============================================================
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
    
    function showLoading(text = 'Loading video...') {
        loadingText.textContent = text;
        loadingOverlay.classList.add('show');
    }
    
    function hideLoading() {
        loadingOverlay.classList.remove('show');
    }
    
    function showError(message) {
        hideLoading();
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            color: #fff; text-align: center; z-index: 20;
            background: rgba(0,0,0,0.8); padding: 30px; border-radius: 12px;
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <h3 style="color:#ff6b6b;margin-bottom:10px;">⚠️ Playback Error</h3>
            <p style="color:#ccc;font-size:14px;line-height:1.6;">${message}</p>
            <button onclick="location.reload()" style="
                margin-top:15px; background:#8652bb; color:#fff;
                border:none; padding:10px 25px; border-radius:6px;
                cursor:pointer; font-size:14px;
            ">Retry</button>
        `;
        container.appendChild(errorDiv);
    }
    
    function updateProgress() {
        if (state.duration === 0) return;
        const percent = (state.currentTime / state.duration) * 100;
        progressFill.style.width = Math.min(percent, 100) + '%';
        currentTimeEl.textContent = formatTime(state.currentTime);
    }
    
    function updateBuffer() {
        if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const percent = (bufferedEnd / state.duration) * 100;
            progressBuffer.style.width = Math.min(percent, 100) + '%';
        }
    }
    
    function togglePlay() {
        if (video.paused) {
            video.play().catch(err => console.warn('Play prevented:', err));
        } else {
            video.pause();
        }
    }
    
    function updatePlayButton() {
        if (state.isPlaying) {
            playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
        } else {
            playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>`;
        }
    }
    
    function updateVolumeUI() {
        const vol = state.isMuted ? 0 : state.volume;
        volumeSlider.value = vol;
        if (vol === 0) {
            volumeBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM9 4l-5 5H1v6h3l5 5V4z"/></svg>`;
        } else if (vol < 0.5) {
            volumeBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
        } else {
            volumeBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M19.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
        }
    }
    
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => console.warn('Fullscreen error:', err));
        } else {
            document.exitFullscreen();
        }
    }
    
    function updateFullscreenButton() {
        if (document.fullscreenElement) {
            fullscreenBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;
            state.isFullscreen = true;
        } else {
            fullscreenBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
            state.isFullscreen = false;
        }
    }
    
    function applyThemeColor(color) {
        state.themeColor = color;
        document.querySelectorAll('.progress-fill, .color-dot.active, .ctrl-btn .badge')
            .forEach(el => {
                if (el.classList.contains('color-dot')) {
                    el.style.borderColor = color;
                } else {
                    el.style.background = color;
                }
            });
        document.querySelectorAll('.progress-fill').forEach(el => {
            el.style.background = `linear-gradient(90deg, ${color}, ${color}dd)`;
        });
        document.querySelectorAll('.ctrl-btn .badge').forEach(el => {
            el.style.background = color;
        });
        document.querySelector('.loading-spinner')?.style.setProperty('border-top-color', color);
    }
    
    function toggleMute() {
        state.isMuted = !state.isMuted;
        video.muted = state.isMuted;
        updateVolumeUI();
    }
    
    // ============================================================
    // 🎯 CONTROLS AUTO-HIDE (FIXED)
    // ============================================================
    
    function showControls() {
        controlsOverlay.classList.add('show');
        state.controlsVisible = true;
        resetControlsTimer();
    }
    
    function hideControls() {
        // Don't hide if:
        if (video.paused) return;
        if (settingsPanel.classList.contains('show')) return;
        if (qualityDropdown.classList.contains('show')) return;
        if (state.isDragging) return;
        if (state.isHoveringControls) return;
        if (volumeSlider.matches(':hover') || volumeSlider.matches(':focus')) return;
        
        controlsOverlay.classList.remove('show');
        state.controlsVisible = false;
    }
    
    function resetControlsTimer() {
        if (state.controlsTimeout) {
            clearTimeout(state.controlsTimeout);
            state.controlsTimeout = null;
        }
        
        if (!video.paused) {
            state.controlsTimeout = setTimeout(() => {
                hideControls();
            }, 3000);
        }
    }
    
    // ============================================================
    // VIDEO LOADING WITH FALLBACK
    // ============================================================
    function loadVideo(urlIndex) {
        const url = PLAYER_CONFIG.videoUrls[urlIndex];
        if (!url) {
            showError('No video source available.');
            return;
        }
        
        state.currentUrlIndex = urlIndex;
        showLoading(`Loading source ${urlIndex + 1}/${PLAYER_CONFIG.videoUrls.length}...`);
        
        video.src = url;
        video.load();
        
        if (url.includes('.m3u8') && typeof Hls !== 'undefined') {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            window._hls = hls;
        }
    }
    
    function tryNextSource() {
        if (state.currentUrlIndex < PLAYER_CONFIG.videoUrls.length - 1) {
            loadVideo(state.currentUrlIndex + 1);
            return true;
        }
        return false;
    }
    
    // ============================================================
    // SUBTITLE PARSING
    // ============================================================
    function parseSubtitles(text) {
        const lines = text.split('\n');
        const cues = [];
        let currentCue = null;
        let timePattern = /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/;
        
        for (const line of lines) {
            const match = line.match(timePattern);
            if (match) {
                if (currentCue) cues.push(currentCue);
                currentCue = {
                    start: parseTime(match[1]),
                    end: parseTime(match[2]),
                    text: ''
                };
            } else if (currentCue && line.trim() && !line.match(/^\d+$/)) {
                currentCue.text += (currentCue.text ? ' ' : '') + line.trim();
            }
        }
        if (currentCue) cues.push(currentCue);
        return cues;
    }
    
    function parseTime(timeStr) {
        const parts = timeStr.split(':');
        if (parts.length === 3) {
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
        }
        return 0;
    }
    
    function loadSubtitles(url) {
        if (!url) return;
        fetch(url)
            .then(res => res.text())
            .then(text => {
                state.subtitles = parseSubtitles(text);
                console.log('✅ Subtitles loaded:', state.subtitles.length);
            })
            .catch(err => console.warn('Subtitle load failed:', err));
    }
    
    function updateSubtitleDisplay() {
        const time = state.currentTime;
        let found = false;
        for (const cue of state.subtitles) {
            if (time >= cue.start && time <= cue.end) {
                subtitleDisplay.textContent = cue.text;
                subtitleDisplay.classList.add('show');
                found = true;
                break;
            }
        }
        if (!found) {
            subtitleDisplay.classList.remove('show');
        }
    }
    
    // ============================================================
    // WATCH PARTY (Simulated)
    // ============================================================
    function toggleWatchParty() {
        state.watchPartyActive = !state.watchPartyActive;
        if (state.watchPartyActive) {
            state.partyMembers = Math.floor(Math.random() * 5) + 2;
            watchPartyIndicator.classList.add('show');
            partyCount.textContent = `${state.partyMembers} watching`;
            watchPartyBtn.style.color = '#4caf50';
        } else {
            watchPartyIndicator.classList.remove('show');
            watchPartyBtn.style.color = '';
        }
    }
    
    // ============================================================
    // CHROMECAST (Simulated)
    // ============================================================
    function toggleCast() {
        const isCasting = castBtn.style.color === '#4caf50';
        if (isCasting) {
            castBtn.style.color = '';
        } else {
            castBtn.style.color = '#4caf50';
        }
    }
    
    // ============================================================
    // EVENT LISTENERS
    // ============================================================
    
    // --- CONTROLS AUTO-HIDE EVENTS ---
    
    // Mouse movement on container
    container.addEventListener('mousemove', function(e) {
        showControls();
        resetControlsTimer();
    });
    
    // Mouse enter/leave container
    container.addEventListener('mouseenter', function() {
        showControls();
    });
    
    container.addEventListener('mouseleave', function() {
        if (!video.paused && !settingsPanel.classList.contains('show') && !qualityDropdown.classList.contains('show')) {
            setTimeout(() => {
                hideControls();
            }, 500);
        }
    });
    
    // Hover over controls
    controlsOverlay.addEventListener('mouseenter', function() {
        state.isHoveringControls = true;
        showControls();
        if (state.controlsTimeout) {
            clearTimeout(state.controlsTimeout);
        }
    });
    
    controlsOverlay.addEventListener('mouseleave', function() {
        state.isHoveringControls = false;
        resetControlsTimer();
    });
    
    // Touch events for mobile
    let touchCount = 0;
    container.addEventListener('touchstart', function(e) {
        touchCount++;
        if (touchCount === 1) {
            // Single tap - toggle controls
            if (controlsOverlay.classList.contains('show')) {
                if (!video.paused) {
                    hideControls();
                }
            } else {
                showControls();
            }
            setTimeout(() => { touchCount = 0; }, 500);
        }
        resetControlsTimer();
    });
    
    container.addEventListener('touchmove', function() {
        showControls();
        resetControlsTimer();
    });
    
    container.addEventListener('touchend', function() {
        resetControlsTimer();
    });
    
    // --- VIDEO EVENTS ---
    video.addEventListener('loadedmetadata', function() {
        state.duration = this.duration;
        durationEl.textContent = formatTime(state.duration);
        hideLoading();
        
        if (PLAYER_CONFIG.startTime > 0) {
            this.currentTime = PLAYER_CONFIG.startTime;
        }
        
        if (PLAYER_CONFIG.autoPlay) {
            this.play().catch(() => {});
        }
    });
    
    video.addEventListener('canplay', function() {
        hideLoading();
    });
    
    video.addEventListener('timeupdate', function() {
        state.currentTime = this.currentTime;
        updateProgress();
        updateBuffer();
        updateSubtitleDisplay();
    });
    
    video.addEventListener('progress', updateBuffer);
    
    video.addEventListener('play', function() {
        state.isPlaying = true;
        updatePlayButton();
        if (!state.posterHidden) {
            posterOverlay.classList.add('hidden');
            state.posterHidden = true;
        }
        hideLoading();
        resetControlsTimer();
    });
    
    video.addEventListener('pause', function() {
        state.isPlaying = false;
        updatePlayButton();
        showControls();
        if (state.controlsTimeout) {
            clearTimeout(state.controlsTimeout);
            state.controlsTimeout = null;
        }
    });
    
    video.addEventListener('ended', function() {
        state.isPlaying = false;
        updatePlayButton();
        showControls();
        if (state.autoNext) {
            state.currentTime = 0;
            this.play().catch(() => {});
        }
    });
    
    video.addEventListener('waiting', function() {
        showLoading('Buffering...');
    });
    
    video.addEventListener('canplaythrough', function() {
        hideLoading();
    });
    
    video.addEventListener('error', function(e) {
        console.error('Video error:', this.error);
        state.errorCount++;
        
        if (state.errorCount < 3 && tryNextSource()) {
            // Trying next source
        } else {
            hideLoading();
            showError('Video playback failed. Please try refreshing the page.');
        }
    });
    
    // --- PLAY/PAUSE ---
    playPauseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        togglePlay();
    });
    video.addEventListener('click', function(e) {
        togglePlay();
    });
    posterOverlay.addEventListener('click', function() {
        video.play().catch(() => {});
    });
    playButton.addEventListener('click', function(e) {
        e.stopPropagation();
        video.play().catch(() => {});
    });
    
    // --- SPACEBAR ---
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT') return;
        if (e.key === ' ' || e.key === 'Space') {
            e.preventDefault();
            togglePlay();
            showControls();
        }
        if (e.key === 'f' || e.key === 'F') {
            toggleFullscreen();
            showControls();
        }
        if (e.key === 'm' || e.key === 'M') {
            toggleMute();
            showControls();
        }
        if (e.key === 'ArrowRight') {
            video.currentTime = Math.min(video.currentTime + 5, state.duration);
            e.preventDefault();
            showControls();
            resetControlsTimer();
        }
        if (e.key === 'ArrowLeft') {
            video.currentTime = Math.max(video.currentTime - 5, 0);
            e.preventDefault();
            showControls();
            resetControlsTimer();
        }
        if (e.key === 'ArrowUp') {
            state.volume = Math.min(1, state.volume + 0.1);
            video.volume = state.volume;
            updateVolumeUI();
            e.preventDefault();
            showControls();
            resetControlsTimer();
        }
        if (e.key === 'ArrowDown') {
            state.volume = Math.max(0, state.volume - 0.1);
            video.volume = state.volume;
            updateVolumeUI();
            e.preventDefault();
            showControls();
            resetControlsTimer();
        }
    });
    
    // --- VOLUME ---
    volumeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMute();
        showControls();
        resetControlsTimer();
    });
    
    volumeSlider.addEventListener('input', function() {
        state.volume = parseFloat(this.value);
        state.isMuted = false;
        video.muted = false;
        video.volume = state.volume;
        updateVolumeUI();
        showControls();
        resetControlsTimer();
    });
    
    volumeSlider.addEventListener('mouseenter', function() {
        showControls();
    });
    
    volumeSlider.addEventListener('mouseleave', function() {
        resetControlsTimer();
    });
    
    // --- PROGRESS BAR ---
    progressContainer.addEventListener('mousedown', function(e) {
        state.isDragging = true;
        const rect = this.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * state.duration;
        video.currentTime = time;
        showControls();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (state.isDragging) {
            const rect = progressContainer.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const time = percent * state.duration;
            video.currentTime = time;
            currentTimeEl.textContent = formatTime(time);
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (state.isDragging) {
            state.isDragging = false;
            resetControlsTimer();
        }
    });
    
    // Touch support for progress
    progressContainer.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.getBoundingClientRect();
        const percent = (touch.clientX - rect.left) / rect.width;
        const time = percent * state.duration;
        video.currentTime = time;
        showControls();
    }, { passive: false });
    
    progressContainer.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        const time = percent * state.duration;
        video.currentTime = time;
    }, { passive: false });
    
    progressContainer.addEventListener('touchend', function() {
        resetControlsTimer();
    });
    
    // --- FULLSCREEN ---
    fullscreenBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFullscreen();
        showControls();
        resetControlsTimer();
    });
    
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    
    // --- QUALITY ---
    qualityBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        qualityDropdown.classList.toggle('show');
        showControls();
        if (state.controlsTimeout) {
            clearTimeout(state.controlsTimeout);
        }
    });
    
    qualityDropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            qualityDropdown.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            state.quality = this.dataset.quality;
            qualityBadge.textContent = state.quality === 'auto' ? 'HD' : state.quality;
            qualityDropdown.classList.remove('show');
            resetControlsTimer();
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!qualityDropdown.contains(e.target) && e.target !== qualityBtn) {
            qualityDropdown.classList.remove('show');
        }
        if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
            settingsPanel.classList.remove('show');
        }
        resetControlsTimer();
    });
    
    // --- SUBTITLES ---
    subtitleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        state.subtitleTrack = (state.subtitleTrack + 1) % (PLAYER_CONFIG.subtitles.length + 1);
        subtitleBadge.style.display = state.subtitleTrack === 0 ? 'none' : 'block';
        if (state.subtitleTrack === 0) {
            subtitleDisplay.classList.remove('show');
        } else {
            const sub = PLAYER_CONFIG.subtitles[state.subtitleTrack - 1];
            if (sub && sub.src) {
                loadSubtitles(sub.src);
            }
        }
        showControls();
        resetControlsTimer();
    });
    
    // --- WATCH PARTY ---
    watchPartyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleWatchParty();
        showControls();
        resetControlsTimer();
    });
    
    // --- CAST ---
    castBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleCast();
        showControls();
        resetControlsTimer();
    });
    
    // --- SETTINGS ---
    settingsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        settingsPanel.classList.toggle('show');
        showControls();
        if (state.controlsTimeout) {
            clearTimeout(state.controlsTimeout);
        }
    });
    
    // Speed setting
    speedSetting.addEventListener('click', function(e) {
        e.stopPropagation();
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
        let idx = speeds.indexOf(state.playbackRate);
        idx = (idx + 1) % speeds.length;
        state.playbackRate = speeds[idx];
        video.playbackRate = state.playbackRate;
        this.textContent = state.playbackRate + 'x';
        showControls();
        resetControlsTimer();
    });
    
    // Auto next
    autoNextSetting.addEventListener('click', function(e) {
        e.stopPropagation();
        state.autoNext = !state.autoNext;
        this.textContent = state.autoNext ? 'On' : 'Off';
        this.style.color = state.autoNext ? '#4caf50' : '#8652bb';
        showControls();
        resetControlsTimer();
    });
    
    // Theme colors
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            this.classList.add('active');
            const color = this.dataset.color;
            applyThemeColor('#' + color);
            showControls();
            resetControlsTimer();
        });
    });
    
    // ============================================================
    // THUMBNAIL GENERATION (Simulated)
    // ============================================================
    function generateThumbnails() {
        if (!PLAYER_CONFIG.thumbsGenerate) return;
        console.log('🎨 Thumbnail generation enabled');
    }
    
    // ============================================================
    // INIT
    // ============================================================
    function init() {
        if (PLAYER_CONFIG.posterUrl) {
            posterImage.src = PLAYER_CONFIG.posterUrl;
        }
        videoTitle.textContent = PLAYER_CONFIG.title;
        
        applyThemeColor(PLAYER_CONFIG.themeColor);
        
        video.volume = PLAYER_CONFIG.volume;
        video.muted = false;
        updateVolumeUI();
        
        if (PLAYER_CONFIG.subtitles.length > 0) {
            const defaultSub = PLAYER_CONFIG.subtitles.find(s => s.default);
            if (defaultSub && defaultSub.src) {
                loadSubtitles(defaultSub.src);
                subtitleBadge.style.display = 'block';
                state.subtitleTrack = 1;
            }
        }
        
        const dropdown = qualityDropdown;
        dropdown.innerHTML = '';
        PLAYER_CONFIG.qualities.forEach(q => {
            const item = document.createElement('div');
            item.className = 'dropdown-item' + (q.value === 'auto' ? ' active' : '');
            item.dataset.quality = q.value;
            item.textContent = q.label;
            dropdown.appendChild(item);
        });
        
        loadVideo(0);
        generateThumbnails();
        showControls();
        
        console.log('✅ Pro Video Player initialized');
        console.log(`📹 Video sources: ${PLAYER_CONFIG.videoUrls.length}`);
        console.log(`🎨 Theme: ${PLAYER_CONFIG.themeColor}`);
        console.log(`📝 Subtitles: ${PLAYER_CONFIG.subtitles.length}`);
        console.log('🎬 Keyboard Shortcuts:');
        console.log('  Space  - Play/Pause');
        console.log('  F      - Fullscreen');
        console.log('  M      - Mute');
        console.log('  ←/→    - Seek -5/+5 seconds');
        console.log('  ↑/↓    - Volume +/- 10%');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ============================================================
    // EXPOSE API
    // ============================================================
    window.player = {
        play: () => video.play(),
        pause: () => video.pause(),
        toggle: togglePlay,
        seek: (time) => { video.currentTime = time; },
        getCurrentTime: () => state.currentTime,
        getDuration: () => state.duration,
        setVolume: (vol) => { state.volume = Math.max(0, Math.min(1, vol)); video.volume = state.volume; updateVolumeUI(); },
        getVolume: () => state.volume,
        toggleFullscreen: toggleFullscreen,
        setPlaybackRate: (rate) => { state.playbackRate = rate; video.playbackRate = rate; },
        getPlaybackRate: () => state.playbackRate,
        toggleWatchParty: toggleWatchParty,
        toggleCast: toggleCast,
        setThemeColor: applyThemeColor,
        showControls: showControls,
        hideControls: hideControls,
        destroy: () => {
            video.pause();
            video.src = '';
            video.load();
            if (state.controlsTimeout) {
                clearTimeout(state.controlsTimeout);
            }
        },
        loadNewVideo: (urls, title, poster) => {
            if (Array.isArray(urls)) {
                PLAYER_CONFIG.videoUrls = urls;
            } else {
                PLAYER_CONFIG.videoUrls = [urls];
            }
            if (title) {
                PLAYER_CONFIG.title = title;
                videoTitle.textContent = title;
            }
            if (poster) {
                PLAYER_CONFIG.posterUrl = poster;
                posterImage.src = poster;
            }
            loadVideo(0);
            showControls();
        }
    };
    
    console.log('🎮 Player API available at window.player');
    console.log('📖 Usage: player.loadNewVideo(["url1", "url2"], "Title", "poster.jpg")');
    console.log('📖 Controls: player.showControls() / player.hideControls()');
    
})();
