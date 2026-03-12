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

        // Listens to the user scrolling to hide/show the indicator dynamically
        if (this.dom['task-list']) {
            this.dom['task-list'].addEventListener('scroll', () => this.checkScroll());
        }
    },
    
    initTasks() {
        const stored = localStorage.getItem('adventure_tasks');
        if (stored) {
            this.state.tasks = JSON.parse(stored);
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

    // --- NEW: Scroll Check Logic ---
    checkScroll() {
        const list = this.dom['task-list'];
        const ind = this.dom['scroll-indicator'];
        if (!list || !ind) return;

        // If the content is taller than the box AND we haven't scrolled to the very bottom
        if (list.scrollHeight > list.clientHeight && (list.scrollHeight - list.scrollTop - list.clientHeight > 5)) {
            ind.style.opacity = '1';
        } else {
            ind.style.opacity = '0';
        }
    },
    // -------------------------------
    
    async syncTasks() {
        localStorage.setItem('adventure_tasks', JSON.stringify(this.state.tasks));
        this.renderTasks();

        try {
            const response = await fetch(`${this.config.DB_BASE}/tasks.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.state.tasks)
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Firebase Save Rejected. Check Security Rules:", response.status, errorText);
            }
        } catch (e) {
            console.error("Network error while saving to Firebase:", e);
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
        this.dom['task-list'].innerHTML = '';
        
        const sortedTasks = this.state.tasks.filter(t => t).sort((a, b) => {
            if (a.done === b.done) {
                return b.id - a.id; 
            }
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
