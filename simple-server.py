#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import unquote

# Change to the directory containing the files
os.chdir('C:\\Users\\HP\\CascadeProjects\\office-sort')

# Define the port
PORT = 3002

# Create a simple HTTP server
class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Get the file path
        path = self.translate_path(self.path)
        
        # Handle root path
        if self.path == '/':
            path = 'dashboard/index.html'
        
        # Handle dashboard routes
        elif self.path.startswith('/dashboard/'):
            # If it's a directory path, serve index.html
            if self.path.endswith('/'):
                path = f'dashboard{self.path}index.html'
            else:
                path = f'dashboard{self.path[9:]}'  # Remove /dashboard/ prefix
        
        # Handle common dashboard page routes
        elif self.path in ['/hr-system', '/document-management', '/tools', '/accounting-tools', 
                          '/it-compliance', '/data-entry-automation', '/packages', '/systems',
                          '/implementation', '/financial', '/scaling', '/auth', '/ai-features',
                          '/automation', '/calendar-system', '/communication-department',
                          '/data-management', '/department-dashboard', '/email-system',
                          '/email-system-updated', '/financial-management', '/gmail-system',
                          '/google-drive', '/hr-system-fixed', '/office-activities',
                          '/operations-department', '/package-selection', '/sales-department',
                          '/scaling', '/security-center', '/tasks-management',
                          '/trello-management', '/database-management', '/navigation-diagnostic',
                          '/accountant-portal', '/sql-system']:
            if self.path == '/accountant-portal':
                # Redirect to accountant portal on different port
                self.send_response(302)
                self.send_header('Location', 'http://localhost:3003')
                self.end_headers()
                return
            elif self.path == '/sql-system':
                # Redirect to SQL system on different port
                self.send_response(302)
                self.send_header('Location', 'http://localhost:3004')
                self.end_headers()
                return
            path = f'dashboard{self.path}.html'
        
        # Handle subdirectory routes
        elif self.path.startswith('/'):
            # Try to find the file in dashboard directory
            dashboard_path = f'dashboard{self.path}'
            if os.path.exists(dashboard_path):
                path = dashboard_path
            else:
                # Try with .html extension
                html_path = f'dashboard{self.path}.html'
                if os.path.exists(html_path):
                    path = html_path
        
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
            # File not found - try to serve dashboard/index.html for SPA routing
            try:
                with open('dashboard/index.html', 'rb') as f:
                    content = f.read()
                    self.send_response(200)
                    self.send_header('Content-type', 'text/html')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    self.end_headers()
                    self.wfile.write(content)
            except FileNotFoundError:
                # If even index.html is not found, send 404
                self.send_response(404)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b'<h1>404 Not Found</h1><p>The file was not found on this server.</p>')

def run_server():
    try:
        # Create and run the server
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"Server running at http://localhost:{PORT}")
            print("Enhanced navigation system active!")
            print("Available routes:")
            print("  - / (Dashboard)")
            print("  - /hr-system")
            print("  - /document-management")
            print("  - /tools")
            print("  - /accounting-tools")
            print("  - /it-compliance")
            print("  - /data-entry-automation")
            print("  - /packages")
            print("  - /systems")
            print("  - /implementation")
            print("  - /financial")
            print("  - /scaling")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    run_server()
