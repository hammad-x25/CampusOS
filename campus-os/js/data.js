// Shared CampusOS data. User changes remain in localStorage; these values are the static defaults.
(function () {
  const campusData = {
    student: {
      name: 'John',
      initials: 'JS',
      program: 'BS Computer Science',
      semester: 5
    },
    semester: {
      number: 5,
      currentWeek: 7,
      totalWeeks: 16,
      completedCredits: 72,
      totalCredits: 130,
      completion: 68,
      currentGpa: 3.74,
      overallAttendance: 87
    },
    courses: [
      {
        id: 'web-technologies',
        code: 'CS-312',
        title: 'Web Technologies',
        instructor: 'Dr. Noman Shafi',
        credits: 3,
        category: 'computing',
        progress: 72,
        currentGrade: 'A-',
        attendance: { attended: 9, total: 10 },
        room: 'Room CS-301',
        nextClass: { day: 'Monday', dayIndex: 1, start: '09:00', end: '10:30', startMinutes: 540, endMinutes: 630 },
        assessment: { title: 'Assignment 01', type: 'Assignment', weight: 10, due: '2026-09-15T23:59:00', priority: 'high' },
        performance: { assignments: 85, quizzes: 78, midterm: 82, participation: 90 },
        skills: { Programming: 88, 'Problem Solving': 74, Design: 82 }
      },
      {
        id: 'artificial-intelligence',
        code: 'CS-421',
        title: 'Artificial Intelligence',
        instructor: 'Dr. Amina Khan',
        credits: 3,
        category: 'computing',
        progress: 64,
        currentGrade: 'A',
        attendance: { attended: 13, total: 17 },
        room: 'AI Lab',
        nextClass: { day: 'Tuesday', dayIndex: 2, start: '11:00', end: '12:30', startMinutes: 660, endMinutes: 750 },
        assessment: { title: 'AI Quiz', type: 'Quiz', weight: 15, due: '2026-09-17T10:00:00', priority: 'medium' },
        performance: { assignments: 82, quizzes: 86, midterm: 84, participation: 76 },
        skills: { 'Problem Solving': 92, Programming: 78, Systems: 62 }
      },
      {
        id: 'database-systems',
        code: 'CS-305',
        title: 'Database Systems',
        instructor: 'Prof. Farhan Ali',
        credits: 3,
        category: 'core',
        progress: 81,
        currentGrade: 'B+',
        attendance: { attended: 14, total: 15 },
        room: 'Room CS-205',
        nextClass: { day: 'Wednesday', dayIndex: 3, start: '10:00', end: '11:30', startMinutes: 600, endMinutes: 690 },
        assessment: { title: 'Database Project', type: 'Project', weight: 25, due: '2026-09-22T23:59:00', priority: 'high' },
        performance: { assignments: 91, quizzes: 89, midterm: 93, participation: 88 },
        skills: { Databases: 96, 'Problem Solving': 80, Programming: 68 }
      },
      {
        id: 'human-computer-interaction',
        code: 'CS-318',
        title: 'Human Computer Interaction',
        instructor: 'Ms. Sara Malik',
        credits: 3,
        category: 'elective',
        progress: 58,
        currentGrade: 'A-',
        attendance: { attended: 13, total: 16 },
        room: 'Design Studio 2',
        nextClass: { day: 'Thursday', dayIndex: 4, start: '08:00', end: '09:00', startMinutes: 480, endMinutes: 540 },
        assessment: { title: 'Usability Testing Report', type: 'Report', weight: 20, due: '2026-09-24T23:59:00', priority: 'medium' },
        performance: { assignments: 88, quizzes: 80, midterm: 84, participation: 90 },
        skills: { Design: 94, Communication: 88, 'Problem Solving': 72 }
      },
      {
        id: 'operating-systems',
        code: 'CS-401',
        title: 'Operating Systems',
        instructor: 'Dr. Bilal Ahmed',
        credits: 3,
        category: 'core',
        progress: 69,
        currentGrade: 'A',
        attendance: { attended: 10, total: 15 },
        room: 'Room CS-402',
        nextClass: { day: 'Wednesday', dayIndex: 3, start: '14:00', end: '16:00', startMinutes: 840, endMinutes: 960 },
        assessment: { title: 'Process Scheduling Lab', type: 'Lab', weight: 15, due: '2026-09-26T23:59:00', priority: 'high' },
        performance: { assignments: 78, quizzes: 74, midterm: 80, participation: 76 },
        skills: { Systems: 91, Programming: 76, 'Problem Solving': 84 }
      },
      {
        id: 'software-engineering',
        code: 'CS-410',
        title: 'Software Engineering',
        instructor: 'Dr. Hamza Raza',
        credits: 3,
        category: 'computing',
        progress: 76,
        currentGrade: 'B+',
        attendance: { attended: 8, total: 10 },
        room: 'Room SE-110',
        nextClass: { day: 'Monday', dayIndex: 1, start: '13:00', end: '14:00', startMinutes: 780, endMinutes: 840 },
        assessment: { title: 'Sprint Planning Review', type: 'Review', weight: 10, due: '2026-09-29T23:59:00', priority: 'low' },
        performance: { assignments: 86, quizzes: 79, midterm: 81, participation: 87 },
        skills: { Communication: 84, 'Problem Solving': 82, Systems: 68 }
      }
    ],
    schedule: [
      { courseId: 'web-technologies', day: 'Monday', dayIndex: 1, start: '09:00', end: '10:30', startMinutes: 540, endMinutes: 630, room: 'Room CS-301' },
      { courseId: 'software-engineering', day: 'Monday', dayIndex: 1, start: '13:00', end: '14:00', startMinutes: 780, endMinutes: 840, room: 'Room SE-110' },
      { courseId: 'artificial-intelligence', day: 'Tuesday', dayIndex: 2, start: '11:00', end: '12:30', startMinutes: 660, endMinutes: 750, room: 'AI Lab' },
      { courseId: 'human-computer-interaction', day: 'Tuesday', dayIndex: 2, start: '14:00', end: '15:30', startMinutes: 840, endMinutes: 930, room: 'Design Studio 2' },
      { courseId: 'database-systems', day: 'Wednesday', dayIndex: 3, start: '10:00', end: '11:30', startMinutes: 600, endMinutes: 690, room: 'Room CS-205' },
      { courseId: 'operating-systems', day: 'Wednesday', dayIndex: 3, start: '14:00', end: '16:00', startMinutes: 840, endMinutes: 960, room: 'Room CS-402' },
      { courseId: 'human-computer-interaction', day: 'Thursday', dayIndex: 4, start: '08:00', end: '09:00', startMinutes: 480, endMinutes: 540, room: 'Design Studio 2' },
      { courseId: 'artificial-intelligence', day: 'Thursday', dayIndex: 4, start: '13:00', end: '14:00', startMinutes: 780, endMinutes: 840, room: 'Room AI-204' },
      { courseId: 'software-engineering', day: 'Friday', dayIndex: 5, start: '10:00', end: '11:30', startMinutes: 600, endMinutes: 690, room: 'Room SE-110' },
      { courseId: 'database-systems', day: 'Friday', dayIndex: 5, start: '15:00', end: '16:00', startMinutes: 900, endMinutes: 960, room: 'Room CS-205' }
    ],
    assessments: [
      { id: 'web-assignment-01', courseId: 'web-technologies', title: 'Web Technologies Assignment', shortTitle: 'Assignment 01', type: 'Assignment', due: '2026-09-15T23:59:00', priority: 'high' },
      { id: 'ai-quiz-01', courseId: 'artificial-intelligence', title: 'AI Quiz', shortTitle: 'AI Quiz', type: 'Quiz', due: '2026-09-17T10:00:00', priority: 'medium' },
      { id: 'database-project-01', courseId: 'database-systems', title: 'Database Project', shortTitle: 'Database Project', type: 'Project', due: '2026-09-22T23:59:00', priority: 'high' },
      { id: 'hci-report-01', courseId: 'human-computer-interaction', title: 'HCI Usability Report', shortTitle: 'Usability Report', type: 'Report', due: '2026-09-24T23:59:00', priority: 'medium' },
      { id: 'os-lab-01', courseId: 'operating-systems', title: 'Operating Systems Lab', shortTitle: 'Scheduling Lab', type: 'Lab', due: '2026-09-26T23:59:00', priority: 'high' }
    ],
    skillMap: {
      Programming: 88,
      'Problem Solving': 80,
      Design: 75,
      Databases: 91,
      Systems: 70,
      Communication: 83
    },
    degreeMatrix: [
      { title: 'Programming Fundamentals', state: 'completed' },
      { title: 'Object-Oriented Programming', state: 'completed' },
      { title: 'Data Structures', state: 'completed' },
      { title: 'Database Systems', state: 'completed', courseId: 'database-systems' },
      { title: 'Web Technologies', state: 'current', courseId: 'web-technologies' },
      { title: 'Artificial Intelligence', state: 'current', courseId: 'artificial-intelligence' },
      { title: 'Computer Networks', state: 'upcoming' },
      { title: 'Final Year Project', state: 'upcoming' }
    ],
    studyActivity: [
      [18, 42, 76, 22, 54, 10, 0],
      [35, 68, 92, 15, 80, 31, 12],
      [76, 12, 58, 88, 64, 20, 8],
      [44, 72, 95, 38, 68, 24, 16]
    ]
  };

  const storageKeys = {
    theme: 'campus-theme',
    tasks: 'campus-tasks',
    focusSessions: 'campus-focus-sessions',
    notificationsRead: 'campus-notifications-read',
    preferences: 'campus-preferences',
    lastLocalSave: 'campus-last-local-save'
  };

  function getCourseById(courseId) {
    return campusData.courses.find((course) => course.id === courseId);
  }

  function getTasks() {
    const savedTasks = localStorage.getItem(storageKeys.tasks);

    if (!savedTasks) {
      return [
        { id: 1, title: 'Web Technologies Assignment', course: 'Web Technologies', deadline: '2026-09-14', priority: 'high', completed: false },
        { id: 2, title: 'AI Quiz Preparation', course: 'Artificial Intelligence', deadline: '2026-09-16', priority: 'high', completed: false },
        { id: 3, title: 'Database Project Schema', course: 'Database Systems', deadline: '2026-09-20', priority: 'medium', completed: false },
        { id: 4, title: 'HCI Wireframe Review', course: 'Human Computer Interaction', deadline: '2026-09-21', priority: 'low', completed: false },
        { id: 5, title: 'Operating Systems Process Lab', course: 'Operating Systems', deadline: '2026-09-23', priority: 'medium', completed: false },
        { id: 6, title: 'Software Engineering Sprint Notes', course: 'Software Engineering', deadline: '2026-09-25', priority: 'low', completed: false },
        { id: 7, title: 'Read DOM Events Chapter', course: 'Web Technologies', deadline: '2026-09-08', priority: 'low', completed: true },
        { id: 8, title: 'Practice SQL Joins', course: 'Database Systems', deadline: '2026-09-09', priority: 'medium', completed: true },
        { id: 9, title: 'Revise Search Algorithms', course: 'Artificial Intelligence', deadline: '2026-09-10', priority: 'low', completed: true },
        { id: 10, title: 'Submit User Persona Report', course: 'Human Computer Interaction', deadline: '2026-09-11', priority: 'low', completed: true }
      ];
    }

    try {
      const parsedTasks = JSON.parse(savedTasks);
      return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch (error) {
      return [];
    }
  }

  function getFocusSessions() {
    const savedSessions = localStorage.getItem(storageKeys.focusSessions);

    if (!savedSessions) {
      return [];
    }

    try {
      const parsedSessions = JSON.parse(savedSessions);
      return Array.isArray(parsedSessions) ? parsedSessions : [];
    } catch (error) {
      return [];
    }
  }

  window.CampusOS = window.CampusOS || {};
  window.CampusOS.data = campusData;
  window.CampusOS.storageKeys = storageKeys;
  window.CampusOS.getCourseById = getCourseById;
  window.CampusOS.getTasks = getTasks;
  window.CampusOS.getFocusSessions = getFocusSessions;
})();
