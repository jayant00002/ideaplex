import React, { useCallback } from 'react';
import { Aside } from '@custom/shared/components/Aside';
import Button from '@custom/shared/components/Button';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import {ReactComponent as AddIcon} from '@custom/shared/icons/add-md.svg';
import { ReactComponent as IconCamOff } from '@custom/shared/icons/camera-off-sm.svg';
import { ReactComponent as IconCamOn } from '@custom/shared/icons/camera-on-sm.svg';
import { ReactComponent as IconMicOff } from '@custom/shared/icons/mic-off-sm.svg';
import { ReactComponent as IconMicOn } from '@custom/shared/icons/mic-on-sm.svg';
import { ReactComponent as Pin } from '@custom/shared/icons/pin.svg';
import {ReactComponent as RemoveIcon} from '@custom/shared/icons/remove.svg';
import PropTypes from 'prop-types';
import AsideHeader from '../App/AsideHeader';
import { REMOVE_USER_MODAL } from '../RemoveUser/RemoveUser';
export const PEOPLE_ASIDE = 'people';

const PersonRow = ({
  participant,
  isOwner = false,
  setPinnedId,
  setPreferredViewMode,
  pinnedId,
  callObject,
  openModal,
  removeUser,
  setRemoveUser,
}) => (
  <div className="person-row">
    <div className="name">
      {participant.name} {participant.isLocal && '(You)'}
    </div>
    <div className="actions">
      {!isOwner ? (
        <>
          <span
            className={participant.isCamMuted ? 'state error' : 'state success'}
          >
            {participant.isCamMuted ? <IconCamOff /> : <IconCamOn />}
          </span>
          <span
            className={participant.isMicMuted ? 'state error' : 'state success'}
          >
            {participant.isMicMuted ? <IconMicOff /> : <IconMicOn />}
          </span>
        </>
      ) : (
        <>
          <Button
            size="tiny-square"
            disabled={participant.isCamMuted}
            variant={participant.isCamMuted ? 'error-light' : 'success-light'}
          >
            {participant.isCamMuted ? <IconCamOff /> : <IconCamOn />}
          </Button>
          <Button
            size="tiny-square"
            disabled={participant.isMicMuted}
            variant={participant.isMicMuted ? 'error-light' : 'success-light'}
          >
            {participant.isMicMuted ? <IconMicOff /> : <IconMicOn />}
          </Button>
        </>
      )}
      {/* pin option button here */}
      {participant.isLocal || participant.isObserver ? null : (
        <span className="pin-mode">
          <Button
            size="tiny-square"
            variant="outline-gray"
            className="pin"
            onClick={() => {
              if (participant.isLocal) {
                setPinnedId(null);
                setPreferredViewMode('grid');
                return;
              } else {
                if (pinnedId === participant.id) {
                  setPinnedId(null);
                  setPreferredViewMode('grid');
                } else {
                  setPinnedId(participant.id);
                  setPreferredViewMode('speaker');
                }
              }
            }}
          >
            {pinnedId === participant.id ? (
              <Pin fill="black" />
            ) : (
              <Pin fill="gray" />
            )}
          </Button>
        </span>
      )}
      {/* upgrade to participant button here */}
      {participant.isObserver ? (
        <span className="upgrade">
          <Button
            size="tiny-square"
            variant="success-light"
            onClick={() => {
              callObject.sendAppMessage(
                { type: 'upgrade', id: participant.id },
                participant.id
              );
            }}
          >
            <AddIcon />
          </Button>
        </span>
      ) : null}
      {/*remove from call button here */}
      {!participant.isLocal ? (
        <span className="remove">
          <Button
            size="tiny-square"
            variant="error-light"
            onClick={() => {
              openModal(REMOVE_USER_MODAL);
              setRemoveUser(participant);
            }}
          >
            <RemoveIcon />
          </Button>
        </span>
      ) : null}
    </div>
    <style jsx>{`
      .person-row {
        display: flex;
        border-bottom: 1px solid var(--gray-light);
        padding-bottom: var(--spacing-xxxs);
        margin-bottom: var(--spacing-xxxs);
        justify-content: space-between;
        align-items: center;
        flex: 1;
      }
      .person-row .name {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .person-row .actions {
        display: flex;
        gap: var(--spacing-xxxs);
        margin-left: var(--spacing-xs);
      }
      .mute-state {
        display: flex;
        width: 24px;
        height: 24px;
        align-items: center;
        justify-content: center;
      }
      .state.error {
        color: var(--red-default);
      }
      .state.success {
        color: var(--green-default);
      }
      .pin {
        display: flex;
        width: 20px;
        height: 20px;
        align-items: center;
        justify-content: center;
      }
    `}</style>
  </div>
);
PersonRow.propTypes = {
  participant: PropTypes.object,
  isOwner: PropTypes.bool,
};

export const PeopleAside = () => {
  const { callObject } = useCallState();
  const {
    showAside,
    setShowAside,
    setPinnedId,
    pinnedId,
    setPreferredViewMode,
    openModal,
    removeUser,
    setRemoveUser,
  } = useUIState();
  const { participants, isOwner } = useParticipants();
  
  const muteAll = useCallback(
    (deviceType) => {
      let updatedParticipantList = {};
      // Accommodate muting mics and cameras
      const newSetting =
        deviceType === 'video' ? { setVideo: false } : { setAudio: false };
      for (let id in callObject.participants()) {
        // Do not update the local participant's device (aka the instructor)
        if (id === 'local') continue;

        updatedParticipantList[id] = newSetting;
      }

      // Update all participants at once
      callObject.updateParticipants(updatedParticipantList);
    },
    [callObject]
  );

  const handleMuteAllAudio = () => muteAll('audio');
  const handleMuteAllVideo = () => muteAll('video');

  if (!showAside || showAside !== PEOPLE_ASIDE) {
    return null;
  }

  return (
    <Aside onClose={() => setShowAside(false)}>
      <AsideHeader />
      <div className="people-aside">
        {isOwner && (
          <div className="owner-actions">
            <Button
              fullWidth
              size="tiny"
              variant="outline-gray"
              onClick={handleMuteAllAudio}
            >
              Mute all mics
            </Button>
            <Button
              fullWidth
              size="tiny"
              variant="outline-gray"
              onClick={handleMuteAllVideo}
            >
              Mute all cams
            </Button>
          </div>
        )}
        <div className="rows">
          {participants.map((p) => (
            
            <PersonRow participant={p} key={p.id} isOwner={isOwner} setPinnedId={setPinnedId} setPreferredViewMode={setPreferredViewMode}
            pinnedId={pinnedId} callObject={callObject} openModal={openModal} removeUser={removeUser} setRemoveUser={setRemoveUser}/>
          
          ))}
        </div>
        <style jsx>
          {`
            .people-aside {
              display: block;
            }
            .owner-actions {
              display: flex;
              align-items: center;
              gap: var(--spacing-xxxs);
              margin: var(--spacing-xs) var(--spacing-xxs);
              flex: 1;
            }
            .rows {
              margin: var(--spacing-xxs);
              flex: 1;
            }
          `}
        </style>
      </div>
    </Aside>
  );
};

export default PeopleAside;
