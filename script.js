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

async function initTimer() {
    try {
        const response = await fetch(DB_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!data) return;

        // 1. Titles & Metadata
        document.title = data.shareTitle || "Next Adventure";
        const ogTitle = document.getElementById("og-title");
        if (ogTitle) ogTitle.setAttribute("content", data.shareTitle || "Adventure");

        // 2. Emoji & Event Name Fix
        const emojiKey = (data.emoji || "heart").toLowerCase();
        const selectedEmoji = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        const nameEl = document.getElementById("event-name");
        if (nameEl) nameEl.innerHTML = `${data.eventName || "Next Adventure"} <span class="anim-bounce">${selectedEmoji}</span>`;

        // 3. Respect useTimer Flag & Display Date
        if (Number(data.useTimer) === 1 && data.targetDate) {
            const parts = data.targetDate.split(/[-/ :]/);
            const targetDateObj = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0);
            const target = targetDateObj.getTime();
            
            const dateDisplay = document.getElementById("full-date-display");
            if (dateDisplay) {
                dateDisplay.innerText = targetDateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                dateDisplay.style.display = "block";
            }

            const timerInterval = setInterval(() => {
                const now = new Date().getTime();
                const dist = target - now;

                if (dist <= 0) {
                    clearInterval(timerInterval);
                    const cd = document.getElementById("countdown");
                    if (cd) cd.style.display = "none";
                    const status = document.getElementById("status-message");
                    if (status) {
                        status.style.display = "block";
                        status.innerText = data.celebrationMessage || "Adventure Starts! ✨";
                    }
                    return;
                }

                const cd = document.getElementById("countdown");
                if (cd) cd.style.display = "flex";
                
                const dEl = document.getElementById("days");
                const hEl = document.getElementById("hours");
                const mEl = document.getElementById("minutes");
                const sEl = document.getElementById("seconds");

                if (dEl) dEl.innerText = Math.floor(dist / 86400000).toString().padStart(2, '0');
                if (hEl) hEl.innerText = Math.floor((dist % 86400000) / 3600000).toString().padStart(2, '0');
                if (mEl) mEl.innerText = Math.floor((dist % 3600000) / 60000).toString().padStart(2, '0');
                if (sEl) sEl.innerText = Math.floor((dist % 60000) / 1000).toString().padStart(2, '0');
            }, 1000);
        } else {
            const cd = document.getElementById("countdown");
            if (cd) cd.style.display = "none";
            const fd = document.getElementById("full-date-display");
            if (fd) fd.style.display = "none";
        }
    } catch (e) { 
        console.error("Database error:", e);
        // Fallback: make sure the app isn't stuck on 'Loading'
        const nameEl = document.getElementById("event-name");
        if (nameEl && nameEl.innerText === "Loading...") {
            nameEl.innerText = "Next Adventure ❤️";
        }
    }
}

// Fixed Theme Toggle Logic
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        const sun = document.getElementById('icon-sun');
        const moon = document.getElementById('icon-moon');
        if (sun) sun.style.display = isLight ? 'block' : 'none';
        if (moon) moon.style.display = isLight ? 'none' : 'block';
    });
}

window.onload = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        const sun = document.getElementById('icon-sun');
        const moon = document.getElementById('icon-moon');
        if (sun) sun.style.display = 'block';
        if (moon) moon.style.display = 'none';
    }

    initTimer();
    
    const roll = Math.random();
    if (roll < 0.25) showSuri('suri-1');
    else if (roll < 0.5) showSuri('suri-2');
    else if (roll < 0.75) showSuri('suri-3');
};
