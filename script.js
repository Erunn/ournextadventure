const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

function showSuri(imageClass) {
    const perch = document.getElementById('cat-perch');
    if (!perch) return;
    const cat = document.createElement('div');
    cat.className = `cat-image ${imageClass}`;
    perch.appendChild(cat);
    setTimeout(() => perch.style.opacity = "1", 500);
}

async function initTimer() {
    try {
        const response = await fetch(DB_URL);
        const data = await response.json();
        if (!data) return;

        // DB Link Preview Sync
        document.title = data.shareTitle || "Our Next Adventure";
        document.getElementById("og-title")?.setAttribute("content", data.shareTitle || "Adventure");
        document.getElementById("meta-desc")?.setAttribute("content", data.metaDescription || "Countdown");
        document.getElementById("event-name").innerText = data.eventName || "Next Adventure";

        if (data.targetDate) {
            const parts = data.targetDate.split(/[-/ :]/);
            const target = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0).getTime();
            
            const timerInterval = setInterval(() => {
                const now = new Date().getTime();
                const dist = target - now;

                // FIX: If time is up, HIDE timer and show message
                if (dist <= 0) {
                    clearInterval(timerInterval);
                    document.getElementById("countdown").style.display = "none";
                    const status = document.getElementById("status-message");
                    status.style.display = "block";
                    status.innerText = data.celebrationMessage || "Adventure Starts! ✨";
                    return;
                }

                // If not zero, SHOW timer
                document.getElementById("countdown").style.display = "flex";
                document.getElementById("days").innerText = Math.floor(dist / 86400000).toString().padStart(2, '0');
                document.getElementById("hours").innerText = Math.floor((dist % 86400000) / 3600000).toString().padStart(2, '0');
                document.getElementById("minutes").innerText = Math.floor((dist % 3600000) / 60000).toString().padStart(2, '0');
                document.getElementById("seconds").innerText = Math.floor((dist % 60000) / 1000).toString().padStart(2, '0');
            }, 1000);
        }
    } catch (e) { console.error(e); }
}

window.onload = () => {
    initTimer();
    const roll = Math.random();
    if (roll < 0.25) showSuri('suri-1');
    else if (roll < 0.5) showSuri('suri-2');
    else if (roll < 0.75) showSuri('suri-3');
};
