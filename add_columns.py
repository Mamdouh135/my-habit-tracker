import sqlite3
conn=sqlite3.connect('backend/habits.db')
c=conn.cursor()
for col in ['name','avatar']:
    try:
        c.execute(f'ALTER TABLE users ADD COLUMN {col} TEXT')
        print('added',col)
    except Exception as e:
        print('err',col,e)
conn.commit()
c.execute("PRAGMA table_info(users)")
print(c.fetchall())
conn.close()