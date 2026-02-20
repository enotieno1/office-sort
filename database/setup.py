#!/usr/bin/env python3
"""
OOES Database Setup Script
Creates and initializes the SQLite database for the Office Operations Efficiency Solution
"""

import sqlite3
import os
from datetime import datetime

def create_database():
    """Create the OOES database with all necessary tables"""
    
    # Create database directory if it doesn't exist
    os.makedirs('database', exist_ok=True)
    
    # Connect to database
    conn = sqlite3.connect('database/ooes.db')
    cursor = conn.cursor()
    
    try:
        # Create tables
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role VARCHAR(20) DEFAULT 'user',
                department VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                profile_image VARCHAR(255),
                phone VARCHAR(20),
                bio TEXT
            )
        ''')
        
        # Departments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS departments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                manager_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (manager_id) REFERENCES users(id)
            )
        ''')
        
        # Employees table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id VARCHAR(20) UNIQUE NOT NULL,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                department_id INTEGER,
                position VARCHAR(100),
                salary DECIMAL(10,2),
                hire_date DATE,
                status VARCHAR(20) DEFAULT 'active',
                address TEXT,
                emergency_contact VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (department_id) REFERENCES departments(id)
            )
        ''')
        
        # Documents table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                file_path VARCHAR(500) NOT NULL,
                file_size INTEGER,
                file_type VARCHAR(50),
                category VARCHAR(50),
                department_id INTEGER,
                uploaded_by INTEGER,
                version INTEGER DEFAULT 1,
                is_public BOOLEAN DEFAULT 0,
                tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (department_id) REFERENCES departments(id),
                FOREIGN KEY (uploaded_by) REFERENCES users(id)
            )
        ''')
        
        # Tasks table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                assigned_to INTEGER,
                assigned_by INTEGER,
                department_id INTEGER,
                priority VARCHAR(20) DEFAULT 'medium',
                status VARCHAR(20) DEFAULT 'pending',
                due_date DATE,
                completed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (assigned_to) REFERENCES employees(id),
                FOREIGN KEY (assigned_by) REFERENCES users(id),
                FOREIGN KEY (department_id) REFERENCES departments(id)
            )
        ''')
        
        # Events table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP,
                location VARCHAR(200),
                organizer_id INTEGER,
                department_id INTEGER,
                event_type VARCHAR(50) DEFAULT 'meeting',
                is_all_day BOOLEAN DEFAULT 0,
                attendees TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (organizer_id) REFERENCES users(id),
                FOREIGN KEY (department_id) REFERENCES departments(id)
            )
        ''')
        
        # Financial records table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS financial_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_type VARCHAR(20) NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                description TEXT,
                category VARCHAR(50),
                department_id INTEGER,
                recorded_by INTEGER,
                invoice_number VARCHAR(50),
                client_name VARCHAR(100),
                transaction_date DATE,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (department_id) REFERENCES departments(id),
                FOREIGN KEY (recorded_by) REFERENCES users(id)
            )
        ''')
        
        # System logs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action VARCHAR(100) NOT NULL,
                module VARCHAR(50),
                details TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                status VARCHAR(20) DEFAULT 'success',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        # Notifications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(20) DEFAULT 'info',
                is_read BOOLEAN DEFAULT 0,
                action_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        # Settings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key VARCHAR(100) UNIQUE NOT NULL,
                value TEXT,
                description TEXT,
                category VARCHAR(50),
                is_public BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Commit changes
        conn.commit()
        
        # Insert default data
        insert_default_data(cursor, conn)
        
        print("Database created successfully!")
        print("Tables created: users, departments, employees, documents, tasks, events, financial_records, system_logs, notifications, settings")
        
    except Exception as e:
        print(f"Error creating database: {e}")
        conn.rollback()
    finally:
        conn.close()

def insert_default_data(cursor, conn):
    """Insert default data into the database"""
    
    try:
        # Insert default departments
        departments = [
            ('Management', 'Executive management team', None),
            ('Human Resources', 'Employee management and payroll', None),
            ('IT Department', 'Information Technology and systems', None),
            ('Finance', 'Financial management and accounting', None),
            ('Operations', 'Daily operations and logistics', None),
            ('Sales', 'Sales and customer relations', None)
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO departments (name, description, manager_id)
            VALUES (?, ?, ?)
        ''', departments)
        
        # Insert default admin user
        cursor.execute('''
            INSERT OR IGNORE INTO users 
            (username, email, password_hash, full_name, role)
            VALUES (?, ?, ?, ?, ?)
        ''', ('admin', 'admin@ooes.com', 'hashed_password_here', 'admin', 'admin'))
        
        # Insert default settings
        settings = [
            ('company_name', 'OOES - Office Operations Efficiency Solution', 'Company name', 'general', 1),
            ('default_currency', 'USD', 'Default currency for financial records', 'general', 1),
            ('timezone', 'UTC', 'Default timezone', 'general', 1),
            ('date_format', 'YYYY-MM-DD', 'Default date format', 'general', 1),
            ('items_per_page', '25', 'Default pagination', 'general', 1),
            ('enable_notifications', 'true', 'Enable system notifications', 'general', 1),
            ('backup_frequency', 'daily', 'Database backup frequency', 'system', 0)
        ]
        
        for setting in settings:
            cursor.execute('''
                INSERT OR IGNORE INTO settings (key, value, description, category, is_public)
                VALUES (?, ?, ?, ?, ?)
            ''', setting)
        
        conn.commit()
        print("Default data inserted successfully!")
        
    except Exception as e:
        print(f"Error inserting default data: {e}")
        conn.rollback()

if __name__ == "__main__":
    print("Setting up OOES Database...")
    create_database()
    print("Database setup complete!")
