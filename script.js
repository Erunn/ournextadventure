const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

function showSuri(imageClass) {
    const perch = document.getElementById('cat-perch');
    if (!perch) return;
    const cat = document.createElement('div');
    cat.className = `cat-image ${imageClass}`;
    perch.innerHTML = ''; 
    perch.appendChild(cat);
    setTimeout(() => perch.style.opacity = "1", 500);
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

async function initTimer() {
    try {
        const response = await fetch(`${DB_URL}?v=${new Date().getTime()}`);
        const data = await response.json();
        if (!data) return;

        // 1. Emoji Animation Mapping
        const emojiKey = (data.emoji || "heart").toLowerCase();
        const selectedEmoji = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        let anim = "anim-bounce";
        if (emojiKey === "star") anim = "anim-pulse";
        if (emojiKey === "sparkles") anim = "anim-wiggle";
        if (emojiKey === "cloud") anim = "anim-float";

        document.getElementById("event-name").innerHTML = 
            `${data.eventName || "Next Adventure"} <span class="${anim}">${selectedEmoji}</span>`;

        // 2. useTimer Logic
        const showTimer = Number(data.useTimer) === 1;
        const countdownEl = document.getElementById("countdown");
        const descEl = document.getElementById("description-display");

        if (showTimer && data.targetDate) {
            countdownEl.style.display = "flex";
            descEl.style.display = "none";
            startCountdown(data.targetDate, data.celebrationMessage);
        } else {
            countdownEl.style.display = "none";
            descEl.style.display = "block";
            descEl.innerText = data.description || "Coming soon!";
        }
    } catch (e) { console.error(e); }
}

function startCountdown(dateStr, msg) {
    const parts = dateStr.split(/[-/ :]/);
    const target = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0).getTime();
    
    // Update Full Date Display
    const fd = document.getElementById("full-date-display");
    fd.innerText = new Date(target).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    fd.style.display = "block";

    const x = setInterval(() => {
        const dist = target - new Date().getTime();
        if (dist <= 0) {
            clearInterval(x);
            document.getElementById("countdown").style.display = "none";
            const s = document.getElementById("status-message");
            s.style.display = "block";
            s.innerText = msg || "Adventure Starts! ✨";
            return;
        }
        document.getElementById("days").innerText = Math.floor(dist / 86400000).toString().padStart(2, '0');
        document.getElementById("hours").innerText = Math.floor((dist % 86400000) / 3600000).toString().padStart(2, '0');
        document.getElementById("minutes").innerText = Math.floor((dist % 3600000) / 60000).toString().padStart(2, '0');
        document.getElementById("seconds").innerText = Math.floor((dist % 60000) / 1000).toString().padStart(2, '0');
    }, 1000);
}

// Fixed Randomizer Logic
window.onload = () => {
    initTimer();
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
    updateThemeIcons(isLight);
};

function updateThemeIcons(light) {
    document.getElementById('icon-sun').style.display = light ? 'block' : 'none';
    document.getElementById('icon-moon').style.display = light ? 'none' : 'block';
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const light = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', light ? 'light' : 'dark');
    updateThemeIcons(light);
});
