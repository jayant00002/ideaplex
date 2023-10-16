import React,{useEffect,useState} from 'react';
import Button from '@custom/shared/components/Button';
import { Card, CardBody, CardHeader } from '@custom/shared/components/Card';
import { TextInput } from '@custom/shared/components/Input';
import Tile from '@custom/shared/components/Tile';
import VideoContainer from '@custom/shared/components/VideoContainer';
import { DEFAULT_ASPECT_RATIO } from '@custom/shared/constants';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import {ReactComponent as AddOthersIcon} from '@custom/shared/icons/add-others.svg';
import Container from './Container';
import Header from './Header';
import { INVITE_MODAL } from './InviteLinksModal';
export const InviteOthers = () => {
  
  const { localParticipant } = useParticipants();
  const {roomInfo} = useCallState();
  const { openModal } = useUIState();
  const roomName = roomInfo.name;

  return (
    <Container>
      <Header />
      <VideoContainer>
        <div className="invite-wrapper">
          <div className="invite-others">
            <Card variant="dark">
              <CardHeader>Waiting for others to join?</CardHeader>
            
            
  {localParticipant.isOwner ? (
              <CardBody >
                <div className="link">
              <Button
              className="invite"
              variant="outline-primary"
              onClick={() => {
                openModal(INVITE_MODAL);
              }}
            >
              Invite Others 
              <span className="icon">
              <AddOthersIcon />
              </span>
            </Button>
            </div>
              </CardBody>
            ) : (
              <CardBody>
                <h3>No Participants are in the call yet!</h3>
              </CardBody>
            )}
            </Card>
          </div>
           
          <div className="preview">
            <Tile participant={localParticipant} mirrored aspectRatio={DEFAULT_ASPECT_RATIO} />
          </div>
          <style jsx>{`
            .invite-wrapper {
              display: flex;
              height: 100%;
              width: 100%;
            }
            
            .invite-others {
              margin: auto;
              text-align: center;
            }
            
            .link {
              display: flex;
              justify-content: center;
              gap: 10px;
              margin: 10px 0;
            }
            .icon {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-left: 5px;
            }
            
            .preview {
              position: absolute;
              bottom: 0;
              width: 186px;
            }
            
            :global(.invite-others .card) {
              border: 0!important;
              width: 40vw;
            }
            
            :global(.invite-others .card input) {
              width: 15vw;
            }
          `}</style>
        </div>
      </VideoContainer>
    </Container>
  )
}

export default InviteOthers;