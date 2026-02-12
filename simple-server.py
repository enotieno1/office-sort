#!/usr/bin/env python3
import http.server
import socketserver
import os

# Change to the directory containing the files
os.chdir('C:\\Users\\HP\\CascadeProjects\\office-sort')

# Define the port
PORT = 3002

# Create a simple HTTP server
class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Get the file path
        path = self.translate_path(self.path)
        
        # Default to index.html if path is '/'
        if self.path == '/':
            path = 'dashboard/index.html'
        
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
                else:
                    content_type = 'application/octet-stream'
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.end_headers()
                self.wfile.write(content)
                
        except FileNotFoundError:
            # File not found
            self.send_response(404)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<h1>404 Not Found</h1><p>The file ' + path.encode() + b' was not found on this server.</p>')

def run_server():
    try:
        # Create and run the server
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"Server running at http://localhost:{PORT}")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    run_server()
