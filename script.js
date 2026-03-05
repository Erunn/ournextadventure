const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

function showSleepingCat() {
    const perch = document.getElementById('cat-perch');
    if (!perch) return;
    const cat = document.createElement('div');
    cat.className = 'sleeping-cat';
    perch.appendChild(cat);
    setTimeout(() => { perch.style.opacity = "1"; }, 500);
}

function createPawTrack() {
    const container = document.getElementById('cat-encounter-container');
    if (!container) return;
    const numSteps = 10; 
    let x = Math.random() * (window.innerWidth - 100);
    let y = Math.random() * (window.innerHeight - 100);
    let angle = Math.random() * 360; 
    const stepLength = 70; 
    const spread = 20; 

    for (let i = 0; i < numSteps; i++) {
        setTimeout(() => {
            const paw = document.createElement('div');
            paw.className = 'paw-print';
            const side = i % 2 === 0 ? 1 : -1;
            const moveAngle = angle * (Math.PI / 180);
            const sideAngle = (angle + 90 * side) * (Math.PI / 180);
            const wobble = (Math.random() - 0.5) * 6;
            const finalX = x + (i * stepLength * Math.cos(moveAngle)) + (spread * Math.cos(sideAngle)) + wobble;
            const finalY = y + (i * stepLength * Math.sin(moveAngle)) + (spread * Math.sin(sideAngle)) + wobble;
            paw.style.left = `${finalX}px`;
            paw.style.top = `${finalY}px`;
            
            // Toes lead the way (image_0.png gait fix)
            paw.style.setProperty('--rot', `${angle + 90}deg`);
            container.appendChild(paw);
            setTimeout(() => paw.remove(), 7000);
        }, i * 450);
    }
}

async function initTimer() {
    try {
        const response = await fetch(DB_URL);
        const data = await response.json();
        if (!data) return;

        // DB-Linked Title for image_2.png share fix
        const sTitle = data.shareTitle || "Our Next Adventure";
        document.title = sTitle;
        document.getElementById("og-title").setAttribute("content", sTitle);

        let currentEventName = data.eventName || "Next Adventure";
        const emojiKey = (data.emoji || "heart").toLowerCase();
        let currentEmoji = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        
        const titleEl = document.getElementById("event-name");
        if (titleEl) titleEl.innerHTML = `${currentEventName} <span class="anim-bounce">${currentEmoji}</span>`;

        if (Number(data.useTimer) === 1 && data.targetDate) {
            document.getElementById("countdown").style.display = "flex";
            const parts = data.targetDate.split(/[-/ :]/);
            const targetTime = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0, parts[5]||0).getTime();
            
            const fullDateEl = document.getElementById("full-date-display");
            if (fullDateEl) {
                fullDateEl.innerText = new Date(targetTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                fullDateEl.style.display = "block";
            }

            const x = setInterval(() => {
                const distance = targetTime - new Date().getTime();
                const d = Math.floor(distance / 86400000);
                const h = Math.floor((distance % 86400000) / 3600000);
                const m = Math.floor((distance % 3600000) / 60000);
                const s = Math.floor((distance % 60000) / 1000);

                const setVal = (id, val, shouldDim) => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.innerText = Math.max(0, val).toString().padStart(2, '0');
                        el.style.opacity = (shouldDim && val <= 0) ? "0.2" : "1";
                    }
                };

                setVal("days", d, true);
                setVal("hours", h, (d <= 0));
                setVal("minutes", m, (d <= 0 && h <= 0));
                setVal("seconds", s, false);

                if (distance < 0) {
                    clearInterval(x);
                    document.getElementById("countdown").style.display = "none";
                    const statusEl = document.getElementById("status-message");
                    statusEl.style.display = "block";
                    statusEl.innerText = data.celebrationMessage || "The moment is here! ✨";
                    document.body.classList.add('celebrate');
                }
            }, 1000);
        }
    } catch (e) { console.error(e); }
}

const btn = document.getElementById('theme-toggle');
if (btn) {
    btn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });
}

// 50/50 Randomizer
window.addEventListener('load', () => {
    if (Math.random() < 0.5) showSleepingCat();
    else {
        createPawTrack();
        setInterval(createPawTrack, 30000);
    }
});

initTimer();
