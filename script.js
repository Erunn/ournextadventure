const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    try {
        const response = await fetch(`${DB_URL}?v=${new Date().getTime()}`);
        const data = await response.json();
        if (!data) return;

        // 1. Titles & Metadata
        document.title = data.shareTitle || "Next Adventure";
        const og = document.getElementById("og-title");
        if (og) og.setAttribute("content", data.shareTitle || "Adventure");

        // 2. Emoji & Animation Logic
        const emojiKey = (data.emoji || "heart").toLowerCase();
        const emoji = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        let anim = "anim-bounce";
        if (emojiKey === "star") anim = "anim-pulse";
        if (emojiKey === "sparkles") anim = "anim-wiggle";
        if (emojiKey === "cloud") anim = "anim-float";

        const nameEl = document.getElementById("event-name");
        if (nameEl) nameEl.innerHTML = `${data.eventName || "Next Adventure"} <span class="${anim}">${emoji}</span>`;

        // 3. useTimer Switch
        const showTimer = Number(data.useTimer) === 1;
        const cdEl = document.getElementById("countdown");
        const dsEl = document.getElementById("description-display");

        if (showTimer && data.targetDate) {
            if (cdEl) cdEl.style.display = "flex";
            if (dsEl) dsEl.style.display = "none";
            startCountdown(data.targetDate, data.celebrationMessage);
        } else {
            if (cdEl) cdEl.style.display = "none";
            if (dsEl) {
                dsEl.style.display = "block";
                // Pointing to 'description' field in DB
                dsEl.innerText = data.description || "Coming soon!";
            }
        }
    } catch (e) { 
        console.error(e);
        const nameEl = document.getElementById("event-name");
        if (nameEl) nameEl.innerText = "Next Adventure ❤️";
    }
}

function startCountdown(dateStr, msg) {
    const parts = dateStr.split(/[-/ :]/);
    const target = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0).getTime();
    
    const fd = document.getElementById("full-date-display");
    if (fd) {
        fd.innerText = new Date(target).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        fd.style.display = "block";
    }

    const x = setInterval(() => {
        const dist = target - new Date().getTime();
        if (dist <= 0) {
            clearInterval(x);
            const cd = document.getElementById("countdown");
            if (cd) cd.style.display = "none";
            const s = document.getElementById("status-message");
            if (s) { s.style.display = "block"; s.innerText = msg || "Adventure Starts! ✨"; }
            return;
        }
        const d = document.getElementById("days");
        const h = document.getElementById("hours");
        const m = document.getElementById("minutes");
        const s = document.getElementById("seconds");
        if (d) d.innerText = Math.floor(dist / 86400000).toString().padStart(2, '0');
        if (h) h.innerText = Math.floor((dist % 86400000) / 3600000).toString().padStart(2, '0');
        if (m) m.innerText = Math.floor((dist % 3600000) / 60000).toString().padStart(2, '0');
        if (s) s.innerText = Math.floor((dist % 60000) / 1000).toString().padStart(2, '0');
    }, 1000);
}

// Encounter Randomizer
window.onload = () => {
    initTimer();
    const roll = Math.random();
    if (roll < 0.25) showSuri('suri-1');
    else if (roll < 0.50) showSuri('suri-2');
    else if (roll < 0.75) showSuri('suri-3');
    else { createPawTrack(); setInterval(createPawTrack, 25000); }

    const isLight = localStorage.getItem('theme') === 'light';
    if (isLight) document.body.classList.add('light-mode');
    updateTheme(isLight);
};

function updateTheme(light) {
    const sun = document.getElementById('icon-sun');
    const moon = document.getElementById('icon-moon');
    if (sun) sun.style.display = light ? 'block' : 'none';
    if (moon) moon.style.display = light ? 'none' : 'block';
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const light = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', light ? 'light' : 'dark');
    updateTheme(light);
});

function showSuri(img) {
    const p = document.getElementById('cat-perch');
    if (!p) return;
    const c = document.createElement('div');
    c.className = `cat-image ${img}`;
    p.appendChild(c);
    setTimeout(() => p.style.opacity = "1", 500);
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
