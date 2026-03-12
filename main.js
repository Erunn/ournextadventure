const UI = {
    state: { isRevealed: false, timer: null, last: {}, tasks: [] },
    config: { DB_BASE: "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app", SURI_TOTAL: 7 },
    dom: {}, 
    
    init() {
        ['event-name', 'full-date-display', 'description-display', 'countdown', 'days', 'hours', 'minutes', 'seconds', 'cat-perch', 'theme-toggle', 'sun-icon', 'moon-icon', 'task-section', 'task-list', 'new-task-input'].forEach(id => {
            this.dom[id] = document.getElementById(id);
        });

        this.renderSuri();
        this.initTheme();
        this.initTasks();
        this.load();
        
        if (this.dom['cat-perch']) {
            this.dom['cat-perch'].addEventListener('pointerdown', e => { e.stopPropagation(); this.renderSuri(); });
        }
    },
    
    initTasks() {
        const stored = localStorage.getItem('adventure_tasks');
        if (stored) {
            try {
                this.state.tasks = JSON.parse(stored).filter(t => t);
            } catch (e) { this.state.tasks = []; }
            this.renderTasks();
        }

        if (this.dom['new-task-input']) {
            this.dom['new-task-input'].addEventListener('keypress', e => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    this.state.tasks.push({ id: Date.now(), text: e.target.value.trim(), done: false });
                    e.target.value = '';
                    this.syncTasks(); 
                }
            });
        }
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
    
    toggleTask(id) {
        const t = this.state.tasks.find(x => x.id === id);
        if (t) { t.done = !t.done; this.syncTasks(); }
    },

    deleteTask(id) {
        this.state.tasks = this.state.tasks.filter(x => x.id !== id);
        this.syncTasks();
    },

    updateTask(id, text) {
        const t = this.state.tasks.find(x => x.id === id);
        if (t && text.trim()) { t.text = text.trim(); this.syncTasks(); }
        else this.renderTasks();
    },

    enterEditMode(li, task) {
        li.innerHTML = '';
        const input = document.createElement('input');
        input.className = 'edit-task-input';
        input.value = task.text;
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'action-btn';
        saveBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

        const save = () => this.updateTask(task.id, input.value);
        input.onkeypress = (e) => { if (e.key === 'Enter') save(); };
        saveBtn.onclick = save;

        li.appendChild(input);
        li.appendChild(saveBtn);
        setTimeout(() => input.focus(), 50);
    },
    
    renderTasks() {
        if (!this.dom['task-list']) return;
        const frag = document.createDocumentFragment();
        
        const sorted = [...this.state.tasks].sort((a, b) => {
            if (a.done === b.done) return b.id - a.id; 
            return a.done ? 1 : -1;
        });

        sorted.forEach(t => {
            const li = document.createElement('li');
            if (t.done) li.classList.add('done');
            
            const txt = document.createElement('span');
            txt.className = 'task-text';
            txt.innerText = t.text;
            txt.onclick = () => this.toggleTask(t.id);
            
            const acts = document.createElement('div');
            acts.className = 'task-actions';

            const edit = document.createElement('button');
            edit.className = 'action-btn';
            edit.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
            edit.onclick = (e) => { e.stopPropagation(); this.enterEditMode(li, t); };

            const del = document.createElement('button');
            del.className = 'action-btn';
            del.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            del.onclick = (e) => { e.stopPropagation(); this.deleteTask(t.id); };

            acts.append(edit, del);
            li.append(txt, acts);
            frag.appendChild(li);
        });
        this.dom['task-list'].replaceChildren(frag);
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
        const m = document.querySelector('meta[name="theme-color"]');
        if (m) m.setAttribute("content", l ? "#f4f5f7" : "#0f1115");
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
            if (Number(d.useTimer) === 1) this.runTimer(d.targetDate, d.celebrationMessage);
            else this.showStatic(d.noTimerMessage);
        } catch (e) { this.showStatic("next adventure"); }
    },

    runTimer(str, msg) {
        const p = str.match(/\d+/g);
        if (!p || p.length < 3) return this.showStatic(msg);
        const target = new Date(p[0].length===4?p[0]:(p[2].length===2?"20"+p[2]:p[2]), p[1]-1, p[0].length===4?p[2]:p[0], p[3]||0, p[4]||0, p[5]||0).getTime();
        
        if (this.dom['full-date-display']) {
            this.dom['full-date-display'].innerText = new Date(target).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            this.dom['full-date-display'].style.display = "block";
        }
        
        const tick = () => {
            const diff = target - Date.now();
            if (diff <= 0) return this.showStatic(msg);
            const vals = { days: Math.floor(diff/864e5), hours: Math.floor((diff%864e5)/36e5), minutes: Math.floor((diff%36e5)/6e4), seconds: Math.floor((diff%6e4)/1e3) };
            Object.keys(vals).forEach(u => {
                if (this.dom[u]) {
                    this.dom[u].innerText = vals[u].toString().padStart(2, '0');
                    if (u !== 'seconds') this.dom[u].classList.toggle('is-due', (u==='days'&&vals.days===0)||(u==='hours'&&vals.days===0&&vals.hours===0)||(u==='minutes'&&vals.days===0&&vals.hours===0&&vals.minutes===0));
                }
            });
            if (this.dom['countdown']) this.dom['countdown'].style.display = "flex";
            if (this.dom['task-section']) this.dom['task-section'].style.display = "block";
            this.reveal();
        };
        tick(); this.state.timer = setInterval(tick, 1000);
    },

    showStatic(m) {
        if (this.state.timer) clearInterval(this.state.timer);
        if (this.dom['countdown']) this.dom['countdown'].style.display = "none";
        if (this.dom['full-date-display']) this.dom['full-date-display'].style.display = "none";
        if (this.dom['description-display']) { this.dom['description-display'].style.display = "block"; this.dom['description-display'].innerText = m; }
        if (this.dom['task-section']) this.dom['task-section'].style.display = "block";
        this.reveal();
    },

    reveal() {
        if (this.state.isRevealed) return;
        document.querySelectorAll(".sync-reveal").forEach(e => e.classList.add("reveal"));
        this.state.isRevealed = true;
    }
};
document.addEventListener('DOMContentLoaded', () => UI.init());
