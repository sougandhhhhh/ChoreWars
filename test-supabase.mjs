import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8')
const env = {}
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=')
  if (key && value.length > 0) env[key.trim()] = value.join('=').trim()
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('--- SUPABASE DOCTOR ---')
console.log('URL:', supabaseUrl)
console.log('Key Length:', supabaseAnonKey?.length)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnostic() {
  try {
    console.log('\n1. Testing Connection (Select 1 from profiles)...')
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    
    if (error) {
      console.error('FAILED: could not read from profiles table.')
      console.error('Error details:', JSON.stringify(error, null, 2))
    } else {
      console.log('SUCCESS: Connected to profiles table.')
    }

    console.log('\n2. Testing Insert (Chore Log)...')
    const testLog = {
      chore_id: 'doctor-test',
      user_id: 'sanjjay',
      points_earned: 0,
      notes: 'Diagnostic test from terminal'
    }
    
    const { error: insertError } = await supabase.from('chore_logs').insert([testLog])
    
    if (insertError) {
      console.error('FAILED: could not insert into chore_logs.')
      console.error('Error details:', JSON.stringify(insertError, null, 2))
    } else {
      console.log('SUCCESS: Inserted test row into chore_logs.')
    }
  } catch (err) {
    console.error('CRITICAL ERROR DURING DIAGNOSTIC:', err)
  }
}

diagnostic()
