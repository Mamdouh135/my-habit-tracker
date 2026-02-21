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
    // create with blank profile columns as well
    await db.run('INSERT INTO users (username, password, name, avatar) VALUES (?, ?, ?, ?)', [username, hash, '', '']);
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
  // include profile info (id/name/avatar/username) so client can populate immediately
  res.json({ token, profile: { id: user.id, name: user.name || '', avatar: user.avatar || '', username: user.username } });
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

// helper to add profile columns if missing
async function ensureProfileColumns(db) {
  try { await db.run('ALTER TABLE users ADD COLUMN name TEXT'); } catch {}
  try { await db.run('ALTER TABLE users ADD COLUMN avatar TEXT'); } catch {}
}

// Get habits (for logged-in user)
router.get('/habits', auth, async (req, res) => {
  const db = await openDb();
  const habits = await db.all('SELECT * FROM habits WHERE userId = ?', [req.userId]);
  res.json(habits);
});

// Profile retrieval
router.get('/profile', auth, async (req, res) => {
  const db = await openDb();
  await ensureProfileColumns(db);
  const user = await db.get('SELECT id, name, avatar, username FROM users WHERE id = ?', [req.userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name || '', avatar: user.avatar || '', username: user.username });
});

// Profile update
router.post('/profile', auth, async (req, res) => {
  const { name, avatar } = req.body;
  const db = await openDb();
  await ensureProfileColumns(db);
  // only update what was provided
  if (name !== undefined) {
    await db.run('UPDATE users SET name = ? WHERE id = ?', [name, req.userId]);
  }
  if (avatar !== undefined) {
    await db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatar, req.userId]);
  }
  const user = await db.get('SELECT name, avatar, username FROM users WHERE id = ?', [req.userId]);
  res.json({ name: user.name || '', avatar: user.avatar || '' });
});

// helper to append a log entry
async function logAction(db, userId, habitId, action) {
  await db.run(
    'INSERT INTO habit_logs (userId, habitId, action, performedAt) VALUES (?, ?, ?, ?)',
    [userId, habitId || null, action, new Date().toISOString()]
  );
}

// Add habit
router.post('/habits', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  const db = await openDb();
  const result = await db.run('INSERT INTO habits (userId, name, createdAt) VALUES (?, ?, ?)', [req.userId, name, new Date().toISOString()]);
  const habit = await db.get('SELECT * FROM habits WHERE id = ?', [result.lastID]);
  // record log
  await logAction(db, req.userId, habit.id, `Added habit "${name}"`);
  res.json(habit);
});

// Delete habit
router.delete('/habits/:id', auth, async (req, res) => {
  const db = await openDb();
  // log before delete so we can include name
  const habit = await db.get('SELECT name FROM habits WHERE id = ? AND userId = ?', [req.params.id, req.userId]);
  if (habit) {
    await logAction(db, req.userId, req.params.id, `Deleted habit "${habit.name}"`);
  }
  await db.run('DELETE FROM habits WHERE id = ? AND userId = ?', [req.params.id, req.userId]);
  res.json({ success: true });
});

// Mark habit as completed for a date
router.post('/habits/:id/complete', auth, async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: 'Missing date' });
  const db = await openDb();
  await db.run('INSERT INTO habit_completions (habitId, date) VALUES (?, ?)', [req.params.id, date]);
  await logAction(db, req.userId, req.params.id, `Completed habit on ${date}`);
  res.json({ success: true });
});

// Get completions for a habit
router.get('/habits/:id/completions', auth, async (req, res) => {
  const db = await openDb();
  const completions = await db.all('SELECT date FROM habit_completions WHERE habitId = ?', [req.params.id]);
  res.json(completions);
});


// fetch logs for current user
router.get('/logs', auth, async (req, res) => {
  const db = await openDb();
  const rows = await db.all(
    `SELECT hl.action, hl.performedAt, h.name as habitName
     FROM habit_logs hl LEFT JOIN habits h ON hl.habitId = h.id
     WHERE hl.userId = ?
     ORDER BY hl.performedAt DESC`,
    [req.userId]
  );
  res.json(rows);
});


export default router;
