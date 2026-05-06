import { supabase } from './supabase'

export async function uploadLocalDataToSupabase(state: any) {
  console.log('DEBUG: Starting uploadLocalDataToSupabase')

  try {
    const people = ["sanjjay", "sougandh", "chris", "haady", "kichu"]
    
    // 1. Sync Profiles (Points)
    console.log('DEBUG: Syncing Profiles...')
    const profileData = people.map(pid => {
      let totalPoints = 0
      Object.values(state.completionStats || {}).forEach((choreStats: any) => {
        const stat = choreStats[pid]
        if (stat) {
          totalPoints += (stat.count || 0) * 100
          totalPoints += (stat.points || 0)
        }
      })
      return { id: pid, display_name: pid.charAt(0).toUpperCase() + pid.slice(1), total_points: totalPoints }
    })

    const { error: profError } = await supabase.from('profiles').upsert(profileData)
    if (profError) console.error('DEBUG: Profile Sync Error:', profError)

    // 2. Sync History (Chore Logs)
    if (state.history && state.history.length > 0) {
      console.log('DEBUG: Syncing History (' + state.history.length + ' logs)...')
      const logs = state.history.map((h: any) => ({
        created_at: h.timestamp,
        chore_id: h.choreId,
        user_id: h.loggerId,
        helper_ids: h.helperIds || [],
        notes: h.notes || '',
        points_earned: h.pointsEarned || 0
      }))

      const { error: logError } = await supabase.from('chore_logs').upsert(logs)
      if (logError) console.error('DEBUG: Log Sync Error:', logError)
    }

    // 3. Sync Warnings
    if (state.warnings && state.warnings.length > 0) {
      console.log('DEBUG: Syncing Warnings...')
      const warnings = state.warnings.map((w: any) => ({
        id: w.id,
        target_user_id: w.targetPid,
        chore_id: w.choreId,
        issued_by: w.issuedBy,
        issued_at: w.issuedAt,
        completed: w.completed,
        penalty_applied: w.penaltyApplied
      }))
      await supabase.from('warnings').upsert(warnings)
    }

    // 4. Sync Reward Polls
    if (state.rewardPolls && state.rewardPolls.length > 0) {
      console.log('DEBUG: Syncing Reward Polls...')
      const polls = state.rewardPolls.map((p: any) => ({
        id: p.id,
        chore_id: p.choreId,
        chore_name: p.choreName,
        requested_by: p.requestedBy,
        requested_points: p.requestedPoints,
        status: p.status,
        votes: p.votes || {},
        created_at: p.choreDate || new Date().toISOString()
      }))
      await supabase.from('reward_polls').upsert(polls)
    }

    console.log('DEBUG: uploadLocalDataToSupabase SUCCESS')
    return true
  } catch (error) {
    console.error('DEBUG: uploadLocalDataToSupabase FATAL ERROR:', error)
    return false
  }
}

export async function fetchSupabaseData() {
  const { data: profiles } = await supabase.from('profiles').select('*')
  const { data: logs } = await supabase.from('chore_logs').select('*').order('created_at', { ascending: false })
  const { data: warnings } = await supabase.from('warnings').select('*')
  const { data: polls } = await supabase.from('reward_polls').select('*')

  return { profiles, logs, warnings, polls }
}
