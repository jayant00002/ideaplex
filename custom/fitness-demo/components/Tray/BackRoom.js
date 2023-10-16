import React from 'react';
import { TrayButton } from '@custom/shared/components/Tray';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconChat } from '@custom/shared/icons/chat-md.svg';
import { useChat } from '../../contexts/ChatProvider';
import { BACKROOM_ASIDE } from '../Call/BackRoomAside';


export const BackRoomTray = () => {
  const { toggleAside } = useUIState();
  const { hasBackroomNewMessages } = useChat();
  const { localParticipant } = useParticipants();

  return (
    <>
    {localParticipant?.isObserver ? (
    <TrayButton
      label={'BackRoom'}
      bubble={hasBackroomNewMessages}
      onClick={() => toggleAside(BACKROOM_ASIDE)}
    >
      <IconChat />
    </TrayButton>
    ) : (
        null
    )}
   </>
  );
};

export default BackRoomTray;
