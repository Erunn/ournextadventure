const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    try {
        // Cache Buster for fresh mobile data
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        const data = await response.json();
        if (!data) return;

        document.title = data.shareTitle || "Next Adventure";

        const emojiKey = (data.emoji || "heart").toLowerCase();
        const emojiChar = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        let anim = "anim-bounce";
        if (emojiKey === "bus" || emojiKey === "train") anim = "anim-drive";
        else if (emojiKey === "plane") anim = "anim-takeoff";

        document.getElementById("event-name").innerHTML = 
            `${data.eventName || "Next Adventure"} <span class="${anim}">${emojiChar}</span>`;

        // FIX: Toggle Description vs Timer
        const showTimer = Number(data.useTimer) === 1;
        const descEl = document.getElementById("description-display");
        
        if (showTimer && data.targetDate) {
            if (descEl) descEl.style.display = "none";
            startCountdown(data.targetDate, data.celebrationMessage);
        } else {
            document.getElementById("countdown").style.display = "none";
            document.getElementById("full-date-display").style.display = "none";
            if (descEl) {
                descEl.style.display = "block";
                descEl.innerText = data.description || "Coming soon!";
            }
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

window.onload = () => {
    initTimer();
    const roll = Math.random();
    if (roll < 0.33) showSuri('suri-1');
    else if (roll < 0.66) showSuri('suri-2');
    else showSuri('suri-3');

    if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');
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
