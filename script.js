const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    try {
        // Cache Buster: Appends a random number so mobile browsers can't use old data
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        const data = await response.json();
        
        if (!data) return;

        // 1. Set Titles
        document.title = data.shareTitle || "Next Adventure";
        const og = document.getElementById("og-title");
        if (og) og.setAttribute("content", data.shareTitle || "Adventure");

        // 2. Emoji Animation Logic - FIXED
        const emojiKey = (data.emoji || "heart").toLowerCase();
        const emojiChar = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        
        let animClass = "anim-bounce"; // Default for heart
        switch(emojiKey) {
            case 'star': animClass = "anim-pulse"; break;
            case 'sparkles': animClass = "anim-wiggle"; break;
            case 'cloud': animClass = "anim-float"; break;
            case 'sun': animClass = "anim-float"; break; 
        }

        const nameEl = document.getElementById("event-name");
        if (nameEl) {
            nameEl.innerHTML = `${data.eventName || "Next Adventure"} <span class="${animClass}">${emojiChar}</span>`;
        }

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
                // Pulling from 'description' field
                dsEl.innerText = data.description || "Coming soon!";
            }
        }
    } catch (e) { 
        console.error("Fetch Error:", e);
        // Fallback to clear 'Loading' screen if DB fails
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

window.onload = () => {
    initTimer();
    
    // 25% Chance Encounter
    const roll = Math.random();
    if (roll < 0.25) showSuri('suri-1');
    else if (roll < 0.50) showSuri('suri-2');
    else if (roll < 0.75) showSuri('suri-3');
    else { 
        createPawTrack(); 
        setInterval(createPawTrack, 25000); 
    }

    const isLight = localStorage.getItem('theme') === 'light';
    if (isLight) document.body.classList.add('light-mode');
    updateThemeUI(isLight);
};

function updateThemeUI(light) {
    const sun = document.getElementById('icon-sun');
    const moon = document.getElementById('icon-moon');
    if (sun) sun.style.display = light ? 'block' : 'none';
    if (moon) moon.style.display = light ? 'none' : 'block';
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const light = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', light ? 'light' : 'dark');
    updateThemeUI(light);
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
            const moveAngle = angle * (Math.PI / 180);
            const finalX = x + (i * 70 * Math.cos(moveAngle)) + (20 * Math.cos((angle + 90 * side) * Math.PI / 180));
            const finalY = y + (i * 70 * Math.sin(moveAngle)) + (20 * Math.sin((angle + 90 * side) * Math.PI / 180));
            paw.style.left = `${finalX}px`;
            paw.style.top = `${finalY}px`;
            paw.style.setProperty('--rot', `${angle + 90}deg`);
            container.appendChild(paw);
            setTimeout(() => paw.remove(), 7000);
        }, i * 450);
    }
}
