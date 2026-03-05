const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

function showSuri(imageClass) {
    const perch = document.getElementById('cat-perch');
    if (!perch) return;
    const cat = document.createElement('div');
    cat.className = `cat-image ${imageClass}`;
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

    for (let i = 0; i < numSteps; i++) {
        setTimeout(() => {
            const paw = document.createElement('div');
            paw.className = 'paw-print';
            const side = i % 2 === 0 ? 1 : -1;
            const moveAngle = angle * (Math.PI / 180);
            const sideAngle = (angle + 90 * side) * (Math.PI / 180);
            const finalX = x + (i * stepLength * Math.cos(moveAngle)) + (20 * Math.cos(sideAngle));
            const finalY = y + (i * stepLength * Math.sin(moveAngle)) + (20 * Math.sin(sideAngle));
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
        const response = await fetch(DB_URL);
        const data = await response.json();
        if (!data) return;

        // Syncing with your Firebase fields
        const sTitle = data.shareTitle || "Our Next Adventure";
        const mDesc = data.metaDescription || "A personal countdown.";
        document.title = sTitle;
        document.getElementById("og-title").setAttribute("content", sTitle);
        document.getElementById("meta-desc").setAttribute("content", mDesc);

        let currentEventName = data.eventName || "Next Adventure";
        const emojiKey = (data.emoji || "heart").toLowerCase();
        let currentEmoji = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        document.getElementById("event-name").innerHTML = `${currentEventName} <span class="anim-bounce">${currentEmoji}</span>`;

        if (Number(data.useTimer) === 1 && data.targetDate) {
            document.getElementById("countdown").style.display = "flex";
            const parts = data.targetDate.split(/[-/ :]/);
            const targetTime = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0, parts[5]||0).getTime();
            
            const x = setInterval(() => {
                const distance = targetTime - new Date().getTime();
                const d = Math.floor(distance / 86400000);
                const h = Math.floor((distance % 86400000) / 3600000);
                const m = Math.floor((distance % 3600000) / 60000);
                const s = Math.floor((distance % 60000) / 1000);

                document.getElementById("days").innerText = d.toString().padStart(2, '0');
                document.getElementById("hours").innerText = h.toString().padStart(2, '0');
                document.getElementById("minutes").innerText = m.toString().padStart(2, '0');
                document.getElementById("seconds").innerText = s.toString().padStart(2, '0');

                if (distance < 0) {
                    clearInterval(x);
                    document.getElementById("countdown").style.display = "none";
                    document.getElementById("status-message").style.display = "block";
                    document.getElementById("status-message").innerText = data.celebrationMessage || "The moment is here! ✨";
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

// 25% Random Chance for each encounter
window.addEventListener('load', () => {
    const roll = Math.random();
    if (roll < 0.25) showSuri('suri-1');
    else if (roll < 0.50) showSuri('suri-2');
    else if (roll < 0.75) showSuri('suri-3');
    else { createPawTrack(); setInterval(createPawTrack, 30000); }
});

initTimer();
