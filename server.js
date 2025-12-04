/**
 * Simple production server for kernel.gmbh
 * Serves static files from the dist/ directory
 * Includes API endpoints for Notion integration
 * 
 * Usage: node server.js
 * Or with custom port: PORT=8080 node server.js
 * 
 * Last updated: 2025-12-04 - Added Anfragen-Link property for Notion
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// Rate limiting storage
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 requests per minute

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

// CORS headers for API
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
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

// Rate limiting check
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean old entries
  if (rateLimitStore.has(ip)) {
    const requests = rateLimitStore.get(ip).filter(time => time > windowStart);
    rateLimitStore.set(ip, requests);
  }
  
  const requests = rateLimitStore.get(ip) || [];
  if (requests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  requests.push(now);
  rateLimitStore.set(ip, requests);
  return true;
}

// Get client IP
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.connection?.remoteAddress || 
         '127.0.0.1';
}

// Sanitize text input
function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// Parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Limit body size to 1MB
      if (body.length > 1024 * 1024) {
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Send JSON response
function sendJSON(res, statusCode, data, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...CORS_HEADERS,
    ...extraHeaders,
  });
  res.end(JSON.stringify(data));
}

/**
 * ============================================================================
 * AI NOTES: NOTION PROPERTY SCHEMA DEFINITION
 * ============================================================================
 * 
 * This object defines ALL properties that the contact form can send to Notion.
 * When adding new form fields:
 * 1. Add the property definition here with its Notion type
 * 2. Add the field mapping in createNotionPage() function
 * 3. The ensureNotionProperties() function will auto-create missing properties
 * 
 * Supported Notion property types:
 * - title: Main title field (only one per database)
 * - email: Email addresses
 * - phone_number: Phone numbers
 * - rich_text: Plain text fields
 * - select: Dropdown with predefined options
 * - date: Date/datetime fields
 * - checkbox: Boolean true/false
 * - number: Numeric values
 * - url: URLs/links
 * 
 * To add a new contact form field:
 * 1. Add entry here: 'FieldName': { type: 'notion_type', options: [...] }
 * 2. In createNotionPage(), add: if (data.fieldName) { properties['FieldName'] = {...} }
 * ============================================================================
 */
const REQUIRED_NOTION_PROPERTIES = {
  // Required fields (always sent)
  'Name': { type: 'title' },
  'E-Mail': { type: 'email' },
  'Status': { 
    type: 'select', 
    options: ['Neu', 'In Bearbeitung', 'Erledigt', 'Archiviert'] 
  },
  'Eingegangen': { type: 'date' },
  
  // Optional fields (sent when provided by user)
  'Telefon': { type: 'phone_number' },
  'Firma': { type: 'rich_text' },
  'Anfrageart': { 
    type: 'select', 
    options: ['Allgemeine Anfrage', 'Projektanfrage', 'Zusammenarbeit', 'Support', 'Sonstiges'] 
  },
  'Budget': { 
    type: 'select', 
    options: ['Unter CHF 500', 'CHF 500-1000', 'CHF 1000-3000', 'CHF 3000-5000', 'Über CHF 5000', 'Auf Anfrage'] 
  },
  'Betreff': { type: 'rich_text' },
  'Hat Anhänge': { type: 'checkbox' },
  
  /**
   * ============================================================================
   * AI NOTES: ANFRAGEN-LINK - DIRECT LINK TO ADMIN PANEL
   * ============================================================================
   * 
   * This URL field stores a direct link to the inquiry in the admin panel.
   * Format: https://yourdomain.com/admin/inquiries/{inquiry-id}
   * 
   * Benefits:
   * - Click directly from Notion to view full inquiry details
   * - See attachments (not possible in Notion)
   * - Manage inquiry status
   * ============================================================================
   */
  'Anfragen-Link': { type: 'url' },
  
  /**
   * ============================================================================
   * AI NOTES: PRODUKT/PAKET MULTI-SELECT FIELD
   * ============================================================================
   * 
   * This multi-select field stores the selected product/package from the contact form.
   * Format: "ProductName - PackageName (Price)" or "ProductName (Price)"
   * 
   * How it works:
   * - Multi-select allows storing multiple values (though form sends one at a time)
   * - New packages are automatically added as options when first submitted
   * - This preserves all historical package options in the database
   * - Options are NOT pre-defined - they are created dynamically on first use
   * 
   * Benefits:
   * - User sees which package was requested
   * - Can filter/sort by package in Notion
   * - Historical tracking of all packages ever requested
   * ============================================================================
   */
  'Produkt/Paket': { 
    type: 'multi_select',
    options: [] // Options are created dynamically when new packages are submitted
  }
};

/**
 * ============================================================================
 * AI NOTES: AUTO-CREATE MISSING NOTION PROPERTIES
 * ============================================================================
 * 
 * This function automatically creates missing database properties in Notion.
 * It's called during connection test and before creating contact entries.
 * 
 * How it works:
 * 1. Fetches current database schema from Notion API
 * 2. Compares with REQUIRED_NOTION_PROPERTIES definition
 * 3. Creates any missing properties using PATCH /databases/{id}
 * 
 * Benefits:
 * - Users don't need to manually create properties in Notion
 * - New form fields are automatically supported
 * - Consistent property types across all installations
 * 
 * Note: Notion API doesn't allow modifying existing properties, only adding new ones.
 * If a property exists with wrong type, user must fix it manually in Notion.
 * ============================================================================
 */
async function ensureNotionProperties(databaseId, apiKey) {
  const NOTION_API_TOKEN = apiKey || process.env.NOTION_API_TOKEN;
  
  if (!NOTION_API_TOKEN || !databaseId) {
    return { success: false, error: 'Missing credentials' };
  }

  try {
    // Get current database schema
    const getResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NOTION_API_TOKEN}`,
        'Notion-Version': '2022-06-28'
      }
    });

    if (!getResponse.ok) {
      return { success: false, error: 'Could not fetch database schema' };
    }

    const dbData = await getResponse.json();
    const existingProps = Object.keys(dbData.properties || {});
    
    // Find missing properties
    const missingProps = Object.keys(REQUIRED_NOTION_PROPERTIES).filter(
      prop => !existingProps.includes(prop)
    );

    if (missingProps.length === 0) {
      console.log(`[${new Date().toISOString()}] ✅ All Notion properties exist`);
      return { success: true, created: [], existing: existingProps };
    }

    console.log(`[${new Date().toISOString()}] 🔧 Creating missing Notion properties: ${missingProps.join(', ')}`);

    // Build properties object for PATCH request
    const propertiesToCreate = {};
    for (const propName of missingProps) {
      const propDef = REQUIRED_NOTION_PROPERTIES[propName];
      
      switch (propDef.type) {
        case 'title':
          // Title property already exists by default, skip
          continue;
        case 'email':
          propertiesToCreate[propName] = { email: {} };
          break;
        case 'phone_number':
          propertiesToCreate[propName] = { phone_number: {} };
          break;
        case 'rich_text':
          propertiesToCreate[propName] = { rich_text: {} };
          break;
        case 'select':
          propertiesToCreate[propName] = { 
            select: { 
              options: (propDef.options || []).map(name => ({ name, color: 'default' }))
            } 
          };
          break;
        case 'multi_select':
          propertiesToCreate[propName] = { 
            multi_select: { 
              options: (propDef.options || []).map(name => ({ name, color: 'default' }))
            } 
          };
          break;
        case 'date':
          propertiesToCreate[propName] = { date: {} };
          break;
        case 'checkbox':
          propertiesToCreate[propName] = { checkbox: {} };
          break;
        case 'number':
          propertiesToCreate[propName] = { number: {} };
          break;
        case 'url':
          propertiesToCreate[propName] = { url: {} };
          break;
        default:
          propertiesToCreate[propName] = { rich_text: {} };
      }
    }

    // Update database with new properties
    if (Object.keys(propertiesToCreate).length > 0) {
      const patchResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${NOTION_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({ properties: propertiesToCreate })
      });

      if (!patchResponse.ok) {
        const errorData = await patchResponse.json().catch(() => ({}));
        console.error(`[${new Date().toISOString()}] ❌ Failed to create properties:`, errorData);
        return { 
          success: false, 
          error: errorData.message || 'Failed to create properties',
          missingProps 
        };
      }

      console.log(`[${new Date().toISOString()}] ✅ Created Notion properties: ${Object.keys(propertiesToCreate).join(', ')}`);
    }

    return { 
      success: true, 
      created: Object.keys(propertiesToCreate),
      existing: existingProps
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error ensuring properties:`, error);
    return { success: false, error: error.message };
  }
}

// Create Notion page
async function createNotionPage(data, databaseId, apiKey) {
  const NOTION_API_TOKEN = apiKey || process.env.NOTION_API_TOKEN;
  
  if (!NOTION_API_TOKEN) {
    throw new Error('NOTION_API_TOKEN not configured');
  }
  
  if (!databaseId) {
    throw new Error('Notion Database ID not configured');
  }

  // Ensure all required properties exist before creating the page
  await ensureNotionProperties(databaseId, apiKey);

  const properties = {
    'Name': {
      title: [{ text: { content: sanitizeText(data.name) || 'Unbekannt' } }]
    },
    'E-Mail': {
      email: data.email || null
    },
    'Status': {
      select: { name: 'Neu' }
    },
    'Eingegangen': {
      date: { start: new Date().toISOString() }
    }
  };

  // Optional fields
  if (data.phone) {
    properties['Telefon'] = { phone_number: sanitizeText(data.phone) };
  }
  if (data.company) {
    properties['Firma'] = { rich_text: [{ text: { content: sanitizeText(data.company) } }] };
  }
  if (data.inquiryType) {
    properties['Anfrageart'] = { select: { name: sanitizeText(data.inquiryType) } };
  }
  if (data.budget) {
    properties['Budget'] = { select: { name: sanitizeText(data.budget) } };
  }
  if (data.subject) {
    properties['Betreff'] = { rich_text: [{ text: { content: sanitizeText(data.subject) } }] };
  }
  if (data.hasAttachments) {
    properties['Hat Anhänge'] = { checkbox: true };
  }
  
  // Add direct link to admin inquiry page - ALWAYS add this property
  if (data.inquiryLink) {
    properties['Anfragen-Link'] = { url: data.inquiryLink };
    console.log(`[${new Date().toISOString()}] 🔗 Adding inquiry link to Notion: ${data.inquiryLink}`);
  } else {
    console.log(`[${new Date().toISOString()}] ⚠️ No inquiry link provided in data`);
    console.log(`[${new Date().toISOString()}] 📋 Received data keys: ${Object.keys(data).join(', ')}`);
  }
  
  /**
   * ============================================================================
   * AI NOTES: MULTI-SELECT HANDLING FOR PRODUKT/PAKET
   * ============================================================================
   * 
   * Multi-select in Notion works differently than select:
   * - Must pass an array of objects with 'name' property
   * - New options are automatically created if they don't exist
   * - Options persist in the database for future filtering
   * 
   * Format sent from frontend: "ProductName - PackageName (Price)"
   * This is stored as a single multi-select option for easy filtering.
   * ============================================================================
   */
  if (data.selectedPackage) {
    // Truncate to 100 chars (Notion limit for option names)
    const packageName = sanitizeText(data.selectedPackage).slice(0, 100);
    properties['Produkt/Paket'] = { 
      multi_select: [{ name: packageName }] 
    };
    console.log(`[${new Date().toISOString()}] 📦 Adding package to Notion: ${packageName}`);
  }

  // Message goes into page content, not properties (to allow longer text)
  const children = [];
  if (data.message) {
    // Split message into chunks of 2000 chars (Notion limit)
    const message = sanitizeText(data.message);
    const chunks = message.match(/.{1,2000}/gs) || [];
    chunks.forEach(chunk => {
      children.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: chunk } }]
        }
      });
    });
  }

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
      children
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Notion API Error:', errorData);
    throw new Error(errorData.message || `Notion API error: ${response.status}`);
  }

  return response.json();
}

// Test Notion connection
async function testNotionConnection(databaseId, apiKey, autoCreate = true) {
  const NOTION_API_TOKEN = apiKey || process.env.NOTION_API_TOKEN;
  
  if (!NOTION_API_TOKEN) {
    return { success: false, error: 'API Key nicht angegeben. Bitte trage den Notion API Key in den Einstellungen ein.' };
  }
  
  if (!databaseId) {
    return { success: false, error: 'Database ID nicht angegeben' };
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NOTION_API_TOKEN}`,
        'Notion-Version': '2022-06-28'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 404) {
        return { success: false, error: 'Datenbank nicht gefunden. Prüfe die Database ID und ob die Integration Zugriff hat.' };
      }
      if (response.status === 401) {
        return { success: false, error: 'Authentifizierung fehlgeschlagen. Prüfe den API Key.' };
      }
      return { success: false, error: errorData.message || `API Fehler: ${response.status}` };
    }

    const dbData = await response.json();
    const existingProps = Object.keys(dbData.properties || {});
    
    // Check for required properties from REQUIRED_NOTION_PROPERTIES
    const allRequiredProps = Object.keys(REQUIRED_NOTION_PROPERTIES);
    const missingProps = allRequiredProps.filter(p => !existingProps.includes(p));
    
    // Auto-create missing properties if enabled
    if (missingProps.length > 0 && autoCreate) {
      console.log(`[${new Date().toISOString()}] 🔧 Auto-creating missing Notion properties...`);
      const ensureResult = await ensureNotionProperties(databaseId, apiKey);
      
      if (ensureResult.success && ensureResult.created?.length > 0) {
        return { 
          success: true, 
          message: `Properties automatisch erstellt: ${ensureResult.created.join(', ')}`,
          databaseTitle: dbData.title?.[0]?.plain_text || 'Unbenannt',
          properties: [...existingProps, ...ensureResult.created],
          created: ensureResult.created
        };
      } else if (!ensureResult.success) {
        return { 
          success: true, 
          warning: `Verbindung OK, aber Properties konnten nicht erstellt werden: ${ensureResult.error}`,
          databaseTitle: dbData.title?.[0]?.plain_text || 'Unbenannt',
          properties: existingProps,
          missingProps
        };
      }
    }

    return { 
      success: true, 
      databaseTitle: dbData.title?.[0]?.plain_text || 'Unbenannt',
      properties: existingProps
    };
  } catch (error) {
    console.error('Notion connection test error:', error);
    return { success: false, error: error.message || 'Verbindungsfehler' };
  }
}

// Handle API requests
async function handleAPI(req, res, urlPath) {
  const ip = getClientIP(req);
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] 🔌 API Request: ${req.method} ${urlPath}`);
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[${timestamp}] ✅ CORS preflight handled`);
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return true;
  }

  // POST /api/contact - Create contact inquiry in Notion
  if (urlPath === '/api/contact' && req.method === 'POST') {
    console.log(`[${timestamp}] 📧 Processing contact form...`);
    // Rate limiting
    if (!checkRateLimit(ip)) {
      sendJSON(res, 429, { error: 'Zu viele Anfragen. Bitte warten Sie eine Minute.' });
      return true;
    }

    try {
      const body = await parseBody(req);
      
      // Validate required fields
      if (!body.name || !body.email || !body.message) {
        sendJSON(res, 400, { error: 'Name, E-Mail und Nachricht sind erforderlich.' });
        return true;
      }

      // Get database ID and API key from body or env
      const databaseId = body.notionDatabaseId || process.env.NOTION_DATABASE_ID;
      const apiKey = body.notionApiKey || process.env.NOTION_API_TOKEN;
      
      if (!databaseId) {
        sendJSON(res, 400, { error: 'Notion Database ID nicht konfiguriert.' });
        return true;
      }
      
      if (!apiKey) {
        sendJSON(res, 400, { error: 'Notion API Key nicht konfiguriert.' });
        return true;
      }

      // Create Notion page
      const result = await createNotionPage(body, databaseId, apiKey);
      
      console.log(`[${timestamp}] ✅ Contact inquiry created in Notion: ${body.email}`);
      
      sendJSON(res, 200, { 
        success: true, 
        message: 'Anfrage erfolgreich an Notion gesendet.',
        notionPageId: result.id
      });
    } catch (error) {
      console.error(`[${timestamp}] ❌ Contact API error:`, error.message);
      sendJSON(res, 500, { 
        error: 'Fehler beim Senden an Notion.', 
        details: error.message 
      });
    }
    return true;
  }

  // GET/POST /api/notion/test - Test Notion connection
  if (urlPath === '/api/notion/test' && (req.method === 'POST' || req.method === 'GET')) {
    console.log(`[${timestamp}] 🧪 Testing Notion connection...`);
    try {
      let databaseId, apiKey;
      
      if (req.method === 'POST') {
        const body = await parseBody(req);
        databaseId = body.databaseId || process.env.NOTION_DATABASE_ID;
        apiKey = body.apiKey || process.env.NOTION_API_TOKEN;
      } else {
        // GET request - use env variables
        databaseId = process.env.NOTION_DATABASE_ID;
        apiKey = process.env.NOTION_API_TOKEN;
      }
      
      const result = await testNotionConnection(databaseId, apiKey);
      console.log(`[${timestamp}] ${result.success ? '✅' : '❌'} Notion test result:`, result.success ? 'Success' : result.error);
      sendJSON(res, result.success ? 200 : 400, result);
    } catch (error) {
      console.error(`[${timestamp}] ❌ Notion test error:`, error.message);
      sendJSON(res, 400, { success: false, error: error.message });
    }
    return true;
  }

  // GET /api/notion/status - Check Notion config status
  if (urlPath === '/api/notion/status' && req.method === 'GET') {
    console.log(`[${timestamp}] 📊 Checking Notion status...`);
    const hasToken = !!process.env.NOTION_API_TOKEN;
    const hasDatabaseId = !!process.env.NOTION_DATABASE_ID;
    sendJSON(res, 200, {
      configured: hasToken && hasDatabaseId,
      hasToken,
      hasDatabaseId
    });
    return true;
  }

  console.log(`[${timestamp}] ⚠️ Unknown API endpoint: ${urlPath}`);
  return false; // Not an API request
}

const server = http.createServer(async (req, res) => {
  const timestamp = new Date().toISOString();
  const clientIP = getClientIP(req);
  
  // Log every incoming request
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${clientIP}`);
  
  // Only allow GET, HEAD, POST, OPTIONS methods
  if (!['GET', 'HEAD', 'POST', 'OPTIONS'].includes(req.method)) {
    console.log(`[${timestamp}] ❌ Method not allowed: ${req.method}`);
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  // Parse URL and remove query string
  let urlPath = req.url.split('?')[0];
  
  // Security: Prevent directory traversal (but keep forward slashes for URL matching)
  urlPath = urlPath.replace(/\.\./g, '').replace(/\/+/g, '/');
  
  // Handle API routes
  if (urlPath.startsWith('/api/')) {
    const handled = await handleAPI(req, res, urlPath);
    if (handled) return;
    
    // Unknown API endpoint
    sendJSON(res, 404, { error: 'API endpoint not found' });
    return;
  }

  // Static file serving (only GET/HEAD)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }
  
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
║  API Endpoints:                                         ║
║  POST /api/contact     - Contact form to Notion         ║
║  GET  /api/notion/test - Test Notion connection         ║
║  GET  /api/notion/status - Check Notion config          ║
╠════════════════════════════════════════════════════════╣
║  Notion: ${process.env.NOTION_API_TOKEN ? 'Configured ✓' : 'Not configured (add .env)'}                        ║
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
