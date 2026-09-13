# CampusOS

CampusOS is a static futuristic Student Operating System for managing academic information, understanding course performance, planning study time, and exploring academic scenarios in one connected interface.

All calculations and data interactions run in the browser. User-created data and preferences are saved locally; no backend, database, API, or cloud service is required.

## Features

### Academic workspace

- Academic dashboard with GPA, attendance, pending-task, and study-time summaries
- Academic Control Center with a calculated Academic Health Score
- Academic status, academic load, risk level, semester completion, and critical-event indicators
- Live daily academic timeline showing past, current, next, and free-period states
- Weekly workload forecast based on classes, assessments, and quizzes
- Critical assessment and deadline countdowns sorted by urgency
- CSS Grid study activity heatmap with focused-minute details
- Quick Action dock for Focus Mode, GPA Forecast, Attendance Risk, and Command Palette
- CampusOS system status bar showing semester progress and local-save status

### Global operating-system interactions

- Command Palette opened with `Ctrl + K` or `Cmd + K`
- Command filtering with arrow-key navigation and Enter execution
- Commands for navigation, search, theme switching, GPA Forecast, Attendance Risk, and Focus Mode
- Universal Search across courses, instructors, classrooms, schedule events, tasks, and academic tools
- Grouped search results with live filtering, keyboard navigation, highlighting, and empty states
- Notification Center with locally generated academic notifications
- Mark-all-as-read support with persisted read state
- Personalization panel for accent, density, and motion preferences
- Dark/light theme switching with saved preference

### Study productivity

- Full-screen Focus Mode
- 25, 45, and 60-minute focus presets
- Start, pause, resume, and reset controls
- Timestamp-based countdown timer
- Selectable course and optional session goal
- SVG progress ring and session completion feedback
- Locally saved completed focus sessions
- Focus activity integrated into the dashboard heatmap

### Courses

- Course Command Center with six realistic courses
- Course search and category filtering
- Course Intelligence view with instructor, credits, progress, attendance, next class, upcoming assessment, assessment weight, performance breakdown, and deterministic outlook
- Course details modal with close-button, overlay, and Escape-key support

### Schedule

- Weekly timetable with Monday-to-Friday columns
- Weekday selection on smaller layouts
- Previous and next week controls
- Current-day highlighting
- Class cards with course, time, room, and instructor abbreviation
- Class details modal with next topic and attendance information

### Tasks

- Existing Task Command Center
- Add, edit, complete, reopen, and delete tasks
- Task title, course, deadline, priority, and description fields
- Form validation with visible messages
- All, pending, completed, and high-priority filters
- Search by task title or course
- Empty-state display when no tasks match
- Task persistence using `localStorage`

### Analytics and academic visualization

- GPA calculator using credit hours, grade points, and quality points
- Add and remove GPA course rows
- Attendance percentage calculator with Safe, Warning, and At Risk states
- Attendance guidance for safe-to-miss and recovery classes
- GPA Forecast Simulator with Expected, Conservative, Best Case, and custom scenarios
- Attendance Risk Simulator for attending or missing the next class without changing saved data
- Safe, caution, and risk attendance zones
- SVG Academic Skill Map for Programming, Problem Solving, Design, Databases, Systems, and Communication
- Course-based skill highlighting
- Semester Progress Matrix showing completed, current, and upcoming milestones

## Technologies

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Vanilla%20JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JavaScript">
  <img src="https://img.shields.io/badge/localStorage-Web%20Storage-6950C7?style=for-the-badge" alt="localStorage Web Storage API">
</p>

- **HTML5** — semantic page structure, accessible controls, dialogs, forms, and tables
- **CSS3** — Grid, Flexbox, responsive layouts, CSS variables, glass surfaces, transitions, animations, and visualizations
- **Vanilla JavaScript** — DOM manipulation, calculations, event handling, local state, and browser interactions without frameworks
- **localStorage** — stores tasks, theme, focus sessions, notification read state, personalization, and local-save timestamps
- **Browser APIs** — `Date`, keyboard events, CSS custom properties, SVG, and local Web Storage

No React, Vue, Angular, Bootstrap, Tailwind, Firebase, database, backend, or external chart library is used.

## Pages

- **Overview (`index.html`)** — The main academic command center containing academic statistics, the Academic Control Center, live timeline, workload forecast, study heatmap, critical events, and quick actions.
- **Courses (`courses.html`)** — Provides course search, category filters, course cards, and the Course Intelligence modal.
- **Schedule (`schedule.html`)** — Displays the weekly timetable with weekday controls, week navigation, current-day highlighting, and class detail modals.
- **Tasks (`tasks.html`)** — Provides the local Task Command Center for creating, editing, completing, deleting, searching, and filtering academic tasks.
- **Analytics (`analytics.html`)** — Contains the GPA calculator, attendance calculator, GPA Forecast Simulator, Attendance Risk Simulator, Academic Skill Map, and Semester Progress Matrix.

## JavaScript Architecture

CampusOS uses simple separate scripts grouped by responsibility. Scripts are loaded with `defer`.

- `data.js` — shared courses, schedule, assessments, semester, skills, degree data, and storage keys
- `utils.js` — shared date, time, countdown, escaping, and local-save helpers
- `main.js` — greeting, system status bar, and local-save display
- `theme.js` — dark/light theme restoration and switching
- `navigation.js` — active navigation state and mobile sidebar drawer
- `search.js` — Universal Search index, filtering, results, and keyboard controls
- `command-palette.js` — command array, palette rendering, filtering, and execution
- `dashboard.js` — health score, timeline, workload, heatmap, and critical events
- `courses.js` — course synchronization, filtering, search, and Course Intelligence
- `schedule.js` — timetable controls, week logic, and class modal
- `tasks.js` — task state, rendering, validation, filters, CRUD operations, and storage
- `analytics.js` — GPA, attendance, forecasting, skill map, and degree matrix logic
- `focus.js` — timestamp-based Focus Mode and focus-session storage
- `notifications.js` — calculated local notifications and read-state storage
- `personalization.js` — accent, density, and motion preferences

Every page loads the shared scripts and then its page-specific script:

```text
index.html     -> dashboard.js
courses.html   -> courses.js
schedule.html  -> schedule.js
tasks.html     -> tasks.js
analytics.html -> analytics.js
```

## Shared Data Model

The shared frontend data is exposed through `window.CampusOS.data` in `js/data.js`.

It contains:

- student information
- semester progress
- courses and instructors
- class schedule events
- assessments and deadlines
- academic skill values
- degree progress states
- default study activity

Pages use the same course IDs and assessment data so course names, instructors, rooms, schedules, and deadlines remain consistent throughout CampusOS.

## Local Storage Keys

| Key | Stored information |
|---|---|
| `campus-theme` | Selected dark or light theme |
| `campus-tasks` | User task array as JSON |
| `campus-focus-sessions` | Completed focus-session array as JSON |
| `campus-notifications-read` | IDs of notifications marked as read |
| `campus-preferences` | Accent, density, and motion preferences as JSON |
| `campus-last-local-save` | Last local persistence timestamp |

CampusOS does not claim cloud synchronization. “Local data saved” means data was saved in the current browser.

## Main Calculations

### GPA

```text
Quality Points = Grade Points × Credit Hours
GPA = Total Quality Points ÷ Total Credit Hours
```

### Academic Health Score

```text
GPA contribution          = GPA ÷ 4 × 35
Attendance contribution   = Attendance Percentage × 0.30
Work contribution         = Completed Task Percentage × 0.20
Deadline contribution     = Deadline Readiness × 0.15
```

This is a transparent local calculation, not an AI prediction.

### Attendance Risk

```text
Current   = Attended ÷ Total Classes × 100
If Attend = (Attended + 1) ÷ (Total Classes + 1) × 100
If Miss   = Attended ÷ (Total Classes + 1) × 100
```

### Workload

```text
Scheduled class   = 2 points
Normal assessment = 4 points
Quiz              = 3 points
```

### Countdown states

```text
Less than 24 hours = Critical
Less than 3 days   = Warning
More than 3 days   = Normal
```

## Keyboard Shortcuts

- `Ctrl + K` / `Cmd + K` — open or close Command Palette
- `/` — open Universal Search
- `F` — open Focus Mode
- `Arrow Up` / `Arrow Down` — move through palette or search results
- `Enter` — execute a selected command or result
- `Escape` — close an open palette, search overlay, drawer, focus surface, or modal

## Responsive Design

CampusOS supports desktop, tablet, and mobile layouts.

- Desktop keeps the full sidebar and wide data layouts.
- Tablet layouts reduce spacing and adjust grids.
- Mobile layouts use a sidebar drawer with hamburger, close, overlay, and Escape controls.
- Dashboard and analytics panels stack where necessary.
- Focus Mode, search, Command Palette, and notifications fit the viewport.
- Heatmaps can scroll within their own container when required.
- Timetables avoid forcing horizontal overflow onto the page.

## Accessibility

- Semantic HTML5 landmarks are used throughout the application.
- Forms and dynamically created controls have labels or accessible names.
- Interactive elements use appropriate button types.
- Dialogs and result lists use relevant ARIA attributes.
- Keyboard navigation and Escape-key closing are supported.
- Visible `:focus-visible` states are provided.
- Icon-only controls have accessible labels.
- Reduced motion is supported through `prefers-reduced-motion` and the personalization panel.

## Project Structure

```text
CampusOS/
├── README.md
└── campus-os/
    ├── index.html
    ├── courses.html
    ├── schedule.html
    ├── tasks.html
    ├── analytics.html
    │
    ├── css/
    │   ├── base.css
    │   ├── layout.css
    │   ├── components.css
    │   ├── pages.css
    │   ├── advanced.css
    │   └── responsive.css
    │
    ├── js/
    │   ├── data.js
    │   ├── utils.js
    │   ├── main.js
    │   ├── theme.js
    │   ├── navigation.js
    │   ├── search.js
    │   ├── command-palette.js
    │   ├── dashboard.js
    │   ├── courses.js
    │   ├── schedule.js
    │   ├── tasks.js
    │   ├── analytics.js
    │   ├── focus.js
    │   ├── notifications.js
    │   └── personalization.js
    │
    └── assets/
        └── images/
```

## Running the Project

Open the `campus-os` folder and open `index.html` in a browser. You can also open the project in Visual Studio Code and use the **Live Server** extension.

No installation, build command, backend, database, or package manager is required.

## Academic Note

CampusOS was developed as part of a university Web Technologies assignment.
