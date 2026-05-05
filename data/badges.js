export const BADGE_DEFINITIONS = [
  {
    id: 'dish-destroyer',
    name: 'Dish Destroyer',
    description: 'Washed dishes 10 times',
    icon: '🍽️',
    color: '#00f0ff',
    check: (completions, profileId) => {
      return completions.filter(c => c.choreId === 'wash-dishes' && c.profileId === profileId).length >= 10;
    },
  },
  {
    id: 'bathroom-boss',
    name: 'Bathroom Boss',
    description: 'Cleaned bathroom 5 times',
    icon: '🚿',
    color: '#a855f7',
    check: (completions, profileId) => {
      return completions.filter(c => c.choreId === 'clean-bathroom' && c.profileId === profileId).length >= 5;
    },
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Completed 5 chores in one day',
    icon: '⚡',
    color: '#ffd700',
    check: (completions, profileId) => {
      const byDay = {};
      completions
        .filter(c => c.profileId === profileId)
        .forEach(c => {
          const day = new Date(c.timestamp).toDateString();
          byDay[day] = (byDay[day] || 0) + 1;
        });
      return Object.values(byDay).some(count => count >= 5);
    },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Completed a chore after 10 PM',
    icon: '🦉',
    color: '#6366f1',
    check: (completions, profileId) => {
      return completions.some(c => {
        if (c.profileId !== profileId) return false;
        const hour = new Date(c.timestamp).getHours();
        return hour >= 22 || hour < 4;
      });
    },
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: '7-day streak',
    icon: '🔥',
    color: '#ff2d7b',
    check: (_, profileId, profiles) => {
      const profile = profiles.find(p => p.id === profileId);
      return profile && profile.streak >= 7;
    },
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Did chores on 3 weekends',
    icon: '⚔️',
    color: '#00ff88',
    check: (completions, profileId) => {
      const weekends = new Set();
      completions
        .filter(c => c.profileId === profileId)
        .forEach(c => {
          const d = new Date(c.timestamp);
          const day = d.getDay();
          if (day === 0 || day === 6) {
            weekends.add(d.toDateString());
          }
        });
      return weekends.size >= 3;
    },
  },
  {
    id: 'the-ghost-badge',
    name: 'The Ghost',
    description: '0 chores in 3 days (shame!)',
    icon: '💀',
    color: '#6b7280',
    isShame: true,
    check: (completions, profileId, profiles) => {
      const profile = profiles.find(p => p.id === profileId);
      if (!profile || !profile.lastActive) return false;
      const daysSinceActive = (Date.now() - new Date(profile.lastActive).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive >= 3;
    },
  },
  {
    id: 'big-brain',
    name: 'Big Brain',
    description: 'Completed 5 hard chores',
    icon: '🧠',
    color: '#f59e0b',
    check: (completions, profileId) => {
      const hardChoreIds = ['clean-bathroom', 'clean-fridge', 'replace-water-filter'];
      return completions.filter(c => c.profileId === profileId && hardChoreIds.includes(c.choreId)).length >= 5;
    },
  },
];
