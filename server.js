/**
 * Simple production server for kernel.gmbh
 * Serves static files from the dist/ directory
 * 
 * Usage: node server.js
 * Or with custom port: PORT=8080 node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.pdf': 'application/pdf',
};

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self'",
    "frame-ancestors 'self'",
  ].join('; '),
};

// Cache durations (in seconds)
const CACHE_DURATIONS = {
  '.html': 0, // No cache for HTML (SPA routing)
  '.js': 31536000, // 1 year for JS (hashed filenames)
  '.css': 31536000, // 1 year for CSS (hashed filenames)
  '.png': 86400, // 1 day for images
  '.jpg': 86400,
  '.jpeg': 86400,
  '.gif': 86400,
  '.svg': 86400,
  '.webp': 86400,
  '.ico': 86400,
  '.woff': 31536000,
  '.woff2': 31536000,
};

const server = http.createServer((req, res) => {
  // Only allow GET and HEAD methods
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  // Parse URL and remove query string
  let urlPath = req.url.split('?')[0];
  
  // Security: Prevent directory traversal
  urlPath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  
  // Determine file path
  let filePath = path.join(DIST_DIR, urlPath);
  
  // Check if path is a directory, serve index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  
  // Get file extension
  const ext = path.extname(filePath).toLowerCase();
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // SPA fallback: serve index.html for client-side routing
    filePath = path.join(DIST_DIR, 'index.html');
  }
  
  // Read and serve file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
    
    const currentExt = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[currentExt] || 'application/octet-stream';
    const cacheDuration = CACHE_DURATIONS[currentExt] || 0;
    
    // Set headers
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': cacheDuration > 0 
        ? `public, max-age=${cacheDuration}, immutable` 
        : 'no-cache, no-store, must-revalidate',
      ...SECURITY_HEADERS,
    };
    
    res.writeHead(200, headers);
    
    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(data);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                 Kernel Website Server                   ║
╠════════════════════════════════════════════════════════╣
║  Status:  Running                                       ║
║  URL:     http://127.0.0.1:${PORT.toString().padEnd(28)}║
║  Mode:    Production                                    ║
╠════════════════════════════════════════════════════════╣
║  Press Ctrl+C to stop                                   ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
