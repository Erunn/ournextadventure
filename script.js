const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    try {
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        const data = await response.json();
        if (!data) return;

        // Sync Tab Name
        document.title = data.shareTitle || "Next Adventure";

        // Emoji & Animation
        const emojiKey = (data.emoji || "heart").toLowerCase();
        const emojiChar = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        let anim = "anim-bounce";
        if (emojiKey === "bus" || emojiKey === "train") anim = "anim-drive";
        else if (emojiKey === "plane") anim = "anim-takeoff";

        document.getElementById("event-name").innerHTML = 
            `${data.eventName || "Next Adventure"} <span class="${anim}">${emojiChar}</span>`;

        // Visibility Logic
        const showTimer = Number(data.useTimer) === 1;
        if (showTimer && data.targetDate) {
            startCountdown(data.targetDate, data.celebrationMessage);
        } else {
            hideTimer(data.celebrationMessage);
        }
    } catch (e) { console.error(e); }
}

function startCountdown(dateStr, msg) {
    const parts = dateStr.split(/[-/ :]/);
    const target = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0).getTime();

    const x = setInterval(() => {
        const dist = target - new Date().getTime();
        
        if (dist <= 0) {
            clearInterval(x);
            hideTimer(msg);
            return;
        }

        document.getElementById("countdown").style.display = "flex";
        const d = Math.floor(dist / 86400000);
        const h = Math.floor((dist % 86400000) / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);

        updateUnit("days", d);
        updateUnit("hours", h);
        updateUnit("minutes", m);
        updateUnit("seconds", s);
    }, 1000);
}

// FIX: Helper to apply dimming
function updateUnit(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = value.toString().padStart(2, '0');
    // If value is 0, add 'is-due' class to dim it
    if (value === 0) {
        el.classList.add("is-due");
    } else {
        el.classList.remove("is-due");
    }
}

function hideTimer(msg) {
    document.getElementById("countdown").style.display = "none";
    document.getElementById("full-date-display").style.display = "none";
    const s = document.getElementById("status-message");
    s.style.display = "block";
    s.innerText = msg || "Adventure Starts! ✨";
}

// Standard Randomizer & Theme Logic
window.onload = () => {
    initTimer();
    const roll = Math.random();
    if (roll < 0.25) showSuri('suri-1');
    else if (roll < 0.50) showSuri('suri-2');
    else if (roll < 0.75) showSuri('suri-3');
    else { createPawTrack(); setInterval(createPawTrack, 25000); }

    const isLight = localStorage.getItem('theme') === 'light';
    if (isLight) document.body.classList.add('light-mode');
};

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const light = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', light ? 'light' : 'dark');
});

function showSuri(img) {
    const p = document.getElementById('cat-perch');
    if (p) {
        const c = document.createElement('div');
        c.className = `cat-image ${img}`;
        p.appendChild(c);
        setTimeout(() => p.style.opacity = "1", 500);
    }
}

function createPawTrack() {
    const container = document.getElementById('cat-encounter-container');
    if (!container) return;
    let x = Math.random() * (window.innerWidth - 100);
    let y = Math.random() * (window.innerHeight - 100);
    let angle = Math.random() * 360; 
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const paw = document.createElement('div');
            paw.className = 'paw-print';
            const side = i % 2 === 0 ? 1 : -1;
            const finalX = x + (i * 70 * Math.cos(angle * Math.PI / 180)) + (20 * Math.cos((angle + 90 * side) * Math.PI / 180));
            const finalY = y + (i * 70 * Math.sin(angle * Math.PI / 180)) + (20 * Math.sin((angle + 90 * side) * Math.PI / 180));
            paw.style.left = `${finalX}px`;
            paw.style.top = `${finalY}px`;
            paw.style.setProperty('--rot', `${angle + 90}deg`);
            container.appendChild(paw);
            setTimeout(() => paw.remove(), 7000);
        }, i * 450);
    }
}
