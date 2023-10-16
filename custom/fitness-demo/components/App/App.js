import React, { useMemo,useEffect,useState } from 'react';
import ExpiryTimer from '@custom/shared/components/ExpiryTimer';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { LiveStreamingProvider } from '@custom/shared/contexts/LiveStreamingProvider';
import { TranscriptionProvider } from '@custom/shared/contexts/TranscriptionProvider';
import { useCallUI } from '@custom/shared/hooks/useCallUI';
import PropTypes from 'prop-types';

import { ChatProvider } from '../../contexts/ChatProvider';
import { ClassStateProvider } from '../../contexts/ClassStateProvider';
import { RecordingProvider } from '../../contexts/RecordingProvider';
import { UpgradeProvider } from '../../contexts/UpgradeProvider';
import Room from '../Call/Room';
import FlyingEmojisOverlay from '../EmojiReaction/FlyingEmojisOverlay';
import { Asides } from './Asides';
import { Modals } from './Modals';


export const App = ({ customComponentForState }) => {
  const { roomExp, state } = useCallState();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (roomExp) {
      const interval = setInterval(() => {
        setTimeLeft(Math.round((roomExp - Date.now()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [roomExp]);
  const componentForState = useCallUI({
    state,
    room: <Room />,
    ...customComponentForState,
  });

  // Memoize children to avoid unnecessary renders from HOC
  return useMemo(
    () => (
      <>
       <TranscriptionProvider>
        <UpgradeProvider>
        <ChatProvider>
          <RecordingProvider>
            <LiveStreamingProvider>
              <ClassStateProvider>
                {roomExp &&  timeLeft < 600 && (
                  <ExpiryTimer expiry={roomExp} />
                )}
                <div className="app">
                  {componentForState()}
                  <Modals />
                  <Asides />
                  <FlyingEmojisOverlay />
                  <style jsx>{`
                    color: white;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
        
                    .loader {
                      margin: 0 auto;
                    }
                  `}</style>
                </div>
              </ClassStateProvider>
             
            </LiveStreamingProvider>
          </RecordingProvider>
        </ChatProvider>
        </UpgradeProvider>
        </TranscriptionProvider>
      </>
    ),
    [componentForState, roomExp]
  );
};

App.propTypes = {
  customComponentForState: PropTypes.any,
};

export default App;