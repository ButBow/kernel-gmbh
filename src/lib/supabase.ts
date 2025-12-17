import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ttdtwqvmegzjufxaligy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0ZHR3cXZtZWd6anVmeGFsaWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjMyMTcsImV4cCI6MjA4MTUzOTIxN30.wVQXhCepxniCQksZwns8V9eSGLJt6tbhlu9A-kEoJqk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
