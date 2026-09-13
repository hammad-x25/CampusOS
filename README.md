# CampusOS

CampusOS is a student productivity dashboard for organising academic information in one place. It provides an overview of study activity, courses, weekly classes, tasks, and academic calculations using HTML5, CSS3, and Vanilla JavaScript.

## Features

- Dashboard overview with academic statistics and progress summaries
- Course Command Center with search, category filters, and course details
- Interactive weekly schedule with weekday selection and class details
- Task Manager with task creation, editing, completion, deletion, filtering, and search
- GPA Calculator based on credit hours and grade points
- Attendance Calculator with percentage and attendance-status guidance
- Dark and light theme switching with saved preference
- Responsive interface for desktop, tablet, and mobile screen sizes

## Technologies

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Vanilla%20JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JavaScript">
  <img src="https://img.shields.io/badge/localStorage-Web%20Storage-6950C7?style=for-the-badge" alt="localStorage Web Storage API">
</p>

- **HTML5** — semantic page structure and accessible form elements
- **CSS3** — layout, responsive design, themes, animations, and visual styling
- **Vanilla JavaScript** — page interactions and DOM updates without a framework
- **localStorage** — saves the selected theme and task data in the browser

## Pages

- **Overview (`index.html`)** — Displays the academic dashboard, statistics, schedule preview, deadlines, and progress.
- **Courses (`courses.html`)** — Lists active courses and supports search, category filtering, and course detail modals.
- **Schedule (`schedule.html`)** — Shows the weekly timetable with weekday selection, week controls, and class detail modals.
- **Tasks (`tasks.html`)** — Provides task management features including adding, editing, completing, deleting, searching, and filtering tasks.
- **Analytics (`analytics.html`)** — Contains the GPA calculator, attendance calculator, and course performance overview.

## JavaScript Concepts Used

- DOM manipulation
- Event listeners
- Arrays and objects
- Reusable functions
- Form validation
- `localStorage`
- `JSON.stringify()` and `JSON.parse()`
- The JavaScript `Date` object

## Project Structure

```text
campus-os/
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
│   └── responsive.css
│
├── js/
│   ├── main.js
│   ├── theme.js
│   ├── navigation.js
│   ├── courses.js
│   ├── schedule.js
│   ├── tasks.js
│   └── analytics.js
│
└── assets/
    └── images/
```

## Running the Project

Open the `campus-os` folder and open `index.html` directly in a web browser. Alternatively, open the folder in Visual Studio Code and start the project with the **Live Server** extension. No backend, database, package installation, or build process is required.

## Academic Note

CampusOS was developed as part of a Web Technologies university assignment.
