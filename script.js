const UI = {
    state: { isRevealed: false, timer: null },
    config: {
        DB: "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json",
        SURI_TOTAL: 7
    },
    
    init() {
        this.renderSuri();
        this.initTheme();
        this.load();
    },

    async load() {
        try {
            // Versioning query to bypass aggressive caching
            const r = await fetch(`${this.config.DB}?v=${Date.now()}`);
            const d = await r.json();
            if (!d) throw 0;

            document.title = d.shareTitle || "Next Adventure";
            const emoji = d.emojiLibrary?.[d.emoji?.toLowerCase()] || "❤️";
            document.getElementById("event-name").innerHTML = `${d.eventName} <span>${emoji}</span>`;

            if (Number(d.useTimer) === 1 && d.targetDate) {
                this.runTimer(d.targetDate, d.celebrationMessage);
            } else {
                this.showStatic(d.noTimerMessage);
            }
        } catch (e) {
            this.showStatic("Next Adventure ❤️");
        }
    },

    runTimer(targetStr, msg) {
        const p = targetStr.split(/[-/ :]/);
        const target = new Date(p[2], p[1]-1, p[0], p[3]||0, p[4]||0).getTime();
        
        const fd = document.getElementById("full-date-display");
        if (fd) {
            fd.innerText = new Date(target).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            fd.style.display = "block";
        }

        const tick = () => {
            const dist = target - Date.now();
            if (dist <= 0) return this.showStatic(msg);

            const t = {
                days: Math.floor(dist / 86400000),
                hours: Math.floor((dist % 86400000) / 3600000),
                minutes: Math.floor((dist % 3600000) / 60000),
                seconds: Math.floor((dist % 60000) / 1000)
            };

            // Efficiently loop through time units
            const units = ['days', 'hours', 'minutes', 'seconds'];
            for (let i = 0; i < units.length; i++) {
                const u = units[i];
                const el = document.getElementById(u);
                el.innerText = t[u].toString().padStart(2, '0');
                
                if (u !== 'seconds') {
                    const isPast = (u === 'days' && t.days === 0) || 
                                   (u === 'hours' && t.days === 0 && t.hours === 0) || 
                                   (u === 'minutes' && t.days === 0 && t.hours === 0 && t.minutes === 0);
                    el.classList.toggle('is-due', isPast);
                }
            }

            document.getElementById("countdown").style.display = "flex";
            this.reveal();
        };

        tick();
        this.state.timer = setInterval(tick, 1000);
    },

    showStatic(msg) {
        if (this.state.timer) clearInterval(this.state.timer);
        document.getElementById("countdown").style.display = "none";
        document.getElementById("full-date-display").style.display = "none";
        const desc = document.getElementById("description-display");
        if (desc) {
            desc.style.display = "block";
            desc.innerText = msg;
        }
        this.reveal();
    },

    reveal() {
        if (this.state.isRevealed) return;
        document.querySelectorAll(".sync-reveal").forEach(el => el.classList.add("reveal"));
        this.state.isRevealed = true;
    },

    renderSuri() {
        const last = sessionStorage.getItem('ls');
        let c; do { c = Math.floor(Math.random() * this.config.SURI_TOTAL) + 1; } while (c == last);
        sessionStorage.setItem('ls', c);
        const perch = document.getElementById('cat-perch');
        const img = document.createElement('div');
        img.className = `cat-image suri-${c}`;
        perch.appendChild(img);
    },

    initTheme() {
        const isL = localStorage.getItem('th') === 'l';
        if (isL) document.body.classList.add('light-mode');
        this.updIcons(isL);
        document.getElementById('theme-toggle').onclick = () => {
            const l = document.body.classList.toggle('light-mode');
            localStorage.setItem('th', l ? 'l' : 'd');
            this.updIcons(l);
        };
    },

    updIcons(l) {
        document.getElementById('sun-icon').style.display = l ? 'block' : 'none';
        document.getElementById('moon-icon').style.display = l ? 'none' : 'block';
    }
};

window.onload = () => UI.init();
