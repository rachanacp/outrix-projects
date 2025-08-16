class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.editingTaskId = null;
        this.pendingDeleteId = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.searchInput = document.getElementById('searchInput');
        this.tasksList = document.getElementById('tasksList');
        this.emptyState = document.getElementById('emptyState');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmMessage = document.getElementById('confirmMessage');
        this.confirmDelete = document.getElementById('confirmDelete');
        this.confirmCancel = document.getElementById('confirmCancel');
        
        // Stats elements
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.pendingTasksEl = document.getElementById('pendingTasks');
    }

    attachEventListeners() {
        // Add task functionality
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.render();
        });

        // Filter functionality
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setFilter(filter);
            });
        });

        // Clear completed tasks
        this.clearCompletedBtn.addEventListener('click', () => {
            this.showConfirmModal(
                'Are you sure you want to clear all completed tasks?',
                () => this.clearCompleted()
            );
        });

        // Modal event listeners
        this.confirmDelete.addEventListener('click', () => this.confirmAction());
        this.confirmCancel.addEventListener('click', () => this.hideConfirmModal());
        this.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) this.hideConfirmModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideConfirmModal();
                this.cancelEdit();
            }
        });

        // Auto-save on page unload
        window.addEventListener('beforeunload', () => this.saveTasks());
    }

    addTask() {
        const text = this.taskInput.value.trim();
        const priority = this.prioritySelect.value;

        if (!text) {
            this.showInputError('Please enter a task description');
            return;
        }

        if (text.length > 100) {
            this.showInputError('Task description is too long (max 100 characters)');
            return;
        }

        const task = {
            id: this.generateId(),
            text,
            priority,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.prioritySelect.value = 'medium';
        this.render();
        this.showNotification('Task added successfully!', 'success');
    }

    showInputError(message) {
        this.taskInput.style.borderColor = 'var(--danger-color)';
        this.showNotification(message, 'error');
        
        setTimeout(() => {
            this.taskInput.style.borderColor = '';
        }, 3000);
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        
        this.saveTasks();
        this.render();
        
        const message = task.completed ? 'Task completed!' : 'Task marked as active';
        this.showNotification(message, 'success');
    }

    deleteTask(id) {
        this.pendingDeleteId = id;
        const task = this.tasks.find(t => t.id === id);
        this.showConfirmModal(
            `Are you sure you want to delete "${task.text}"?`,
            () => this.performDelete()
        );
    }

    performDelete() {
        const taskElement = document.querySelector(`[data-task-id="${this.pendingDeleteId}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== this.pendingDeleteId);
                this.saveTasks();
                this.render();
                this.showNotification('Task deleted successfully!', 'success');
            }, 300);
        }
        this.pendingDeleteId = null;
    }

    startEdit(id) {
        this.cancelEdit(); // Cancel any existing edit
        this.editingTaskId = id;
        this.render();
        
        // Focus on the input
        const input = document.querySelector(`[data-task-id="${id}"] .task-input`);
        if (input) {
            input.focus();
            input.select();
        }
    }

    saveEdit(id) {
        const input = document.querySelector(`[data-task-id="${id}"] .task-input`);
        const newText = input.value.trim();

        if (!newText) {
            this.showNotification('Task description cannot be empty', 'error');
            return;
        }

        if (newText.length > 100) {
            this.showNotification('Task description is too long (max 100 characters)', 'error');
            return;
        }

        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.text = newText;
            this.saveTasks();
            this.showNotification('Task updated successfully!', 'success');
        }

        this.editingTaskId = null;
        this.render();
    }

    cancelEdit() {
        this.editingTaskId = null;
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.render();
        this.showNotification(`${completedCount} completed tasks cleared!`, 'success');
    }

    getFilteredTasks() {
        let filteredTasks = this.tasks;

        // Apply status filter
        if (this.currentFilter === 'active') {
            filteredTasks = filteredTasks.filter(t => !t.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(t => t.completed);
        }

        // Apply search filter
        if (this.searchTerm) {
            filteredTasks = filteredTasks.filter(t => 
                t.text.toLowerCase().includes(this.searchTerm)
            );
        }

        return filteredTasks;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        
        this.updateStats();
        this.renderTasks(filteredTasks);
        this.updateClearButton();
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        this.pendingTasksEl.textContent = pending;
    }

    renderTasks(tasks) {
        if (tasks.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        const tasksHTML = tasks.map(task => this.createTaskHTML(task)).join('');
        this.tasksList.innerHTML = tasksHTML;

        // Attach event listeners to task elements
        this.attachTaskEventListeners();
    }

    createTaskHTML(task) {
        const isEditing = this.editingTaskId === task.id;
        const createdDate = new Date(task.createdAt).toLocaleDateString();
        const completedDate = task.completedAt ? new Date(task.completedAt).toLocaleDateString() : null;

        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                         data-action="toggle" data-task-id="${task.id}"></div>
                    <span class="task-text ${task.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}">${this.escapeHtml(task.text)}</span>
                    <input type="text" class="task-input ${isEditing ? 'active' : ''}" 
                           value="${this.escapeHtml(task.text)}" maxlength="100">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    <div class="task-actions">
                        ${isEditing ? `
                            <button class="task-btn save-btn" data-action="save" data-task-id="${task.id}">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="task-btn cancel-btn" data-action="cancel" data-task-id="${task.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : `
                            <button class="task-btn edit-btn" data-action="edit" data-task-id="${task.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="task-btn delete-btn" data-action="delete" data-task-id="${task.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        `}
                    </div>
                </div>
                <div class="task-meta">
                    <span class="task-date">
                        <i class="fas fa-calendar-plus"></i>
                        Created: ${createdDate}
                    </span>
                    ${completedDate ? `
                        <span class="task-date">
                            <i class="fas fa-calendar-check"></i>
                            Completed: ${completedDate}
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    attachTaskEventListeners() {
        this.tasksList.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            const taskId = e.target.closest('[data-task-id]')?.dataset.taskId;
            
            if (!action || !taskId) return;

            switch (action) {
                case 'toggle':
                    this.toggleTask(taskId);
                    break;
                case 'edit':
                    this.startEdit(taskId);
                    break;
                case 'delete':
                    this.deleteTask(taskId);
                    break;
                case 'save':
                    this.saveEdit(taskId);
                    break;
                case 'cancel':
                    this.cancelEdit();
                    break;
            }
        });

        // Handle Enter and Escape keys in edit mode
        this.tasksList.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('task-input')) {
                const taskId = e.target.closest('[data-task-id]').dataset.taskId;
                
                if (e.key === 'Enter') {
                    this.saveEdit(taskId);
                } else if (e.key === 'Escape') {
                    this.cancelEdit();
                }
            }
        });
    }

    showEmptyState() {
        this.tasksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <h3>No tasks found</h3>
                <p>${this.searchTerm ? 'No tasks match your search' : 
                      this.currentFilter === 'active' ? 'No active tasks' :
                      this.currentFilter === 'completed' ? 'No completed tasks' :
                      'Add your first task to get started!'}</p>
            </div>
        `;
    }

    hideEmptyState() {
        const emptyState = this.tasksList.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
    }

    updateClearButton() {
        const hasCompleted = this.tasks.some(t => t.completed);
        this.clearCompletedBtn.style.display = hasCompleted ? 'flex' : 'none';
    }

    showConfirmModal(message, onConfirm) {
        this.confirmMessage.textContent = message;
        this.confirmAction = onConfirm;
        this.confirmModal.classList.add('active');
        this.confirmCancel.focus();
    }

    hideConfirmModal() {
        this.confirmModal.classList.remove('active');
        this.confirmAction = null;
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 
                        type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
            transition: opacity 0.2s;
        `;

        closeBtn.addEventListener('click', () => notification.remove());
        closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
        closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.8');

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);

        // Add CSS animation styles
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('taskmaster-tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('taskmaster-tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showNotification('Failed to save tasks to local storage', 'error');
        }
    }

    // Public API for external access
    exportTasks() {
        const data = {
            tasks: this.tasks,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    }

    importTasks(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.tasks && Array.isArray(data.tasks)) {
                this.tasks = data.tasks;
                this.saveTasks();
                this.render();
                this.showNotification(`Imported ${data.tasks.length} tasks successfully!`, 'success');
                return true;
            }
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Failed to import tasks. Invalid format.', 'error');
        }
        return false;
    }

    clearAllTasks() {
        this.showConfirmModal(
            'Are you sure you want to delete ALL tasks? This action cannot be undone.',
            () => {
                this.tasks = [];
                this.saveTasks();
                this.render();
                this.showNotification('All tasks cleared!', 'success');
            }
        );
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
    
    // Expose useful functions to global scope for debugging/external access
    window.TaskMasterAPI = {
        exportTasks: () => window.taskManager.exportTasks(),
        importTasks: (data) => window.taskManager.importTasks(data),
        clearAll: () => window.taskManager.clearAllTasks(),
        getStats: () => ({
            total: window.taskManager.tasks.length,
            completed: window.taskManager.tasks.filter(t => t.completed).length,
            pending: window.taskManager.tasks.filter(t => !t.completed).length
        })
    };
});

// Service worker registration for potential PWA features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment the following lines if you want to add PWA capabilities
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}