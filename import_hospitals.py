import csv
import sqlite3
import os

def import_hospitals(csv_file):
    """Import hospital data from CSV to SQLite database"""
    # Configure database path
    instance_path = os.path.join(os.getcwd(), 'instance')
    db_file = os.path.join(instance_path, 'database.db')
    
    # Create database connection
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Recreate hospitals table
    cursor.execute("DROP TABLE IF EXISTS hospitals")
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
    
    # Import CSV data
    row_count = 0
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = csv.reader(file)
        next(reader)  # Skip header
        
        for row in reader:
            if len(row) == 24:
                cursor.execute("INSERT INTO hospitals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", row)
                row_count += 1
                
                # Print progress
                if row_count % 100 == 0:
                    print(f"Imported {row_count} records...")
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    print(f"Successfully imported {row_count} records")

if __name__ == '__main__':
    # Replace with your actual CSV path
    csv_path = r'C:/Users/ASUS/Desktop/MIS_project2/dataset'
    import_hospitals(csv_path)