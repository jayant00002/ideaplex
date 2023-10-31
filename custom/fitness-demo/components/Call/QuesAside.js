import React, { useEffect, useRef, useState } from 'react';
import { Aside } from '@custom/shared/components/Aside';
import Button from '@custom/shared/components/Button';
import { Card, CardBody } from '@custom/shared/components/Card';
import { TextInput } from '@custom/shared/components/Input';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import useMessageSound from '@custom/shared/hooks/useMessageSound';
import { ReactComponent as IconEmoji } from '@custom/shared/icons/emoji-sm.svg';
import { useChat } from '../../contexts/ChatProvider';
import AsideHeader from '../App/AsideHeader';

export const QUES_ASIDE = 'ques';

export const QuesAside = () => {
  const { showAside, setShowAside } = useUIState();
  const { sendMessage, chatHistory, hasNewMessages, setHasNewMessages } =
    useChat();
  const [newMessage, setNewMessage] = useState('');
   const playMessageSound = useMessageSound();
  const [showEmojis, setShowEmojis] = useState(false);
 
    const { localParticipant } = useParticipants();
  const emojis = ['😍', '😭', '😂', '👋', '🙏'];
  const chatWindowRef = useRef();

  useEffect(() => {
    // Clear out any new message notifications if we're showing the chat screen
    if (showAside === QUES_ASIDE) {
      setHasNewMessages(false);
    }
    console.log(chatHistory)
  }, [showAside, chatHistory?.length, setHasNewMessages]);

  useEffect(() => {
    if (hasNewMessages && showAside !== QUES_ASIDE) {
       playMessageSound();
    }
  }, [playMessageSound, showAside, hasNewMessages]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatHistory?.length]);

  if (!showAside || showAside !== QUES_ASIDE) {
    return null;
  }
  if(!localParticipant?.isOwner)
    {
        return null;
    }

  return (
    <Aside onClose={() => setShowAside(false)}>
      <div className="aside-header">
        <div
          className={`tab ${showAside === QUES_ASIDE && 'active'}`}
          onClick={() => setShowAside(QUES_ASIDE)}
        >
          <p>Ques</p>
        </div>
      </div>
      <div className="info-container">
        <p>
          The Ques is for the observers and moderators only. You can interact
          with the observers and moderators by sending them a message. Any
          message you send will be visible to all the observers and moderators.
        </p>
      </div>

      {localParticipant?.isOwner && (
        <div className="messages-container" ref={chatWindowRef}>
          {chatHistory?.map((chatItem) => (
            <div
              className={
                chatItem.isObserver || chatItem.receiver === 'observer'
                  ? 'show'
                  : 'hide'
              }
              key={chatItem.id}
            >
              <div
                className={chatItem.isLocal ? 'message local' : 'message'}
                key={chatItem.id}
              >
                <span className="content">{chatItem.message}</span>
                <span className="sender">{chatItem.sender}</span>
              </div>
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
      <footer className={'chat-footer'}>
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
          variant={'transparent'}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button
          className="send-button"
          variant="transparent"
          disabled={!newMessage}
          onClick={() => {
            if (localParticipant?.isOwner) {
              sendMessage(newMessage, 'observer');
            }

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
        .info-container {
          color: var(--primary-dark);
          width: 100%;
          background-color: #d9edf7;
          margin-top: 20px;
          padding: 20px;
          border-radius: 8px;
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
          width: 100%;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .tab.active {
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

export default QuesAside;
