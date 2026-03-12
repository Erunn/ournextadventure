const UI = {
    state: { isRevealed: false, timer: null, last: {}, tasks: [] },
    config: { DB_BASE: "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app", SURI_TOTAL: 7 },
    dom: {}, 
    
    init() {
        const ids = ['event-name', 'full-date-display', 'description-display', 'countdown', 'days', 'hours', 'minutes', 'seconds', 'cat-perch', 'theme-toggle', 'sun-icon', 'moon-icon', 'task-section', 'task-list', 'new-task-input', 'scroll-indicator'];
        ids.forEach(id => this.dom[id] = document.getElementById(id));

        this.renderSuri();
        this.initTheme();
        this.initTasks();
        this.load();
        
        if (this.dom['cat-perch']) {
            this.dom['cat-perch'].addEventListener('pointerdown', e => { e.preventDefault(); this.renderSuri(); });
        }
        
        this.dom['task-list']?.addEventListener('scroll', () => this.checkScroll());
    },
    
    checkScroll() {
        const el = this.dom['task-list'];
        const ind = this.dom['scroll-indicator'];
        if (!el || !ind) return;
        const hasMore = el.scrollHeight > el.clientHeight && (el.scrollHeight - el.scrollTop - el.clientHeight > 15);
        ind.classList.toggle('visible', hasMore);
    },

    initTasks() {
        const stored = localStorage.getItem('adventure_tasks');
        if (stored) this.state.tasks = JSON.parse(stored).filter(t => t);
        this.renderTasks();

        this.dom['new-task-input']?.addEventListener('keypress', e => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                this.state.tasks.push({ id: Date.now(), text: e.target.value.trim(), done: false });
                e.target.value = '';
                this.syncTasks(); 
            }
        });
    },

    async syncTasks() {
        localStorage.setItem('adventure_tasks', JSON.stringify(this.state.tasks));
        this.renderTasks();
        try {
            await fetch(`${this.config.DB_BASE}/tasks.json`, {
                method: 'PUT',
                body: JSON.stringify(this.state.tasks)
            });
        } catch (e) { console.error(e); }
    },
    
    renderTasks() {
        if (!this.dom['task-list']) return;
        const frag = document.createDocumentFragment();
        const sorted = [...this.state.tasks].sort((a, b) => (a.done === b.done) ? b.id - a.id : a.done ? 1 : -1);

        sorted.forEach(t => {
            const li = document.createElement('li');
            if (t.done) li.classList.add('done');
            
            const txt = document.createElement('span');
            txt.className = 'task-text';
            txt.innerText = t.text;
            txt.onclick = () => { t.done = !t.done; this.syncTasks(); };
            
            const del = document.createElement('button');
            del.className = 'action-btn';
            del.innerHTML = `<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            del.onclick = (e) => { e.stopPropagation(); this.state.tasks = this.state.tasks.filter(x => x.id !== t.id); this.syncTasks(); };

            li.append(txt, del);
            frag.appendChild(li);
        });
        this.dom['task-list'].replaceChildren(frag);
        setTimeout(() => this.checkScroll(), 100);
    },

    renderSuri() {
        const last = sessionStorage.getItem('ls');
        let c; do { c = Math.floor(Math.random() * this.config.SURI_TOTAL) + 1; } while (c.toString() === last);
        sessionStorage.setItem('ls', c);
        if (this.dom['cat-perch']) this.dom['cat-perch'].innerHTML = `<div class="cat-image suri-${c}"></div>`;
    },
    
    initTheme() {
        const isL = localStorage.getItem('th') === 'l';
        if (isL) document.body.classList.add('light-mode');
        this.updIcons(isL);
        this.dom['theme-toggle'].onclick = () => {
            const l = document.body.classList.toggle('light-mode');
            localStorage.setItem('th', l ? 'l' : 'd');
            this.updIcons(l);
        };
    },

    updIcons(l) {
        if (this.dom['sun-icon']) this.dom['sun-icon'].style.display = l ? 'block' : 'none';
        if (this.dom['moon-icon']) this.dom['moon-icon'].style.display = l ? 'none' : 'block';
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", l ? "#f4f5f7" : "#0f1115");
    },

    async load() {
        try {
            const r = await fetch(`${this.config.DB_BASE}/.json?v=${Date.now()}`);
            const d = await r.json();
            
            if (d.tasks) {
                this.state.tasks = Array.isArray(d.tasks) ? d.tasks.filter(t => t) : Object.values(d.tasks);
                this.renderTasks();
            }

            const em = d.emojiLibrary?.[d.emoji?.toLowerCase()] || "";
            if (this.dom['event-name']) this.dom['event-name'].innerHTML = d.eventName + (em ? ` <span>${em}</span>` : "");
            
            if (this.dom['task-section']) this.dom['task-section'].style.display = "block";

            if (Number(d.useTimer) === 1) {
                // Pass the celebration message into the timer function
                this.runTimer(d.targetDate, d.celebrationMessage);
            } else {
                this.showStatic(d.noTimerMessage);
            }
        } catch (e) { this.reveal(); }
    },

    runTimer(str, celebrationMsg) {
        const p = str.match(/\d+/g);
        if (!p || p.length < 3) return this.showStatic(celebrationMsg);
        const target = new Date(p[0].length===4?p[0]:(p[2].length===2?"20"+p[2]:p[2]), p[1]-1, p[0].length===4?p[2]:p[0], p[3]||0, p[4]||0, p[5]||0).getTime();
        
        if (this.dom['full-date-display']) {
            this.dom['full-date-display'].innerText = new Date(target).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            this.dom['full-date-display'].style.display = "block";
        }
        
        const tick = () => {
            const diff = target - Date.now();
            
            // ACHIEVED: Show celebration message when achieved
            if (diff <= 0) return this.showStatic(celebrationMsg || "Time's up!");

            const vals = { 
                days: Math.floor(diff/864e5), 
                hours: Math.floor((diff%864e5)/36e5), 
                minutes: Math.floor((diff%36e5)/6e4), 
                seconds: Math.floor((diff%6e4)/1e3) 
            };

            Object.keys(vals).forEach(u => {
                if (this.dom[u]) {
                    this.dom[u].innerText = vals[u].toString().padStart(2, '0');
                    
                    // FIXED: Disable units (opacity) if they are zero
                    if (u === 'days') {
                        this.dom[u].classList.toggle('is-due', vals.days === 0);
                    } else if (u === 'hours') {
                        this.dom[u].classList.toggle('is-due', vals.days === 0 && vals.hours === 0);
                    } else if (u === 'minutes') {
                        this.dom[u].classList.toggle('is-due', vals.days === 0 && vals.hours === 0 && vals.minutes === 0);
                    }
                }
            });

            if (this.dom['countdown']) this.dom['countdown'].style.display = "flex";
            this.reveal();
        };
        tick(); this.state.timer = setInterval(tick, 1000);
    },

    showStatic(m) {
        if (this.state.timer) clearInterval(this.state.timer);
        if (this.dom['countdown']) this.dom['countdown'].style.display = "none";
        if (this.dom['full-date-display']) this.dom['full-date-display'].style.display = "none";
        if (this.dom['description-display']) { 
            this.dom['description-display'].style.display = "block"; 
            this.dom['description-display'].innerText = m || ""; 
        }
        this.reveal();
    },

    reveal() {
        if (this.state.isRevealed) return;
        document.querySelectorAll(".sync-reveal").forEach(e => e.classList.add("reveal"));
        this.state.isRevealed = true;
    }
};
document.addEventListener('DOMContentLoaded', () => UI.init());
