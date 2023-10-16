import React from 'react';
import { PEOPLE_ASIDE } from '@custom/shared/components/Aside/PeopleAside';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { BACKROOM_ASIDE } from '../Call/BackRoomAside';


export const BackRoomHeader = () => {
  const { showAside, setShowAside } = useUIState();
  const{localParticipant} = useParticipants();

  return (
    <>
      <div className="aside-header">
        
        <div
          className={`tab ${showAside === BACKROOM_ASIDE && 'active'}`}
          onClick={() => setShowAside(BACKROOM_ASIDE)}
        >
          <p>BackRoom</p>
        </div>
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
        }
        
        .tab {
          height: 100%;
          width: 50%;
          cursor: pointer;
        }
        
        .tab.active {
          background: var(--reverse)!important;
          color: var(--text-default)!important;
          font-weight: 900;
        }
      `}</style>
    </>
  )
};

export default BackRoomHeader;