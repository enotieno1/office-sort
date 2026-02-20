const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = 3002;

// Enhanced Security Headers
const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// Enhanced Rate Limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;

// IP blocking
const blockedIPs = new Set();
const suspiciousActivities = new Map();

// Session management
const sessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Performance monitoring
const performanceMetrics = {
    requests: 0,
    responseTime: [],
    errors: 0,
    cacheHits: 0,
    cacheMisses: 0
};

// Cache system
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Enhanced MIME types
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
    '.wasm': 'application/wasm',
    '.ico': 'image/x-icon'
};

// Route definitions
const routes = {
    // Dashboard routes
    '/': 'dashboard/index.html',
    '/dashboard': 'dashboard/index.html',
    '/dashboard/overview': 'dashboard/index.html',
    '/dashboard/analytics': 'dashboard/index.html',
    '/dashboard/reports': 'dashboard/index.html',
    '/dashboard/alerts': 'dashboard/index.html',
    
    // HR routes
    '/hr': 'dashboard/hr-system.html',
    '/hr/employees': 'dashboard/hr-system.html',
    '/hr/employees/:id': 'dashboard/deep-page-templates.html',
    '/hr/employees/:id/performance': 'dashboard/deep-page-templates.html',
    '/hr/employees/:id/attendance': 'dashboard/deep-page-templates.html',
    '/hr/employees/:id/salary': 'dashboard/deep-page-templates.html',
    '/hr/employees/:id/documents': 'dashboard/deep-page-templates.html',
    '/hr/employees/:id/disciplinary': 'dashboard/deep-page-templates.html',
    '/hr/attendance': 'dashboard/hr-system.html',
    '/hr/leave': 'dashboard/hr-system.html',
    '/hr/payroll': 'dashboard/hr-system.html',
    '/hr/performance': 'dashboard/hr-system.html',
    '/hr/contracts': 'dashboard/hr-system.html',
    '/hr/reports': 'dashboard/hr-system.html',
    
    // Finance routes
    '/finance': 'dashboard/financial-management.html',
    '/finance/budget': 'dashboard/financial-management.html',
    '/finance/invoices': 'dashboard/financial-management.html',
    '/finance/invoices/:id': 'dashboard/deep-page-templates.html',
    '/finance/invoices/:id/edit': 'dashboard/deep-page-templates.html',
    '/finance/invoices/:id/payment': 'dashboard/deep-page-templates.html',
    '/finance/expenses': 'dashboard/financial-management.html',
    '/finance/payroll': 'dashboard/financial-management.html',
    '/finance/reports': 'dashboard/financial-management.html',
    '/finance/tax': 'dashboard/financial-management.html',
    
    // Procurement routes
    '/procurement': 'dashboard/procurement.html',
    '/procurement/requests': 'dashboard/procurement.html',
    '/procurement/requests/:id': 'dashboard/deep-page-templates.html',
    '/procurement/requests/:id/approve': 'dashboard/deep-page-templates.html',
    '/procurement/requests/:id/budget': 'dashboard/deep-page-templates.html',
    '/procurement/vendors': 'dashboard/procurement.html',
    '/procurement/contracts': 'dashboard/procurement.html',
    '/procurement/inventory': 'dashboard/procurement.html',
    '/procurement/reports': 'dashboard/procurement.html',
    
    // CRM routes
    '/crm': 'dashboard/sales-department.html',
    '/crm/clients': 'dashboard/sales-department.html',
    '/crm/clients/:id': 'dashboard/deep-page-templates.html',
    '/crm/clients/:id/invoices': 'dashboard/deep-page-templates.html',
    '/crm/clients/:id/projects': 'dashboard/deep-page-templates.html',
    '/crm/clients/:id/communications': 'dashboard/deep-page-templates.html',
    '/crm/leads': 'dashboard/sales-department.html',
    '/crm/sales': 'dashboard/sales-department.html',
    '/crm/support': 'dashboard/sales-department.html',
    '/crm/analytics': 'dashboard/sales-department.html',
    
    // Document Management routes
    '/documents': 'dashboard/document-management.html',
    '/documents/repository': 'dashboard/document-management.html',
    '/documents/templates': 'dashboard/document-management.html',
    '/documents/workflows': 'dashboard/document-management.html',
    '/documents/versioning': 'dashboard/document-management.html',
    '/documents/compliance': 'dashboard/document-management.html',
    
    // Compliance routes
    '/compliance': 'dashboard/it-compliance.html',
    '/compliance/policies': 'dashboard/it-compliance.html',
    '/compliance/audits': 'dashboard/it-compliance.html',
    '/compliance/risk': 'dashboard/it-compliance.html',
    '/compliance/training': 'dashboard/it-compliance.html',
    '/compliance/reports': 'dashboard/it-compliance.html',
    
    // Analytics routes
    '/analytics': 'dashboard/analytics.html',
    '/analytics/dashboard': 'dashboard/analytics.html',
    '/analytics/reports': 'dashboard/analytics.html',
    '/analytics/kpi': 'dashboard/analytics.html',
    '/analytics/forecasting': 'dashboard/analytics.html',
    '/analytics/data': 'dashboard/analytics.html',
    
    // Settings routes
    '/settings': 'dashboard/settings.html',
    '/settings/users': 'dashboard/settings.html',
    '/settings/roles': 'dashboard/settings.html',
    '/settings/system': 'dashboard/settings.html',
    '/settings/integrations': 'dashboard/settings.html',
    '/settings/security': 'dashboard/settings.html'
};

// Enhanced server class
class EnhancedServer {
    constructor() {
        this.server = http.createServer(this.handleRequest.bind(this));
        this.setupGracefulShutdown();
    }

    async handleRequest(req, res) {
        const startTime = Date.now();
        const clientIP = req.connection.remoteAddress || req.socket.remoteAddress;
        
        try {
            // Security checks
            if (blockedIPs.has(clientIP)) {
                this.sendError(res, 403, 'IP address blocked');
                return;
            }

            // Rate limiting
            if (!this.checkRateLimit(clientIP)) {
                this.sendError(res, 429, 'Too many requests');
                return;
            }

            // Parse URL
            const parsedUrl = url.parse(req.url, true);
            let pathname = parsedUrl.pathname;

            // Normalize path
            if (pathname === '/') {
                pathname = '/dashboard';
            }

            // Handle dynamic routes
            const route = this.matchRoute(pathname);
            
            if (route) {
                // Check cache
                const cacheKey = `${req.method}:${pathname}`;
                const cached = cache.get(cacheKey);
                
                if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
                    performanceMetrics.cacheHits++;
                    this.sendCachedResponse(res, cached);
                    return;
                }
                
                performanceMetrics.cacheMisses++;
                
                // Load the file
                const filePath = path.join(__dirname, route);
                const content = await this.loadFile(filePath);
                
                if (content) {
                    // Cache the response
                    cache.set(cacheKey, {
                        content,
                        contentType: this.getContentType(filePath),
                        timestamp: Date.now()
                    });
                    
                    this.sendFile(res, filePath, content);
                } else {
                    this.sendError(res, 404, 'File not found');
                }
            } else {
                // Try to serve static files
                await this.serveStaticFile(req, res, pathname);
            }

        } catch (error) {
            console.error('Request handling error:', error);
            this.sendError(res, 500, 'Internal server error');
            performanceMetrics.errors++;
        } finally {
            // Track performance
            const responseTime = Date.now() - startTime;
            performanceMetrics.requests++;
            performanceMetrics.responseTime.push(responseTime);
            
            // Keep only last 1000 response times
            if (performanceMetrics.responseTime.length > 1000) {
                performanceMetrics.responseTime.shift();
            }
        }
    }

    matchRoute(pathname) {
        // Direct match first
        if (routes[pathname]) {
            return routes[pathname];
        }

        // Pattern matching for dynamic routes
        for (const [pattern, filePath] of Object.entries(routes)) {
            if (this.pathMatches(pathname, pattern)) {
                return filePath;
            }
        }

        return null;
    }

    pathMatches(pathname, pattern) {
        const pathParts = pathname.split('/').filter(p => p);
        const patternParts = pattern.split('/').filter(p => p);

        if (pathParts.length !== patternParts.length) {
            return false;
        }

        return patternParts.every((part, index) => {
            return part.startsWith(':') || part === pathParts[index];
        });
    }

    async serveStaticFile(req, res, pathname) {
        // Remove leading slash and decode URI
        const decodedPath = decodeURIComponent(pathname.substring(1));
        
        // Security check - prevent directory traversal
        if (decodedPath.includes('..') || decodedPath.includes('\\')) {
            this.sendError(res, 400, 'Invalid path');
            return;
        }

        const filePath = path.join(__dirname, decodedPath);
        
        // Check if file exists and is within allowed directory
        if (!filePath.startsWith(__dirname)) {
            this.sendError(res, 403, 'Access denied');
            return;
        }

        try {
            const content = await this.loadFile(filePath);
            if (content) {
                this.sendFile(res, filePath, content);
            } else {
                this.sendError(res, 404, 'File not found');
            }
        } catch (error) {
            this.sendError(res, 500, 'Internal server error');
        }
    }

    async loadFile(filePath) {
        try {
            const stats = await fs.promises.stat(filePath);
            if (stats.isFile()) {
                return await fs.promises.readFile(filePath);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    sendFile(res, filePath, content) {
        const contentType = this.getContentType(filePath);
        
        // Apply security headers
        Object.entries(securityHeaders).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Add performance headers
        res.setHeader('Server-Timing', `total;dur=${Date.now()}`);
        
        res.writeHead(200);
        res.end(content);
    }

    sendCachedResponse(res, cached) {
        Object.entries(securityHeaders).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        res.setHeader('Content-Type', cached.contentType);
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('X-Cache', 'HIT');
        
        res.writeHead(200);
        res.end(cached.content);
    }

    sendError(res, statusCode, message) {
        const errorPages = {
            400: 'error-pages/400.html',
            403: 'error-pages/403.html',
            404: 'error-pages/404.html',
            429: 'error-pages/429.html',
            500: 'error-pages/500.html'
        };

        const errorPage = errorPages[statusCode];
        
        if (errorPage) {
            const filePath = path.join(__dirname, errorPage);
            this.loadFile(filePath).then(content => {
                if (content) {
                    res.writeHead(statusCode, { 'Content-Type': 'text/html' });
                    res.end(content);
                } else {
                    this.sendDefaultError(res, statusCode, message);
                }
            }).catch(() => {
                this.sendDefaultError(res, statusCode, message);
            });
        } else {
            this.sendDefaultError(res, statusCode, message);
        }
    }

    sendDefaultError(res, statusCode, message) {
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Error ${statusCode}</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-50 min-h-screen flex items-center justify-center">
                <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                    <div class="text-center">
                        <div class="mb-4">
                            <i class="fas fa-exclamation-triangle text-6xl text-yellow-400"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">Error ${statusCode}</h1>
                        <p class="text-gray-600 mb-6">${message}</p>
                        <button onclick="history.back()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Go Back
                        </button>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        res.writeHead(statusCode, { 'Content-Type': 'text/html' });
        res.end(html);
    }

    getContentType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return mimeTypes[ext] || 'application/octet-stream';
    }

    checkRateLimit(clientIP) {
        const now = Date.now();
        const clientData = rateLimit.get(clientIP);
        
        if (!clientData) {
            rateLimit.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
            return true;
        }
        
        if (now > clientData.resetTime) {
            rateLimit.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
            return true;
        }
        
        if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
            return false;
        }
        
        clientData.count++;
        return true;
    }

    setupGracefulShutdown() {
        const shutdown = (signal) => {
            console.log(`\nReceived ${signal}. Shutting down gracefully...`);
            
            this.server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
            
            // Force close after 10 seconds
            setTimeout(() => {
                console.log('Forcing shutdown');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }

    start() {
        this.server.listen(PORT, () => {
            console.log(`🚀 Enhanced OOES Server running on port ${PORT}`);
            console.log(`📊 Performance monitoring enabled`);
            console.log(`🔒 Enhanced security features active`);
            console.log(`💾 Caching system enabled`);
            console.log(`🌐 Open http://localhost:${PORT} in your browser`);
            
            // Log performance metrics every 30 seconds
            setInterval(() => {
                const avgResponseTime = performanceMetrics.responseTime.length > 0
                    ? performanceMetrics.responseTime.reduce((a, b) => a + b, 0) / performanceMetrics.responseTime.length
                    : 0;
                
                console.log(`📈 Performance: ${performanceMetrics.requests} requests, ${avgResponseTime.toFixed(2)}ms avg, ${performanceMetrics.errors} errors, Cache hit rate: ${(performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100).toFixed(1)}%`);
            }, 30000);
        });
    }

    // API endpoints for monitoring
    setupAPIRoutes() {
        // Health check endpoint
        this.server.on('request', (req, res) => {
            if (req.url === '/api/health' && req.method === 'GET') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'healthy',
                    uptime: process.uptime(),
                    metrics: performanceMetrics,
                    timestamp: new Date().toISOString()
                }));
            }
            
            // Metrics endpoint
            if (req.url === '/api/metrics' && req.method === 'GET') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(performanceMetrics));
            }
        });
    }
}

// Create and start the enhanced server
const server = new EnhancedServer();
server.setupAPIRoutes();
server.start();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
