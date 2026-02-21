const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('backend/habits.db');
db.all('SELECT id,username,name,avatar FROM users',[],(err,rows)=>{
  if(err) console.error(err);
  else console.log(rows);
  db.close();
});