import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase project URL and anon key
const supabaseUrl = 'https://zlyzncxdvhxzwalafirm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseXpuY3hkdmh4endhbGFmaXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NTEwOTMsImV4cCI6MjA2ODAyNzA5M30.FBpChDOFcvQD66mLaCz8iwqbTHe-ZZ_M1FlRW57gYlA';

export const supabase = createClient(supabaseUrl, supabaseKey);
