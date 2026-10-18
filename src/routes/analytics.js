// Learning-analytics routes. All scoped to the logged-in user.
// These feed the dashboard summary cards and the Chart.js charts.
const express = require('express');
const db = require('../db/db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();
router.use(requireLogin);

// GET /api/analytics/summary
// Headline numbers: totals, completion rate, overdue, upcoming (next 7 days).
router.get('/summary', (req, res) => {
  try {
    const counts = db
      .prepare(
        `SELECT
           COUNT(*)                                              AS total,
           SUM(status = 'completed')                             AS completed,
           SUM(status = 'pending')                               AS pending,
           SUM(status = 'pending' AND deadline IS NOT NULL
               AND deadline < date('now'))                       AS overdue,
           SUM(status = 'pending' AND deadline IS NOT NULL
               AND deadline BETWEEN date('now')
                   AND date('now', '+7 day'))                    AS upcoming
         FROM tasks WHERE user_id = ?`
      )
      .get(req.session.userId);

    const total = Number(counts.total) || 0;
    const completed = Number(counts.completed) || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      total,
      completed,
      pending: Number(counts.pending) || 0,
      overdue: Number(counts.overdue) || 0,
      upcoming: Number(counts.upcoming) || 0,
      completionRate,
    });
  } catch (err) {
    console.error('summary error:', err);
    res.status(500).json({ error: 'Could not load summary.' });
  }
});

// GET /api/analytics/weekly
// Tasks completed on each of the last 7 days (oldest -> newest).
router.get('/weekly', (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT date(completed_at) AS day, COUNT(*) AS count
           FROM tasks
          WHERE user_id = ?
            AND status = 'completed'
            AND date(completed_at) >= date('now', '-6 day')
          GROUP BY date(completed_at)`
      )
      .all(req.session.userId);

    // Build a lookup, then fill in all 7 days so the chart has no gaps.
    const byDay = {};
    for (const r of rows) byDay[r.day] = Number(r.count);

    const labels = [];
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      data.push(byDay[key] || 0);
    }
    res.json({ labels, data });
  } catch (err) {
    console.error('weekly error:', err);
    res.status(500).json({ error: 'Could not load weekly data.' });
  }
});

// GET /api/analytics/by-category
// Completed vs total tasks per subject/category.
router.get('/by-category', (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT category,
                COUNT(*)                  AS total,
                SUM(status = 'completed') AS completed
           FROM tasks
          WHERE user_id = ?
          GROUP BY category
          ORDER BY total DESC`
      )
      .all(req.session.userId);

    res.json({
      categories: rows.map((r) => ({
        category: r.category || 'General',
        total: Number(r.total),
        completed: Number(r.completed),
      })),
    });
  } catch (err) {
    console.error('by-category error:', err);
    res.status(500).json({ error: 'Could not load category data.' });
  }
});

module.exports = router;
