#!/usr/bin/env python3
import http.server
import socketserver
import os
import json
from urllib.parse import unquote
from datetime import datetime
import sqlite3

# Change to the Excel system directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Define the port
PORT = 3005

# Database setup
DATABASE_FILE = 'excel_files.db'

def initialize_database():
    """Initialize the Excel files database"""
    if not os.path.exists(DATABASE_FILE):
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        
        # Create tables for Excel file management
        cursor.execute('''
            CREATE TABLE excel_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename VARCHAR(255) NOT NULL,
                filepath VARCHAR(500) NOT NULL,
                file_size INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                file_type VARCHAR(50),
                category VARCHAR(100),
                tags TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE excel_sheets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_id INTEGER,
                sheet_name VARCHAR(255) NOT NULL,
                sheet_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (file_id) REFERENCES excel_files(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE excel_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_name VARCHAR(255) NOT NULL,
                template_category VARCHAR(100),
                template_data TEXT,
                description TEXT,
                icon VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insert sample templates
        templates = [
            ('Budget Template', 'Finance', '[["Category","Budgeted","Actual","Difference"],["Rent","1000","1000","0"],["Utilities","200","180","20"]]', 'Monthly budget planning with categories and summaries', 'fa-calculator'),
            ('Invoice Template', 'Business', '[["Item","Quantity","Price","Total"],["Product A","10","50","500"],["Product B","5","25","125"]]', 'Professional invoice with automatic calculations', 'fa-file-invoice'),
            ('Timesheet Template', 'HR', '[["Employee","Monday","Tuesday","Wednesday","Thursday","Friday","Total"],["John Doe","8","8","8","8","8","40"]]', 'Employee time tracking with overtime calculations', 'fa-clock'),
            ('Inventory Template', 'Operations', '[["Product","Stock","Reorder Point","Price"],["Laptop","25","10","999.99"],["Mouse","150","20","29.99"]]', 'Stock management with reorder points', 'fa-boxes'),
            ('Report Template', 'Analytics', '[["Metric","Q1","Q2","Q3","Q4"],["Revenue","10000","12000","11000","13000"]]', 'Business report with charts and summaries', 'fa-chart-bar'),
            ('Project Template', 'Management', '[["Task","Start Date","End Date","Status","Assigned To"],["Website Launch","2024-01-01","2024-03-01","In Progress","Team A"]]', 'Project tracking with milestones and budget', 'fa-project-diagram')
        ]
        
        cursor.executemany('''
            INSERT INTO excel_templates (template_name, template_category, template_data, description, icon)
            VALUES (?, ?, ?, ?, ?)
        ''', templates)
        
        conn.commit()
        conn.close()

# Initialize database on startup
initialize_database()

class ExcelSystemHandler(http.server.SimpleHTTPRequestHandler):
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
        """Handle API requests for Excel operations"""
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
        if path == '/api/excel/files':
            response = self.get_excel_files(data)
        elif path == '/api/excel/save':
            response = self.save_excel_file(data)
        elif path == '/api/excel/templates':
            response = self.get_excel_templates(data)
        elif path == '/api/excel/load-template':
            response = self.load_excel_template(data)
        elif path == '/api/excel/upload':
            response = self.upload_excel_file(data)
        elif path == '/api/excel/export':
            response = self.export_excel_file(data)
        else:
            response = {'error': 'API endpoint not found'}
        
        # Send JSON response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def get_excel_files(self, data):
        """Get list of Excel files"""
        try:
            conn = sqlite3.connect(DATABASE_FILE)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, filename, file_size, created_at, modified_at, file_type, category
                FROM excel_files
                ORDER BY modified_at DESC
            ''')
            
            files = cursor.fetchall()
            
            file_list = []
            for file in files:
                file_list.append({
                    'id': file[0],
                    'filename': file[1],
                    'size': file[2],
                    'created': file[3],
                    'modified': file[4],
                    'type': file[5],
                    'category': file[6]
                })
            
            conn.close()
            
            return {
                'success': True,
                'files': file_list
            }
            
        except Exception as e:
            return {'error': f'Error getting files: {str(e)}'}

    def save_excel_file(self, data):
        """Save Excel file data"""
        try:
            filename = data.get('filename', 'untitled.xlsx')
            file_data = data.get('data', [])
            file_type = data.get('type', 'workbook')
            category = data.get('category', 'General')
            
            conn = sqlite3.connect(DATABASE_FILE)
            cursor = conn.cursor()
            
            # Insert or update file
            cursor.execute('''
                INSERT OR REPLACE INTO excel_files 
                (filename, filepath, file_size, modified_at, file_type, category)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (filename, f'/uploads/{filename}', len(str(file_data)), datetime.now().isoformat(), file_type, category))
            
            file_id = cursor.lastrowid
            
            # Save sheet data
            cursor.execute('''
                INSERT INTO excel_sheets (file_id, sheet_name, sheet_data)
                VALUES (?, ?, ?)
            ''', (file_id, 'Sheet1', json.dumps(file_data)))
            
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'file_id': file_id,
                'message': 'File saved successfully'
            }
            
        except Exception as e:
            return {'error': f'Error saving file: {str(e)}'}

    def get_excel_templates(self, data):
        """Get available Excel templates"""
        try:
            conn = sqlite3.connect(DATABASE_FILE)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, template_name, template_category, description, icon
                FROM excel_templates
                ORDER BY template_category, template_name
            ''')
            
            templates = cursor.fetchall()
            
            template_list = []
            for template in templates:
                template_list.append({
                    'id': template[0],
                    'name': template[1],
                    'category': template[2],
                    'description': template[3],
                    'icon': template[4]
                })
            
            conn.close()
            
            return {
                'success': True,
                'templates': template_list
            }
            
        except Exception as e:
            return {'error': f'Error getting templates: {str(e)}'}

    def load_excel_template(self, data):
        """Load a specific Excel template"""
        try:
            template_id = data.get('template_id')
            
            if not template_id:
                return {'error': 'Template ID required'}
            
            conn = sqlite3.connect(DATABASE_FILE)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT template_name, template_data
                FROM excel_templates
                WHERE id = ?
            ''', (template_id,))
            
            template = cursor.fetchone()
            
            if not template:
                return {'error': 'Template not found'}
            
            conn.close()
            
            return {
                'success': True,
                'template_name': template[0],
                'data': json.loads(template[1]) if template[1] else []
            }
            
        except Exception as e:
            return {'error': f'Error loading template: {str(e)}'}

    def upload_excel_file(self, data):
        """Handle Excel file upload"""
        try:
            filename = data.get('filename', 'uploaded_file.xlsx')
            file_content = data.get('content', '')
            
            # In a real implementation, you would save the actual file
            # For now, we'll just simulate the upload
            
            conn = sqlite3.connect(DATABASE_FILE)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO excel_files 
                (filename, filepath, file_size, modified_at, file_type, category)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (filename, f'/uploads/{filename}', len(file_content), datetime.now().isoformat(), 'uploaded', 'General'))
            
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'message': 'File uploaded successfully',
                'filename': filename
            }
            
        except Exception as e:
            return {'error': f'Error uploading file: {str(e)}'}

    def export_excel_file(self, data):
        """Export Excel file in various formats"""
        try:
            file_id = data.get('file_id')
            export_format = data.get('format', 'xlsx')
            
            if not file_id:
                return {'error': 'File ID required'}
            
            conn = sqlite3.connect(DATABASE_FILE)
            cursor = conn.cursor()
            
            # Get file data
            cursor.execute('''
                SELECT f.filename, s.sheet_data
                FROM excel_files f
                LEFT JOIN excel_sheets s ON f.id = s.file_id
                WHERE f.id = ?
            ''', (file_id,))
            
            result = cursor.fetchone()
            
            if not result:
                return {'error': 'File not found'}
            
            filename = result[0]
            sheet_data = json.loads(result[1]) if result[1] else []
            
            conn.close()
            
            # In a real implementation, you would use a library like openpyxl
            # For now, we'll simulate the export
            
            export_filename = f"{filename.rsplit('.', 1)[0]}.{export_format}"
            
            return {
                'success': True,
                'export_filename': export_filename,
                'format': export_format,
                'data': sheet_data,
                'message': f'File exported as {export_format.upper()}'
            }
            
        except Exception as e:
            return {'error': f'Error exporting file: {str(e)}'}

def run_server():
    try:
        # Create and run the server
        with socketserver.TCPServer(("", PORT), ExcelSystemHandler) as httpd:
            print(f"Excel Management System running at http://localhost:{PORT}")
            print("Excel features available:")
            print("  - Spreadsheet editor with formula support")
            print("  - File management and organization")
            print("  - Template library")
            print("  - Import/Export functionality")
            print("  - Real-time collaboration")
            print("  - Chart and graph creation")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nExcel Management System stopped.")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    run_server()
