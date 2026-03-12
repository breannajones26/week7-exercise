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
  // Reset filters to prevent stale data for next user
  currentFilters = { style: '', instructor: '' };
  currentSort = 'date-desc';
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
  if (text === null || text === undefined) {
    return '';
  }
  const div = document.createElement('div');
  div.textContent = String(text);
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
    // Verify it's an array
    if (!Array.isArray(classes)) {
      console.error('Classes data is not an array');
      return [];
    }
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
// Filter and Sort State
// ==========================================

let currentFilters = {
  style: '',
  instructor: ''
};

let currentSort = 'date-desc';

/**
 * Get filtered and sorted classes
 * @returns {Array} Filtered and sorted array of classes
 */
function getFilteredClasses() {
  let classes = getClasses();

  // Apply style filter
  if (currentFilters.style) {
    classes = classes.filter(c => c.className === currentFilters.style);
  }

  // Apply instructor filter
  if (currentFilters.instructor) {
    classes = classes.filter(c => c.instructor === currentFilters.instructor);
  }

  // Apply sorting
  classes.sort((a, b) => {
    switch (currentSort) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'style-asc':
        return a.className.localeCompare(b.className);
      case 'instructor-asc':
        return a.instructor.localeCompare(b.instructor);
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  return classes;
}

/**
 * Populate filter dropdowns with available options
 */
function populateFilterDropdowns() {
  const classes = getClasses();
  const filterStyle = document.getElementById('filterStyle');
  const filterInstructor = document.getElementById('filterInstructor');

  // Get unique styles
  const styles = [...new Set(classes.map(c => c.className))].sort();

  // Get unique instructors
  const instructors = [...new Set(classes.map(c => c.instructor))].sort();

  // Populate style dropdown (use escapeHtml for display, but keep raw value for matching)
  filterStyle.innerHTML = '<option value="">All Styles</option>';
  styles.forEach(s => {
    const option = document.createElement('option');
    option.value = s;
    option.textContent = s;
    filterStyle.appendChild(option);
  });

  // Populate instructor dropdown
  filterInstructor.innerHTML = '<option value="">All Instructors</option>';
  instructors.forEach(i => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    filterInstructor.appendChild(option);
  });

  // Restore current filter values
  filterStyle.value = currentFilters.style;
  filterInstructor.value = currentFilters.instructor;
}

/**
 * Check if any filters are active
 * @returns {boolean} True if filters are active
 */
function hasActiveFilters() {
  return currentFilters.style !== '' || currentFilters.instructor !== '';
}

/**
 * Update clear filters button visibility
 */
function updateClearFiltersButton() {
  const clearBtn = document.getElementById('clearFiltersBtn');
  clearBtn.style.display = hasActiveFilters() ? 'block' : 'none';
}

/**
 * Clear all filters and reset to defaults
 */
function clearFilters() {
  currentFilters = { style: '', instructor: '' };
  document.getElementById('filterStyle').value = '';
  document.getElementById('filterInstructor').value = '';
  updateClearFiltersButton();
  renderClasses();
}

/**
 * Setup filter and sort event listeners
 */
function setupFilterListeners() {
  const filterStyle = document.getElementById('filterStyle');
  const filterInstructor = document.getElementById('filterInstructor');
  const sortOrder = document.getElementById('sortOrder');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');

  filterStyle.addEventListener('change', (e) => {
    currentFilters.style = e.target.value;
    updateClearFiltersButton();
    renderClasses();
  });

  filterInstructor.addEventListener('change', (e) => {
    currentFilters.instructor = e.target.value;
    updateClearFiltersButton();
    renderClasses();
  });

  sortOrder.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderClasses();
  });

  clearFiltersBtn.addEventListener('click', clearFilters);
}

// ==========================================
// UI Rendering Functions
// ==========================================

// Format date for display (handles timezone correctly)
function formatDate(dateString) {
  // Handle null/undefined/empty date
  if (!dateString || typeof dateString !== 'string') {
    return 'No date';
  }

  // Parse as local date to avoid timezone issues
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return 'Invalid date';
  }

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);

  // Check for invalid date
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Render the class list
function renderClasses() {
  const allClasses = getClasses();
  const classList = document.getElementById('classList');
  const emptyState = document.getElementById('emptyState');
  const noResultsState = document.getElementById('noResultsState');
  const filterControls = document.getElementById('filterControls');

  // Auto-clear invalid filters (e.g., after deleting the only class with that style)
  const validStyles = [...new Set(allClasses.map(c => c.className))];
  const validInstructors = [...new Set(allClasses.map(c => c.instructor))];

  if (currentFilters.style && !validStyles.includes(currentFilters.style)) {
    currentFilters.style = '';
  }
  if (currentFilters.instructor && !validInstructors.includes(currentFilters.instructor)) {
    currentFilters.instructor = '';
  }

  // Update filter dropdowns
  populateFilterDropdowns();
  updateClearFiltersButton();

  const filteredClasses = getFilteredClasses();

  // No classes at all
  if (allClasses.length === 0) {
    classList.style.display = 'none';
    emptyState.style.display = 'block';
    noResultsState.style.display = 'none';
    filterControls.style.display = 'none';
    return;
  }

  // Show filter controls when there are classes
  filterControls.style.display = 'flex';

  // No results after filtering
  if (filteredClasses.length === 0) {
    classList.style.display = 'none';
    emptyState.style.display = 'none';
    noResultsState.style.display = 'block';
    return;
  }

  classList.style.display = 'flex';
  emptyState.style.display = 'none';
  noResultsState.style.display = 'none';

  classList.innerHTML = filteredClasses.map(c => `
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

  // Add event listeners with double-click protection
  classList.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const button = e.target;
      if (button.disabled) return;

      const card = button.closest('.class-card');
      const id = card.dataset.id;
      openEditModal(id);
    });
  });

  classList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const button = e.target;
      if (button.disabled) return;

      // Disable button to prevent double-click
      button.disabled = true;

      const card = button.closest('.class-card');
      const id = card.dataset.id;

      if (confirm('Delete this class?')) {
        deleteClass(id);
        renderClasses();
      } else {
        // Re-enable if user cancels
        button.disabled = false;
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

// Modal elements (initialized after DOM ready)
let modal, form, modalTitle;

function initModalElements() {
  modal = document.getElementById('classModal');
  form = document.getElementById('classForm');
  modalTitle = document.getElementById('modalTitle');
}

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
    if (!classData.date) {
      alert('Please select a date');
      return;
    }

    if (!classData.className) {
      alert('Please select a class type');
      return;
    }

    if (!classData.instructor) {
      alert('Instructor name is required');
      return;
    }

    // Validate max lengths to prevent storage issues
    if (classData.instructor.length > 100) {
      alert('Instructor name is too long (max 100 characters)');
      return;
    }

    if (classData.location.length > 200) {
      alert('Location is too long (max 200 characters)');
      return;
    }

    if (classData.notes.length > 1000) {
      alert('Notes are too long (max 1000 characters)');
      return;
    }

    const existingId = document.getElementById('classId').value;

    if (existingId) {
      const updated = updateClass(existingId, classData);
      if (!updated) {
        alert('This class no longer exists. It may have been deleted.');
        closeModal();
        renderClasses();
        return;
      }
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
  initModalElements();
  setupAuthListeners();
  setupTabs();
  setupFilterListeners();
  setupEventListeners();
  checkAuthState();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
