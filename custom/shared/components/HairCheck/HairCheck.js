import React, { useState, useEffect, useMemo } from 'react';
import Button from '@custom/shared/components/Button';
import { DEVICE_MODAL } from '@custom/shared/components/DeviceSelectModal/DeviceSelectModal';
import { PRECALL_TEST_MODAL } from '../PreCallTestModal';
import { TextInput } from '@custom/shared/components/Input';
import Loader from '@custom/shared/components/Loader';
import MuteButton from '@custom/shared/components/MuteButton';
import Tile from '@custom/shared/components/Tile';
import { ACCESS_STATE_LOBBY } from '@custom/shared/constants';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import {useRouter } from 'next/router';
import Field from '../Field';
import { SelectInput } from '../Input';
import {
  DEVICE_STATE_BLOCKED,
  DEVICE_STATE_NOT_FOUND,
  DEVICE_STATE_IN_USE,
  DEVICE_STATE_PENDING,
  useMediaDevices,
} from '@custom/shared/contexts/MediaDeviceProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import IconSettings from '@custom/shared/icons/settings-sm.svg';
import IconFlip from '@custom/shared/icons/flip.svg';
import { useDeepCompareMemo } from 'use-deep-compare';
import DeviceSelect from '../DeviceSelect';
/**
 * Hair check
 * ---
 * - Setup local media devices to see how you look / sound
 * - Toggle mute state of camera and mic
 * - Set user name and join call / request access
 */
export const HairCheck = () => {
  const { callObject } = useCallState();
  const { localParticipant } = useParticipants();
  const [fetching, setFetching] = useState(false);
  const router = useRouter();
  const {observer ,accessToken , participant,t,room} = router.query;
  console.log(`Observer: ${observer}`)
  const {
    camState,
    micState,
    camError,
    micError,
    isCamMuted,
    isMicMuted,
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
  const { openModal } = useUIState();
  const [waiting, setWaiting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [denied, setDenied] = useState();
  const [userName, setUserName] = useState(
    localStorage.getItem('PLUOT_PARTICIPANT_NAME') || ''
  );
  const [t1, setT1] = useState(false);
  const [t2, setT2] = useState(false);
  async function validateToken(token,linkNo) {
    try{
    const res = await fetch(
      'https://ipex-backend-kohl.vercel.app/api/links/join',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: room,
          linkNo: `${linkNo}`,
          token,
        }),
      }
    );
    console.log(res);
   if(res.status==200)
    {
      return true;
    }
    else
    {
      return false;
    }
  }
  catch(e)
  {
    console.log(e);
    return false;
  }
  }
  
  async function participantJoined(token,linkNo) {
    try {
      const res = await fetch(
        'https://ipex-backend-kohl.vercel.app/api/links/joined',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName: room,
            linkNo: `${linkNo}`,
            token,
          }),
        }
      );

      console.log(res);
     console.log(localParticipant)
      if(res.status==200)
      {
        return true;
      }
      else
      {
        return false;
      }
    }
    catch(e)
    {
      console.log(e);
      return false;
    }
  }
  // Initialise devices (even though we're not yet in a call)
  useEffect(async() => {
    if (!callObject) return;
     if((!observer) && (!participant || !accessToken) &&( !t))
    {
      console.log("Invalid token");
       router.push('/not-found');
       //end call
      callObject.leave();
      return;
    }
    if(participant && accessToken )
    {
      setFetching(true);
      const isValid = await validateToken(accessToken,participant);
      setFetching(false);
      if (!isValid) {
        console.log("Invalid token");
        router.push('/not-found');
        //end call
        callObject.leave();
        return;
      }
    }
    if(observer != "true")
    callObject.startCamera();
    
  }, [callObject]);

  const joinCall = async () => {
    if (!callObject) return;

    // Disable join controls
    setJoining(true);

    // Set the local participants name
    await callObject.setUserName(userName);
   
    if(observer=="true"){
    await callObject.setUserData({
      isObserver : true,
    })
    callObject.setLocalAudio(false);
    callObject.setLocalVideo(false);
  }
    else
    await callObject.setUserData({
      isObserver : false,
    })

    if(participant && accessToken )
    {
     const userData=  callObject.participants()['local'].userData;
   
     await callObject.setUserData({
      ...userData,
      linkNo: participant,
     })
    
    }

    // Async request access (this will block until the call owner responds to the knock)
    const { access } = callObject.accessState();
    await callObject.join();

    // If we we're in the lobby, wait for the owner to let us in
    if (access?.level === ACCESS_STATE_LOBBY) {
      setWaiting(true);
      const { granted } = await callObject.requestAccess({
        name: userName,
        access: {
          level: 'full',
        },
      });

      if (granted) {
        // Note: we don't have to do any thing here as the call state will mutate
        console.log('👋 Access granted');
        localStorage.setItem('PLUOT_PARTICIPANT_NAME', userName);
        await participantJoined(accessToken,participant);
      } else {
        console.log('❌ Access denied');
        setDenied(true);
      }
    }
  };

  // Memoize the to prevent unnecessary re-renders
  const tileMemo = useDeepCompareMemo(
    () => (
      <Tile
        participant={localParticipant}
        mirrored
        showAvatar
        showName={false}
      />
    ),
    [localParticipant]
  );

  const isLoading = useMemo(() => camState === DEVICE_STATE_PENDING || micState === DEVICE_STATE_PENDING, [
    camState, micState,
  ]);

  const hasError = useMemo(() => camError || micError, [camError, micError]);

  const camErrorVerbose = useMemo(() => {
    switch (camState) {
      case DEVICE_STATE_BLOCKED:
        return 'Camera blocked by user';
      case DEVICE_STATE_NOT_FOUND:
        return 'Camera not found';
      case DEVICE_STATE_IN_USE:
        return 'Device in use';
      default:
        return 'unknown';
    }
  }, [camState]);

  const micErrorVerbose = useMemo(() => {
    switch (micState) {
      case DEVICE_STATE_BLOCKED:
        return 'Microphone blocked by user';
      case DEVICE_STATE_NOT_FOUND:
        return 'Microphone not found';
      case DEVICE_STATE_IN_USE:
        return 'Microphone in use';
      default:
        return 'unknown';
    }
  }, [micState]);

  const showWaitingMessage = useMemo(() => {
    return (
      <div className="waiting">
        <Loader />
        {denied ? (
          <span>Call owner denied request</span>
        ) : (
          <>
          <span>Waiting for host to grant access</span>
          <span>Cancel request</span>
          </>
        )}
        <style jsx>{`
          .waiting {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            justify-content: center;
          }

          .waiting span {
            color: #fff;
            font-size: 14px;
            margin-top: var(--spacing-xs);
          }
        `}</style>
      </div>
    );
  }, [denied]);

  const showUsernameInput = useMemo(() => {
    return (
      <div className="username-input">
        <label htmlFor="username">Name</label>
        <TextInput
          placeholder="Enter display name"
          variant="dark"
          disabled={joining}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <div className="name-help">
          Please enter your name as you signed up for this research. Please note that this will be used to mark your attendance to this discussion.
        </div>
       <style jsx>{`
          .username-input {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: var(--spacing-xs);
          }
          .name-help {
            font-size: 12px;
            color: #fff;
          
          }
          @media (max-width: 576px) {
            .name-help {
              font-size: 10px;
            }
            .username-input {
              gap: var(--spacing-xxs);
            }
          }
        `}</style>
      </div>
    );
  }, [userName, joining, setUserName]);
  const showAgrement = useMemo(() => {
    return (
      <div className="agreement">
        <div className="agreement-label">
          You will need to agree to the following before joining the discussion
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="flexCheckDefault"
            onChange={(e) => setT1(e.target.checked)}
          />
          <label className="form-check-label mx-2" htmlFor="flexCheckDefault">
            I agree to the General Participation Agreement
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="flexCheckDefault2"
            onChange={(e) => setT2(e.target.checked)}
          />
          <label className="form-check-label mx-2" htmlFor="flexCheckDefault2">
            I agree to the Adverse Events Disclosure
          </label>
        </div>
        <style jsx>{`
          .agreement {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: var(--spacing-xs);
          }
          .agreement-label {
            font-size: 14px;
            color: #fff;
          }
          .form-check {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: var(--spacing-xs);
          }
          .form-check-input {
            width: 20px;
            height: 20px;
            border-radius: 4px !important;
            background-color: #fff !important;
            border: 1px solid #fff !important;
          }
          .form-check-input:checked {
            background-color: #fff !important;
            border: 1px solid #fff !important;
          }
          .form-check-input:focus {
            background-color: #fff !important;
            border: 1px solid #fff !important;
          }
          .form-check-input:active {
            background-color: #fff !important;
            border: 1px solid #fff !important;
          }

          .form-check-label {
            font-size: 14px;
            color: #fff;
          }
          //blue check
          .form-check-input:checked {
            background-color: #fff !important;
            border: 1px solid #fff !important;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 448 512'%3E%3Cpath d='M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z' /%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: center;
            background-size: 100% 100%;
          }
          @media (max-width: 992px) {
            .form-check-label {
              font-size: 12px;
              color: #fff;
            }
          }

          @media (max-width: 576px) {
            .agreement-label {
              font-size: 12px;
            }
            .form-check-label {
              font-size: 10px;
            }
            .agreement {
              gap: var(--spacing-xxs);
            }
          }
        `}</style>
      </div>
    );
  }
  , [t1, t2,joining]);
  const showJoinButton = useMemo(() => {
    return (
      <div className="join-button">
      <Button
        variant="primary"
        onClick={joinCall}
        disabled={joining || !t1 || !t2}
      >
        <span>{localParticipant?.isOwner ? 'Join' : 'Request access'}</span>
      </Button>
      <style jsx>{`
          .join-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs);
            width: 100%;
          }
           
        `}</style>
      </div>
    );
  }
  , [t1, t2,joining]);
  const deviceSelect = useMemo(() => {
    return (
      <div className="device-select">
        <Field label="Select camera:">
          <SelectInput
            onChange={(e) => setCurrentCam(cams[e.target.value])}
            value={cams.findIndex(
              (i) => i.device.deviceId === currentCam?.device.deviceId
            )}
          >
            {cams?.map((cam, i) => (
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
            {mics?.map((mic, i) => (
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
              {speakers?.map((speaker, i) => (
                <option key={`speaker-${speaker.device.deviceId}`} value={i}>
                  {speaker.device.label}
                </option>
              ))}
            </SelectInput>
          </Field>
        )}
        <style jsx>{`
          .device-select {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: var(--spacing-xxxs);
            width: 100%;
            max-width: 100%;
          }
          .device-select :global(.field) {
            width: 100%;
            margin: 0;
            padding: 0;
            height: max-content;
          }
          .device-select :global(.label) {
            font-size: 14px;
            color: #fff !important;
            margin-bottom: var(--spacing-xxxs);
          }
          @media (max-width: 576px) {
            .device-select {
              display: none;
            }
          }
        `}</style>
      </div>
    );
  }
  , [cams, mics, speakers, currentCam, currentMic, currentSpeaker]);
  return (
    <>
      {!fetching?(
      <main className="haircheck">
        <img
          src="/assets/daily-logo.svg"
          alt="Daily.co"
          width="132"
          height="58"
          className="logo"
        />
        <div className="panel">
          {/* <header>
            <h2>Ready to join?</h2>
          </header> */}
          <div className="panel-left">
          {(!observer && !localParticipant.isObserver) &&(
          <div className="tile-container">
            <div className="content">
              <Button
                className="device-button"
                size="medium-square"
                variant="blur"
                onClick={() => openModal(DEVICE_MODAL)}
              >
                <IconSettings />
              </Button>
              <Button
                className="flip-button"
                size="medium-square"
                variant="blur"
                onClick={() => callObject.cycleCamera()}
              >
                <IconFlip />
              </Button>

              {isLoading && (
                <div className="overlay-message">
                  Loading devices, please wait...
                </div>
              )}
              {hasError && (
                <>
                  {camError && (
                    <div className="overlay-message">{camErrorVerbose}</div>
                  )}
                  {micError && (
                    <div className="overlay-message">{micErrorVerbose}</div>
                  )}
                </>
              )}
            </div>
            <div className="mute-buttons">
              <MuteButton isMuted={isCamMuted || localParticipant.isObserver} disabled={camError || localParticipant.isObserver} />
              <MuteButton mic isMuted={isMicMuted || localParticipant.isObserver} disabled={micError || localParticipant.isObserver} />
            </div>
            {tileMemo}
          </div>
          )}
          
          {(!observer && !localParticipant.isObserver) &&(
            <>
            {deviceSelect}
            </>
          )}
          </div>
          <div className="panel-right">
            {showUsernameInput}
            {showAgrement}
            {showJoinButton}
            {waiting && showWaitingMessage}
            </div>
        </div>
        {/* {(!observer && !localParticipant.isObserver) &&(
           <div className="pre-call-test">
              <Button
                variant="primary"
                onClick={() => openModal(PRECALL_TEST_MODAL)}
              >
                <span>Pre-call test</span>
              </Button>
            </div>
        )} */}

        <style jsx>{`
          .haircheck {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            height: 100%;
            width: 100%;
            background: url('/assets/pattern-bg.png') center center no-repeat;
            background-size: 100%;
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .haircheck .panel {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content:flex-start;
            border : 3px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-md);
            width: 70%;
            max-height: 100%;

            gap: var(--spacing-sm);
            padding: var(--spacing-sm);
            flex:2;
          }
          .haircheck .panel-left {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: var(--spacing-sm);
            flex: 1;
            height: 100%;
            width: 50%;
          }
          .haircheck .tile-container {
            border-radius: var(--radius-md);
            -webkit-mask-image: -webkit-radial-gradient(white, black);
            overflow: hidden;
            position: relative;
             width: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            
          }
          .haircheck .tile-container :global(.tile) {
            object-fit: cover;
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
          }
           .panel-right {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: var(--spacing-sm);
            flex: 1;
          }
          .haircheck header {
          
            color: white;
            border: 3px solid rgba(255, 255, 255, 0.1);
            max-width: 100%;
            margin: 0 auto;
            border-radius: var(--radius-md) var(--radius-md) 0 0;
            border-bottom: 0px;
            padding: var(--spacing-md) 0 calc(6px + var(--spacing-md)) 0;
          }

          // .haircheck header:before,
          // .haircheck footer:before {
          //   content: '';
          //   position: absolute;
          //   height: 6px;
          //   left: var(--spacing-sm);
          //   right: var(--spacing-sm);
          //   background: linear-gradient(
          //     90deg,
          //     var(--primary-default) 0%,
          //     var(--secondary-dark) 100%
          //   );
          //   border-radius: 6px 6px 0px 0px;
          //   bottom: 0px;
          // }

          // .haircheck footer:before {
          //   top: 0px;
          //   bottom: auto;
          //   border-radius: 0px 0px 6px 6px;
          // }

          .haircheck header h2 {
            margin: 0px;
          }

          .haircheck .content {
           position: absolute;
            top: 0px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99;
            
          }

          .haircheck .mute-buttons {
            position: absolute;
            bottom: 0px;
            left: 0px;
            right: 0px;
            z-index: 99;
            padding: var(--spacing-xs);
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs);
          }

          .haircheck .content :global(.device-button) {
            position: absolute;
            top: var(--spacing-xxs);
            right: var(--spacing-xxs);
            display: none;
          }
          .haircheck .content :global(.flip-button) {
            position: absolute;
            top: var(--spacing-xxs);
            left: var(--spacing-xxs);
            display: none;
          }
          .haircheck .overlay-message {
            color: var(--reverse);
            padding: var(--spacing-xxs) var(--spacing-xs);
            background: rgba(0, 0, 0, 0.35);
            border-radius: var(--radius-sm);
          }

          .haircheck footer {
            position: relative;
            
            margin: 0;
          
            padding: calc(6px + var(--spacing-md)) var(--spacing-sm)
              var(--spacing-md) var(--spacing-sm);
           
          }

          // .logo {
          //   position: absolute;
          //   top: var(--spacing-sm);
          //   left: var(--spacing-sm);
          // }
          .pre-call-test {
            position: absolute;
            bottom: var(--spacing-sm);
            left: var(--spacing-sm);
            height: max-content;

          }
          @media (max-width: 1200px) {
            .haircheck .panel {
              width: 80%;
            }
          }
          @media (max-width:1024px) {
            .haircheck {
              flex-direction: column;
            }
            .haircheck .panel {
              width: 90%;
              
              border-radius: var(--radius-md);
              border: 3px solid rgba(255, 255, 255, 0.1);
              padding: var(--spacing-sm);
            }
            .haircheck .tile-container {
              border-radius: var(--radius-md);
              -webkit-mask-image: -webkit-radial-gradient(white, black);
              overflow: hidden;
              position: relative;
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: flex-start;
              gap: var(--spacing-xs);
            }
            .haircheck .tile-container :global(.tile) {
              object-fit: cover;
              width: 100%;
              height: 100%;
              max-width: 100%;
              max-height: 100%;
            }
            .panel-right {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: flex-start;
              gap: var(--spacing-sm);
              flex: 1;
            }
            .logo {
              margin: 0;
            }

            .haircheck .content {
              position: absolute;
              top: 0px;
              left: 0px;
              right: 0px;
              bottom: 0px;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 99;
            }

            .haircheck .mute-buttons {
              position: absolute;
              bottom: 0px;
              left: 0px;
              right: 0px;
              z-index: 99;
              padding: var(--spacing-xs);
              box-sizing: border-box;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: var(--spacing-xs);
            }
            @media (max-width: 992px) {
              .haircheck .panel {
                width: 95%;
              
              }
            }
            @media (max-width: 768px) {
              .haircheck .panel {
                width: 95%;
                max-height: 90%;
                padding: var(--spacing-xxxs);
              }
            }
            @media (max-width: 576px) {
              .haircheck .panel {
                width: 90%;
                max-height: max-content;
                padding: var(--spacing-xxxs);
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-xxs);
              }
              .haircheck .panel-left {
                width: 100%;
              }
              
              .haircheck .tile-container {
                width: 100%;
                max-height: 100%;
              }
              .haircheck .content :global(.device-button) {
                display: block;
              }
              .haircheck .content :global(.flip-button) {
                display: block;
                z-index: 99;
              }
              .panel-right {
                width: 100%;
                max-height: 100%;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-xxs);
              }
              .pre-call-test {
                left : 0px;
                top: 10px;
              }
            }
              

        `}</style>
      </main>
      ):(
        <Loader />
      )}
    </>
  );
};

export default HairCheck;
