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
        const data = await response.json();
        if (!data) return;

        // 1. Titles & Metadata
        document.title = data.shareTitle || "Next Adventure";
        document.getElementById("og-title")?.setAttribute("content", data.shareTitle || "Adventure");
        document.getElementById("meta-desc")?.setAttribute("content", data.metaDescription || "Countdown");

        // 2. Emoji & Event Name Fix
        const emojiKey = (data.emoji || "heart").toLowerCase();
        const selectedEmoji = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        document.getElementById("event-name").innerHTML = `${data.eventName || "Next Adventure"} <span class="anim-bounce">${selectedEmoji}</span>`;

        // 3. Respect useTimer Flag & Display Date
        if (Number(data.useTimer) === 1 && data.targetDate) {
            const parts = data.targetDate.split(/[-/ :]/);
            const targetDateObj = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0);
            const target = targetDateObj.getTime();
            
            // Show the text date below the timer
            const dateDisplay = document.getElementById("full-date-display");
            dateDisplay.innerText = targetDateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            dateDisplay.style.display = "block";

            const timerInterval = setInterval(() => {
                const now = new Date().getTime();
                const dist = target - now;

                if (dist <= 0) {
                    clearInterval(timerInterval);
                    document.getElementById("countdown").style.display = "none";
                    document.getElementById("status-message").style.display = "block";
                    document.getElementById("status-message").innerText = data.celebrationMessage || "Adventure Starts! ✨";
                    return;
                }

                document.getElementById("countdown").style.display = "flex";
                document.getElementById("days").innerText = Math.floor(dist / 86400000).toString().padStart(2, '0');
                document.getElementById("hours").innerText = Math.floor((dist % 86400000) / 3600000).toString().padStart(2, '0');
                document.getElementById("minutes").innerText = Math.floor((dist % 3600000) / 60000).toString().padStart(2, '0');
                document.getElementById("seconds").innerText = Math.floor((dist % 60000) / 1000).toString().padStart(2, '0');
            }, 1000);
        } else {
            // Force hide if useTimer is 0 or targetDate is missing
            document.getElementById("countdown").style.display = "none";
            document.getElementById("full-date-display").style.display = "none";
        }
    } catch (e) { console.error("Database error:", e); }
}

// 4. Fixed Theme Toggle Logic
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        document.getElementById('icon-sun').style.display = isLight ? 'block' : 'none';
        document.getElementById('icon-moon').style.display = isLight ? 'none' : 'block';
    });
}

// 5. Initialize Page
window.onload = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('icon-sun').style.display = 'block';
        document.getElementById('icon-moon').style.display = 'none';
    }

    initTimer();
    
    // 25% Chance roll
    const roll = Math.random();
    if (roll < 0.25) showSuri('suri-1');
    else if (roll < 0.5) showSuri('suri-2');
    else if (roll < 0.75) showSuri('suri-3');
};
