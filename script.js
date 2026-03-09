// ==========================================
// Dance Class Tracker - Main JavaScript
// ==========================================

// localStorage keys
const STORAGE_KEYS = {
  classes: 'dct_classes',
  instructors: 'dct_instructors',
  styles: 'dct_styles'
};

// Default dance styles
const DEFAULT_STYLES = [
  'Ballet',
  'Contemporary',
  'Jazz',
  'Hip Hop',
  'Modern',
  'Tap',
  'Lyrical',
  'House',
  'Breaking',
  'Heels',
  'Afro',
  'Latin',
  'Ballroom',
  'Other'
];

// ==========================================
// Data Management Functions
// ==========================================

// Generate a unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get data from localStorage
function getData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Save data to localStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initialize default styles if none exist
function initializeStyles() {
  const styles = getData(STORAGE_KEYS.styles);
  if (styles.length === 0) {
    const defaultStyles = DEFAULT_STYLES.map(name => ({
      id: generateId(),
      name: name,
      isCustom: false
    }));
    saveData(STORAGE_KEYS.styles, defaultStyles);
  }
}

// ==========================================
// Class CRUD Operations
// ==========================================

// Get all classes (sorted by date, newest first)
function getClasses() {
  const classes = getData(STORAGE_KEYS.classes);
  return classes.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Add a new class
function addClass(classData) {
  const classes = getData(STORAGE_KEYS.classes);
  const newClass = {
    id: generateId(),
    ...classData,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  classes.push(newClass);
  saveData(STORAGE_KEYS.classes, classes);

  // Also add instructor if new
  addInstructorIfNew(classData.instructor, classData.style);

  return newClass;
}

// Update an existing class
function updateClass(id, classData) {
  const classes = getData(STORAGE_KEYS.classes);
  const index = classes.findIndex(c => c.id === id);
  if (index !== -1) {
    classes[index] = {
      ...classes[index],
      ...classData,
      updatedAt: Date.now()
    };
    saveData(STORAGE_KEYS.classes, classes);
    return classes[index];
  }
  return null;
}

// Delete a class
function deleteClass(id) {
  const classes = getData(STORAGE_KEYS.classes);
  const filtered = classes.filter(c => c.id !== id);
  saveData(STORAGE_KEYS.classes, filtered);
}

// ==========================================
// Instructor Functions
// ==========================================

// Get all instructors with class counts
function getInstructors() {
  const classes = getData(STORAGE_KEYS.classes);
  const instructorMap = {};

  classes.forEach(c => {
    const name = c.instructor;
    if (!instructorMap[name]) {
      instructorMap[name] = {
        name: name,
        count: 0,
        styles: new Set()
      };
    }
    instructorMap[name].count++;
    instructorMap[name].styles.add(c.style);
  });

  return Object.values(instructorMap)
    .map(i => ({ ...i, styles: Array.from(i.styles) }))
    .sort((a, b) => b.count - a.count);
}

// Add instructor if they don't exist
function addInstructorIfNew(name, style) {
  // Instructors are derived from classes, no separate storage needed
  // This function is a placeholder for future enhancement
}

// ==========================================
// Style Functions
// ==========================================

// Get all styles
function getStyles() {
  return getData(STORAGE_KEYS.styles);
}

// Add a custom style
function addCustomStyle(name) {
  const styles = getData(STORAGE_KEYS.styles);
  const exists = styles.some(s => s.name.toLowerCase() === name.toLowerCase());
  if (!exists) {
    styles.push({
      id: generateId(),
      name: name,
      isCustom: true
    });
    saveData(STORAGE_KEYS.styles, styles);
  }
}

// ==========================================
// UI Rendering Functions
// ==========================================

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Render the class list
function renderClasses() {
  const classes = getClasses();
  const classList = document.getElementById('classList');
  const emptyState = document.getElementById('emptyState');

  if (classes.length === 0) {
    classList.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  classList.style.display = 'flex';
  emptyState.style.display = 'none';

  classList.innerHTML = classes.map(c => `
    <div class="class-card" data-id="${c.id}">
      <div class="class-card-header">
        <span class="class-date">${formatDate(c.date)}</span>
        <span class="class-style">${c.style}</span>
      </div>
      <div class="class-instructor">${c.instructor}</div>
      ${c.studio ? `<div class="class-studio">${c.studio}</div>` : ''}
      ${c.difficulty ? `<div class="class-difficulty">${c.difficulty}</div>` : ''}
      ${c.notes ? `<div class="class-notes">${c.notes}</div>` : ''}
      <div class="class-actions">
        <button class="btn btn-secondary btn-small edit-btn">Edit</button>
        <button class="btn btn-danger btn-small delete-btn">Delete</button>
      </div>
    </div>
  `).join('');

  // Add event listeners
  classList.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.class-card');
      const id = card.dataset.id;
      openEditModal(id);
    });
  });

  classList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.class-card');
      const id = card.dataset.id;
      if (confirm('Delete this class?')) {
        deleteClass(id);
        renderClasses();
      }
    });
  });
}

// Render instructors list
function renderInstructors() {
  const instructors = getInstructors();
  const instructorList = document.getElementById('instructorList');

  if (instructors.length === 0) {
    instructorList.innerHTML = '<div class="empty-state"><p>No instructors yet. Add some classes first!</p></div>';
    return;
  }

  instructorList.innerHTML = instructors.map(i => `
    <div class="instructor-card">
      <div>
        <div class="instructor-name">${i.name}</div>
        <div class="instructor-count">${i.styles.join(', ')}</div>
      </div>
      <div class="instructor-count">${i.count} class${i.count === 1 ? '' : 'es'}</div>
    </div>
  `).join('');
}

// Render styles list
function renderStyles() {
  const styles = getStyles();
  const styleList = document.getElementById('styleList');

  styleList.innerHTML = styles.map(s => `
    <span class="style-tag ${s.isCustom ? 'custom' : ''}">${s.name}</span>
  `).join('');
}

// Populate style dropdown in form
function populateStyleDropdown() {
  const styles = getStyles();
  const select = document.getElementById('classStyle');

  select.innerHTML = '<option value="">Select a style</option>' +
    styles.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
}

// ==========================================
// Modal Functions
// ==========================================

const modal = document.getElementById('classModal');
const form = document.getElementById('classForm');
const modalTitle = document.getElementById('modalTitle');

// Open modal for adding new class
function openAddModal() {
  modalTitle.textContent = 'Add Class';
  form.reset();
  document.getElementById('classId').value = '';
  // Set default date to today
  document.getElementById('classDate').value = new Date().toISOString().split('T')[0];
  populateStyleDropdown();
  modal.classList.add('active');
}

// Open modal for editing existing class
function openEditModal(id) {
  const classes = getData(STORAGE_KEYS.classes);
  const classData = classes.find(c => c.id === id);

  if (!classData) return;

  modalTitle.textContent = 'Edit Class';
  populateStyleDropdown();

  document.getElementById('classId').value = classData.id;
  document.getElementById('classDate').value = classData.date;
  document.getElementById('classStyle').value = classData.style;
  document.getElementById('classInstructor').value = classData.instructor;
  document.getElementById('classStudio').value = classData.studio || '';
  document.getElementById('classDuration').value = classData.duration || '';
  document.getElementById('classDifficulty').value = classData.difficulty || '';
  document.getElementById('classNotes').value = classData.notes || '';

  modal.classList.add('active');
}

// Close modal
function closeModal() {
  modal.classList.remove('active');
  form.reset();
}

// ==========================================
// Tab Navigation
// ==========================================

function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show correct content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${target}-tab`) {
          content.classList.add('active');
        }
      });

      // Render content for the active tab
      if (target === 'classes') renderClasses();
      if (target === 'instructors') renderInstructors();
      if (target === 'styles') renderStyles();
    });
  });
}

// ==========================================
// Event Listeners
// ==========================================

function setupEventListeners() {
  // Add class button
  document.getElementById('addClassBtn').addEventListener('click', openAddModal);

  // Close modal
  document.querySelector('.close-btn').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const classData = {
      date: document.getElementById('classDate').value,
      style: document.getElementById('classStyle').value,
      instructor: document.getElementById('classInstructor').value.trim(),
      studio: document.getElementById('classStudio').value.trim(),
      duration: parseInt(document.getElementById('classDuration').value) || null,
      difficulty: document.getElementById('classDifficulty').value,
      notes: document.getElementById('classNotes').value.trim()
    };

    const existingId = document.getElementById('classId').value;

    if (existingId) {
      updateClass(existingId, classData);
    } else {
      addClass(classData);
    }

    closeModal();
    renderClasses();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// ==========================================
// Initialize App
// ==========================================

function init() {
  initializeStyles();
  setupTabs();
  setupEventListeners();
  renderClasses();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
