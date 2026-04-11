import sqlite3

conn = sqlite3.connect('database.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Check daily_stats
cur.execute('SELECT COUNT(*) as cnt FROM daily_stats')
print(f'daily_stats rows: {cur.fetchone()["cnt"]}')

# Check if there's data for today
from datetime import date
today = date.today().isoformat()
cur.execute('SELECT COUNT(*) as cnt FROM daily_stats WHERE date = ?', (today,))
print(f'Today\'s stats ({today}): {cur.fetchone()["cnt"]}')

# Get sample data
cur.execute('SELECT * FROM daily_stats LIMIT 3')
rows = cur.fetchall()
print('\nSample daily_stats:')
for row in rows:
    print(dict(row))

# Check risk_scores
cur.execute('SELECT COUNT(*) as cnt FROM risk_scores')
print(f'\nrisk_scores rows: {cur.fetchone()["cnt"]}')

cur.execute('SELECT COUNT(*) as cnt FROM risk_scores WHERE date = ?', (today,))
print(f'Today\'s risk_scores: {cur.fetchone()["cnt"]}')

# Get top 5 districts
cur.execute('''
    SELECT d.name, r.score, r.risk_level, r.primary_disease
    FROM risk_scores r
    JOIN districts d ON d.id = r.district_id
    WHERE r.date = ?
    ORDER BY r.score DESC
    LIMIT 5
''', (today,))
print('\nTop 5 districts today:')
for row in cur.fetchall():
    print(dict(row))

# Check if Ludhiana is in top 5
cur.execute('''
    SELECT d.name, r.score, r.risk_level
    FROM risk_scores r
    JOIN districts d ON d.id = r.district_id
    WHERE r.date = ? AND d.name LIKE '%Ludhiana%'
''', (today,))
ludhiana = cur.fetchone()
print(f'\nLudhiana score: {dict(ludhiana) if ludhiana else "Not found"}')

conn.close()
