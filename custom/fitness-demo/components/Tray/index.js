import React from 'react';
import BackRoomTray from './BackRoom';
import ChatTray from './Chat';
import EmojiTray from './Emoji';
import QuesTray from './Ques';
import RecordTray from './Record';
import ScreenShareTray from './ScreenShare';
import Transcript from './Transcript';


export const Tray = () => {
  return (
    <>
      <ChatTray />
      <BackRoomTray />
      <QuesTray />
      <RecordTray />
      <Transcript />
      <ScreenShareTray />
      <EmojiTray />
    </>
  );
};

export default Tray;
