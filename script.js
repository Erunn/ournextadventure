const UI = {
    state: { isRevealed: false, timer: null, last: {}, tasks: [] },
    config: { DB_BASE: "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app", SURI_TOTAL: 7 },
    dom: {}, 
    
    init() {
        ['event-name', 'full-date-display', 'description-display', 'countdown', 'days', 'hours', 'minutes', 'seconds', 'cat-perch', 'theme-toggle', 'sun-icon', 'moon-icon', 'task-section', 'task-list', 'new-task-input', 'scroll-indicator'].forEach(id => {
            this.dom[id] = document.getElementById(id);
        });

        this.renderSuri();
        this.initTheme();
        this.initTasks();
        this.load();
        
        if (this.dom['cat-perch']) {
            this.dom['cat-perch'].addEventListener('pointerdown', e => { e.stopPropagation(); this.renderSuri(); });
        }

        if (this.dom['task-list']) {
            this.dom['task-list'].addEventListener('scroll', () => this.checkScroll());
        }
    },
    
    initTasks() {
        const stored = localStorage.getItem('adventure_tasks');
        if (stored) {
            try {
                this.state.tasks = JSON.parse(stored);
                if (!Array.isArray(this.state.tasks)) this.state.tasks = [];
            } catch (e) {
                this.state.tasks = [];
                localStorage.removeItem('adventure_tasks');
            }
            this.renderTasks();
        }

        if (this.dom['new-task-input']) {
            this.dom['new-task-input'].addEventListener('keypress', e => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    this.state.tasks.push({ 
                        id: Date.now(), 
                        text: e.target.value.trim(), 
                        done: false 
                    });
                    e.target.value = '';
                    this.syncTasks(); 
                    if (this.dom['task-list']) this.dom['task-list'].scrollTop = 0;
                }
            });
        }
    },

    checkScroll() {
        const list = this.dom['task-list'];
        const ind = this.dom['scroll-indicator'];
        if (!list || !ind) return;

        ind.style.opacity = (list.scrollHeight > list.clientHeight && (list.scrollHeight - list.scrollTop - list.clientHeight > 5)) ? '1' : '0';
    },
    
    async syncTasks() {
        localStorage.setItem('adventure_tasks', JSON.stringify(this.state.tasks));
        this.renderTasks();

        try {
            await fetch(`${this.config.DB_BASE}/tasks.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.state.tasks)
            });
        } catch (e) {
            console.error("Firebase sync error:", e);
        }
    },
    
    toggleTask(id) {
        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            task.done = !task.done;
            this.syncTasks();
        }
    },

    deleteTask(id) {
        this.state.tasks = this.state.tasks.filter(t => t && t.id !== id);
        this.syncTasks();
    },

    updateTask(id, newText) {
        const task = this.state.tasks.find(t => t.id === id);
        if (task && newText.trim()) {
            task.text = newText.trim();
            this.syncTasks();
        } else {
            this.renderTasks(); 
        }
    },

    enterEditMode(li, task) {
        li.innerHTML = '';
        li.className = ''; 
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-task-input';
        input.value = task.text;

        const saveBtn = document.createElement('button');
        saveBtn.className = 'action-btn';
        saveBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

        const triggerSave = () => this.updateTask(task.id, input.value);

        input.onkeypress = (e) => { if (e.key === 'Enter') triggerSave(); };
        input.onkeydown = (e) => { if (e.key === 'Escape') this.renderTasks(); };
        saveBtn.onclick = triggerSave;

        li.appendChild(input);
        li.appendChild(saveBtn);
        
        setTimeout(() => {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }, 10);
    },
    
    renderTasks() {
        if (!this.dom['task-list']) return;
        const frag = document.createDocumentFragment();
        
        const sortedTasks = this.state.tasks.filter(t => t).sort((a, b) => {
            if (a.done === b.done) return b.id - a.id; 
            return a.done ? 1 : -1;
        });

        sortedTasks.forEach(t => {
            const li = document.createElement('li');
            if (t.done) li.className = 'done';
            
            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            textSpan.innerText = t.text;
            textSpan.onclick = () => this.toggleTask(t.id);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'task-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn';
            editBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
            editBtn.onclick = (e) => {
                e.stopPropagation();
                this.enterEditMode(li, t);
            };

            const delBtn = document.createElement('button');
            delBtn.className = 'action-btn';
            delBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            delBtn.onclick = (e) => {
                e.stopPropagation();
                this.deleteTask(t.id);
            };

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(delBtn);

            li.appendChild(textSpan);
            li.appendChild(actionsDiv);
            frag.appendChild(li);
        });

        this.dom['task-list'].replaceChildren(frag);
        setTimeout(() => this.checkScroll(), 10);
    },

    renderSuri() {
        const last = sessionStorage.getItem('ls');
        let c; do { c = Math.floor(Math.random() * this.config.SURI_TOTAL) + 1; } while (c.toString() === last);
        sessionStorage.setItem('ls', c);
        // FIXED: Clear content before setting class to avoid "stray letters"
        if (this.dom['cat-perch']) {
            this.dom['cat-perch'].innerHTML = ''; 
            const imgDiv = document.createElement('div');
            imgDiv.className = `cat-image suri-${c}`;
            this.dom['cat-perch'].appendChild(imgDiv);
        }
    },
    
    // Remaining functions (initTheme, updIcons, load, runTimer, showStatic, reveal) same as previous version...
    initTheme() {
        const isL = localStorage.getItem('th') === 'l';
        if (isL) document.body.classList.add('light-mode');
        this.updIcons(isL);
        if (this.dom['theme-toggle']) {
            this.dom['theme-toggle'].onclick = () => {
                const l = document.body.classList.toggle('light-mode');
                localStorage.setItem('th', l ? 'l' : 'd');
                this.updIcons(l);
            };
        }
    },
    updIcons(l) {
        if (this.dom['sun-icon']) this.dom['sun-icon'].style.display = l ? 'block' : 'none';
        if (this.dom['moon-icon']) this.dom['moon-icon'].style.display = l ? 'none' : 'block';
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute("content", l ? "#f4f5f7" : "#0f1115");
    },
    async load() {
        try {
            const r = await fetch(`${this.config.DB_BASE}/.json?v=${Date.now()}`);
            const d = await r.json();
            if (!d) throw 0;
            if (d.tasks) {
                this.state.tasks = Array.isArray(d.tasks) ? d.tasks.filter(t => t) : Object.values(d.tasks);
                localStorage.setItem('adventure_tasks', JSON.stringify(this.state.tasks));
                this.renderTasks();
            }
            const emoji = d.emojiLibrary?.[d.emoji?.toLowerCase()];
            const emojiHTML = emoji ? ` <span style="font-style: normal;">${emoji}</span>` : "";
            if (this.dom['event-name']) this.dom['event-name'].innerHTML = `${d.eventName}${emojiHTML}`;
            if (Number(d.useTimer) === 1 && d.targetDate) this.runTimer(d.targetDate, d.celebrationMessage);
            else this.showStatic(d.noTimerMessage);
        } catch (e) {
            this.showStatic("next adventure");
        }
    },
    runTimer(targetStr, msg) {
        const parts = targetStr.match(/\d+/g);
        if (!parts || parts.length < 3) return this.showStatic(msg);
        let Y, M, D, h, m, s;
        if (parts[0].length === 4) { Y = parts[0]; M = parts[1]; D = parts[2]; } 
        else { D = parts[0]; M = parts[1]; Y = parts[2]; if (Y.length === 2) Y = "20" + Y; }
        h = parts[3] || 0; m = parts[4] || 0; s = parts[5] || 0;
        const target = new Date(Y, M - 1, D, h, m, s).getTime();
        if (this.dom['full-date-display']) {
            this.dom['full-date-display'].innerText = new Date(target).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            this.dom['full-date-display'].style.display = "block";
        }
        const tick = () => {
            const dist = target - Date.now();
            if (dist <= 0) return this.showStatic(msg);
            const vals = {
                days: Math.floor(dist / 86400000),
                hours: Math.floor((dist % 86400000) / 3600000),
                minutes: Math.floor((dist % 3600000) / 60000),
                seconds: Math.floor((dist % 60000) / 1000)
            };
            Object.keys(vals).forEach(u => {
                const val = vals[u];
                if (this.dom[u] && this.state.last[u] !== val) {
                    this.state.last[u] = val;
                    this.dom[u].innerText = val.toString().padStart(2, '0');
                    if (u !== 'seconds') {
                        const isDue = (u==='days'&&vals.days===0) || (u==='hours'&&vals.days===0&&vals.hours===0) || (u==='minutes'&&vals.days===0&&vals.hours===0&&vals.minutes===0);
                        this.dom[u].classList.toggle('is-due', isDue);
                    }
                }
            });
            if (this.dom['countdown']) this.dom['countdown'].style.display = "flex";
            if (this.dom['task-section']) this.dom['task-section'].style.display = "block";
            this.reveal();
        };
        tick();
        this.state.timer = setInterval(tick, 1000);
    },
    showStatic(msg) {
        if (this.state.timer) clearInterval(this.state.timer);
        if (this.dom['countdown']) {
            this.dom['countdown'].style.display = "flex";
            this.dom['countdown'].style.visibility = "hidden";
            this.dom['countdown'].style.opacity = "0";
        }
        if (this.dom['full-date-display']) this.dom['full-date-display'].style.display = "none";
        if (this.dom['description-display']) { 
            this.dom['description-display'].style.display = "block"; 
            this.dom['description-display'].innerText = msg; 
        }
        if (this.dom['task-section']) this.dom['task-section'].style.display = "block";
        this.reveal();
    },
    reveal() {
        if (this.state.isRevealed) return;
        document.querySelectorAll(".sync-reveal").forEach(el => el.classList.add("reveal"));
        this.state.isRevealed = true;
    }
};

document.addEventListener('DOMContentLoaded', () => UI.init());
