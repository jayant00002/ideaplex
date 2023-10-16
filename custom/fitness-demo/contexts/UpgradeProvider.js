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
  export const UpgradeContext = createContext();
  
  export const UpgradeProvider = ({ children }) => {
    const { callObject } = useCallState();
   
  
    const handleNewMessage = useCallback(
      (e) => {
       if(e?.data?.type==='upgrade') {
         const participants = callObject.participants();
          const sender = participants[e.fromId];
          const receiver = participants['local'];
          console.log(receiver)
          if(sender.owner) {
            console.log('owner')
            console.log(e)
            if(receiver.userData.isObserver) {
              console.log('observer')
              callObject.setUserData({isObserver: false})
            }
          }
          else {
            console.log('not owner')
           return;
          }
       }
       else {
            return;
         }
      },
      [callObject]
    );
  
  
    useEffect(() => {
      if (!callObject) {
        return false;
      }
  
      console.log(`💬 Upgrading Observer`);
  
      callObject.on('app-message', handleNewMessage);
  
      return () => callObject.off('app-message', handleNewMessage);
    }, [callObject, handleNewMessage]);
  
    return (
      <UpgradeContext.Provider
        value={{
            handleNewMessage,
        }}
      >
        {children}
      </UpgradeContext.Provider>
    );
  };
  
  UpgradeContext.propTypes = {
    children: PropTypes.node,
  };
  
  export const useUpgrade = () => useContext(UpgradeContext);