import React, { useMemo, useState } from 'react';
import './rewardPollingStation.css';

export type PollItem = {
  id: string;
  title: string;
  short?: string;
  details: string;
  status?: string;
  hasVoted?: boolean;
  isParticipant?: boolean;
};

type Props = {
  items: PollItem[];
  onVote?: (item: PollItem) => void;
};

// Compact, expandable reward polling cards laid out in a 3-column grid.
export const RewardPollingStation: React.FC<Props> = ({ items, onVote }) => {
  // Track per-item expansion state
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleVote = (it: PollItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onVote?.(it);
  };

  // Show a compact short description if available, otherwise a trimmed version
  const displayShort = (item: PollItem) => {
    if (item.short) return item.short;
    // Fallback: first 80 chars of details
    const s = item.details || '';
    return s.length > 80 ? s.substring(0, 80) + '…' : s;
  };

  // Simple safe key for list rendering
  const gridTemplate = useMemo(() => {
    return 'repeat(3, 1fr)';
  }, []);

  return (
    <section className="rcs-reward-polling-station" aria-label="Reward Polling Station">
      <div className="rcs-grid" style={{ gridTemplateColumns: gridTemplate as any }}>
        {items.map((it) => {
          const isExp = expanded.has(it.id);
          return (
            <article key={it.id} className={`rcs-card ${isExp ? 'expanded' : ''}`} onClick={(e) => handleVote(it, e)}>
              <header className="rcs-card-header" onClick={(e) => toggle(it.id, e)} role="button" aria-expanded={isExp} aria-label={`Toggle details for ${it.title}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(it.id, e as any); }}>
                <div className="rcs-card-title">{it.title}</div>
                <div className="rcs-card-status">{it.status ?? ''}</div>
              </header>
              <div className={`rcs-card-details ${isExp ? 'open' : ''}`} aria-hidden={!isExp}>
                <div className="rcs-card-summary">{displayShort(it)}</div>
                <div className="rcs-details-content">{it.details}</div>
              </div>
              <div className="rcs-card-actions">
                <button className={`rcs-vote-btn ${it.hasVoted ? 'info-state' : ''}`} onClick={(e) => handleVote(it, e)}>
                  {it.isParticipant ? 'PARTICIPANT' : it.hasVoted ? 'Info' : 'Vote'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default RewardPollingStation;
