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
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Rate limiting storage
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 requests per minute

// ============================================================================
// AUTHENTICATION
// ============================================================================

// Admin password - CHANGE THIS before deployment!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Kernel#Admin2024!';

// Active auth tokens (in-memory, cleared on server restart)
const authTokens = new Map(); // token -> { createdAt, expiresAt }
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Generate secure random token
function generateAuthToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Validate auth token
function validateAuthToken(token) {
  if (!token) return false;
  const tokenData = authTokens.get(token);
  if (!tokenData) return false;
  if (Date.now() > tokenData.expiresAt) {
    authTokens.delete(token);
    return false;
  }
  return true;
}

// Extract token from request headers
function getAuthToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Check if request is authenticated
function isAuthenticated(req) {
  const token = getAuthToken(req);
  return validateAuthToken(token);
}

// Timing-safe password comparison
function secureCompare(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

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
    "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*",
    "frame-ancestors 'self'",
  ].join('; '),
};

// CORS headers for API
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ============================================================================
// OLLAMA / LLM CONFIGURATION
// ============================================================================

// Get chatbot settings from stored content or defaults
function getChatbotSettings() {
  const content = readDataFile('content.json', null);
  const defaults = {
    enabled: true,
    welcomeMessage: 'Willkommen! Ich bin der KernelFlow Assistent. Wie kann ich Ihnen helfen?',
    placeholderText: 'Schreiben Sie eine Nachricht...',
    suggestedQuestions: ['Was bietet KernelFlow?', 'Preise & Pakete', 'Kontakt'],
    pythonServerUrl: process.env.PYTHON_CHATBOT_URL || 'http://localhost:8001',
    ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2:latest',
    maxTokens: 1024,
    temperature: 0.7,
    systemPromptAddition: '',
  };
  
  if (content?.settings?.chatbotSettings) {
    return { ...defaults, ...content.settings.chatbotSettings };
  }
  return defaults;
}

// Load system prompt for chatbot
function loadSystemPrompt() {
  const promptPath = path.join(DATA_DIR, 'chatbot-system-prompt.txt');
  let basePrompt = 'Du bist ein hilfreicher Assistent für die KernelFlow-Webseite. Antworte höflich und informativ auf Deutsch.';
  
  // Get settings first to check for uploaded markdown prompt
  const settings = getChatbotSettings();
  
  // Prefer uploaded markdown system prompt if available
  if (settings.systemPromptMarkdown && settings.systemPromptMarkdown.trim()) {
    basePrompt = settings.systemPromptMarkdown;
  } else {
    // Fall back to file-based prompt
    try {
      if (fs.existsSync(promptPath)) {
        basePrompt = fs.readFileSync(promptPath, 'utf8');
      }
    } catch (error) {
      console.error('Error loading system prompt:', error.message);
    }
  }
  
  // Add custom additions from settings
  if (settings.systemPromptAddition) {
    basePrompt += '\n\n' + settings.systemPromptAddition;
  }
  
  return basePrompt;
}

// Get live data for chatbot context
function getLiveDataContext() {
  const content = readDataFile('content.json', null);
  if (!content) return '';
  
  const liveData = [];
  
  // Add company info
  if (content.settings?.companyName) {
    liveData.push(`FIRMENNAME: ${content.settings.companyName}`);
  }
  
  // Add products/services info
  if (content.products && content.products.length > 0) {
    const productsList = content.products
      .filter(p => p.status === 'published')
      .map(p => `- ${p.name}: ${p.shortDescription || p.description || 'Keine Beschreibung'} (${p.priceText || 'Preis auf Anfrage'})`)
      .join('\n');
    if (productsList) {
      liveData.push(`VERFÜGBARE SERVICES:\n${productsList}`);
    }
  }
  
  // Add categories
  if (content.categories && content.categories.length > 0) {
    const categoriesList = content.categories.map(c => `- ${c.name}: ${c.description || ''}`).join('\n');
    liveData.push(`KATEGORIEN:\n${categoriesList}`);
  }
  
  // Add recent blog posts
  if (content.posts && content.posts.length > 0) {
    const recentPosts = content.posts
      .filter(p => p.status === 'published')
      .slice(0, 3)
      .map(p => `- ${p.title}`)
      .join('\n');
    if (recentPosts) {
      liveData.push(`AKTUELLE BLOG-BEITRÄGE:\n${recentPosts}`);
    }
  }
  
  // Add site settings/contact info
  if (content.settings) {
    const s = content.settings;
    const contactInfo = [];
    if (s.contactEmail) contactInfo.push(`E-Mail: ${s.contactEmail}`);
    if (s.contactPhone) contactInfo.push(`Telefon: ${s.contactPhone}`);
    if (s.contactLocation) contactInfo.push(`Standort: ${s.contactLocation}`);
    if (contactInfo.length > 0) {
      liveData.push(`KONTAKTDATEN:\n${contactInfo.join('\n')}`);
    }
  }
  
  return liveData.length > 0 ? '\n\nLIVE_DATEN:\n' + liveData.join('\n\n') : '';
}

// Call Ollama API
async function callOllama(messages) {
  const settings = getChatbotSettings();
  const systemPrompt = loadSystemPrompt();
  const liveContext = getLiveDataContext();
  
  // Build full system message with live data
  const fullSystemPrompt = systemPrompt + liveContext;
  
  // Prepare messages for Ollama
  const ollamaMessages = [
    { role: 'system', content: fullSystemPrompt },
    ...messages.map(msg => ({
      role: msg.role,
      content: sanitizeText(msg.content) // Sanitize all user input
    }))
  ];
  
  try {
    const response = await fetch(`${settings.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: settings.ollamaModel,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: settings.temperature,
          top_p: 0.9,
          num_predict: settings.maxTokens,
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error:', response.status, errorText);
      throw new Error(`Ollama API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
  } catch (error) {
    console.error('Ollama connection error:', error);
    throw error;
  }
}

// ============================================================================
// DATA FILE HELPERS
// ============================================================================

function readDataFile(filename, defaultValue) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
  }
  return defaultValue;
}

function writeDataFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    return false;
  }
}

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

  // ============================================================================
  // CHATBOT API - AI Chat with Ollama
  // ============================================================================
  
  // POST /api/chat - Send message to chatbot
  if (urlPath === '/api/chat' && req.method === 'POST') {
    console.log(`[${timestamp}] 🤖 Processing chat message...`);
    
    // Check if chatbot is enabled
    const chatSettings = getChatbotSettings();
    if (!chatSettings.enabled) {
      sendJSON(res, 403, { error: 'Der Chatbot ist momentan deaktiviert.' });
      return true;
    }
    
    // Rate limiting for chat
    if (!checkRateLimit(ip)) {
      sendJSON(res, 429, { error: 'Zu viele Anfragen. Bitte warten Sie eine Minute.' });
      return true;
    }
    
    try {
      const body = await parseBody(req);
      
      if (!body.message) {
        sendJSON(res, 400, { error: 'Nachricht erforderlich' });
        return true;
      }
      
      // Sanitize message and prepare conversation
      const sanitizedMessage = sanitizeText(body.message);
      if (sanitizedMessage.length > 2000) {
        sendJSON(res, 400, { error: 'Nachricht zu lang (max. 2000 Zeichen)' });
        return true;
      }
      
      // Prepare messages array
      const messages = [];
      if (body.history && Array.isArray(body.history)) {
        // Add sanitized history (last 10 messages max)
        body.history.slice(-10).forEach(msg => {
          if (msg.role && msg.content) {
            messages.push({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: sanitizeText(msg.content).slice(0, 2000)
            });
          }
        });
      } else {
        messages.push({ role: 'user', content: sanitizedMessage });
      }
      
      // Call Ollama
      const response = await callOllama(messages);
      
      console.log(`[${timestamp}] ✅ Chat response generated`);
      sendJSON(res, 200, { response });
    } catch (error) {
      console.error(`[${timestamp}] ❌ Chat API error:`, error.message);
      
      // Return user-friendly error
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
        sendJSON(res, 503, { 
          error: 'Der Chat-Service ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut.',
          details: 'Ollama service not reachable'
        });
      } else {
        sendJSON(res, 500, { 
          error: 'Es gab ein Problem bei der Verarbeitung Ihrer Anfrage.',
          details: error.message 
        });
      }
    }
    return true;
  }
  
  // GET /api/chat/status - Check if chat is available
  if (urlPath === '/api/chat/status' && req.method === 'GET') {
    console.log(`[${timestamp}] 📊 Checking chat status...`);
    const chatSettings = getChatbotSettings();
    
    if (!chatSettings.enabled) {
      sendJSON(res, 200, { 
        available: false, 
        enabled: false,
        reason: 'Chatbot is disabled in settings'
      });
      return true;
    }
    
    try {
      const response = await fetch(`${chatSettings.ollamaUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const modelAvailable = data.models?.some(m => m.name.includes(chatSettings.ollamaModel.split(':')[0]));
        sendJSON(res, 200, { 
          available: true,
          enabled: true,
          model: chatSettings.ollamaModel,
          modelLoaded: modelAvailable
        });
      } else {
        sendJSON(res, 200, { available: false, enabled: true, reason: 'Ollama not responding' });
      }
    } catch (error) {
      sendJSON(res, 200, { available: false, enabled: true, reason: 'Ollama not reachable' });
    }
    return true;
  }
  
  // POST /api/python-chat - Proxy to Python chatbot server
  if (urlPath === '/api/python-chat' && req.method === 'POST') {
    console.log(`[${timestamp}] 🐍 Proxying to Python chatbot server...`);
    
    const chatSettings = getChatbotSettings();
    if (!chatSettings.enabled) {
      sendJSON(res, 403, { error: 'Der Chatbot ist momentan deaktiviert.' });
      return true;
    }
    
    // Rate limiting
    if (!checkRateLimit(ip)) {
      sendJSON(res, 429, { error: 'Zu viele Anfragen. Bitte warten Sie eine Minute.' });
      return true;
    }
    
    try {
      const body = await parseBody(req);
      const pythonServerUrl = chatSettings.pythonServerUrl || 'http://localhost:8001';
      
      // Get session ID from header or body
      const sessionId = req.headers['x-session-id'] || body.session_id;
      
      // Forward request to Python server
      const proxyResponse = await fetch(`${pythonServerUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId && { 'X-Session-ID': sessionId })
        },
        body: JSON.stringify(body)
      });
      
      const data = await proxyResponse.json();
      
      if (!proxyResponse.ok) {
        console.error(`[${timestamp}] ❌ Python server error:`, data);
        sendJSON(res, proxyResponse.status, data);
        return true;
      }
      
      console.log(`[${timestamp}] ✅ Python chatbot response received`);
      sendJSON(res, 200, data);
    } catch (error) {
      console.error(`[${timestamp}] ❌ Python proxy error:`, error.message);
      sendJSON(res, 503, { 
        error: 'Python Chatbot-Server nicht erreichbar.',
        hint: 'Starte den Python-Server mit: python scripts/chatbot_server.py'
      });
    }
    return true;
  }
  
  // GET /api/python-chat/health - Check Python server health
  if (urlPath === '/api/python-chat/health' && req.method === 'GET') {
    console.log(`[${timestamp}] 🐍 Checking Python chatbot health...`);
    const chatSettings = getChatbotSettings();
    const pythonServerUrl = chatSettings.pythonServerUrl || 'http://localhost:8001';
    
    try {
      const response = await fetch(`${pythonServerUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        sendJSON(res, 200, { 
          available: true,
          python_server: data,
          ollama_url: chatSettings.ollamaUrl,
          model: chatSettings.ollamaModel
        });
      } else {
        sendJSON(res, 200, { available: false, reason: 'Python server not responding' });
      }
    } catch (error) {
      sendJSON(res, 200, { 
        available: false, 
        reason: 'Python server not reachable',
        hint: 'Starte mit: python scripts/chatbot_server.py'
      });
    }
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

  // ============================================================================
  // AUTHENTICATION API
  // ============================================================================

  // POST /api/auth/login - Login and get auth token
  if (urlPath === '/api/auth/login' && req.method === 'POST') {
    console.log(`[${timestamp}] 🔐 Login attempt from ${ip}`);
    
    // Rate limit login attempts
    if (!checkRateLimit(ip)) {
      console.log(`[${timestamp}] ❌ Too many login attempts from ${ip}`);
      sendJSON(res, 429, { error: 'Zu viele Anmeldeversuche. Bitte warten Sie.' });
      return true;
    }
    
    try {
      const body = await parseBody(req);
      const { password } = body;
      
      if (!password) {
        sendJSON(res, 400, { error: 'Passwort erforderlich' });
        return true;
      }
      
      if (secureCompare(password, ADMIN_PASSWORD)) {
        const token = generateAuthToken();
        authTokens.set(token, {
          createdAt: Date.now(),
          expiresAt: Date.now() + TOKEN_EXPIRY_MS
        });
        
        console.log(`[${timestamp}] ✅ Login successful`);
        sendJSON(res, 200, { 
          success: true, 
          token,
          expiresIn: TOKEN_EXPIRY_MS 
        });
      } else {
        console.log(`[${timestamp}] ❌ Login failed - wrong password`);
        sendJSON(res, 401, { error: 'Falsches Passwort' });
      }
    } catch (error) {
      console.error(`[${timestamp}] ❌ Login error:`, error.message);
      sendJSON(res, 500, { error: error.message });
    }
    return true;
  }

  // POST /api/auth/logout - Invalidate token
  if (urlPath === '/api/auth/logout' && req.method === 'POST') {
    const token = getAuthToken(req);
    if (token) {
      authTokens.delete(token);
      console.log(`[${timestamp}] 🔓 Logout successful`);
    }
    sendJSON(res, 200, { success: true });
    return true;
  }

  // GET /api/auth/verify - Verify token is valid
  if (urlPath === '/api/auth/verify' && req.method === 'GET') {
    const valid = isAuthenticated(req);
    console.log(`[${timestamp}] 🔑 Token verification: ${valid ? 'valid' : 'invalid'}`);
    sendJSON(res, valid ? 200 : 401, { valid });
    return true;
  }

  // ============================================================================
  // CONTENT API - Central data storage for all site content
  // ============================================================================

  // GET /api/content - Get all content data
  if (urlPath === '/api/content' && req.method === 'GET') {
    console.log(`[${timestamp}] 📖 Fetching content data...`);
    const content = readDataFile('content.json', null);
    if (content) {
      sendJSON(res, 200, content);
    } else {
      sendJSON(res, 404, { error: 'Content not initialized' });
    }
    return true;
  }

  // POST /api/content - Save content data (PROTECTED)
  if (urlPath === '/api/content' && req.method === 'POST') {
    if (!isAuthenticated(req)) {
      console.log(`[${timestamp}] 🚫 Unauthorized content save attempt`);
      sendJSON(res, 401, { error: 'Nicht autorisiert' });
      return true;
    }
    console.log(`[${timestamp}] 💾 Saving content data...`);
    try {
      const body = await parseBody(req);
      const success = writeDataFile('content.json', body);
      if (success) {
        console.log(`[${timestamp}] ✅ Content saved successfully`);
        sendJSON(res, 200, { success: true });
      } else {
        sendJSON(res, 500, { error: 'Failed to save content' });
      }
    } catch (error) {
      console.error(`[${timestamp}] ❌ Content save error:`, error.message);
      sendJSON(res, 500, { error: error.message });
    }
    return true;
  }

  // ============================================================================
  // THEME API - Central theme configuration
  // ============================================================================

  // GET /api/theme - Get theme config
  if (urlPath === '/api/theme' && req.method === 'GET') {
    console.log(`[${timestamp}] 🎨 Fetching theme data...`);
    const theme = readDataFile('theme.json', null);
    if (theme) {
      sendJSON(res, 200, theme);
    } else {
      sendJSON(res, 404, { error: 'Theme not initialized' });
    }
    return true;
  }

  // POST /api/theme - Save theme config (PROTECTED)
  if (urlPath === '/api/theme' && req.method === 'POST') {
    if (!isAuthenticated(req)) {
      console.log(`[${timestamp}] 🚫 Unauthorized theme save attempt`);
      sendJSON(res, 401, { error: 'Nicht autorisiert' });
      return true;
    }
    console.log(`[${timestamp}] 🎨 Saving theme data...`);
    try {
      const body = await parseBody(req);
      const success = writeDataFile('theme.json', body);
      if (success) {
        console.log(`[${timestamp}] ✅ Theme saved successfully`);
        sendJSON(res, 200, { success: true });
      } else {
        sendJSON(res, 500, { error: 'Failed to save theme' });
      }
    } catch (error) {
      console.error(`[${timestamp}] ❌ Theme save error:`, error.message);
      sendJSON(res, 500, { error: error.message });
    }
    return true;
  }

  // ============================================================================
  // INQUIRIES API - Contact form submissions
  // ============================================================================

  // GET /api/inquiries - Get all inquiries (PROTECTED - only admin can see all)
  if (urlPath === '/api/inquiries' && req.method === 'GET') {
    if (!isAuthenticated(req)) {
      console.log(`[${timestamp}] 🚫 Unauthorized inquiries fetch attempt`);
      sendJSON(res, 401, { error: 'Nicht autorisiert' });
      return true;
    }
    console.log(`[${timestamp}] 📋 Fetching inquiries...`);
    const inquiries = readDataFile('inquiries.json', []);
    sendJSON(res, 200, inquiries);
    return true;
  }

  // POST /api/inquiries - Add new inquiry
  if (urlPath === '/api/inquiries' && req.method === 'POST') {
    console.log(`[${timestamp}] 📝 Saving new inquiry...`);
    try {
      const body = await parseBody(req);
      const inquiries = readDataFile('inquiries.json', []);
      inquiries.push(body);
      const success = writeDataFile('inquiries.json', inquiries);
      if (success) {
        console.log(`[${timestamp}] ✅ Inquiry saved successfully`);
        sendJSON(res, 200, { success: true, id: body.id });
      } else {
        sendJSON(res, 500, { error: 'Failed to save inquiry' });
      }
    } catch (error) {
      console.error(`[${timestamp}] ❌ Inquiry save error:`, error.message);
      sendJSON(res, 500, { error: error.message });
    }
    return true;
  }

  // DELETE /api/inquiries/:id - Delete inquiry (PROTECTED)
  if (urlPath.startsWith('/api/inquiries/') && req.method === 'DELETE') {
    if (!isAuthenticated(req)) {
      console.log(`[${timestamp}] 🚫 Unauthorized inquiry delete attempt`);
      sendJSON(res, 401, { error: 'Nicht autorisiert' });
      return true;
    }
    const inquiryId = urlPath.split('/').pop();
    console.log(`[${timestamp}] 🗑️ Deleting inquiry: ${inquiryId}`);
    try {
      const inquiries = readDataFile('inquiries.json', []);
      const filtered = inquiries.filter(i => i.id !== inquiryId);
      if (filtered.length === inquiries.length) {
        sendJSON(res, 404, { error: 'Inquiry not found' });
        return true;
      }
      const success = writeDataFile('inquiries.json', filtered);
      if (success) {
        console.log(`[${timestamp}] ✅ Inquiry deleted successfully`);
        sendJSON(res, 200, { success: true });
      } else {
        sendJSON(res, 500, { error: 'Failed to delete inquiry' });
      }
    } catch (error) {
      console.error(`[${timestamp}] ❌ Inquiry delete error:`, error.message);
      sendJSON(res, 500, { error: error.message });
    }
    return true;
  }

  // PUT /api/inquiries - Update all inquiries (bulk save) (PROTECTED)
  if (urlPath === '/api/inquiries' && req.method === 'PUT') {
    if (!isAuthenticated(req)) {
      console.log(`[${timestamp}] 🚫 Unauthorized inquiries bulk save attempt`);
      sendJSON(res, 401, { error: 'Nicht autorisiert' });
      return true;
    }
    console.log(`[${timestamp}] 💾 Bulk saving inquiries...`);
    try {
      const body = await parseBody(req);
      const success = writeDataFile('inquiries.json', body);
      if (success) {
        console.log(`[${timestamp}] ✅ Inquiries bulk saved successfully`);
        sendJSON(res, 200, { success: true });
      } else {
        sendJSON(res, 500, { error: 'Failed to save inquiries' });
      }
    } catch (error) {
      console.error(`[${timestamp}] ❌ Inquiries bulk save error:`, error.message);
      sendJSON(res, 500, { error: error.message });
    }
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
  
  // Only allow GET, HEAD, POST, PUT, DELETE, OPTIONS methods
  if (!['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'].includes(req.method)) {
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
║  Data:    ${DATA_DIR.padEnd(43)}║
╠════════════════════════════════════════════════════════╣
║  Auth API (Protected Endpoints):                        ║
║  POST /api/auth/login    - Login & get token            ║
║  POST /api/auth/logout   - Invalidate token             ║
║  GET  /api/auth/verify   - Verify token                 ║
╠════════════════════════════════════════════════════════╣
║  Content API (🔒 = requires auth):                       ║
║  GET      /api/content      - Site content              ║
║  POST 🔒  /api/content      - Save content              ║
║  GET      /api/theme        - Theme config              ║
║  POST 🔒  /api/theme        - Save theme                ║
║  GET  🔒  /api/inquiries    - Contact inquiries         ║
║  POST     /api/inquiries    - New inquiry (public)      ║
║  DELETE🔒 /api/inquiries/:id - Delete inquiry           ║
╠════════════════════════════════════════════════════════╣
║  Notion API:                                            ║
║  POST /api/contact       - Send to Notion               ║
║  GET  /api/notion/test   - Test connection              ║
║  GET  /api/notion/status - Check config                 ║
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
