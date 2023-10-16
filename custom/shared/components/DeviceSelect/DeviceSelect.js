import React from 'react';
import { useMediaDevices } from '@custom/shared/contexts/MediaDeviceProvider';
import Field from '../Field';
import { SelectInput } from '../Input';

export const DeviceSelect = () => {
  const {
    cams,
    mics,
    speakers,
    currentCam,
    setCurrentCam,
    currentMic,
    setCurrentMic,
    currentSpeaker,
    setCurrentSpeaker,
  } = useMediaDevices();
   console.log('currentCam', currentCam)
    console.log('currentMic', currentMic)
    console.log('currentSpeaker', currentSpeaker) 
    console.log('cams', cams)
    console.log('mics', mics)
    console.log('speakers', speakers)
  if (!currentCam && !currentMic && !currentSpeaker) {
    return <div>Loading devices...</div>;
  }

  return (
    <>
      <Field label="Select camera:">
        <SelectInput
          onChange={(e) => setCurrentCam(cams[e.target.value])}
          value={cams.findIndex(
            (i) => i.device.deviceId === currentCam?.device.deviceId
          )}
        >
          {cams?.map((cam,i) => (
            <option key={`cam-${cam.device.deviceId}`} value={i}>
              {cam.device.label}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field label="Select microphone:">
        <SelectInput
          onChange={(e) => setCurrentMic(mics[e.target.value])}
          value={mics.findIndex(
            (i) => i.device.deviceId === currentMic?.device.deviceId
          )}
        >
          {mics?.map((mic,i) => (
            <option key={`mic-${mic.device.deviceId}`} value={i}>
              {mic.device.label}
            </option>

          ))}
        </SelectInput>
      </Field>

      {/**
       * Note: Safari does not support selection audio output devices
       */}
      {speakers.length > 0 && (
        <Field label="Select speakers:">
          <SelectInput
            onChange={(e) => setCurrentSpeaker(speakers[e.target.value])}
            value={speakers.findIndex(
              (i) => i.device.deviceId == currentSpeaker?.device.deviceId
            )}
          >
            {speakers?.map((speaker,i) => (
              <option key={`speaker-${speaker.device.deviceId}`} value={i}>
                {speaker.device.label}
              </option>
            ))}
          </SelectInput>
        </Field>
      )}
    </>
  );
};

export default DeviceSelect;
