const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    try {
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        const data = await response.json();
        
        if (!data) {
            showFallback();
            return;
        }

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
            revealUI();
        }
    } catch (e) { 
        console.error("Connection error:", e);
        showFallback();
    }
}

function revealUI() {
    const targets = document.querySelectorAll(".sync-reveal");
    targets.forEach(el => el.classList.add("reveal"));
}

function showFallback() {
    const eventName = document.getElementById("event-name");
    if (eventName) eventName.innerText = "Next Adventure ❤️";
    const noTimerEl = document.getElementById("description-display");
    if (noTimerEl) {
        noTimerEl.style.display = "block";
        noTimerEl.innerText = "Check back soon for updates.";
    }
    revealUI();
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

    let firstRun = true;
    const x = setInterval(() => {
        const dist = target - new Date().getTime();
        if (dist <= 0) {
            clearInterval(x);
            hideTimer(msg);
            if (firstRun) revealUI();
            return;
        }

        const d = Math.floor(dist / 86400000);
        const h = Math.floor((dist % 86400000) / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);

        const dEl = document.getElementById("days");
        const hEl = document.getElementById("hours");
        const mEl = document.getElementById("minutes");
        const sEl = document.getElementById("seconds");

        if(dEl) dEl.innerText = d.toString().padStart(2, '0');
        if(hEl) hEl.innerText = h.toString().padStart(2, '0');
        if(mEl) mEl.innerText = m.toString().padStart(2, '0');
        if(sEl) sEl.innerText = s.toString().padStart(2, '0');

        if (d === 0) dEl.classList.add("is-due"); else dEl.classList.remove("is-due");
        if (d === 0 && h === 0) hEl.classList.add("is-due"); else hEl.classList.remove("is-due");
        if (d === 0 && h === 0 && m === 0) mEl.classList.add("is-due"); else mEl.classList.remove("is-due");

        document.getElementById("countdown").style.display = "flex";
        
        if (firstRun) {
            revealUI();
            firstRun = false;
        }
    }, 1000);
}

function hideTimer(msg) {
    document.getElementById("countdown").style.display = "none";
    document.getElementById("full-date-display").style.display = "none";
    const s = document.getElementById("status-message");
    if (s) { s.style.display = "block"; s.innerText = msg || "Adventure Starts! ✨"; }
    revealUI();
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

// UPDATED: Logic to prevent repeat cats on refresh
window.onload = () => {
    initTimer();
    
    const lastCat = sessionStorage.getItem('lastSuriIndex');
    let suriIndex;
    
    // Keep picking a new number until it's different from the last one
    do {
        suriIndex = Math.floor(Math.random() * 7) + 1;
    } while (suriIndex.toString() === lastCat);

    sessionStorage.setItem('lastSuriIndex', suriIndex);
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
    }
}
