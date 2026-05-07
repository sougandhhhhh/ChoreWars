import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Data sync will not work.')
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { 
      from: () => ({ 
        select: () => ({ 
          order: () => Promise.resolve({ data: [], error: null }),
          select: () => ({ order: () => Promise.resolve({ data: [], error: null }) })
        }),
        upsert: () => Promise.resolve({ error: null }),
        insert: () => Promise.resolve({ error: null }),
        delete: () => Promise.resolve({ error: null }),
        update: () => Promise.resolve({ error: null })
      }),
      channel: () => ({
        on: () => ({
          subscribe: () => ({})
        }),
        subscribe: () => ({})
      }),
      removeChannel: () => Promise.resolve(),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    } as any;
