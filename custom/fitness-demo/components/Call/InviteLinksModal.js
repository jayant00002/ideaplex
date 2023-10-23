import React,{useState,useEffect} from "react";
import Button from "@custom/shared/components/Button"
import { Card, CardBody } from "@custom/shared/components/Card";
import Modal from "@custom/shared/components/Modal";
import { useCallState } from "@custom/shared/contexts/CallProvider";
import {useParticipants} from "@custom/shared/contexts/ParticipantsProvider";
import { useUIState } from "@custom/shared/contexts/UIStateProvider";

export const INVITE_MODAL = "links";

export const InviteLinksModal = () => {
    const {roomInfo} = useCallState();
    const { currentModals, closeModal } = useUIState();
    const [token,setToken] = useState('');
    const data = ['1' , '2' , '3' , '4' , '5','6','7','8'];
  const [participantTokens,setParticipantTokens] = useState([]);
 
    const [linkType, setLinkType] = useState("participant");
    const {localParticipant} = useParticipants();
    const roomName = roomInfo?.name;
  useEffect(async() => {
    if(!roomName) return;
    if(!localParticipant?.isOwner) return;
    setToken(await   generateOwnerToken());
    setParticipantTokens([]);
     for(let i=1;i<=8;i++)
     {
       const participantToken = await generateParticipantToken(i,roomName);
       setParticipantTokens(participantTokens => [...participantTokens,participantToken]);
       console.log(participantTokens)
     }
 },[roomName])
 const generateOwnerToken = async() => {
     const res = await fetch('/api/token', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         roomName: roomName,
         isOwner: true,
       }),
     });
     
   const resJson = await res.json();
     return resJson.token;
 }
 const generateParticipantToken = async(linkNo,roomName) => {
   try 
   {
    const res = await fetch(
      'https://ipex-backend-kohl.vercel.app/api/links/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Allow-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          linkNo: `${linkNo}`,
          roomName: roomName,
        }),
      }
    );
     const resJson = await res.json();
     console.log(resJson);
     return resJson.token;
   }
   catch(err)
   {
     console.log(err);
   }
 }
    return (
        <Modal
        title="Invite Links"
        isOpen={currentModals[INVITE_MODAL]}
        onClose={() => closeModal(INVITE_MODAL)}
        >
        <Card>
              <CardBody>
                {/* three tabs for participants, moderators, and observers */}
                <div className="tabs">
                    <div className={linkType==='participant'?'tab active':'tab'}
                    onClick={()=>setLinkType('participant')}
                    >Participants
                    </div>
                    <div className={linkType==='moderator'?'tab active':'tab'}
                    onClick={()=>setLinkType('moderator')}
                    >Moderators</div>
                    <div className={linkType==='observer'?'tab active':'tab'}
                    onClick={()=>setLinkType('observer')}
                    >Observers</div>
                </div>
                {(linkType === "participant") && (participantTokens.length>0)? (
                  data.map((item,index) => {
                    return <div key={index} className="link">
                <Button
                variant="outline-gray"
              >
                Participant {index+1}
              </Button>
                  
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                      window.location.href + `?participant=${index+1}&accessToken=` + participantTokens[index]
                      );
                    }
                    }
                  >
                    Copy link
                  </Button>
                </div>
                  })
                ) : null}
               {linkType === "moderator" ? (
                  <div className="link">
                    <Button
                    variant="outline-gray"
                  >
                    Moderator
                    </Button>
                    <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.host}?room=${roomName}&token=${token}`
                      );
                    }}
                    >
                    Copy link
                    </Button>
                  </div>
                ) : null}
                {linkType === "observer" ? (
                  <div className="link">
                    <Button
                    variant="outline-gray"
                  >
                    Observer
                    </Button>
                    <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        window.location.href + "?observer=true"
                    );
                    }}
                    >
                    Copy link
                    </Button>
                  </div>
                ) : null}
              </CardBody>
              </Card>
         <style jsx>{`
            .tabs {
                display: flex;
                justify-content: space-between;
                margin-bottom: 1rem;
            }
            .tab {
                padding: 0.5rem 1rem;
                border-radius: 0.25rem;
                border: 1px solid #C8D1DC;
                cursor: pointer;
            }
            .tab.active {
                background-color: #C8D1DC;
                transition: background-color 0.2s ease;
            }
            .link {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin: 10px 0;
              }
              @media (max-width: 768px) {
                .link {
                  flex-direction: column;
                  align-items: center;
                }
                .tab{
                  width:100%;
                }
                .tabs {
                  flex-direction: column;
                  align-items: center;
                }
              }

            `}</style>

        </Modal>
    );
    }

    export default InviteLinksModal;