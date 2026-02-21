import sqlite3
conn=sqlite3.connect('backend/habits.db')
c=conn.cursor()
c.execute('SELECT id,username,name,avatar FROM users')
print(c.fetchall())
conn.close()