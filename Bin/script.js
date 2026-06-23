// ============================================
// script.js — KEX Player (separate)
// ============================================
(function() {
    "use strict";

    // --- DOM refs ---
    const video = document.getElementById('videoPlayer');
    const container = document.getElementById('playerContainer');
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progressContainer');
    const currentSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeIcon = document.getElementById('volumeIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    const speedBtn = document.getElementById('speedBtn');
    const speedMenu = document.getElementById('speedMenu');
    const speedOptions = document.querySelectorAll('.speed-option');
    const qualityBtn = document.getElementById('qualityBtn');
    const qualityMenu = document.getElementById('qualityMenu');
    const qualityOptions = document.querySelectorAll('.quality-option');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const spinner = document.getElementById('spinner');
    const closeBtn = document.getElementById('closeBtn');
    const videoTitleSpan = document.getElementById('videoTitle');

    // --- Video source (Dropbox direct) ---
    const dropboxRaw = 'https://www.dropbox.com/scl/fi/gb5ivkvjfaozs1bu4n8do/trailer-_your_name._-_makoto_shinkai-720p.mp4?rlkey=hs9a2slw5dqor6qp9g29ttyhq&st=5uj3nmf3&dl=1';
    const directLink = dropboxRaw.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    video.src = directLink;
    videoTitleSpan.textContent = '🎬 KEX';
    video.controls = false;

    // --- Quality simulation (UI feedback) ---
    let currentQuality = 'auto';

    function applyQualitySimulation(quality) {
        currentQuality = quality;
        let message = '';
        if (quality === 'auto') message = 'Auto HD: Adaptive streaming active';
        else if (quality === '720p') message = '720p High Definition';
        else message = '480p Standard Definition';

        const toast = document.createElement('div');
        toast.textContent = `🎛️ Quality: ${message}`;
        toast.style.position = 'absolute';
        toast.style.bottom = '80px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'rgba(0,0,0,0.8)';
        toast.style.color = '#e91e63';
        toast.style.padding = '8px 18px';
        toast.style.borderRadius = '40px';
        toast.style.fontSize = '13px';
        toast.style.fontWeight = 'bold';
        toast.style.zIndex = '999';
        toast.style.backdropFilter = 'blur(12px)';
        toast.style.pointerEvents = 'none';
        toast.style.fontFamily = 'monospace';
        container.style.position = 'relative';
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 1800);
        console.log(`[KEX] Quality changed to ${quality}`);
    }

    // --- Helpers ---
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    let controlsTimeout;
    let controlsVisible = false;
    let isMouseMoving = false;
    let isSeeking = false;
    let hideDelay = isMobile ? 4000 : 3000;

    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function showControls() {
        if (!controlsVisible) {
            container.classList.add('controls-visible');
            controlsVisible = true;
        }
        resetHideTimer();
    }

    function hideControls() {
        if (controlsVisible && !video.paused && !isMouseMoving && !isSeeking) {
            container.classList.remove('controls-visible');
            controlsVisible = false;
        }
    }

    function resetHideTimer() {
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => hideControls(), hideDelay);
    }

    function updateProgress() {
        if (video.duration) {
            const percent = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${percent}%`;
            currentSpan.textContent = formatTime(video.currentTime);
        }
    }

    function seek(e) {
        const rect = progressContainer.getBoundingClientRect();
        let clickX;
        if (e.type === 'click' || e.type === 'mousemove') {
            clickX = e.clientX - rect.left;
        } else if (e.touches && e.touches.length) {
            clickX = e.touches[0].clientX - rect.left;
        } else return;
        let percent = clickX / rect.width;
        percent = Math.min(1, Math.max(0, percent));
        if (video.duration) video.currentTime = percent * video.duration;
        showControls();
    }

    function togglePlay() {
        if (video.paused) {
            video.play().then(() => {
                playIcon.classList.remove('fa-play');
                playIcon.classList.add('fa-pause');
            }).catch(e => console.warn("autoplay blocked", e));
        } else {
            video.pause();
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        }
        showControls();
    }

    function updateVolumeUI() {
        if (video.muted || video.volume === 0) {
            volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down');
            volumeIcon.classList.add('fa-volume-mute');
            volumeSlider.value = 0;
        } else {
            if (video.volume > 0.5) volumeIcon.classList.remove('fa-volume-mute', 'fa-volume-down');
            else volumeIcon.classList.remove('fa-volume-mute', 'fa-volume-up');
            volumeIcon.classList.add(video.volume > 0.5 ? 'fa-volume-up' : 'fa-volume-down');
            volumeSlider.value = video.volume;
        }
    }

    function toggleMute() {
        if (video.muted) {
            video.muted = false;
            if (video.volume === 0) video.volume = 0.8;
            updateVolumeUI();
        } else {
            video.muted = true;
            updateVolumeUI();
        }
        showControls();
    }

    // --- Fullscreen (cross-browser) ---
    function toggleFullscreen() {
        const elem = container;
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            const requestMethod = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
            if (requestMethod) {
                requestMethod.call(elem).catch(err => {
                    console.warn(`Fullscreen error: ${err.message}`);
                    alert('Press F11 for fullscreen or allow fullscreen permissions');
                });
            } else {
                alert('Fullscreen API not supported');
            }
        } else {
            const exitMethod = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
            if (exitMethod) exitMethod.call(document);
        }
    }

    function onFullscreenChange() {
        const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (isFull) {
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            container.classList.add('fullscreen-active');
            hideDelay = 4000;
        } else {
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            container.classList.remove('fullscreen-active');
            hideDelay = isMobile ? 4000 : 3000;
            showControls();
        }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    // --- Event binding ---
    playBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', showControls);
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(video.duration);
        if (video.readyState >= 2) spinner.style.display = 'none';
    });
    video.addEventListener('waiting', () => { spinner.style.display = 'block'; });
    video.addEventListener('playing', () => { spinner.style.display = 'none'; });

    progressContainer.addEventListener('click', (e) => { seek(e); showControls(); });
    progressContainer.addEventListener('mousemove', (e) => { if (isSeeking) seek(e); });
    progressContainer.addEventListener('mousedown', () => { isSeeking = true; showControls(); });
    window.addEventListener('mouseup', () => { isSeeking = false; resetHideTimer(); });

    if (isTouch) {
        progressContainer.addEventListener('touchstart', (e) => { isSeeking = true; seek(e); e.preventDefault(); });
        progressContainer.addEventListener('touchmove', (e) => { if (isSeeking) { seek(e); e.preventDefault(); } });
        progressContainer.addEventListener('touchend', () => { isSeeking = false; resetHideTimer(); });
    }

    volumeSlider.addEventListener('input', (e) => {
        video.volume = parseFloat(e.target.value);
        video.muted = false;
        updateVolumeUI();
        showControls();
    });
    volumeBtn.addEventListener('click', toggleMute);

    // Speed
    speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speedMenu.classList.toggle('show');
        qualityMenu.classList.remove('show');
        showControls();
    });
    speedOptions.forEach(opt => {
        opt.addEventListener('click', (e) => {
            const speedVal = parseFloat(opt.getAttribute('data-speed'));
            video.playbackRate = speedVal;
            speedOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            speedMenu.classList.remove('show');
            showControls();
            e.stopPropagation();
        });
    });

    // Quality
    qualityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        qualityMenu.classList.toggle('show');
        speedMenu.classList.remove('show');
        showControls();
    });
    qualityOptions.forEach(opt => {
        opt.addEventListener('click', (e) => {
            const selectedQuality = opt.getAttribute('data-quality');
            qualityOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            qualityMenu.classList.remove('show');
            applyQualitySimulation(selectedQuality);
            showControls();
            e.stopPropagation();
        });
    });

    fullscreenBtn.addEventListener('click', toggleFullscreen);

    closeBtn.addEventListener('click', () => {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            const exitMethod = document.exitFullscreen || document.webkitExitFullscreen;
            if (exitMethod) exitMethod.call(document);
        } else {
            console.log('KEX Player ready');
        }
    });

    // Mouse movement
    container.addEventListener('mousemove', () => {
        isMouseMoving = true;
        showControls();
        setTimeout(() => { isMouseMoving = false; }, 800);
    });
    container.addEventListener('mouseleave', () => {
        if (!video.paused) {
            container.classList.remove('controls-visible');
            controlsVisible = false;
        }
    });
    container.addEventListener('mouseenter', showControls);

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        const key = e.key;
        if (key === ' ' || key === 'k') { togglePlay(); e.preventDefault(); }
        else if (key === 'm') { toggleMute(); e.preventDefault(); }
        else if (key === 'f') { toggleFullscreen(); e.preventDefault(); }
        else if (key === 'ArrowLeft') { video.currentTime = Math.max(0, video.currentTime - 5); showControls(); e.preventDefault(); }
        else if (key === 'ArrowRight') { video.currentTime = Math.min(video.duration, video.currentTime + 5); showControls(); e.preventDefault(); }
        else if (key === 'ArrowUp') { video.volume = Math.min(1, video.volume + 0.1); updateVolumeUI(); showControls(); e.preventDefault(); }
        else if (key === 'ArrowDown') { video.volume = Math.max(0, video.volume - 0.1); updateVolumeUI(); showControls(); e.preventDefault(); }
    });

    container.addEventListener('contextmenu', (e) => { e.preventDefault(); return false; });
    video.addEventListener('dragstart', (e) => e.preventDefault());

    // Init
    video.volume = 0.8;
    updateVolumeUI();
    showControls();

    // Disable long-press download on mobile
    if (isTouch) {
        let longTouchTimer;
        container.addEventListener('touchstart', (e) => {
            longTouchTimer = setTimeout(() => {
                alert('KEX Player: Downloads are disabled');
            }, 700);
            showControls();
        });
        container.addEventListener('touchend', () => clearTimeout(longTouchTimer));
        container.addEventListener('touchmove', () => clearTimeout(longTouchTimer));
    }

    // Close menus on outside click
    document.addEventListener('click', (e) => {
        if (!speedBtn.contains(e.target) && !speedMenu.contains(e.target)) speedMenu.classList.remove('show');
        if (!qualityBtn.contains(e.target) && !qualityMenu.contains(e.target)) qualityMenu.classList.remove('show');
    });

    console.log('✅ KEX Player: separated HTML, CSS & JS — fully operational');
})();
