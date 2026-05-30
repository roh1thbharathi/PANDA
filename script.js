let escapeCount = 0;
const MAX_ESCAPES = 3;
let isFixed = false;
let cooldown = false;

window.addEventListener('DOMContentLoaded', () => {
    const btnNo = document.getElementById('btn-no');

    btnNo.addEventListener('mouseenter', handleEscape);

    btnNo.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleEscape();
    }, { passive: false });
});

function handleEscape() {
    if (escapeCount >= MAX_ESCAPES || cooldown) return;
    cooldown = true;
    setTimeout(() => { cooldown = false; }, 300);

    escapeCount++;
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
    const g = document.createElement('span');
    g.className = 'panda-ghost';
    g.textContent = '🐼';
    g.style.left = x + 'px';
    g.style.top  = y + 'px';
    document.body.appendChild(g);
    setTimeout(() => g.remove(), 950);
}

// ─── Navigation ───────────────────────────────────────────

function goToMovies() {
    showPage('page-movies');
}

function pickMovie(title) {
    document.getElementById('chosen-title').textContent = title;
    showPage('page-confirm');
    launchConfetti();
}

function pickBait() {
    showPage('page-blocked');
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
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
