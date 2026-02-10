const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = 3002;

// Security Headers
const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// Rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;

// IP blocking
const blockedIPs = new Set();
const suspiciousActivities = new Map();

// Session management
const sessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// Security middleware functions
function getClientIP(req) {
    return req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

function checkRateLimit(ip) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    
    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, []);
    }
    
    const requests = rateLimit.get(ip).filter(timestamp => timestamp > windowStart);
    
    if (requests.length >= RATE_LIMIT_MAX_REQUESTS) {
        return false;
    }
    
    requests.push(now);
    rateLimit.set(ip, requests);
    return true;
}

function detectSuspiciousActivity(ip, userAgent) {
    const key = `${ip}:${userAgent}`;
    const now = Date.now();
    
    if (!suspiciousActivities.has(key)) {
        suspiciousActivities.set(key, { count: 0, firstSeen: now });
    }
    
    const activity = suspiciousActivities.get(key);
    activity.count++;
    
    // Block if too many requests in short time
    if (activity.count > 50 && (now - activity.firstSeen) < 60000) {
        blockedIPs.add(ip);
        return true;
    }
    
    return false;
}

function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

function validateSession(token) {
    const session = sessions.get(token);
    if (!session) return false;
    
    if (Date.now() - session.created > SESSION_TIMEOUT) {
        sessions.delete(token);
        return false;
    }
    
    session.lastAccess = Date.now();
    return true;
}

function applySecurityHeaders(res) {
    Object.entries(securityHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
}

function logSecurityEvent(event, details) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        details,
        level: 'SECURITY'
    };
    console.log('[SECURITY]', JSON.stringify(logEntry));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Apply security headers to all responses
  applySecurityHeaders(res);
  
  // Get client IP for security monitoring
  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  // Check if IP is blocked
  if (blockedIPs.has(clientIP)) {
    logSecurityEvent('BLOCKED_IP_ATTEMPT', { ip: clientIP, userAgent });
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 Forbidden - Access Denied</h1>');
    return;
  }
  
  // Rate limiting
  if (!checkRateLimit(clientIP)) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip: clientIP });
    res.writeHead(429, { 'Content-Type': 'text/html' });
    res.end('<h1>429 Too Many Requests</h1>');
    return;
  }
  
  // Detect suspicious activity
  if (detectSuspiciousActivity(clientIP, userAgent)) {
    logSecurityEvent('SUSPICIOUS_ACTIVITY_DETECTED', { ip: clientIP, userAgent });
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 Forbidden - Suspicious Activity Detected</h1>');
    return;
  }
  
  // Security API routes
  if (pathname.startsWith('/api/security/')) {
    handleSecurityAPI(pathname, req, res, clientIP);
    return;
  }
  
  // API route
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'OOES - Office Operations Efficiency Solution'
    }));
    return;
  }
  
  // Default to index.html for root
  if (pathname === '/') {
    pathname = '/dashboard/index.html';
  }
  
  const filePath = path.join(__dirname, pathname);
  const ext = path.parse(filePath).ext;
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 Server Error</h1>');
      }
      return;
    }
    
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
});

// Security API handler
function handleSecurityAPI(pathname, req, res, clientIP) {
    const parts = pathname.split('/');
    const action = parts[3];
    
    switch (action) {
        case 'scan':
            if (req.method === 'POST') {
                // Simulate security scan
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'scanning',
                    message: 'Security scan initiated',
                    scanId: crypto.randomBytes(16).toString('hex')
                }));
                logSecurityEvent('SECURITY_SCAN_INITIATED', { ip: clientIP });
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method not allowed' }));
            }
            break;
            
        case 'status':
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                securityScore: 98.5,
                threatsBlocked: 47,
                activeConnections: 12,
                encryptionStatus: 'AES-256',
                lastScan: new Date().toISOString(),
                blockedIPs: Array.from(blockedIPs).length,
                rateLimitActive: true
            }));
            break;
            
        case 'block-ip':
            if (req.method === 'POST') {
                // Would normally get IP from request body
                const ipToBlock = clientIP; // Example
                blockedIPs.add(ipToBlock);
                logSecurityEvent('IP_BLOCKED', { blockedIP: ipToBlock, blockedBy: clientIP });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'IP blocked' }));
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method not allowed' }));
            }
            break;
            
        default:
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Security endpoint not found' }));
    }
}

server.listen(PORT, () => {
  console.log(`🚀 OOES - Office Operations Efficiency Solution running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
});
