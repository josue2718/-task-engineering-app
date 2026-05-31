// ===== TASK ENGINEERING APP - app.js =====
// feature/task-form

const STORAGE_KEY = 'task-eng-tasks';

// ── State ──────────────────────────────────────────────
let tasks = loadTasks();
let currentFilter = 'all';

// ── Persistence ────────────────────────────────────────
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ── CRUD ───────────────────────────────────────────────
function addTask(title, description, priority, assignee) {
  const task = {
    id: Date.now(),
    title: title.trim(),
    description: description.trim(),
    priority,
    assignee: assignee.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
  tasks.unshift(task);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; saveTasks(); renderTasks(); }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// ── Filtering ──────────────────────────────────────────
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTasks();
}

function getFiltered() {
  if (currentFilter === 'active') return tasks.filter(t => !t.done);
  if (currentFilter === 'done')   return tasks.filter(t => t.done);
  return tasks;
}

// ── Render ─────────────────────────────────────────────
function renderTasks() {
  const list = document.getElementById('task-list');
  if (!list) return;

  const filtered = getFiltered();

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">// No tasks found</div>`;
    return;
  }

  list.innerHTML = filtered.map(t => `
    <div class="task-item priority-${t.priority} ${t.done ? 'done' : ''}" data-id="${t.id}">
      <input class="task-check" type="checkbox" ${t.done ? 'checked' : ''}
             onchange="toggleTask(${t.id})">
      <div class="task-content">
        <div class="task-title">${escapeHtml(t.title)}</div>
        <div class="task-meta">
          <span class="badge badge-${t.priority}">${t.priority}</span>
          ${t.assignee ? `<span>@${escapeHtml(t.assignee)}</span>` : ''}
          <span>${formatDate(t.createdAt)}</span>
        </div>
      </div>
      <button class="btn btn-danger" onclick="deleteTask(${t.id})">× del</button>
    </div>
  `).join('');
}

// ── Form Handling ──────────────────────────────────────
function initForm() {
  const form = document.getElementById('task-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const title    = document.getElementById('task-title').value;
    const desc     = document.getElementById('task-desc').value;
    const priority = document.getElementById('task-priority').value;
    const assignee = document.getElementById('task-assignee').value;

    if (!title.trim()) return;

    addTask(title, desc, priority, assignee);
    form.reset();
    document.getElementById('task-title').focus();
  });
}

// ── Filter Buttons ─────────────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
}

// ── Utils ──────────────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day:'2-digit', month:'short' });
}

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initForm();
  initFilters();
  renderTasks();
});