const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    try {
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        const data = await response.json();
        if (!data) return;

        // 1. FIX: Sync Browser Tab Title with 'shareTitle'
        const finalTitle = data.shareTitle || "Next Adventure";
        document.title = finalTitle; 
        const og = document.getElementById("og-title");
        if (og) og.setAttribute("content", finalTitle);

        // 2. Emoji Logic
        const emojiKey = (data.emoji || "heart").toLowerCase();
        const emojiChar = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        let anim = "anim-bounce";
        if (emojiKey === "bus" || emojiKey === "train") anim = "anim-drive";
        else if (emojiKey === "plane") anim = "anim-takeoff";

        const nameEl = document.getElementById("event-name");
        if (nameEl) nameEl.innerHTML = `${data.eventName || "Next Adventure"} <span class="${anim}">${emojiChar}</span>`;

        // 3. useTimer Switch Logic
        const showTimer = Number(data.useTimer) === 1;
        const countdownEl = document.getElementById("countdown");
        const descEl = document.getElementById("description-display");

        if (showTimer && data.targetDate) {
            if (countdownEl) countdownEl.style.setProperty("display", "flex", "important");
            if (descEl) descEl.style.display = "none";
            startCountdown(data.targetDate, data.celebrationMessage);
        } else {
            if (countdownEl) countdownEl.style.display = "none";
            if (descEl) {
                descEl.style.display = "block";
                descEl.innerText = data.description || "Our next adventure is coming soon.";
            }
        }
    } catch (e) { console.error(e); }
}

function startCountdown(dateStr, msg) {
    const parts = dateStr.split(/[-/ :]/);
    const target = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0).getTime();
    
    // Set text date display
    const fd = document.getElementById("full-date-display");
    if (fd) {
        fd.innerText = new Date(target).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        fd.style.display = "block";
    }

    const x = setInterval(() => {
        const dist = target - new Date().getTime();
        
        const dEl = document.getElementById("days");
        const hEl = document.getElementById("hours");
        const mEl = document.getElementById("minutes");
        const sEl = document.getElementById("seconds");

        if (dist <= 0) {
            // FIX: If time is up, dim all units
            [dEl, hEl, mEl, sEl].forEach(el => { if(el) { el.innerText = "00"; el.classList.add("is-due"); } });
            clearInterval(x);
            const s = document.getElementById("status-message");
            if (s) { s.style.display = "block"; s.innerText = msg || "Adventure Starts! ✨"; }
            return;
        }

        const d = Math.floor(dist / 86400000);
        const h = Math.floor((dist % 86400000) / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);

        // FIX: Dim individual units as they reach zero
        if (dEl) { dEl.innerText = d.toString().padStart(2, '0'); d === 0 ? dEl.classList.add("is-due") : dEl.classList.remove("is-due"); }
        if (hEl) { hEl.innerText = h.toString().padStart(2, '0'); (d === 0 && h === 0) ? hEl.classList.add("is-due") : hEl.classList.remove("is-due"); }
        if (mEl) { mEl.innerText = m.toString().padStart(2, '0'); (d === 0 && h === 0 && m === 0) ? mEl.classList.add("is-due") : mEl.classList.remove("is-due"); }
        if (sEl) { sEl.innerText = s.toString().padStart(2, '0'); }

    }, 1000);
}

// Randomizer and Theme Setup
window.onload = () => {
    initTimer();
    const roll = Math.random();
    if (roll < 0.25) showSuri('suri-1');
    else if (roll < 0.50) showSuri('suri-2');
    else if (roll < 0.75) showSuri('suri-3');
    else { createPawTrack(); setInterval(createPawTrack, 25000); }

    const isLight = localStorage.getItem('theme') === 'light';
    if (isLight) document.body.classList.add('light-mode');
    updateUI(isLight);
};

function updateUI(light) {
    const sun = document.getElementById('icon-sun');
    const moon = document.getElementById('icon-moon');
    if (sun) sun.style.display = light ? 'block' : 'none';
    if (moon) moon.style.display = light ? 'none' : 'block';
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const light = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', light ? 'light' : 'dark');
    updateUI(light);
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
