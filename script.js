const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    try {
        // Cache Buster for mobile refresh
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        const data = await response.json();
        if (!data) return;

        document.title = data.shareTitle || "Next Adventure";

        const emojiKey = (data.emoji || "heart").toLowerCase();
        const emojiChar = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        let anim = "anim-bounce";
        if (emojiKey === "bus" || emojiKey === "train") anim = "anim-drive";
        else if (emojiKey === "plane") anim = "anim-takeoff";

        const nameEl = document.getElementById("event-name");
        if (nameEl) nameEl.innerHTML = `${data.eventName || "Next Adventure"} <span class="${anim}">${emojiChar}</span>`;

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
    const targetDateObj = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0);
    const target = targetDateObj.getTime();

    const fd = document.getElementById("full-date-display");
    if (fd) {
        fd.innerText = targetDateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        fd.style.display = "block";
    }

    const x = setInterval(() => {
        const dist = target - new Date().getTime();
        if (dist <= 0) {
            clearInterval(x);
            hideTimer(msg);
            return;
        }

        document.getElementById("countdown").style.display = "flex";
        updateUnit("days", Math.floor(dist / 86400000));
        updateUnit("hours", Math.floor((dist % 86400000) / 3600000));
        updateUnit("minutes", Math.floor((dist % 3600000) / 60000));
        updateUnit("seconds", Math.floor((dist % 60000) / 1000));
    }, 1000);
}

function updateUnit(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = value.toString().padStart(2, '0');
    // Dimming logic
    if (value === 0) el.classList.add("is-due");
    else el.classList.remove("is-due");
}

function hideTimer(msg) {
    document.getElementById("countdown").style.display = "none";
    document.getElementById("full-date-display").style.display = "none";
    const s = document.getElementById("status-message");
    s.style.display = "block";
    s.innerText = msg || "Adventure Starts! ✨";
}

// Fixed Theme Switch Logic
document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const light = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', light ? 'light' : 'dark');
});

// UPATED Randomizer Logic for 7 Images
window.onload = () => {
    initTimer();
    const roll = Math.random();
    
    // Each case has a 14.28% chance (1/7)
    if (roll < 0.14) {
        showSuri('suri-1');
    } else if (roll < 0.28) {
        showSuri('suri-2');
    } else if (roll < 0.42) {
        showSuri('suri-3');
    } else if (roll < 0.56) {
        showSuri('suri-4'); // New Image
    } else if (roll < 0.70) {
        showSuri('suri-5'); // New Image
    } else if (roll < 0.84) {
        showSuri('suri-6'); // New Image
    } else {
        showSuri('suri-7'); // New Image
    }

    if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');
};

function showSuri(img) {
    const p = document.getElementById('cat-perch');
    if (p) {
        const c = document.createElement('div');
        c.className = `cat-image ${img}`;
        p.innerHTML = ''; // Clear previous cat if necessary
        p.appendChild(c);
        setTimeout(() => p.style.opacity = "1", 500);
    }
}
