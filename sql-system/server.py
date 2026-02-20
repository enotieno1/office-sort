#!/usr/bin/env python3
import http.server
import socketserver
import os
import sqlite3
import json
from urllib.parse import unquote, urlparse
from datetime import datetime

# Change to the SQL system directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Define the port
PORT = 3004

# Database setup
DATABASES = {
    'main': 'main_database.db',
    'accounting': 'accounting_database.db',
    'hr': 'hr_database.db',
    'inventory': 'inventory_database.db'
}

def initialize_databases():
    """Initialize all databases with sample data"""
    for db_name, db_file in DATABASES.items():
        if not os.path.exists(db_file):
            conn = sqlite3.connect(db_file)
            cursor = conn.cursor()
            
            if db_name == 'main':
                # Main database schema
                cursor.execute('''
                    CREATE TABLE users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        first_name VARCHAR(50),
                        last_name VARCHAR(50),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        is_active BOOLEAN DEFAULT 1
                    )
                ''')
                
                cursor.execute('''
                    CREATE TABLE departments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name VARCHAR(100) NOT NULL,
                        description TEXT,
                        manager_id INTEGER,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (manager_id) REFERENCES users(id)
                    )
                ''')
                
                cursor.execute('''
                    CREATE TABLE projects (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name VARCHAR(200) NOT NULL,
                        description TEXT,
                        start_date DATE,
                        end_date DATE,
                        status VARCHAR(20) DEFAULT 'active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Insert sample data
                cursor.execute('''
                    INSERT INTO users (username, email, first_name, last_name) VALUES
                    ('john_doe', 'john@example.com', 'John', 'Doe'),
                    ('jane_smith', 'jane@example.com', 'Jane', 'Smith'),
                    ('bob_wilson', 'bob@example.com', 'Bob', 'Wilson'),
                    ('alice_brown', 'alice@example.com', 'Alice', 'Brown'),
                    ('charlie_davis', 'charlie@example.com', 'Charlie', 'Davis')
                ''')
                
                cursor.execute('''
                    INSERT INTO departments (name, description, manager_id) VALUES
                    ('Engineering', 'Software development team', 1),
                    ('Sales', 'Sales and marketing team', 2),
                    ('HR', 'Human resources department', 3),
                    ('Finance', 'Financial management', 4),
                    ('Operations', 'Business operations', 5)
                ''')
                
                cursor.execute('''
                    INSERT INTO projects (name, description, start_date, status) VALUES
                    ('Website Redesign', 'Complete overhaul of company website', '2024-01-15', 'active'),
                    ('Mobile App', 'Develop mobile application', '2024-02-01', 'planning'),
                    ('Database Migration', 'Migrate to new database system', '2024-03-01', 'active')
                ''')
                
            elif db_name == 'accounting':
                # Accounting database schema
                cursor.execute('''
                    CREATE TABLE invoices (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        invoice_number VARCHAR(50) UNIQUE NOT NULL,
                        client_name VARCHAR(100) NOT NULL,
                        amount DECIMAL(10,2) NOT NULL,
                        due_date DATE,
                        status VARCHAR(20) DEFAULT 'pending',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                cursor.execute('''
                    CREATE TABLE expenses (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        description VARCHAR(200) NOT NULL,
                        amount DECIMAL(10,2) NOT NULL,
                        category VARCHAR(50),
                        date DATE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Insert sample data
                cursor.execute('''
                    INSERT INTO invoices (invoice_number, client_name, amount, due_date, status) VALUES
                    ('INV-001', 'ABC Corporation', 1500.00, '2024-02-15', 'pending'),
                    ('INV-002', 'XYZ LLC', 2300.00, '2024-02-20', 'paid'),
                    ('INV-003', 'DEF Industries', 800.00, '2024-02-10', 'overdue')
                ''')
                
                cursor.execute('''
                    INSERT INTO expenses (description, amount, category, date) VALUES
                    ('Office Supplies', 150.00, 'Supplies', '2024-02-14'),
                    ('Software License', 99.00, 'Software', '2024-02-13'),
                    ('Client Lunch', 85.00, 'Meals', '2024-02-12')
                ''')
                
            elif db_name == 'hr':
                # HR database schema
                cursor.execute('''
                    CREATE TABLE employees (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        employee_id VARCHAR(20) UNIQUE NOT NULL,
                        first_name VARCHAR(50) NOT NULL,
                        last_name VARCHAR(50) NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        department VARCHAR(50),
                        position VARCHAR(100),
                        salary DECIMAL(10,2),
                        hire_date DATE,
                        is_active BOOLEAN DEFAULT 1
                    )
                ''')
                
                cursor.execute('''
                    CREATE TABLE attendance (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        employee_id INTEGER,
                        date DATE,
                        check_in TIME,
                        check_out TIME,
                        hours_worked DECIMAL(4,2),
                        FOREIGN KEY (employee_id) REFERENCES employees(id)
                    )
                ''')
                
                # Insert sample data
                cursor.execute('''
                    INSERT INTO employees (employee_id, first_name, last_name, email, department, position, salary, hire_date) VALUES
                    ('EMP001', 'John', 'Doe', 'john@company.com', 'Engineering', 'Software Engineer', 75000.00, '2023-01-15'),
                    ('EMP002', 'Jane', 'Smith', 'jane@company.com', 'Sales', 'Sales Manager', 85000.00, '2022-06-01'),
                    ('EMP003', 'Bob', 'Wilson', 'bob@company.com', 'HR', 'HR Specialist', 65000.00, '2023-03-10')
                ''')
                
            elif db_name == 'inventory':
                # Inventory database schema
                cursor.execute('''
                    CREATE TABLE products (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        sku VARCHAR(50) UNIQUE NOT NULL,
                        name VARCHAR(200) NOT NULL,
                        description TEXT,
                        category VARCHAR(50),
                        price DECIMAL(10,2),
                        stock_quantity INTEGER DEFAULT 0,
                        reorder_level INTEGER DEFAULT 10
                    )
                ''')
                
                cursor.execute('''
                    CREATE TABLE inventory_transactions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        product_id INTEGER,
                        transaction_type VARCHAR(20),
                        quantity INTEGER,
                        reference VARCHAR(100),
                        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (product_id) REFERENCES products(id)
                    )
                ''')
                
                # Insert sample data
                cursor.execute('''
                    INSERT INTO products (sku, name, description, category, price, stock_quantity) VALUES
                    ('LAPTOP-001', 'Business Laptop', 'High-performance laptop for business use', 'Electronics', 999.99, 25),
                    ('MOUSE-001', 'Wireless Mouse', 'Ergonomic wireless mouse', 'Electronics', 29.99, 150),
                    ('DESK-001', 'Office Desk', 'Adjustable standing desk', 'Furniture', 499.99, 15)
                ''')
            
            conn.commit()
            conn.close()

# Initialize databases on startup
initialize_databases()

class SQLSystemHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Get the file path
        path = self.translate_path(self.path)
        
        # Handle root path
        if self.path == '/':
            path = 'index.html'
        
        # Handle API routes
        elif self.path.startswith('/api/'):
            self.handle_api_request(self.path)
            return
        
        try:
            # Try to open the file
            with open(path, 'rb') as f:
                # Read the file content
                content = f.read()
                
                # Determine content type
                if path.endswith('.html'):
                    content_type = 'text/html'
                elif path.endswith('.css'):
                    content_type = 'text/css'
                elif path.endswith('.js'):
                    content_type = 'application/javascript'
                elif path.endswith('.json'):
                    content_type = 'application/json'
                elif path.endswith('.png'):
                    content_type = 'image/png'
                elif path.endswith('.jpg') or path.endswith('.jpeg'):
                    content_type = 'image/jpeg'
                elif path.endswith('.gif'):
                    content_type = 'image/gif'
                elif path.endswith('.svg'):
                    content_type = 'image/svg+xml'
                else:
                    content_type = 'application/octet-stream'
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.wfile.write(content)
                
        except FileNotFoundError:
            # File not found - send 404
            self.send_response(404)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<h1>404 Not Found</h1><p>The file was not found on this server.</p>')

    def do_POST(self):
        if self.path.startswith('/api/'):
            self.handle_api_request(self.path)
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def handle_api_request(self, path):
        """Handle API requests for SQL operations"""
        try:
            content_length = self.headers.get('Content-Length')
            if content_length:
                post_data = self.rfile.read(int(content_length))
            else:
                post_data = b''
            
            try:
                data = json.loads(post_data.decode('utf-8')) if post_data else {}
            except:
                data = {}
        except Exception as e:
            data = {}
        
        # API endpoints
        if path == '/api/sql/execute':
            response = self.execute_sql_query(data)
        elif path == '/api/sql/schema':
            response = self.get_database_schema(data)
        elif path.startswith('/api/sql/table/'):
            table_name = path.split('/')[-1]
            response = self.get_table_details(table_name, data)
        else:
            response = {'error': 'API endpoint not found'}
        
        # Send JSON response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def execute_sql_query(self, data):
        """Execute SQL query and return results"""
        query = data.get('query', '').strip()
        database = data.get('database', 'main')
        
        if not query:
            return {'error': 'No query provided'}
        
        try:
            db_file = DATABASES.get(database, DATABASES['main'])
            conn = sqlite3.connect(db_file)
            conn.row_factory = sqlite3.Row  # Enable dictionary-like access
            cursor = conn.cursor()
            
            # Execute query
            cursor.execute(query)
            
            # Determine if it's a SELECT query or other operation
            if query.upper().startswith('SELECT') or query.upper().startswith('WITH') or query.upper().startswith('EXPLAIN'):
                rows = cursor.fetchall()
                data = [dict(row) for row in rows]
                response = {
                    'success': True,
                    'data': data,
                    'rowCount': len(data),
                    'query': query
                }
            else:
                # For INSERT, UPDATE, DELETE operations
                conn.commit()
                response = {
                    'success': True,
                    'rowCount': cursor.rowcount,
                    'message': f'Query executed successfully. {cursor.rowcount} rows affected.',
                    'query': query
                }
            
            conn.close()
            return response
            
        except sqlite3.Error as e:
            return {
                'error': f'SQL Error: {str(e)}',
                'query': query
            }
        except Exception as e:
            return {
                'error': f'Error: {str(e)}',
                'query': query
            }

    def get_database_schema(self, data):
        """Get database schema information"""
        database = data.get('database', 'main')
        
        try:
            db_file = DATABASES.get(database, DATABASES['main'])
            conn = sqlite3.connect(db_file)
            cursor = conn.cursor()
            
            # Get table information
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cursor.fetchall()
            
            table_info = []
            for table in tables:
                table_name = table[0]
                
                # Get row count
                cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                row_count = cursor.fetchone()[0]
                
                # Get column information
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = cursor.fetchall()
                
                table_info.append({
                    'name': table_name,
                    'rows': row_count,
                    'columns': [{'name': col[1], 'type': col[2], 'nullable': not col[3]} for col in columns]
                })
            
            conn.close()
            
            return {
                'success': True,
                'database': database,
                'tables': table_info
            }
            
        except Exception as e:
            return {'error': f'Error getting schema: {str(e)}'}

    def get_table_details(self, table_name, data):
        """Get detailed information about a specific table"""
        database = data.get('database', 'main')
        
        try:
            db_file = DATABASES.get(database, DATABASES['main'])
            conn = sqlite3.connect(db_file)
            cursor = conn.cursor()
            
            # Get column information
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            # Get sample data (first 5 rows)
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
            sample_data = cursor.fetchall()
            
            # Get indexes
            cursor.execute(f"PRAGMA index_list({table_name})")
            indexes = cursor.fetchall()
            
            conn.close()
            
            return {
                'success': True,
                'table': table_name,
                'columns': [{'name': col[1], 'type': col[2], 'nullable': not col[3], 'primary_key': col[5]} for col in columns],
                'sample_data': sample_data,
                'indexes': [{'name': idx[1], 'unique': bool(idx[2])} for idx in indexes]
            }
            
        except Exception as e:
            return {'error': f'Error getting table details: {str(e)}'}

def run_server():
    try:
        # Create and run the server
        with socketserver.TCPServer(("", PORT), SQLSystemHandler) as httpd:
            print(f"SQL Management System running at http://localhost:{PORT}")
            print("Database features available:")
            print("  - Query Editor with syntax highlighting")
            print("  - Database schema browser")
            print("  - Query history tracking")
            print("  - Multiple database support")
            print("  - Export and backup functionality")
            print("  - Real-time query execution")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nSQL Management System stopped.")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    run_server()
