import React from 'react';
import Button from '@custom/shared/components/Button';
import { TrayButton } from '@custom/shared/components/Tray';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconChat } from '@custom/shared/icons/chat-md.svg';
import { useChat } from '../../contexts/ChatProvider';
import { CHAT_ASIDE } from '../Call/ChatAside';


export const ChatTray = ({isSmall}) => {
  const { toggleAside } = useUIState();
  const { hasNewMessages } = useChat();
  const { localParticipant } = useParticipants();

  return (
    <>
    {isSmall ? (
       <Button
              className="translucent"
              onClick={() => toggleAside(CHAT_ASIDE)}
              IconBefore={IconChat}
            >
              {localParticipant.isObserver ? 'Ques' : 'Chat'}
            </Button>
    ) : (
    <TrayButton
      label={localParticipant.isObserver ? 'Ques' : 'Chat'}
      bubble={hasNewMessages}
      onClick={() => toggleAside(CHAT_ASIDE)}
    >
      <IconChat />
    </TrayButton>
    )}
    </>
  );
};

export default ChatTray;
