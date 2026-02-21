const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('habits.db');
db.serialize(() => {
  db.all('SELECT * FROM users', (e, r) => { console.log('users', r); });
  db.all('SELECT * FROM habits', (e, r) => { console.log('habits', r); });
  db.all('SELECT * FROM habit_logs', (e, r) => { console.log('logs', r); });
});
