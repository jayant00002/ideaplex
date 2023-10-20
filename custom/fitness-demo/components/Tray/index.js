import React from 'react';
import { useResponsive } from '@custom/shared/hooks/useResponsive';
import BackRoomTray from './BackRoom';
import ChatTray from './Chat';
import EmojiTray from './Emoji';
import QuesTray from './Ques';
import RecordTray from './Record';
import ScreenShareTray from './ScreenShare';
import Transcript from './Transcript';


export const Tray = () => {
    const responsive = useResponsive();
  return (
    <>
    {!responsive.isMobile() && (
      <>
      <ChatTray />
      <BackRoomTray />
      <QuesTray />
      <RecordTray />
      <Transcript />
      </>
    )}
      <ScreenShareTray />
      <EmojiTray />
    </>
  );
};

export default Tray;
