import React from 'react';
import { PEOPLE_ASIDE } from '@custom/shared/components/Aside/PeopleAside';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { CHAT_ASIDE } from '../Call/ChatAside';


export const AsideHeader = () => {
  const { showAside, setShowAside } = useUIState();
  const{localParticipant} = useParticipants();

  return (
    <>
      <div className="aside-header">
        {localParticipant.isOwner && showAside === PEOPLE_ASIDE && (
          <div
            className={`tab ${showAside === PEOPLE_ASIDE && 'active'}`}
            onClick={() => setShowAside(PEOPLE_ASIDE)}
          >
            <p>People</p>
          </div>
        )}
        {showAside === CHAT_ASIDE && (
          <div
            className={`tab ${showAside === CHAT_ASIDE && 'active'}`}
            onClick={() => setShowAside(CHAT_ASIDE)}
          >
            <p>{localParticipant.isObserver ? 'Ques' : 'Chat'}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .aside-header {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 5vh;
          text-align: center;
          background: var(--gray-wash);
          color: var(--gray-dark);
          border-radius: var(--radius-sm) !important;
          margin-top: 0.5rem;
        }

        .tab {
          height: 100%;
          width: 100%;
          cursor: pointer;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          
        }

        .tab.active {
          background: var(--gray-wash);
          color: var(--text-default) !important;
          font-weight: 900;
        }
      `}</style>
    </>
  );
};

export default AsideHeader;