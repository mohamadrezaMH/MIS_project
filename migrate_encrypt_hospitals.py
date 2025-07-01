import sqlite3
from crypto_utils import encrypt_value

DB_PATH = 'instance/database.db'
TABLE = 'hospitals'
NAME_FIELD = 'Facility_Name'

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute(f'SELECT * FROM {TABLE} LIMIT 1')
columns = [desc[0] for desc in cursor.description]

cursor.execute(f'SELECT rowid, * FROM {TABLE}')
rows = cursor.fetchall()

for row in rows:
    rowid = row[0]
    data = dict(zip(['rowid'] + columns, row))
    update_fields = []
    update_values = []
    for col in columns:
        if col == NAME_FIELD:
            continue
        encrypted = encrypt_value(data[col])
        update_fields.append(f'{col} = ?')
        update_values.append(encrypted)
    if update_fields:
        update_values.append(rowid)
        sql = f"UPDATE {TABLE} SET {', '.join(update_fields)} WHERE rowid = ?"
        cursor.execute(sql, update_values)

conn.commit()
conn.close()
print('Migration completed: All fields (except Facility_Name) encrypted.') 