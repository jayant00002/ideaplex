import React, { useEffect, useRef, useState } from 'react';
import { Aside } from '@custom/shared/components/Aside';
import Button from '@custom/shared/components/Button';
import { Card,CardBody } from '@custom/shared/components/Card';
import { TextInput } from '@custom/shared/components/Input';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import useMessageSound from '@custom/shared/hooks/useMessageSound';
import { ReactComponent as IconEmoji } from '@custom/shared/icons/emoji-sm.svg';
import { useChat } from '../../contexts/ChatProvider';
import BackRoomHeader from '../App/BackRoomHeader';



export const BACKROOM_ASIDE = 'backroom';

export const BackRoomAside = () => {
  const { showAside, setShowAside } = useUIState();
  const { sendMessage, backroomChatHistory, hasBackroomNewMessages, setHasBackroomNewMessages } =
    useChat();
  const [newMessage, setNewMessage] = useState('');
   const playMessageSound = useMessageSound();
  const [showEmojis, setShowEmojis] = useState(false);
  const { localParticipant } = useParticipants();
  const emojis = ['😍', '😭', '😂', '👋', '🙏'];
  const chatWindowRef = useRef();

  useEffect(() => {
    // Clear out any new message notifications if we're showing the chat screen
    if (showAside === BACKROOM_ASIDE) {
      setHasBackroomNewMessages(false);
    }
    console.log(backroomChatHistory)
  }, [showAside, backroomChatHistory?.length, setHasBackroomNewMessages]);

  useEffect(() => {
    if (hasBackroomNewMessages && showAside !== BACKROOM_ASIDE) {
       playMessageSound();
    }
  }, [playMessageSound, showAside, hasBackroomNewMessages]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [backroomChatHistory?.length]);

  if (!showAside || showAside !== BACKROOM_ASIDE) {
    return null;
  }

  return (
    <Aside onClose={() => setShowAside(false)}>
      <BackRoomHeader />
      <div className="info-container">
        The BackRoom is for the observers only. Any messages sent here will not
        be seen by the participants or the moderators in the meeting.
      </div>

      {!localParticipant?.isOwner && (
        <div className="messages-container" ref={chatWindowRef}>
          {backroomChatHistory?.map((chatItem) => (
            <div
              className={chatItem.isLocal ? 'message local' : 'message'}
              key={chatItem.id}
            >
              <span className="content">{chatItem.message}</span>
              <span className="sender">{chatItem.sender}</span>
            </div>
          ))}
        </div>
      )}
      {showEmojis && (
        <div className="emojis">
          {emojis.map((emoji) => (
            <Button
              key={emoji}
              variant="gray"
              size="small-circle"
              onClick={() => sendMessage(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      )}
      <footer className="chat-footer">
        <Button
          variant="gray"
          size="small-circle"
          onClick={() => setShowEmojis(!showEmojis)}
        >
          <IconEmoji />
        </Button>
        <TextInput
          value={newMessage}
          placeholder="Type message here"
          variant="transparent"
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button
          className="send-button"
          variant="transparent"
          disabled={!newMessage}
          onClick={() => {
            sendMessage(newMessage, 'observer');
            setNewMessage('');
          }}
        >
          Send
        </Button>
      </footer>
      <style jsx>{`
        .emojis {
          position: absolute;
          display: flex;
          bottom: var(--spacing-xxl);
          left: 0px;
          transform: translateX(calc(-50% + 26px));
          z-index: 99;
          background: white;
          padding: var(--spacing-xxxs);
          column-gap: 5px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-depth-2);
        }
        .info-container {
          color: var(--primary-dark);
          width: 100%;
          background-color: #d9edf7;
          margin-top: 20px;
          padding: 20px;
          border-radius: 8px;
        }
        .messages-container {
          flex: 1;
          overflow-y: scroll;
        }

        .message {
          margin: var(--spacing-xxs);
          padding: var(--spacing-xxs);
          background: var(--gray-wash);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
        }
        .observer-tab {
          background: #3c3e46;
        }
        .message.local {
          background: var(--gray-light);
        }

        .message.local .sender {
          color: var(--primary-dark);
        }

        .content {
          color: var(--text-mid);
          display: block;
        }

        .sender {
          font-weight: var(--weight-medium);
          font-size: 0.75rem;
        }

        .chat-footer {
          flex-flow: row nowrap;
          box-sizing: border-box;
          padding: var(--spacing-xxs) 0;
          display: flex;
          position: relative;
          border-top: 1px solid var(--gray-light);
        }

        .chat-footer :global(.input-container) {
          flex: 1;
        }

        .chat-footer :global(.input-container input) {
          padding-right: 0;
        }

        .chat-footer :global(.send-button) {
          padding: 0 var(--spacing-xs);
        }
        .aside-header {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 5vh;
          text-align: center;
          background: var(--gray-wash);
          color: var(--gray-dark);
          margin-top: 0.5rem;
        }

        .tab {
          height: 100%;
          width: 50%;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .tab.active {
          background: #1bebb9 !important;
          color: var(--text-default) !important;
          font-weight: 900;
        }
        .hide {
          display: none;
        }
        .show {
          display: block;
        }
      `}</style>
    </Aside>
  );
};

export default BackRoomAside;
