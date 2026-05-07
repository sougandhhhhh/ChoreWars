import React from 'react';
import { Info, Vote as VoteIcon } from 'lucide-react';
import './rewardPollingStation.css';

export type PollItem = {
  id: string;
  title: string;
  short?: string;
  details: string;
  status?: string;
  hasVoted?: boolean;
  isParticipant?: boolean;
  voteProgress?: number; // 0 to 1
  voteSummary?: string;  // e.g. "2/4 voted"
  points?: number;
  requesterName?: string;
};

type Props = {
  items: PollItem[];
  onVote?: (item: PollItem) => void;
};

export const RewardPollingStation: React.FC<Props> = ({ items, onVote }) => {
  const displayItems = items.slice(0, 3);

  return (
    <section className="rcs-reward-polling-boxes" aria-label="Reward Polling Station">
      <div className="rcs-boxes-container">
        {displayItems.map((it) => {
          const canVote = !it.hasVoted && !it.isParticipant;
          
          return (
            <div key={it.id} className={`rcs-poll-box ${it.hasVoted ? 'voted' : ''} ${it.isParticipant ? 'participant' : ''}`}>
              <div className="rcs-box-info">
                <span className="rcs-box-title">{it.title}</span>
                <span className="rcs-box-subtitle">{it.voteSummary || 'Pending'}</span>
              </div>
              
              <button 
                className={`rcs-box-btn ${canVote ? 'btn-vote' : 'btn-info'}`}
                onClick={() => onVote?.(it)}
              >
                {canVote ? (
                  <>
                    <VoteIcon className="w-3 h-3" />
                    <span>VOTE</span>
                  </>
                ) : (
                  <>
                    <Info className="w-3 h-3" />
                    <span>INFO</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
        
        {/* Fill empty slots */}
        {[...Array(Math.max(0, 3 - displayItems.length))].map((_, i) => (
          <div key={`empty-${i}`} className="rcs-poll-box-placeholder">
          </div>
        ))}
      </div>
    </section>
  );
};

export default RewardPollingStation;
