let escapeCount = 0;
const MAX_ESCAPES = 3;
let isFixed = false;
let cooldown = false;

window.addEventListener('DOMContentLoaded', () => {
    // Floating bamboo + panda decorations
    const decoLayer = document.createElement('div');
    decoLayer.id = 'deco-layer';
    document.body.appendChild(decoLayer);
    const decoItems = [
        '🐼','🐼','🐼','🐼','🐼','🐼','🐼','🐼',
        '🐷','🐷','🐷','🐷','🐷',
        '🎋','🎋','🎋','🎋','🎍','🎍','🎍','🎋','🎋'
    ];
    decoItems.forEach((emoji) => {
        const el = document.createElement('span');
        el.className = 'deco';
        el.textContent = emoji;
        el.style.left              = (Math.random() * 92) + '%';
        el.style.animationDelay    = (Math.random() * 8) + 's';
        el.style.animationDuration = (6 + Math.random() * 8) + 's';
        el.style.fontSize          = (18 + Math.random() * 20) + 'px';
        decoLayer.appendChild(el);
    });

    // Typewriter on heading
    const text = 'Hey Panda';
    let i = 0;
    const h = document.getElementById('heading');
    const type = () => {
        if (i <= text.length) { h.textContent = text.slice(0, i++); setTimeout(type, 110); }
    };
    type();

    const btnNo = document.getElementById('btn-no');
    btnNo.addEventListener('click', handleEscape);
    btnNo.addEventListener('touchstart', (e) => {
        e.preventDefault(); // prevents ghost click after touch
        handleEscape();
    }, { passive: false });
});

function handleEscape() {
    if (escapeCount >= MAX_ESCAPES || cooldown) return;
    cooldown = true;
    setTimeout(() => { cooldown = false; }, 300);

    escapeCount++;
    playWoosh();
    const btnNo = document.getElementById('btn-no');

    // On first escape: lock current visual position then go fixed
    if (!isFixed) {
        const rect = btnNo.getBoundingClientRect();
        btnNo.classList.add('is-fixed');
        btnNo.style.left = rect.left + 'px';
        btnNo.style.top  = rect.top  + 'px';
        isFixed = true;
        // Small tick so the fixed position is painted before we move
        requestAnimationFrame(() => teleportNo(btnNo));
    } else {
        teleportNo(btnNo);
    }
}

function teleportNo(btnNo) {
    if (escapeCount >= MAX_ESCAPES) {
        // Final escape — spin out and vanish
        btnNo.style.transition = 'transform 0.45s ease, opacity 0.45s ease';
        btnNo.style.transform  = 'scale(0) rotate(720deg)';
        btnNo.style.opacity    = '0';
        setTimeout(() => {
            btnNo.style.display = 'none';
            document.getElementById('no-gone').classList.remove('hidden');
        }, 480);
        return;
    }

    const pad = 24;
    const bw  = btnNo.offsetWidth  || 130;
    const bh  = btnNo.offsetHeight || 54;
    const maxX = window.innerWidth  - bw  - pad;
    const maxY = window.innerHeight - bh  - pad;

    // Pick a spot at least 180px from current position
    const curX = parseFloat(btnNo.style.left) || window.innerWidth  / 2;
    const curY = parseFloat(btnNo.style.top)  || window.innerHeight / 2;
    let nx, ny, tries = 0;
    do {
        nx = pad + Math.random() * maxX;
        ny = pad + Math.random() * maxY;
        tries++;
    } while (Math.hypot(nx - curX, ny - curY) < 180 && tries < 20);

    btnNo.style.transition = 'none';
    btnNo.style.left = nx + 'px';
    btnNo.style.top  = ny + 'px';

    // Update label
    const labels = ['No 🐼💨', '🏃 🐼 Nope!', '🐼💨💨 NEVER'];
    btnNo.textContent = labels[escapeCount - 1] || '🐼💨';

    spawnGhost(nx, ny);
}

function spawnGhost(x, y) {
    const g = document.createElement('div');
    g.className = 'panda-ghost';
    g.innerHTML = '<img src="images/funny-3.jpeg" onerror="this.outerHTML=\'🐼\'">';
    g.style.left = x + 'px';
    g.style.top  = y + 'px';
    document.body.appendChild(g);
    setTimeout(() => g.remove(), 2400);
}

// ─── Navigation ───────────────────────────────────────────

function goToMovies() {
    const a = new Audio('yes.mp4');
    a.play().catch(() => {});
    showPage('page-movies');
}

function backToMovies() {
    const ctx = getCtx();
    if (ctx) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(320, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.12);
        g.gain.setValueAtTime(0.18, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        o.start(); o.stop(ctx.currentTime + 0.13);
    }
    showPage('page-movies');
}

function pickMovie(title) {
    playCardTap();
    setTimeout(() => {
        document.getElementById('chosen-title').textContent = title;
        showPage('page-confirm');
        launchConfetti();
        playCheer();
    }, 250);
}

function pickBait() {
    playCardTap();
    setTimeout(() => {
        playBlocked();
        showPage('page-blocked');
    }, 120);
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ─── Sounds (Web Audio API — no files needed) ─────────────

let _ctx = null;
function getCtx() {
    try {
        if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (_ctx.state === 'suspended') _ctx.resume();
        return _ctx;
    } catch(e) { return null; }
}

function playWoosh() {
    const ctx = getCtx(); if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(900, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.35);
    g.gain.setValueAtTime(0.5, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.start(); o.stop(ctx.currentTime + 0.35);
}

function playBlocked() {
    const ctx = getCtx(); if (!ctx) return;
    [440, 349, 294].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.connect(g); g.connect(ctx.destination);
        const t = ctx.currentTime + i * 0.28;
        o.frequency.setValueAtTime(freq, t);
        o.frequency.exponentialRampToValueAtTime(freq * 0.85, t + 0.25);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        o.start(t); o.stop(t + 0.3);
    });
}

function playCheer() {
    const ctx = getCtx(); if (!ctx) return;
    [523, 659, 784, 1047].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        const t = ctx.currentTime + i * 0.12;
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.start(t); o.stop(t + 0.2);
    });
}

function playMarioCoin() {
    const ctx = getCtx(); if (!ctx) return;
    [[988, 0, 0.065], [1319, 0.07, 0.28]].forEach(([freq, start, end]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, ctx.currentTime + start);
        g.gain.setValueAtTime(0.25, ctx.currentTime + start);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + end);
        o.start(ctx.currentTime + start);
        o.stop(ctx.currentTime + end + 0.01);
    });
}

function playCardTap() {
    const ctx = getCtx(); if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(520, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.14);
    g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    o.start(); o.stop(ctx.currentTime + 0.14);
}

// ─── Confetti ─────────────────────────────────────────────

function launchConfetti() {
    const colors = ['#f9a8d4','#4ade80','#60a5fa','#fbbf24','#a78bfa','#f87171','#ffffff'];
    const box = document.getElementById('confetti-box');
    box.innerHTML = '';

    for (let i = 0; i < 130; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'conf';
            const size = 6 + Math.random() * 9;
            el.style.cssText = `
                left: ${Math.random() * 100}vw;
                width: ${size}px;
                height: ${size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                animation-duration: ${2 + Math.random() * 2.2}s;
                animation-delay: ${Math.random() * 0.4}s;
            `;
            box.appendChild(el);
            setTimeout(() => el.remove(), 5000);
        }, i * 22);
    }
}
