# Student Task Management System with Learning Analytics

A web-based system that helps students organize academic tasks, track deadlines,
and view simple productivity analytics (completion rate, weekly progress, overdue
alerts, and tasks per subject).

Built for a final-year project using the recommended architecture:

- **Frontend:** HTML, CSS, JavaScript + [Chart.js](https://www.chartjs.org/)
- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`) — zero-config, no server to install
- **Auth:** simple email + password login (sessions, passwords hashed with bcrypt)

---

## Features

- Register / login / logout (email + password)
- Create, edit, delete tasks
- Title, description, category/subject, deadline, priority, status
- Mark tasks complete with one click
- Search and filter by status / priority
- Dashboard with summary cards and analytics charts:
  - **Completion rate**
  - **Weekly productivity** (tasks completed in the last 7 days)
  - **Tasks by category** (completed vs total)
  - **Overdue / upcoming alerts**

---

## Project structure

```
student-managment-system/
├── package.json
├── .env.example           # copy to .env and fill in
├── README.md
└── src/                   # all application source code
    ├── server.js          # Express app entry point
    ├── db/
    │   ├── schema.sql     # tables
    │   ├── init.js        # creates the DB from schema.sql
    │   └── db.js          # shared SQLite connection
    ├── middleware/
    │   └── auth.js        # "is the user logged in?" guard
    ├── routes/
    │   ├── auth.js        # register / login / logout / me
    │   ├── tasks.js       # task CRUD + complete toggle
    │   └── analytics.js   # summary / weekly / by-category
    └── public/            # frontend (served as static files)
        ├── index.html     # login + register
        ├── dashboard.html # main app
        ├── css/style.css
        └── js/
            ├── api.js     # fetch helper
            ├── auth.js    # login page logic
            └── dashboard.js  # tasks + charts
```

---

## Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- That's it — SQLite needs no separate database server.

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment (optional)
The defaults work out of the box. To customise, copy the example file:
```bash
cp .env.example .env
```
```
PORT=3000
DB_FILE=src/db/student_tasks.db
SESSION_SECRET=any_long_random_string
```

### 4. Create the database and tables
```bash
npm run init-db
```
This runs `db/schema.sql`, creating the SQLite database file and the
`users` and `tasks` tables.

### 5. Start the server
```bash
npm start          # or: npm run dev  (auto-restart on changes)
```
Open **http://localhost:3000** in your browser.

---

## Database schema

**users**

| Field      | Type             | Notes          |
|------------|------------------|----------------|
| user_id    | INTEGER (PK)     | auto-increment |
| name       | TEXT             |                |
| email      | TEXT             | unique         |
| password   | TEXT             | bcrypt hash    |
| created_at | TEXT (datetime)  |                |

**tasks**

| Field        | Type                          | Notes                          |
|--------------|-------------------------------|--------------------------------|
| task_id      | INTEGER (PK)                  | auto-increment                 |
| user_id      | INTEGER (FK → users)          | owner                          |
| title        | TEXT                          |                                |
| description  | TEXT                          |                                |
| category     | TEXT                          | subject/category for analytics |
| deadline     | TEXT ('YYYY-MM-DD')           |                                |
| priority     | TEXT (low / medium / high)    | CHECK constraint               |
| status       | TEXT (pending / completed)    | CHECK constraint               |
| created_at   | TEXT (datetime)               |                                |
| completed_at | TEXT (datetime)               | used for the weekly chart      |

---

## API reference

All `/api/tasks` and `/api/analytics` routes require login.

### Auth
| Method | Endpoint            | Body                          |
|--------|---------------------|-------------------------------|
| POST   | /api/auth/register  | `{ name, email, password }`   |
| POST   | /api/auth/login     | `{ email, password }`         |
| POST   | /api/auth/logout    | —                             |
| GET    | /api/auth/me        | —                             |

### Tasks
| Method | Endpoint                  | Notes                                   |
|--------|---------------------------|-----------------------------------------|
| GET    | /api/tasks                | filters: `?status=&priority=&category=&search=` |
| GET    | /api/tasks/:id            |                                         |
| POST   | /api/tasks                | `{ title, description, category, deadline, priority }` |
| PUT    | /api/tasks/:id            | update any field (incl. `status`)       |
| PATCH  | /api/tasks/:id/toggle     | flip pending ↔ completed                |
| DELETE | /api/tasks/:id            |                                         |

### Analytics
| Method | Endpoint                     | Returns                              |
|--------|------------------------------|--------------------------------------|
| GET    | /api/analytics/summary       | totals, completion rate, overdue, upcoming |
| GET    | /api/analytics/weekly        | completed-per-day for last 7 days    |
| GET    | /api/analytics/by-category   | completed vs total per category      |

---

## Testing checklist (for the report)

- [ ] Register a new account, then log in / log out
- [ ] Add a task with a deadline and priority
- [ ] Edit a task; delete a task
- [ ] Mark a task complete and reopen it
- [ ] Add a task with a past deadline → confirm it shows as **overdue**
- [ ] Check the completion rate updates as tasks are completed
- [ ] Complete tasks on different days → confirm the weekly chart updates
- [ ] Add tasks in different categories → confirm the category chart

---

## Possible future improvements
- Mobile application support
- Advanced predictive analytics
- AI-based study recommendations
