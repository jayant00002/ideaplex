import React from 'react';
import Button from '@custom/shared/components/Button';
import { TrayButton } from '@custom/shared/components/Tray';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useTranscription } from '@custom/shared/contexts/TranscriptionProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconTranscription } from '@custom/shared/icons/chat-md.svg';
import { TRANSCRIPTION_ASIDE } from '../Call/TranscriptionAside'

export const Tray = ({isSmall}) => {
  const { toggleAside,showAside } = useUIState();
  const { hasNewCaptions } = useTranscription();
  const { callObject } = useCallState();
  async function startTranscription() {
    await callObject.startTranscription();
  }
  async function stopTranscription() {
    await callObject.stopTranscription();
  }
  return (
    <>
      {isSmall ? (
        <Button
          className="translucent"
          onClick={() => {

            toggleAside(TRANSCRIPTION_ASIDE);
            if (showAside !== TRANSCRIPTION_ASIDE) {
              startTranscription();
            } else if (showAside === TRANSCRIPTION_ASIDE) {
              stopTranscription();
            }
          }}
          IconBefore={IconTranscription}
        >
          Captions
        </Button>
      ) : (
        <TrayButton
          label="Captions"
          bubble={hasNewCaptions}
          onClick={() => {
            toggleAside(TRANSCRIPTION_ASIDE);
            if (showAside !== TRANSCRIPTION_ASIDE) {
              startTranscription();
            } else if (showAside === TRANSCRIPTION_ASIDE) {
              stopTranscription();
            }
          }}
        >
          <IconTranscription />
        </TrayButton>
      )}
    </>
  );
};

export default Tray;