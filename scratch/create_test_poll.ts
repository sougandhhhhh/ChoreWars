
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestPoll() {
  const pollId = `poll-test-${Date.now()}`
  const { error } = await supabase.from('reward_polls').insert({
    id: pollId,
    chore_id: 'extra',
    chore_name: 'TEST REWARD CHORE',
    requested_by: 'sougandh',
    requested_points: 50,
    status: 'pending',
    votes: {},
    created_at: new Date().toISOString()
  })
  
  if (error) console.error('Error creating test poll:', error)
  else console.log('Test poll created:', pollId)
}

createTestPoll()
