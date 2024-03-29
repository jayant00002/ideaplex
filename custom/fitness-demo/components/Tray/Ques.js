import React from 'react';
import Button from '@custom/shared/components/Button';
import { TrayButton } from '@custom/shared/components/Tray';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconChat } from '@custom/shared/icons/chat-md.svg';
import { useChat } from '../../contexts/ChatProvider';
import { QUES_ASIDE } from '../Call/QuesAside';


export const QuesTray= ({isSmall}) => {
  const { toggleAside } = useUIState();
  const { hasNewMessages } = useChat();
  const { localParticipant } = useParticipants();
  if(!localParticipant.isOwner) return null;
  return (
    <>
    {isSmall ? (
        <Button
                className="translucent"
                onClick={() => toggleAside(QUES_ASIDE)}
                IconBefore={IconChat}
              >
                Ques
              </Button>
      ) : (
    <TrayButton
      label={'Ques'}
      bubble={hasNewMessages}
      onClick={() => toggleAside(QUES_ASIDE)}
    >
      <IconChat />
    </TrayButton>
    )}
    </>
  );
};

export default QuesTray;
