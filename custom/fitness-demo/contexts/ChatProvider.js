import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { nanoid } from 'nanoid';
import PropTypes from 'prop-types';
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { callObject } = useCallState();
  const [chatHistory, setChatHistory] = useState([]);
  const[backroomChatHistory, setBackroomChatHistory] = useState([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [hasBackroomNewMessages, setHasBackroomNewMessages] = useState(false);

  const handleNewMessage = useCallback(
    (e) => {
    
      if (e?.data?.message?.type) return;
      if(e?.data?.type==='upgrade') return;
      if(e?.fromId==='transcription') return;
      console.log(e)
      const participants = callObject.participants();
      const sender = participants[e.fromId].user_name
        ? participants[e.fromId].user_name
        : 'Guest';
      const isObserver = participants[e.fromId].userData.isObserver;
      const isOwner = participants[e.fromId].owner;
      if((participants['local'].userData.isObserver && isObserver) || (participants['local'].owner &&isObserver)) {
        if(e?.data?.observers) {
          setBackroomChatHistory((oldState) => [
            ...oldState,
            { sender, isObserver : isObserver, message: e.data.message, id: nanoid() },
          ]);
          setHasBackroomNewMessages(true);
        }
        else {
      setChatHistory((oldState) => [
        ...oldState,
        { sender, isObserver : isObserver, message: e.data.message, id: nanoid() },
      ]);
      setHasNewMessages(true);
    }

      }
      if(!participants['local'].userData.isObserver && !isObserver && !isOwner ) {
        setChatHistory((oldState) => [
          ...oldState,
          { sender, isObserver: isObserver, message: e.data.message, id: nanoid() },
        ]);
       
        setHasNewMessages(true);
        }
        if(isOwner && !isObserver) {
          setChatHistory((oldState) => [
            ...oldState,
            { sender, isObserver: isObserver, message: e.data.message, id: nanoid() },
          ]);
         
          setHasNewMessages(true);
          }
    },
    [callObject]
  );

  const sendMessage = useCallback(
    (message, receiver) => {
      if (!callObject) {
        return false;
      }

      console.log('💬 Sending app message');

      //send the message to receiver type if sender is owner
      const isOwner = callObject.participants().local.owner;
      const isObserver = callObject.participants().local.userData.isObserver;
      const observers = Object.keys(callObject.participants()).filter((p) => callObject.participants()[p].userData.isObserver);
      console.log(observers);
      const noObservers = Object.keys(callObject.participants()).filter((p) => !callObject.participants()[p].userData.isObserver);
      if(isOwner) {
        if(receiver==='participant')
        {
          noObservers.forEach((o) => {
            callObject.sendAppMessage({message},o)
          })
        }
        else if(receiver==='observer')
        {
          observers.forEach((o) => {
            callObject.sendAppMessage({message},o)
          })
        }
      }
      else {
        if(isObserver && receiver==='owner')
        {
          const owners = Object.keys(callObject.participants()).filter((p) => callObject.participants()[p].owner);
        
          owners.forEach((o) => {
            callObject.sendAppMessage({message},o)
          })
          for(let i=0;i<observers.length;i++)
          {
            if(observers[i]!==callObject.participants().local.id)
            {
              callObject.sendAppMessage({message},observers[i])
            }
          }
        }
        else if(isObserver && receiver==='observer')
        {
          for(let i=0;i<observers.length;i++)
          {
            if(observers[i]!==callObject.participants().local.id)
            {
              callObject.sendAppMessage({message, observers:true},observers[i])
            }
          }
        }
        else
        callObject.sendAppMessage({message},'*')
      }


      // Get the sender (local participant) name
      const sender = callObject.participants().local.user_name
        ? callObject.participants().local.user_name
        : 'Guest';

      // Update local chat history
      if(isObserver&& receiver==='observer') {
       return setBackroomChatHistory((oldState) => [
        ...oldState,
        { sender, message, id: nanoid(), isLocal: true, receiver },
      ]);
      }
      else {
      return setChatHistory((oldState) => [
        ...oldState,
        { sender, message, id: nanoid(), isLocal: true, receiver },
      ]);
    }
    },
    [callObject]
  );

  useEffect(() => {
    if (!callObject) {
      return false;
    }

    console.log(`💬 Chat provider listening for app messages`);

    callObject.on('app-message', handleNewMessage);

    return () => callObject.off('app-message', handleNewMessage);
  }, [callObject, handleNewMessage]);

  return (
    <ChatContext.Provider
      value={{
        sendMessage,
        chatHistory,
        backroomChatHistory,
        hasNewMessages,
        setHasNewMessages,
        hasBackroomNewMessages,
        setHasBackroomNewMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node,
};

export const useChat = () => useContext(ChatContext);