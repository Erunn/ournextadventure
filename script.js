const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    try {
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        const data = await response.json();
        if (!data) return;

        document.title = data.shareTitle || "Next Adventure";

        const emojiKey = (data.emoji || "heart").toLowerCase();
        const emojiChar = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        
        document.getElementById("event-name").innerHTML = 
            `${data.eventName || "Next Adventure"} <span>${emojiChar}</span>`;

        const showTimer = Number(data.useTimer) === 1;
        const noTimerEl = document.getElementById("description-display");
        
        if (showTimer && data.targetDate) {
            if (noTimerEl) noTimerEl.style.display = "none";
            startCountdown(data.targetDate, data.celebrationMessage);
        } else {
            document.getElementById("countdown").style.display = "none";
            document.getElementById("full-date-display").style.display = "none";
            if (noTimerEl) {
                noTimerEl.style.display = "block";
                noTimerEl.innerText = data.noTimerMessage || "Our next adventure is coming soon.";
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
    if (value === 0) el.classList.add("is-due");
    else el.classList.remove("is-due");
}

function hideTimer(msg) {
    document.getElementById("countdown").style.display = "none";
    document.getElementById("full-date-display").style.display = "none";
    const s = document.getElementById("status-message");
    if (s) { s.style.display = "block"; s.innerText = msg || "Adventure Starts! ✨"; }
}

function updateThemeIcons(isLight) {
    const sun = document.getElementById('sun-icon');
    const moon = document.getElementById('moon-icon');
    if (isLight) {
        if (sun) sun.style.display = 'block';
        if (moon) moon.style.display = 'none';
    } else {
        if (sun) sun.style.display = 'none';
        if (moon) moon.style.display = 'block';
    }
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcons(isLight);
});

window.onload = () => {
    initTimer();
    const roll = Math.random();
    const suriIndex = Math.floor(roll * 7) + 1;
    showSuri(`suri-${suriIndex}`);

    const savedTheme = localStorage.getItem('theme');
    const isLight = savedTheme === 'light';
    if (isLight) document.body.classList.add('light-mode');
    updateThemeIcons(isLight);
};

function showSuri(img) {
    const p = document.getElementById('cat-perch');
    if (p) {
        const c = document.createElement('div');
        c.className = `cat-image ${img}`;
        p.innerHTML = ''; 
        p.appendChild(c);
        setTimeout(() => p.style.opacity = "1", 500);
    }
}
