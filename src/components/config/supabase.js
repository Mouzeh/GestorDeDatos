import { createClient } from '@supabase/supabase-js'

// TUS CREDENCIALES REALES
const supabaseUrl = 'https://giyrxqaqmgsclaucptli.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpeXJ4cWFxbWdzY2xhdWNwdGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODE0OTcsImV4cCI6MjA3OTY1NzQ5N30.QcU32seWTfY2wNdbNsd7NQ1RG9EXYWxLLPNRtZ9Sm4E'

console.log('🔗 Conectando a Supabase:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})