import React, { memo, useEffect, useState, useRef } from 'react';
import { VIEW_MODE_FULLSCREEN } from '../../contexts/UIStateProvider';
import { useVideoTrack } from '@custom/shared/hooks/useVideoTrack';
import { useUIState } from '../../contexts/UIStateProvider';
import { useHandRaising } from '../../hooks/useHandRaising';
import RaiseHandBadge from './RaiseHandBadge';
import { ReactComponent as IconMicMute } from '@custom/shared/icons/mic-off-sm.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { DEFAULT_ASPECT_RATIO } from '../../constants';
import { Video } from './Video';
import { ReactComponent as Avatar } from './avatar.svg';
import { ReactComponent as IconFullScreen } from '@custom/shared/icons/full-screen.svg';
import { ReactComponent as IconFullScreenExit } from '@custom/shared/icons/full-screen-exit.svg';
import {ReactComponent as IconPin} from '@custom/shared/icons/pin.svg';
import {ReactComponent as IconUnpin} from '@custom/shared/icons/pinned.svg';
const SM_TILE_MAX_WIDTH = 300;

export const Tile = memo(
  ({
    participant,
    mirrored = true,
    showName = true,
    showAvatar = true,
    showActiveSpeaker = true,
    isSideBarItem = false,
    videoFit = 'contain',
    aspectRatio = DEFAULT_ASPECT_RATIO,
    onVideoResize,
    ...props
  }) => {
    const videoTrack = useVideoTrack(participant.id);
    const {viewMode, setViewMode, pinnedId,setPinnedId,setPreferredViewMode} = useUIState();
    const videoRef = useRef(null);
    const tileRef = useRef(null);
    const [tileWidth, setTileWidth] = useState(0);
   const {handRaisedParticipants} = useHandRaising();
   const userHandRaised = handRaisedParticipants?.includes(participant?.id);
   const userScreenShare = participant.isScreenshare;
    /**
     * Effect: Resize
     *
     * Add optional event listener for resize event so the parent component
     * can know the video's native aspect ratio.
     */
    useEffect(() => {
      const video = videoRef.current;
      if (!onVideoResize || !video) return false;
      const handleResize = () => {
        if (!video) return;
        const width = video?.videoWidth;
        const height = video?.videoHeight;
        if (width && height) {
          // Return the video's aspect ratio to the parent's handler
          onVideoResize(width / height);
        }
      };

      handleResize();
      video?.addEventListener('resize', handleResize);

      return () => video?.removeEventListener('resize', handleResize);
    }, [onVideoResize, videoRef, participant]);

    /**
     * Effect: Resize Observer
     *
     * Adjust size of text overlay based on tile size
     */
    useEffect(() => {
      const tile = tileRef.current;
      if (!tile || typeof ResizeObserver === 'undefined') return false;
      let frame;
      const resizeObserver = new ResizeObserver(() => {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (!tile) return;
          const dimensions = tile?.getBoundingClientRect();
          const { width } = dimensions;
          setTileWidth(width);
        });
      });
      resizeObserver.observe(tile);
      return () => {
        if (frame) cancelAnimationFrame(frame);
        resizeObserver.disconnect();
      };
    }, [tileRef]);

    const cx = classNames('tile', videoFit, {
      mirrored,
      avatar: showAvatar && !videoTrack,
      screenShare: participant.isScreenShare,
      active: showActiveSpeaker && participant.isActiveSpeaker,
      small: tileWidth < SM_TILE_MAX_WIDTH,
    });

    return (
      <>
      {!participant.isObserver ? (
      <div ref={tileRef} className={cx} {...props}>
        <div className="content">
          {showName && (
            <div className="name">
              {participant.isMicMuted && !participant.isScreenShare && (
                <IconMicMute />
              )}
              {participant.name}
              {participant.isLocal ? ' (You)' : ''}
            </div>
          )}
          {videoTrack ? (
            <Video
              ref={videoRef}
              fit={videoFit}
              isScreen={participant.isScreenshare}
              participantId={participant?.id}
            />
          ) : (
            showAvatar && (
              <div className="avatar">
                <Avatar style={{ width: '35%', height: '35%' }} />
              </div>
            )
          )}
          {userHandRaised ? <RaiseHandBadge id={participant?.id} isLocal={participant?.isLocal} />: null}
          {!participant?.isLocal || participant?.isScreenshare ?(
          <>
          {(pinnedId === participant?.id) ||(!mirrored) && viewMode!=='grid' ? 
          (<div className= {viewMode !== VIEW_MODE_FULLSCREEN ? "unpin-button" : "unpin-button hidden"}
          onClick={() => {
            if(mirrored)
            setPinnedId(null);
            if(pinnedId)
            setPinnedId(null);
            
            setViewMode('grid');
          }
          }
          >
          <IconUnpin fill="white" />
          </div>
          )
          :
          (
          <div className= {viewMode !== VIEW_MODE_FULLSCREEN ? "pin-button" : "pin-button hidden"}
          onClick={() => {
            if(mirrored)
            setPinnedId(participant?.id);
            setPreferredViewMode('speaker');
            setViewMode('speaker');
          }
          }
          >
            <IconPin fill="white" />
          </div>
          )
  }
          </>
          ): null}
          
          
          {!mirrored && !isSideBarItem && (
           <div className={viewMode!=='grid' ? "full-screen-button" : "full-screen-button hidden"}
           onClick={() => {
              if(viewMode === VIEW_MODE_FULLSCREEN) {
                setViewMode('speaker');
                /*if screen is in full screen mode, exit full screen mode*/
                if (document.fullscreenElement)
                document.exitFullscreen();
              } else {
                setViewMode(VIEW_MODE_FULLSCREEN);
                document.documentElement.requestFullscreen();
              }
           }
           }
           >
            {viewMode === VIEW_MODE_FULLSCREEN ? <IconFullScreenExit/> : <IconFullScreen />}
           </div>
          )}
        </div>
        <style jsx>{`
          .tile .content {
            padding-bottom: ${100 / aspectRatio}%;
          }
        `}</style>
        <style jsx>{`
          .tile {
            background: var(--blue-dark);
            min-width: 1px;
            overflow: hidden;
            position: relative;
            width: 100%;
            box-sizing: border-box;
          }

          .tile.active:before {
            content: '';
            position: absolute;
            top: 0px;
            right: 0px;
            left: 0px;
            bottom: 0px;
            border: 2px solid var(--primary-default);
            box-sizing: border-box;
            pointer-events: none;
            z-index: 2;
          }

          .tile .name {
            position: absolute;
            bottom: 0px;
            display: flex;
            align-items: center;
            left: 0px;
            z-index: 2;
            line-height: 1;
            font-size: 0.875rem;
            color: white;
            font-weight: var(--weight-medium);
            padding: var(--spacing-xxs);
            text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.45);
            gap: var(--spacing-xxs);
          }

          .tile .name :global(svg) {
            color: var(--red-default);
          }

          .tile.small .name {
            font-size: 12px;
          }

          .tile :global(video) {
            height: calc(100% + 4px);
            left: -2px;
            object-position: center;
            position: absolute;
            top: -2px;
            width: calc(100% + 4px);
            z-index: 1;
          }

          .tile.contain :global(video) {
            object-fit: contain;
          }

          .tile.cover :global(video) {
            object-fit: cover;
          }

          .tile.mirrored :global(video) {
            transform: scale(-1, 1);
          }

          .tile .avatar {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        .tile .full-screen-button {
            position: absolute;
            bottom: 0;
            right: 3%;
            padding: 0.5rem;
            background: var(--blue-dark);
            border-radius: 0 0 0 0.5rem;
            z-index: 2;
            cursor: pointer;
           
          }
          .tile .full-screen-button.hidden {
            display: none;
          }
          .tile .pin-button {
            position: absolute;
            bottom: 0;
            right: 0;
            padding: 0.5rem;
            display: none;
            cursor: pointer;
            z-index: 999;
          }
          .tile:hover .pin-button {
            display: block;
          }
          .tile .unpin-button {
            position: absolute;
            bottom: 0;
            right: 0;
            padding: 0.5rem;
            cursor: pointer;
            z-index: 999;
          }
          .hidden {
            display: none;
          }
        `}</style>
      </div>
      ) : null}
      </>
    );
  }
);

Tile.propTypes = {
  participant: PropTypes.object.isRequired,
  mirrored: PropTypes.bool,
  showName: PropTypes.bool,
  showAvatar: PropTypes.bool,
  aspectRatio: PropTypes.number,
  onVideoResize: PropTypes.func,
  showActiveSpeaker: PropTypes.bool,
  videoFit: PropTypes.string,
};

export default Tile;
