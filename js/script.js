/**
 * PERSONA 5 PORTFOLIO JAVASCRIPT - WILLYS LOKA
 * Features:
 * - Metaverse Audio Engine (Default Auto-Play with 25% Chill Volume, Autoplay Fallback Handler)
 * - Authentic Persona 5 Menu Select / Next SFX (assets/audio/select.mp3)
 * - Phantom Thief Star Trail Custom Cursor
 * - Floating Stars & Halftone Particle Background Canvas
 * - 3D Tilt Effect on Hero Portrait, Project Cards, and Calling Card
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. AUTHENTIC PERSONA 5 UI SFX ENGINE
  // ==========================================
  let sfxEnabled = true;
  const selectSfx = new Audio('assets/audio/select.mp3');
  selectSfx.volume = 0.35;

  let audioCtx = null;
  function initAudioCtx() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Authentic Persona 5 Click / Next SFX
  function playNextSfx() {
    if (!sfxEnabled) return;
    try {
      const s = selectSfx.cloneNode();
      s.volume = 0.35;
      s.play().catch(() => {});
    } catch (e) {
      // Audio playback fallback
    }
  }

  // P5 Menu Hover Sound (subtle snappy blip)
  function playHoverSfx() {
    if (!sfxEnabled) return;
    initAudioCtx();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  // Attach SFX to all interactive elements
  function attachInteractiveSfx() {
    const interactiveElements = document.querySelectorAll('a, button, input[type="range"], .card, .btn, .c-btn');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => playHoverSfx());
      el.addEventListener('click', () => playNextSfx());
    });
  }
  attachInteractiveSfx();

  // ==========================================
  // 2. METAVERSE AUDIO CONTROLLER (BGM)
  // ==========================================
  const bgm = document.getElementById('bgm-player');
  const playBtn = document.getElementById('p5-play-btn');
  const playText = document.getElementById('p5-play-text');
  const muteBtn = document.getElementById('p5-mute-btn');
  const muteIcon = document.getElementById('p5-mute-icon');
  const volumeSlider = document.getElementById('p5-volume-slider');
  const sfxToggleBtn = document.getElementById('p5-sfx-toggle');
  const widgetContainer = document.querySelector('.p5-audio-widget');
  const trackStatus = document.querySelector('.p5-track-status');

  // Set default low chill volume (0.25 = 50% lower than 0.5)
  const DEFAULT_VOLUME = 0.25;
  let prevVolume = DEFAULT_VOLUME;

  if (bgm) {
    bgm.volume = DEFAULT_VOLUME;
    if (volumeSlider) volumeSlider.value = DEFAULT_VOLUME;

    // Audio error fallback
    bgm.addEventListener('error', () => {
      console.warn('Local BGM failed, trying online stream fallback...');
      if (trackStatus) trackStatus.textContent = 'STREAMING ONLINE';
      bgm.src = 'https://archive.org/download/last-surprise/Last%20Surprise.mp3';
      bgm.load();
      startBgm();
    });

    // Helper: start playback
    function startBgm() {
      if (bgm.paused) {
        bgm.play().then(() => {
          if (widgetContainer) widgetContainer.classList.add('p5-playing');
          if (playText) playText.textContent = 'PAUSE';
          if (trackStatus) trackStatus.textContent = 'NOW PLAYING';
        }).catch(err => {
          // Autoplay blocked by browser policy until user interacts
          if (trackStatus) trackStatus.textContent = 'CLICK TO PLAY';
        });
      }
    }

    // Try auto-play immediately on load
    startBgm();

    // Fallback: If autoplay policy blocked unprompted audio, resume upon FIRST interaction anywhere
    const userInteractionEvents = ['click', 'touchstart', 'keydown', 'scroll'];
    function handleFirstUserInteraction() {
      startBgm();
      initAudioCtx();
      userInteractionEvents.forEach(evt => {
        window.removeEventListener(evt, handleFirstUserInteraction);
      });
    }
    userInteractionEvents.forEach(evt => {
      window.addEventListener(evt, handleFirstUserInteraction, { once: true, passive: true });
    });

    // Play / Pause Toggle Button
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        initAudioCtx();
        if (bgm.paused) {
          bgm.play().then(() => {
            widgetContainer.classList.add('p5-playing');
            if (playText) playText.textContent = 'PAUSE';
            if (trackStatus) trackStatus.textContent = 'NOW PLAYING';
          }).catch(err => console.log('Playback error:', err));
        } else {
          bgm.pause();
          widgetContainer.classList.remove('p5-playing');
          if (playText) playText.textContent = 'PLAY BGM';
          if (trackStatus) trackStatus.textContent = 'PAUSED';
        }
      });
    }

    // Volume Slider Control
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        bgm.volume = val;
        if (val > 0) {
          bgm.muted = false;
          if (muteIcon) muteIcon.textContent = '🔊';
          prevVolume = val;
        } else {
          bgm.muted = true;
          if (muteIcon) muteIcon.textContent = '🔇';
        }
      });
    }

    // Mute / Unmute Button
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        if (bgm.muted || bgm.volume === 0) {
          bgm.muted = false;
          bgm.volume = prevVolume > 0 ? prevVolume : DEFAULT_VOLUME;
          if (volumeSlider) volumeSlider.value = bgm.volume;
          if (muteIcon) muteIcon.textContent = '🔊';
        } else {
          prevVolume = bgm.volume;
          bgm.muted = true;
          if (volumeSlider) volumeSlider.value = 0;
          if (muteIcon) muteIcon.textContent = '🔇';
        }
      });
    }

    // SFX Toggle
    if (sfxToggleBtn) {
      sfxToggleBtn.addEventListener('click', () => {
        sfxEnabled = !sfxEnabled;
        if (sfxEnabled) {
          sfxToggleBtn.classList.add('active');
          sfxToggleBtn.textContent = 'SFX: ON';
          playNextSfx();
        } else {
          sfxToggleBtn.classList.remove('active');
          sfxToggleBtn.textContent = 'SFX: OFF';
        }
      });
    }
  }

  // ==========================================
  // 3. PHANTOM THIEF STAR TRAIL CURSOR
  // ==========================================
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  let lastStarTime = 0;
  const starColors = ['#e60012', '#ffffff', '#ffe600'];

  if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastStarTime < 35) return;
      lastStarTime = now;

      createStarParticle(e.clientX, e.clientY);
    });
  }

  function createStarParticle(x, y) {
    const star = document.createElement('div');
    star.className = 'cursor-star';
    const color = starColors[Math.floor(Math.random() * starColors.length)];
    const size = Math.floor(Math.random() * 8) + 10;
    
    star.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24">
        <polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9" fill="${color}" stroke="#000" stroke-width="1.5"/>
      </svg>
    `;
    
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    document.body.appendChild(star);

    setTimeout(() => {
      star.remove();
    }, 650);
  }

  // ==========================================
  // 4. FLOATING PARTICLES CANVAS BACKGROUND
  // ==========================================
  const canvas = document.getElementById('p5-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(35, Math.floor(width / 35));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 7 + 4,
        speedX: (Math.random() - 0.5) * 0.7,
        speedY: -Math.random() * 0.9 - 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        type: Math.random() > 0.4 ? 'star' : 'dot',
        color: Math.random() > 0.35 ? '#e60012' : '#ffffff',
        alpha: Math.random() * 0.45 + 0.15
      });
    }

    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.type === 'star') {
          drawStar(ctx, 0, 0, 5, p.size, p.size / 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }

  // ==========================================
  // 5. 3D INTERACTIVE TILT EFFECT
  // ==========================================
  const tiltElements = document.querySelectorAll('.cutin-card, .card, .calling-card-top, .calling-card-bottom');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
});
