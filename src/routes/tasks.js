// Task CRUD routes. All routes require login and are scoped to the
// logged-in user (req.session.userId) so users only see their own tasks.
const express = require('express');
const db = require('../db/db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();
router.use(requireLogin);

const PRIORITIES = ['low', 'medium', 'high'];

// Normalise an empty deadline to NULL.
function cleanDeadline(value) {
  return value && String(value).trim() !== '' ? value : null;
}

// Current timestamp as 'YYYY-MM-DD HH:MM:SS' (matches SQLite datetime()).
function now() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// GET /api/tasks?status=&priority=&category=&search=
router.get('/', (req, res) => {
  try {
    const { status, priority, category, search } = req.query;
    const where = ['user_id = ?'];
    const params = [req.session.userId];

    if (status === 'pending' || status === 'completed') {
      where.push('status = ?');
      params.push(status);
    }
    if (PRIORITIES.includes(priority)) {
      where.push('priority = ?');
      params.push(priority);
    }
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    if (search) {
      where.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const rows = db
      .prepare(
        `SELECT task_id, title, description, category, deadline, priority, status,
                created_at, completed_at
           FROM tasks
          WHERE ${where.join(' AND ')}
          ORDER BY status ASC,
                   (deadline IS NULL), deadline ASC,
                   CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END`
      )
      .all(params);
    res.json({ tasks: rows });
  } catch (err) {
    console.error('list tasks error:', err);
    res.status(500).json({ error: 'Could not load tasks.' });
  }
});

// GET /api/tasks/:id
router.get('/:id', (req, res) => {
  try {
    const task = db
      .prepare('SELECT * FROM tasks WHERE task_id = ? AND user_id = ?')
      .get(req.params.id, req.session.userId);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json({ task });
  } catch (err) {
    console.error('get task error:', err);
    res.status(500).json({ error: 'Could not load task.' });
  }
});

// POST /api/tasks  { title, description, category, deadline, priority }
router.post('/', (req, res) => {
  try {
    const title = (req.body.title || '').trim();
    const description = (req.body.description || '').trim();
    const category = (req.body.category || '').trim() || 'General';
    const deadline = cleanDeadline(req.body.deadline);
    const priority = PRIORITIES.includes(req.body.priority) ? req.body.priority : 'medium';

    if (!title) return res.status(400).json({ error: 'Title is required.' });

    const info = db
      .prepare(
        `INSERT INTO tasks (user_id, title, description, category, deadline, priority)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(req.session.userId, title, description, category, deadline, priority);
    const task = db.prepare('SELECT * FROM tasks WHERE task_id = ?').get(info.lastInsertRowid);
    res.status(201).json({ task });
  } catch (err) {
    console.error('create task error:', err);
    res.status(500).json({ error: 'Could not create task.' });
  }
});

// PUT /api/tasks/:id  — update fields (and keep completed_at in sync with status)
router.put('/:id', (req, res) => {
  try {
    const current = db
      .prepare('SELECT * FROM tasks WHERE task_id = ? AND user_id = ?')
      .get(req.params.id, req.session.userId);
    if (!current) return res.status(404).json({ error: 'Task not found.' });

    const title = req.body.title !== undefined ? (req.body.title || '').trim() : current.title;
    if (!title) return res.status(400).json({ error: 'Title is required.' });

    const description = req.body.description !== undefined
      ? (req.body.description || '').trim() : current.description;
    const category = req.body.category !== undefined
      ? ((req.body.category || '').trim() || 'General') : current.category;
    const deadline = req.body.deadline !== undefined
      ? cleanDeadline(req.body.deadline) : current.deadline;
    const priority = PRIORITIES.includes(req.body.priority) ? req.body.priority : current.priority;
    const status = (req.body.status === 'pending' || req.body.status === 'completed')
      ? req.body.status : current.status;

    // completed_at: stamp on transition to completed, clear when reopened.
    let completedAt = current.completed_at;
    if (status === 'completed' && current.status !== 'completed') completedAt = now();
    if (status === 'pending') completedAt = null;

    db.prepare(
      `UPDATE tasks
          SET title = ?, description = ?, category = ?, deadline = ?,
              priority = ?, status = ?, completed_at = ?
        WHERE task_id = ? AND user_id = ?`
    ).run(title, description, category, deadline, priority, status, completedAt,
          req.params.id, req.session.userId);

    const task = db.prepare('SELECT * FROM tasks WHERE task_id = ?').get(req.params.id);
    res.json({ task });
  } catch (err) {
    console.error('update task error:', err);
    res.status(500).json({ error: 'Could not update task.' });
  }
});

// PATCH /api/tasks/:id/toggle  — flip pending <-> completed in one click
router.patch('/:id/toggle', (req, res) => {
  try {
    const row = db
      .prepare('SELECT status FROM tasks WHERE task_id = ? AND user_id = ?')
      .get(req.params.id, req.session.userId);
    if (!row) return res.status(404).json({ error: 'Task not found.' });

    const newStatus = row.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? now() : null;

    db.prepare(
      'UPDATE tasks SET status = ?, completed_at = ? WHERE task_id = ? AND user_id = ?'
    ).run(newStatus, completedAt, req.params.id, req.session.userId);

    const task = db.prepare('SELECT * FROM tasks WHERE task_id = ?').get(req.params.id);
    res.json({ task });
  } catch (err) {
    console.error('toggle task error:', err);
    res.status(500).json({ error: 'Could not update task.' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  try {
    const info = db
      .prepare('DELETE FROM tasks WHERE task_id = ? AND user_id = ?')
      .run(req.params.id, req.session.userId);
    if (info.changes === 0) return res.status(404).json({ error: 'Task not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('delete task error:', err);
    res.status(500).json({ error: 'Could not delete task.' });
  }
});

module.exports = router;
