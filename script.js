// ==========================================
// Dance Class Tracker - Main JavaScript
// ==========================================

// localStorage keys
const STORAGE_KEY = 'dct_classes';
const USERS_KEY = 'dct_users';
const CURRENT_USER_KEY = 'dct_current_user';

// ==========================================
// Authentication Functions
// ==========================================

/**
 * Get all registered users from localStorage
 * @returns {Array} Array of user objects
 */
function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading users:', e);
    return [];
  }
}

/**
 * Save users to localStorage
 * @param {Array} users - Array of user objects
 */
function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users:', e);
    alert('Unable to save. Storage may be full.');
  }
}

/**
 * Get the currently logged in user
 * @returns {Object|null} Current user or null if not logged in
 */
function getCurrentUser() {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error reading current user:', e);
    return null;
  }
}

/**
 * Sign up a new user
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Object} Result with success boolean and message
 */
function signup(username, password) {
  const users = getUsers();

  // Check if username already exists
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: 'Username already exists' };
  }

  // Create new user
  const newUser = {
    id: generateId(),
    username: username,
    password: password // Note: In a real app, this would be hashed
  };

  users.push(newUser);
  saveUsers(users);

  // Auto-login after signup
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

  return { success: true, message: 'Account created successfully' };
}

/**
 * Login a user
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Object} Result with success boolean and message
 */
function login(username, password) {
  const users = getUsers();

  const user = users.find(u =>
    u.username.toLowerCase() === username.toLowerCase() &&
    u.password === password
  );

  if (!user) {
    return { success: false, message: 'Invalid username or password' };
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, message: 'Login successful' };
}

/**
 * Logout the current user
 */
function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Check if user is logged in and update UI accordingly
 */
function checkAuthState() {
  const user = getCurrentUser();
  const authScreen = document.getElementById('authScreen');
  const mainApp = document.getElementById('mainApp');
  const usernameDisplay = document.getElementById('usernameDisplay');

  if (user) {
    authScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    usernameDisplay.textContent = user.username;
    renderClasses();
  } else {
    authScreen.classList.remove('hidden');
    mainApp.classList.add('hidden');
  }
}

// Default dance styles for dropdown
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
// Data Persistence - localStorage Helpers
// ==========================================

/**
 * Generate a unique ID for each class entry
 * @returns {string} Unique identifier
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - User input text
 * @returns {string} Escaped safe text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get the storage key for classes (user-specific)
 * @returns {string} Storage key for current user's classes
 */
function getClassesKey() {
  const user = getCurrentUser();
  return user ? `dct_classes_${user.id}` : STORAGE_KEY;
}

/**
 * Get all classes from localStorage
 * Data is stored as a JSON array (user-specific)
 * @returns {Array} Array of class objects
 */
function getClasses() {
  const key = getClassesKey();
  const data = localStorage.getItem(key);
  if (!data) {
    return [];
  }
  // Parse JSON array from localStorage
  try {
    const classes = JSON.parse(data);
    // Sort by date, newest first
    return classes.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (e) {
    console.error('Error parsing classes data:', e);
    return [];
  }
}

/**
 * Save all classes to localStorage
 * Data is stored as a JSON array (user-specific)
 * @param {Array} classes - Array of class objects
 */
function saveClasses(classes) {
  const key = getClassesKey();
  try {
    localStorage.setItem(key, JSON.stringify(classes));
  } catch (e) {
    console.error('Error saving classes:', e);
    alert('Unable to save. Storage may be full.');
  }
}

// ==========================================
// Class CRUD Operations
// ==========================================

/**
 * Add a new class to localStorage
 * Each class contains: id, className, instructor, date, location, notes
 * @param {Object} classData - Class data from form
 * @returns {Object} The newly created class object
 */
function addClass(classData) {
  const classes = getClasses();
  const newClass = {
    id: generateId(),
    className: classData.className,
    instructor: classData.instructor,
    date: classData.date,
    location: classData.location,
    notes: classData.notes
  };
  classes.push(newClass);
  saveClasses(classes);
  return newClass;
}

/**
 * Update an existing class in localStorage
 * @param {string} id - The class ID to update
 * @param {Object} classData - Updated class data
 * @returns {Object|null} The updated class or null if not found
 */
function updateClass(id, classData) {
  const classes = getClasses();
  const index = classes.findIndex(c => c.id === id);
  if (index !== -1) {
    classes[index] = {
      id: id,
      className: classData.className,
      instructor: classData.instructor,
      date: classData.date,
      location: classData.location,
      notes: classData.notes
    };
    saveClasses(classes);
    return classes[index];
  }
  return null;
}

/**
 * Delete a class from localStorage
 * @param {string} id - The class ID to delete
 */
function deleteClass(id) {
  const classes = getClasses();
  const filtered = classes.filter(c => c.id !== id);
  saveClasses(filtered);
}

// ==========================================
// Instructor Functions (derived from classes)
// ==========================================

/**
 * Get all instructors with class counts
 * Instructors are derived from class entries
 * @returns {Array} Array of instructor objects with counts
 */
function getInstructors() {
  const classes = getClasses();
  const instructorMap = {};

  classes.forEach(c => {
    const name = c.instructor;
    if (!instructorMap[name]) {
      instructorMap[name] = {
        name: name,
        count: 0,
        classNames: new Set()
      };
    }
    instructorMap[name].count++;
    instructorMap[name].classNames.add(c.className);
  });

  return Object.values(instructorMap)
    .map(i => ({ ...i, classNames: Array.from(i.classNames) }))
    .sort((a, b) => b.count - a.count);
}

// ==========================================
// Style/Class Name Functions
// ==========================================

/**
 * Get all available class styles for the dropdown
 * @returns {Array} Array of style names
 */
function getStyles() {
  return DEFAULT_STYLES;
}

// ==========================================
// UI Rendering Functions
// ==========================================

// Format date for display (handles timezone correctly)
function formatDate(dateString) {
  // Parse as local date to avoid timezone issues
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
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
    <div class="class-card" data-id="${escapeHtml(c.id)}">
      <div class="class-card-header">
        <span class="class-date">${formatDate(c.date)}</span>
        <span class="class-style">${escapeHtml(c.className)}</span>
      </div>
      <div class="class-instructor">${escapeHtml(c.instructor)}</div>
      ${c.location ? `<div class="class-location">${escapeHtml(c.location)}</div>` : ''}
      ${c.notes ? `<div class="class-notes">${escapeHtml(c.notes)}</div>` : ''}
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
        <div class="instructor-name">${escapeHtml(i.name)}</div>
        <div class="instructor-styles">${i.classNames.map(name => escapeHtml(name)).join(', ')}</div>
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
    <span class="style-tag">${s}</span>
  `).join('');
}

// Populate class name dropdown in form
function populateStyleDropdown() {
  const styles = getStyles();
  const select = document.getElementById('className');

  select.innerHTML = '<option value="">Select a class</option>' +
    styles.map(s => `<option value="${s}">${s}</option>`).join('');
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
  const classes = getClasses();
  const classData = classes.find(c => c.id === id);

  if (!classData) return;

  modalTitle.textContent = 'Edit Class';
  populateStyleDropdown();

  document.getElementById('classId').value = classData.id;
  document.getElementById('classDate').value = classData.date;
  document.getElementById('className').value = classData.className;
  document.getElementById('classInstructor').value = classData.instructor;
  document.getElementById('classLocation').value = classData.location || '';
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
// Auth Event Listeners
// ==========================================

function setupAuthListeners() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const showSignup = document.getElementById('showSignup');
  const showLogin = document.getElementById('showLogin');
  const logoutBtn = document.getElementById('logoutBtn');

  // Toggle between login and signup forms
  showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    document.getElementById('signupError').textContent = '';
  });

  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    document.getElementById('loginError').textContent = '';
  });

  // Login form submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validate inputs
    if (!username) {
      document.getElementById('loginError').textContent = 'Please enter a username';
      return;
    }

    if (!password) {
      document.getElementById('loginError').textContent = 'Please enter a password';
      return;
    }

    const result = login(username, password);

    if (result.success) {
      loginForm.reset();
      checkAuthState();
    } else {
      document.getElementById('loginError').textContent = result.message;
    }
  });

  // Signup form submission
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    // Validate username
    if (!username || username.length < 2) {
      document.getElementById('signupError').textContent = 'Username must be at least 2 characters';
      return;
    }

    // Validate passwords match
    if (password !== confirm) {
      document.getElementById('signupError').textContent = 'Passwords do not match';
      return;
    }

    // Validate password length
    if (password.length < 4) {
      document.getElementById('signupError').textContent = 'Password must be at least 4 characters';
      return;
    }

    const result = signup(username, password);

    if (result.success) {
      signupForm.reset();
      checkAuthState();
    } else {
      document.getElementById('signupError').textContent = result.message;
    }
  });

  // Logout button
  logoutBtn.addEventListener('click', () => {
    logout();
    checkAuthState();
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
      className: document.getElementById('className').value,
      instructor: document.getElementById('classInstructor').value.trim(),
      location: document.getElementById('classLocation').value.trim(),
      notes: document.getElementById('classNotes').value.trim()
    };

    // Validate required fields after trim
    if (!classData.instructor) {
      alert('Instructor name is required');
      return;
    }

    if (!classData.className) {
      alert('Please select a class type');
      return;
    }

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
  setupAuthListeners();
  setupTabs();
  setupEventListeners();
  checkAuthState();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
