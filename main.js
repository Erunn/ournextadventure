// ... existing UI init code ...

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
            
            // Task section should always be shown if it exists
            if (this.dom['task-section']) this.dom['task-section'].style.display = "block";

            if (Number(d.useTimer) === 1) {
                this.runTimer(d.targetDate);
            } else {
                this.showStatic(d.noTimerMessage);
            }
        } catch (e) { this.reveal(); }
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

// ... rest of the code ...
