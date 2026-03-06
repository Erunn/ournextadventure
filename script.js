const CONFIG = {
    DB_URL: "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json",
    SURI_COUNT: 7,
    REVEAL_CLASS: "reveal",
    DIM_CLASS: "is-due"
};

async function init() {
    setupSuri();
    setupTheme();
    await loadData();
}

async function loadData() {
    try {
        const response = await fetch(`${CONFIG.DB_URL}?nocache=${Date.now()}`);
        const data = await response.json();
        if (!data) throw new Error("Empty data");

        document.title = data.shareTitle || "Next Adventure";
        const emoji = data.emojiLibrary?.[data.emoji?.toLowerCase()] || "❤️";
        
        document.getElementById("event-name").innerHTML = 
            `${data.eventName || "Next Adventure"} <span>${emoji}</span>`;

        const isTimerEnabled = Number(data.useTimer) === 1;
        
        if (isTimerEnabled && data.targetDate) {
            startCountdown(data.targetDate, data.celebrationMessage);
        } else {
            toggleUI(false, data.noTimerMessage);
        }
    } catch (e) {
        console.error("Init failed:", e);
        toggleUI(false, "Next Adventure ❤️");
    }
}

function toggleUI(timerVisible, message) {
    const countdownEl = document.getElementById("countdown");
    const dateEl = document.getElementById("full-date-display");
    const descEl = document.getElementById("description-display");
    const statusEl = document.getElementById("status-message");

    if (timerVisible) {
        countdownEl.style.display = "flex";
        if (descEl) descEl.style.display = "none";
    } else {
        countdownEl.style.display = "none";
        if (dateEl) dateEl.style.display = "none";
        if (descEl) {
            descEl.style.display = "block";
            descEl.innerText = message || "Our next adventure is coming soon.";
        }
        reveal();
    }
}

function startCountdown(dateStr, msg) {
    const parts = dateStr.split(/[-/ :]/);
    const target = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0).getTime();

    const fd = document.getElementById("full-date-display");
    if (fd) {
        fd.innerText = new Date(target).toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        fd.style.display = "block";
    }

    let revealed = false;
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const dist = target - now;

        if (dist <= 0) {
            clearInterval(timer);
            toggleUI(false, msg);
            return;
        }

        const time = {
            d: Math.floor(dist / 86400000),
            h: Math.floor((dist % 86400000) / 3600000),
            m: Math.floor((dist % 3600000) / 60000),
            s: Math.floor((dist % 60000) / 1000)
        };

        const els = {
            d: document.getElementById("days"),
            h: document.getElementById("hours"),
            m: document.getElementById("minutes"),
            s: document.getElementById("seconds")
        };

        Object.keys(time).forEach(k => els[k].innerText = time[k].toString().padStart(2, '0'));

        els.d.classList.toggle(CONFIG.DIM_CLASS, time.d === 0);
        els.h.classList.toggle(CONFIG.DIM_CLASS, time.d === 0 && time.h === 0);
        els.m.classList.toggle(CONFIG.DIM_CLASS, time.d === 0 && time.h === 0 && time.m === 0);
        els.s.classList.remove(CONFIG.DIM_CLASS);

        document.getElementById("countdown").style.display = "flex";
        if (!revealed) { reveal(); revealed = true; }
    }, 1000);
}

function reveal() {
    document.querySelectorAll(".sync-reveal").forEach(el => el.classList.add(CONFIG.REVEAL_CLASS));
}

function setupSuri() {
    const last = sessionStorage.getItem('lastSuri');
    let current;
    do {
        current = Math.floor(Math.random() * CONFIG.SURI_COUNT) + 1;
    } while (current.toString() === last);

    sessionStorage.setItem('lastSuri', current);
    const perch = document.getElementById('cat-perch');
    if (perch) {
        const img = document.createElement('div');
        img.className = `cat-image suri-${current}`;
        perch.appendChild(img);
    }
}

function setupTheme() {
    const toggle = document.getElementById('theme-toggle');
    const isLight = localStorage.getItem('theme') === 'light';
    if (isLight) document.body.classList.add('light-mode');
    updateIcons(isLight);

    toggle?.addEventListener('click', () => {
        const nowLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', nowLight ? 'light' : 'dark');
        updateIcons(nowLight);
    });
}

function updateIcons(isLight) {
    document.getElementById('sun-icon').style.display = isLight ? 'block' : 'none';
    document.getElementById('moon-icon').style.display = isLight ? 'none' : 'block';
}

window.onload = init;
