import React, { useEffect } from 'react';
import Button from '@custom/shared/components/Button';
import { TrayButton } from '@custom/shared/components/Tray';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconRecord } from '@custom/shared/icons/record-md.svg';
import {
  RECORDING_ERROR,
  RECORDING_RECORDING,
  RECORDING_SAVED,
  RECORDING_UPLOADING,
  useRecording,
} from '../../contexts/RecordingProvider';
import { RECORDING_MODAL } from '../Record/RecordingModal';


export const Tray = ({isSmall}) => {
  const { enableRecording } = useCallState();
  const { openModal } = useUIState();
  const { recordingState } = useRecording();
  const { localParticipant } = useParticipants();

  useEffect(() => {
    console.log(`⏺️ Recording state: ${recordingState}`);

    if (recordingState === RECORDING_ERROR) {
      // show error modal here
    }
  }, [recordingState]);

  const isRecording = [
    RECORDING_RECORDING,
    RECORDING_UPLOADING,
    RECORDING_SAVED,
  ].includes(recordingState);


  if(!localParticipant.isOwner)
    {
        console.log(`⏺️ Recording disabled for non-owner`)
        return null;
    }

  return (
    <>
     {isSmall ? (
       <Button
                className="translucent"
                onClick={() => openModal(RECORDING_MODAL)}
                IconBefore={IconRecord}
              >
                {isRecording ? 'Stop' : 'Record'}
       </Button>
      ) : (
    <TrayButton
      label={isRecording ? 'Stop' : 'Record'}
      orange={isRecording}
      onClick={() => openModal(RECORDING_MODAL)}
    >
      <IconRecord />
    </TrayButton>
    )}
    </>
  );
};

export default Tray;