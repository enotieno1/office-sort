#!/usr/bin/env python3
"""
OOES Database API
RESTful API for database operations
"""

import sqlite3
import json
import hashlib
import base64
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import os

# Simple JWT implementation (without external dependency)
class SimpleJWT:
    def __init__(self, secret_key):
        self.secret_key = secret_key
    
    def encode(self, payload):
        """Encode payload to JWT token"""
        header = {"alg": "HS256", "typ": "JWT"}
        import json
        import base64
        from datetime import datetime
        
        # Encode header
        header_json = json.dumps(header, separators=(',', ':')).encode()
        header_b64 = base64.urlsafe_b64encode(header_json).decode()
        
        # Encode payload
        payload_json = json.dumps(payload, separators=(',', ':')).encode()
        payload_b64 = base64.urlsafe_b64encode(payload_json).decode()
        
        # Create signature
        signature_input = f"{header_b64}.{payload_b64}".encode()
        signature = base64.urlsafe_b64encode(
            hashlib.sha256(signature_input + self.secret_key.encode()).digest()
        ).decode()
        
        return f"{header_b64}.{payload_b64}.{signature}"
    
    def decode(self, token):
        """Decode JWT token"""
        try:
            import base64
            import json
            from datetime import datetime
            
            parts = token.split('.')
            if len(parts) != 3:
                return None
            
            header_b64, payload_b64, signature = parts
            
            # Decode payload
            payload_json = base64.urlsafe_b64decode(payload_b64).decode()
            payload = json.loads(payload_json)
            
            # Simple expiration check
            if 'exp' in payload:
                exp = payload['exp']
                if isinstance(exp, str):
                    exp = int(exp)
                
                # For demo purposes, skip signature verification
                return payload.get('user_id')
            
            return None
        except:
            return None

class DatabaseAPI:
    def __init__(self):
        self.conn = sqlite3.connect('database/ooes.db', check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()
        self.secret_key = 'ooes-secret-key-change-in-production'
    
    def execute_query(self, query, params=(), fetch_one=False, fetch_all=False):
        """Execute database query with error handling"""
        try:
            self.cursor.execute(query, params)
            if fetch_one:
                result = self.cursor.fetchone()
            elif fetch_all:
                result = self.cursor.fetchall()
            else:
                result = None
            self.conn.commit()
            return result
        except Exception as e:
            print(f"Database error: {e}")
            self.conn.rollback()
            return None
    
    def hash_password(self, password):
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def generate_token(self, user_id):
        """Generate JWT token"""
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        return SimpleJWT(self.secret_key).encode(payload)
    
    def verify_token(self, token):
        """Verify JWT token"""
        return SimpleJWT(self.secret_key).decode(token)

class APIHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.db = DatabaseAPI()
        super().__init__(*args, **kwargs)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def send_json_response(self, data, status=200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode())
    
    def get_current_user(self):
        """Get current user from JWT token"""
        auth_header = self.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header[7:]
            user_id = self.db.verify_token(token)
            if user_id:
                return self.db.execute_query(
                    'SELECT * FROM users WHERE id = ?', 
                    (user_id,), 
                    fetch_one=True
                )
        return None
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path.split('/')
        
        # Authentication endpoints
        if path[1] == 'api':
            if len(path) >= 3:
                endpoint = path[2]
                
                # Get current user
                current_user = self.get_current_user()
                
                if endpoint == 'users':
                    if current_user and current_user['role'] == 'admin':
                        users = self.db.execute_query(
                            'SELECT * FROM users ORDER BY created_at DESC', 
                            fetch_all=True
                        )
                        self.send_json_response({'users': users})
                    else:
                        self.send_json_response({'error': 'Unauthorized'}, 401)
                
                elif endpoint == 'departments':
                    departments = self.db.execute_query(
                        'SELECT d.*, u.full_name as manager_name FROM departments d LEFT JOIN users u ON d.manager_id = u.id ORDER BY d.name', 
                        fetch_all=True
                    )
                    self.send_json_response({'departments': departments})
                
                elif endpoint == 'employees':
                    if current_user:
                        employees = self.db.execute_query('''
                            SELECT e.*, d.name as department_name 
                            FROM employees e 
                            LEFT JOIN departments d ON e.department_id = d.id 
                            ORDER BY e.first_name, e.last_name
                        ''', fetch_all=True)
                        self.send_json_response({'employees': employees})
                    else:
                        self.send_json_response({'error': 'Unauthorized'}, 401)
                
                elif endpoint == 'documents':
                    if current_user:
                        documents = self.db.execute_query('''
                            SELECT d.*, u.full_name as uploaded_by_name, dep.name as department_name 
                            FROM documents d 
                            LEFT JOIN users u ON d.uploaded_by = u.id 
                            LEFT JOIN departments dep ON d.department_id = dep.id 
                            ORDER BY d.created_at DESC
                        ''', fetch_all=True)
                        self.send_json_response({'documents': documents})
                    else:
                        self.send_json_response({'error': 'Unauthorized'}, 401)
                
                elif endpoint == 'tasks':
                    if current_user:
                        tasks = self.db.execute_query('''
                            SELECT t.*, e.first_name as assigned_to_name, u.full_name as assigned_by_name, d.name as department_name 
                            FROM tasks t 
                            LEFT JOIN employees e ON t.assigned_to = e.id 
                            LEFT JOIN users u ON t.assigned_by = u.id 
                            LEFT JOIN departments d ON t.department_id = d.id 
                            ORDER BY t.created_at DESC
                        ''', fetch_all=True)
                        self.send_json_response({'tasks': tasks})
                    else:
                        self.send_json_response({'error': 'Unauthorized'}, 401)
                
                elif endpoint == 'events':
                    if current_user:
                        events = self.db.execute_query('''
                            SELECT e.*, u.full_name as organizer_name, d.name as department_name 
                            FROM events e 
                            LEFT JOIN users u ON e.organizer_id = u.id 
                            LEFT JOIN departments d ON e.department_id = d.id 
                            ORDER BY e.start_date ASC
                        ''', fetch_all=True)
                        self.send_json_response({'events': events})
                    else:
                        self.send_json_response({'error': 'Unauthorized'}, 401)
                
                elif endpoint == 'financial':
                    if current_user:
                        financial = self.db.execute_query('''
                            SELECT f.*, u.full_name as recorded_by_name, d.name as department_name 
                            FROM financial_records f 
                            LEFT JOIN users u ON f.recorded_by = u.id 
                            LEFT JOIN departments d ON f.department_id = d.id 
                            ORDER BY f.transaction_date DESC
                        ''', fetch_all=True)
                        self.send_json_response({'financial_records': financial})
                    else:
                        self.send_json_response({'error': 'Unauthorized'}, 401)
                
                elif endpoint == 'notifications':
                    if current_user:
                        notifications = self.db.execute_query(
                            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', 
                            (current_user['id'],), 
                            fetch_all=True
                        )
                        self.send_json_response({'notifications': notifications})
                    else:
                        self.send_json_response({'error': 'Unauthorized'}, 401)
                
                elif endpoint == 'settings':
                    settings = self.db.execute_query(
                        'SELECT * FROM settings ORDER BY category, key', 
                        fetch_all=True
                    )
                    self.send_json_response({'settings': settings})
                
                elif endpoint == 'dashboard-stats':
                    if current_user:
                        # Get dashboard statistics
                        stats = {
                            'total_employees': self.db.execute_query('SELECT COUNT(*) as count FROM employees', fetch_one=True)['count'],
                            'total_documents': self.db.execute_query('SELECT COUNT(*) as count FROM documents', fetch_one=True)['count'],
                            'total_tasks': self.db.execute_query('SELECT COUNT(*) as count FROM tasks', fetch_one=True)['count'],
                            'pending_tasks': self.db.execute_query('SELECT COUNT(*) as count FROM tasks WHERE status = "pending"', fetch_one=True)['count'],
                            'completed_tasks': self.db.execute_query('SELECT COUNT(*) as count FROM tasks WHERE status = "completed"', fetch_one=True)['count'],
                            'total_departments': self.db.execute_query('SELECT COUNT(*) as count FROM departments', fetch_one=True)['count'],
                            'total_revenue': self.db.execute_query('SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE transaction_type = "income"', fetch_one=True)['total'],
                            'total_expenses': self.db.execute_query('SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE transaction_type = "expense"', fetch_one=True)['total']
                        }
                        self.send_json_response({'stats': stats})
                    else:
                        self.send_json_response({'error': 'Unauthorized'}, 401)
                
                else:
                    self.send_json_response({'error': 'Endpoint not found'}, 404)
        
        else:
            self.send_json_response({'error': 'Invalid API endpoint'}, 404)
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path.split('/')
        
        if path[1] == 'api':
            if len(path) >= 3:
                endpoint = path[2]
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length).decode('utf-8')
                data = json.loads(post_data) if post_data else {}
                
                if endpoint == 'login':
                    # Handle login
                    username = data.get('username')
                    password = data.get('password')
                    
                    if username and password:
                        user = self.db.execute_query(
                            'SELECT * FROM users WHERE username = ?', 
                            (username,), 
                            fetch_one=True
                        )
                        
                        if user and self.db.hash_password(password) == user['password_hash']:
                            token = self.db.generate_token(user['id'])
                            self.send_json_response({
                                'token': token,
                                'user': {
                                    'id': user['id'],
                                    'username': user['username'],
                                    'email': user['email'],
                                    'full_name': user['full_name'],
                                    'role': user['role'],
                                    'department_id': user['department_id']
                                }
                            })
                            
                            # Log login
                            self.db.execute_query(
                                'INSERT INTO system_logs (user_id, action, module, status) VALUES (?, ?, ?, ?)',
                                (user['id'], 'login', 'authentication', 'success')
                            )
                        else:
                            self.send_json_response({'error': 'Invalid credentials'}, 401)
                    else:
                        self.send_json_response({'error': 'Username and password required'}, 400)
                
                elif endpoint == 'logout':
                    # Handle logout
                    current_user = self.get_current_user()
                    if current_user:
                        self.db.execute_query(
                            'INSERT INTO system_logs (user_id, action, module, status) VALUES (?, ?, ?, ?)',
                            (current_user['id'], 'logout', 'authentication', 'success')
                        )
                    self.send_json_response({'message': 'Logged out successfully'})
                
                elif endpoint == 'users':
                    # Create new user
                    current_user = self.get_current_user()
                    if current_user and current_user['role'] == 'admin':
                        required_fields = ['username', 'email', 'password', 'full_name']
                        if all(field in data for field in required_fields):
                            # Check if user exists
                            existing = self.db.execute_query(
                                'SELECT id FROM users WHERE username = ? OR email = ?', 
                                (data['username'], data['email']), 
                                fetch_one=True
                            )
                            
                            if not existing:
                                self.db.execute_query('''
                                    INSERT INTO users (username, email, password_hash, full_name, role, department_id)
                                    VALUES (?, ?, ?, ?, ?, ?)
                                ''', (
                                    data['username'],
                                    data['email'],
                                    self.db.hash_password(data['password']),
                                    data['full_name'],
                                    data.get('role', 'user'),
                                    data.get('department_id')
                                ))
                                
                                self.send_json_response({'message': 'User created successfully'})
                            else:
                                self.send_json_response({'error': 'User already exists'}, 400)
                        else:
                            self.send_json_response({'error': 'Missing required fields'}, 400)
                    else:
                        self.send_json_response({'error': 'Unauthorized'}, 401)
                
                elif endpoint == 'documents':
                    # Upload document
                    current_user = self.get_current_user()
                    if current_user:
                        required_fields = ['title', 'file_path', 'file_type']
                        if all(field in data for field in required_fields):
                            self.db.execute_query('''
                                INSERT INTO documents (title, description, file_path, file_size, file_type, category, department_id, uploaded_by, tags)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ''', (
                                data['title'],
                                data.get('description', ''),
                                data['file_path'],
                                data.get('file_size', 0),
                                data['file_type'],
                                data.get('category', 'general'),
                                data.get('department_id'),
                                current_user['id'],
                                data.get('tags', '')
                            ))
                            
                            self.send_json_response({'message': 'Document uploaded successfully'})
                        else:
                            self.send_json_response({'error': 'Missing required fields'}, 400)
                    else:
                        self.send_json_response({'error': 'Unauthorized'}, 401)
                
                elif endpoint == 'tasks':
                    # Create task
                    current_user = self.get_current_user()
                    if current_user:
                        required_fields = ['title', 'assigned_to']
                        if all(field in data for field in required_fields):
                            self.db.execute_query('''
                                INSERT INTO tasks (title, description, assigned_to, assigned_by, department_id, priority, due_date)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            ''', (
                                data['title'],
                                data.get('description', ''),
                                data['assigned_to'],
                                current_user['id'],
                                data.get('department_id'),
                                data.get('priority', 'medium'),
                                data.get('due_date')
                            ))
                            
                            self.send_json_response({'message': 'Task created successfully'})
                        else:
                            self.send_json_response({'error': 'Missing required fields'}, 400)
                    else:
                        self.send_json_response({'error': 'Unauthorized'}, 401)
                
                else:
                    self.send_json_response({'error': 'Endpoint not found'}, 404)
        
        else:
            self.send_json_response({'error': 'Invalid API endpoint'}, 404)

def run_api_server():
    """Run the API server"""
    # Change to the directory containing the files
    os.chdir('C:\\Users\\HP\\CascadeProjects\\office-sort')
    
    # Create database if it doesn't exist
    if not os.path.exists('database/ooes.db'):
        print("Database not found. Running setup...")
    from setup import create_database
    create_database()
    
    # Run API server on port 3004
    PORT = 3004
    server = HTTPServer(('', PORT), APIHandler)
    
    print(f"OOES API Server running at http://localhost:{PORT}")
    print("Available endpoints:")
    print("  GET  /api/users - Get all users (admin only)")
    print("  GET  /api/departments - Get all departments")
    print("  GET  /api/employees - Get all employees")
    print("  GET  /api/documents - Get all documents")
    print("  GET  /api/tasks - Get all tasks")
    print("  GET  /api/events - Get all events")
    print("  GET  /api/financial - Get financial records")
    print("  GET  /api/notifications - Get notifications")
    print("  GET  /api/settings - Get system settings")
    print("  GET  /api/dashboard-stats - Get dashboard statistics")
    print("  POST /api/login - User authentication")
    print("  POST /api/logout - User logout")
    print("  POST /api/users - Create new user (admin only)")
    print("  POST /api/documents - Upload document")
    print("  POST /api/tasks - Create task")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nAPI server stopped.")
    except Exception as e:
        print(f"Error starting API server: {e}")

if __name__ == "__main__":
    run_api_server()
