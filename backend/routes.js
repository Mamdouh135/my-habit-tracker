import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { openDb } from './database.js';

const router = express.Router();
const JWT_SECRET = 'replace_this_with_env_secret';

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const db = await openDb();
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'Username taken' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await openDb();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    const { userId } = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get habits (for logged-in user)
router.get('/habits', auth, async (req, res) => {
  const db = await openDb();
  const habits = await db.all('SELECT * FROM habits WHERE userId = ?', [req.userId]);
  res.json(habits);
});

// Get current user info (including tutorialSeen)
router.get('/me', auth, async (req, res) => {
  const db = await openDb();
  const user = await db.get('SELECT id, username, COALESCE(tutorialSeen, 0) as tutorialSeen FROM users WHERE id = ?', [req.userId]);
  res.json(user);
});

// Mark tutorial as seen for the logged-in user
router.post('/me/tutorial-seen', auth, async (req, res) => {
  const db = await openDb();
  await db.run('UPDATE users SET tutorialSeen = 1 WHERE id = ?', [req.userId]);
  res.json({ success: true });
});

// Add habit
router.post('/habits', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  const db = await openDb();
  await db.run('INSERT INTO habits (userId, name, createdAt) VALUES (?, ?, ?)', [req.userId, name, new Date().toISOString()]);
  res.json({ success: true });
});

// Delete habit
router.delete('/habits/:id', auth, async (req, res) => {
  const db = await openDb();
  await db.run('DELETE FROM habits WHERE id = ? AND userId = ?', [req.params.id, req.userId]);
  res.json({ success: true });
});

// Mark habit as completed for a date
router.post('/habits/:id/complete', auth, async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: 'Missing date' });
  const db = await openDb();
  await db.run('INSERT INTO habit_completions (habitId, date) VALUES (?, ?)', [req.params.id, date]);
  res.json({ success: true });
});

// Get completions for a habit
router.get('/habits/:id/completions', auth, async (req, res) => {
  const db = await openDb();
  const completions = await db.all('SELECT date FROM habit_completions WHERE habitId = ?', [req.params.id]);
  res.json(completions);
});

export default router;
