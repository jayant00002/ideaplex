import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconChat } from '@custom/shared/icons/chat-md.svg';
import { useChat } from '../../contexts/ChatProvider';
import { CHAT_ASIDE } from '../Call/ChatAside';


export const ChatTray = () => {
  const { toggleAside } = useUIState();
  const { hasNewMessages } = useChat();
  const { localParticipant } = useParticipants();

  return (
    <TrayButton
      label={localParticipant.isObserver ? 'Ques' : 'Chat'}
      bubble={hasNewMessages}
      onClick={() => toggleAside(CHAT_ASIDE)}
    >
      <IconChat />
    </TrayButton>
  );
};

export default ChatTray;
