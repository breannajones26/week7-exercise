# Dance Class Tracker - App Plan

## Overview

A simple, beginner-friendly web app that lets dancers log and track the classes they've taken. Users can record class details including instructor, dance style, date, and personal notes. All data is stored locally in the browser using localStorage.

---

## Tech Stack

- **HTML5** - Structure and semantic markup
- **CSS3** - Styling with CSS variables for easy theming
- **Vanilla JavaScript** - Logic and localStorage management
- **localStorage** - Client-side data persistence

---

## File Structure

```
dance-class-tracker/
├── index.html      # Main HTML page
├── styles.css      # All styles
├── script.js       # Application logic
├── PLAN.md         # This file
└── README.md       # Setup instructions
```

---

## Core Features

### 1. Add Class Entry
**Status:** Implemented

| Field | Type | Location |
|-------|------|----------|
| Style/Class Name | Dropdown | `index.html:47` - `<select id="classStyle">` |
| Instructor Name | Text input | `index.html:51` - `<input id="classInstructor">` |
| Date of Class | Date picker | `index.html:43` - `<input type="date" id="classDate">` |
| Difficulty Level | Dropdown | `index.html:59` - `<select id="classDifficulty">` |
| Personal Notes | Textarea | `index.html:67` - `<textarea id="classNotes">` |
| Studio (optional) | Text input | `index.html:55` - `<input id="classStudio">` |

**Logic:** `script.js:addClass()` (line 60) - saves to localStorage

---

### 2. View Saved Classes
**Status:** Implemented

- **Display location:** `index.html:21` - `<div id="classList">`
- **Render function:** `script.js:renderClasses()` (line 117)
- **Sorting:** Newest first by date
- **Shows:** Date, style badge, instructor, difficulty, notes

---

### 3. Edit or Delete Entries
**Status:** Implemented

| Action | UI Element | Function |
|--------|------------|----------|
| Edit | "Edit" button on each card | `script.js:openEditModal()` (line 197) |
| Delete | "Delete" button on each card | `script.js:deleteClass()` (line 84) |
| Save changes | Form submit | `script.js:updateClass()` (line 72) |

---

### 4. Basic UI Layout
**Status:** Implemented

```
┌─────────────────────────────────────────────────────┐
│  HEADER: Title + [+ Add Class] button               │  ← index.html:13-16
├─────────────────────────────────────────────────────┤
│  NAV TABS: [Classes] [Instructors] [Styles]         │  ← index.html:18-22
├─────────────────────────────────────────────────────┤
│  CONTENT AREA:                                      │
│  ┌───────────────────────────────────────────────┐ │
│  │  Class Card                                    │ │  ← Rendered by JS
│  │  Date • Style Badge                           │ │
│  │  Instructor Name                              │ │
│  │  Difficulty Level                             │ │
│  │  Notes...                        [Edit][Del]  │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
│  MODAL: Add/Edit form (hidden by default)           │  ← index.html:38-75
└─────────────────────────────────────────────────────┘
```

---

## Future Enhancements

- Filter classes by instructor, style, or date range
- Statistics dashboard (classes per month, favorite styles)
- Export data as JSON/CSV
- Dark mode toggle

---

## Data Model

### Class Entry
```javascript
{
  id: "uuid-string",           // Unique identifier
  date: "2026-03-09",          // ISO date string
  style: "Contemporary",       // Dance style name
  instructor: "Maria Santos",  // Instructor name
  difficulty: "Intermediate",  // Beginner | Intermediate | Advanced | All Levels
  studio: "Downtown Dance",    // Optional: studio/location
  duration: 60,                // Optional: class length in minutes
  notes: "Worked on turns...", // Personal notes
  createdAt: 1741536000000,    // Timestamp when entry was created
  updatedAt: 1741536000000     // Timestamp when last modified
}
```

### Instructor
```javascript
{
  id: "uuid-string",
  name: "Maria Santos",
  styles: ["Contemporary", "Jazz"],  // Styles they teach
  notes: "Great at breaking down technique"
}
```

### Dance Styles
```javascript
{
  id: "uuid-string",
  name: "Contemporary",
  isCustom: false  // true for user-added styles
}
```

### localStorage Keys
```
dct_classes     → Array of class entries
dct_instructors → Array of instructors
dct_styles      → Array of dance styles
```

---

## Default Dance Styles

- Ballet
- Contemporary
- Jazz
- Hip Hop
- Modern
- Tap
- Lyrical
- House
- Breaking
- Heels
- Afro
- Latin (Salsa, Bachata, etc.)
- Ballroom
- Other

---

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│  Dance Class Tracker                      [+ Add]   │
├─────────────────────────────────────────────────────┤
│  [Classes]  [Instructors]  [Styles]                 │  ← Navigation tabs
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Mar 9, 2026 • Contemporary                  │   │
│  │ Instructor: Maria Santos                    │   │
│  │ "Focused on floor work and transitions..." │   │
│  │                            [Edit] [Delete]  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Mar 7, 2026 • Hip Hop                       │   │
│  │ Instructor: DJ Mike                         │   │
│  │ "Learned new choreo to..."                  │   │
│  │                            [Edit] [Delete]  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Order

1. **Set up HTML structure** - Basic layout with navigation
2. **Add CSS styling** - Clean, mobile-friendly design
3. **Implement localStorage utilities** - Save/load/delete functions
4. **Build class logging feature** - Form and list display
5. **Add edit/delete functionality** - CRUD operations
6. **Implement instructors view** - List and manage instructors
7. **Add styles management** - Custom style support
8. **Polish and test** - Edge cases, empty states, validation

---

## Getting Started

To run the app:
1. Open `index.html` in any web browser
2. No build tools or server required

To clear all data:
- Open browser DevTools → Application → localStorage → Clear
