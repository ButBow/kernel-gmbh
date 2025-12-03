// Security utilities for input validation and sanitization

import { z } from 'zod';

// URL validation schema - allows empty strings or valid URLs
export const urlSchema = z.string().refine(
  (val) => {
    if (!val || val.trim() === '') return true;
    try {
      const url = new URL(val);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  },
  { message: 'Bitte geben Sie eine gültige URL ein (https://...)' }
);

// Email validation
export const emailSchema = z.string().email('Ungültige E-Mail-Adresse');

// Phone validation (Swiss format)
export const phoneSchema = z.string().regex(
  /^(\+41|0)[0-9\s]{9,15}$/,
  'Ungültige Telefonnummer'
);

// Text sanitization - removes potential XSS vectors
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// URL sanitization - ensures URL is safe
export function sanitizeUrl(url: string): string {
  if (!url || url.trim() === '') return '';
  
  const trimmed = url.trim();
  
  // Block javascript: and data: URLs
  const lowerUrl = trimmed.toLowerCase();
  if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
    return '';
  }
  
  // Ensure URL has protocol
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  
  return trimmed;
}

// Validate and sanitize external link
export function isValidExternalUrl(url: string): boolean {
  if (!url || url.trim() === '') return true; // Empty is valid (optional field)
  
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Input length limits
export const INPUT_LIMITS = {
  name: 100,
  email: 255,
  phone: 30,
  url: 500,
  shortText: 200,
  mediumText: 500,
  longText: 2000,
  richText: 10000,
} as const;

// Truncate text to limit
export function truncateToLimit(text: string, limit: number): string {
  if (!text) return '';
  return text.slice(0, limit);
}

// Check if string contains potential script injection
export function containsScriptInjection(input: string): boolean {
  if (!input) return false;
  const lowerInput = input.toLowerCase();
  const dangerousPatterns = [
    '<script',
    'javascript:',
    'onerror=',
    'onload=',
    'onclick=',
    'onmouseover=',
    'eval(',
    'document.cookie',
    'document.write',
  ];
  return dangerousPatterns.some(pattern => lowerInput.includes(pattern));
}
