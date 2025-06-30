import csv
import sqlite3
from flask import Flask
import os

def import_hospitals(csv_file):
    # ایجاد یک برنامه Flask موقت برای دسترسی به instance_path
    app = Flask(__name__)
    app.instance_path = os.path.join(os.getcwd(), 'instance')  # تنظیم مسیر instance
    
    # مسیر دیتابیس
    db_file = os.path.join(app.instance_path, 'database.db')
    print(f"استفاده از دیتابیس: {db_file}")
    
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # 1. حذف جدول قدیمی اگر وجود دارد
    cursor.execute("DROP TABLE IF EXISTS hospitals")
    
    # 2. ایجاد جدول جدید با ساختار صحیح (بدون فیلد id)
    cursor.execute("""
    CREATE TABLE hospitals (
        Facility_Name TEXT,
        Facility_City TEXT,
        Facility_State TEXT,
        Facility_Type TEXT,
        Rating_Overall TEXT,
        Rating_Mortality TEXT,
        Rating_Safety TEXT,
        Rating_Readmission TEXT,
        Rating_Experience TEXT,
        Rating_Effectiveness TEXT,
        Rating_Timeliness TEXT,
        Rating_Imaging TEXT,
        Procedure_Heart_Attack_Cost TEXT,
        Procedure_Heart_Attack_Quality TEXT,
        Procedure_Heart_Attack_Value TEXT,
        Procedure_Heart_Failure_Cost TEXT,
        Procedure_Heart_Failure_Quality TEXT,
        Procedure_Heart_Failure_Value TEXT,
        Procedure_Pneumonia_Cost TEXT,
        Procedure_Pneumonia_Quality TEXT,
        Procedure_Pneumonia_Value TEXT,
        Procedure_Hip_Knee_Cost TEXT,
        Procedure_Hip_Knee_Quality TEXT,
        Procedure_Hip_Knee_Value TEXT
    );
    """)
    
    row_count = 0
    
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = csv.reader(file)
        next(reader)  # رد کردن هدر
        
        for row in reader:
            if len(row) == 24:
                cursor.execute("""
                INSERT INTO hospitals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                                             ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                                             ?, ?, ?, ?)
                """, row)
                row_count += 1
                # نمایش هر 100 رکورد
                if row_count % 100 == 0:
                    print(f"{row_count} رکورد وارد شد...")
    
    conn.commit()
    print(f"جمعاً {row_count} رکورد وارد شد")
    conn.close()

if __name__ == '__main__':
    import_hospitals(r'C:\Users\ASUS\Desktop\create database\hospitals.csv')