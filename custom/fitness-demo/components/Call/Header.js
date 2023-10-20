import React, { useMemo, useCallback } from 'react';
import Button from '@custom/shared/components/Button';
import HeaderCapsule from '@custom/shared/components/HeaderCapsule';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import {ReactComponent as AddOthersIcon} from '@custom/shared/icons/add-others.svg';
import {ReactComponent as IconGrid} from '@custom/shared/icons/grid-md.svg';
import { ReactComponent as IconLock } from '@custom/shared/icons/lock-md.svg';
import {ReactComponent as IconSpeaker} from '@custom/shared/icons/speaker-view-md.svg';
import { slugify } from '@custom/shared/lib/slugify';
import { INVITE_MODAL } from './InviteLinksModal';

export const Header = () => {
  const { roomInfo } = useCallState();
  const { participantCount, localParticipant } = useParticipants();
  const { customCapsule, openModal,viewMode, setViewMode,setPinnedId} = useUIState();
 

  return useMemo(
    () => (
      <header className="room-header">
        <img
          src="/assets/daily-logo.svg"
          alt="Daily"
          className="logo"
          width="80"
          height="32"
        />

        <HeaderCapsule>
          {roomInfo.privacy === 'private' && <IconLock />}
          {slugify.revert(roomInfo.name)}
        </HeaderCapsule>
        {!localParticipant.isObserver ? (
          <div className="invite">
            <HeaderCapsule>
              {`${participantCount} ${
                participantCount === 1 ? 'participant' : 'participants'
              }`}
            </HeaderCapsule>
          </div>
        ) : null}

        {customCapsule && (
          <HeaderCapsule variant={customCapsule.variant}>
            {customCapsule.variant === 'recording' && <span />}
            {customCapsule.label}
          </HeaderCapsule>
        )}
        {localParticipant.isOwner ? (
          <div className="invite invite-btn" onClick={() => openModal(INVITE_MODAL)}>
            <span className="invite-text">Invite</span>
            <span className="icon">
              <AddOthersIcon />
            </span>
          </div>
        ) : null}
        {viewMode !== 'fullscreen' ? (
          <div className="view-switcher">
            <Button
              className="grid-view"
              variant={viewMode === 'grid' ? 'primary' : 'outline-gray'}
              size="tiny-square"
              onClick={() => {
                setPinnedId(null);
                setViewMode('grid');
              }}
            >
              <IconGrid />
            </Button>
            <Button
              className="speaker-view"
              variant={viewMode === 'speaker' ? 'primary' : 'outline-gray'}
              size="tiny-square"
              onClick={() => {
                setViewMode('speaker');
              }}
            >
              <IconSpeaker />
            </Button>
          </div>
        ) : null}
        <style jsx>{`
          .room-header {
            display: flex;
            flex: 0 0 auto;
            column-gap: var(--spacing-xxs);
            box-sizing: border-box;
            padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-xxs)
              var(--spacing-sm);
            align-items: center;
            width: 100%;
            flex-wrap: wrap;
          }

          .logo {
            margin-right: var(--spacing-xs);
          }
          .invite {
            margin-left: 0;
            margin-right: 0;
          }
          .icon {
            margin-left: var(--spacing-xxs);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .view-switcher {
            display: flex;
            column-gap: var(--spacing-xxs);
            margin-left: auto;
            margin-right: var(--spacing-xs);
          }
          .invite-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            flex-direction: row;
            width: max-content;
            background-color: var(--primary-default);
            padding: 6px 10px;
            border-radius: 10px;
            color :black;
          }
          @media (max-width: 768px) {
            .room-header {
              padding: var(--spacing-xxs) var(--spacing-xs) var(--spacing-xs)
                var(--spacing-xs);
            }
            .invite {
              display: none;
            }
            .invite-btn {
              display:flex;
              gap:0;
            }
            .invite-text {
              display: none;
            }
            .logo {
              margin-right: 0;
            }
          }
        `}</style>
      </header>
    ),
    [roomInfo.privacy, roomInfo.name, participantCount, customCapsule]
  );
};

export default Header;
