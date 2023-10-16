import React, { useEffect } from 'react';
import Button from '@custom/shared/components/Button';
import { CardBody } from '@custom/shared/components/Card';
import Modal from '@custom/shared/components/Modal';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';

export const REMOVE_USER_MODAL = 'remove-user';
export const RemoveUserModal = () => {
     const { currentModals, closeModal, removeUser, setRemoveUser } =
       useUIState();
        const { callObject } = useCallState();
    useEffect(() => {
        if (!removeUser) {
            closeModal(REMOVE_USER_MODAL);
        }
       
    }, [removeUser]);
  
    async function removeUserFromRoom() {
        callObject.updateParticipant(removeUser?.id, {
                eject: true,
                updatePermissions: {
                  hasPresence: false,
                },
              });
                setRemoveUser(null);
                }
        async function blockUserFromRoom() {
             try 
   {
     const room = await callObject.room();
     console.log(room.name);
     const participants = await callObject.participants();
    const res = await fetch(
      'https://ipex-backend-kohl.vercel.app/api/links/block',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Allow-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          linkNo: `${participants[removeUser?.id].userData.linkNo}`,
          roomName: `${room.name}`,
        }),
      }
    );
    const data = await res.json();
    console.log(data);
    callObject.updateParticipant(removeUser?.id, {
                eject: true,
                updatePermissions: {
                  hasPresence: false,
                },
              });
                setRemoveUser(null);

    } catch (err) {
    console.log(err);
    }
    }
  return (
    <Modal
      title={`Remove ${removeUser?.name} from the room?`}
      isOpen={currentModals[REMOVE_USER_MODAL]}
      onClose={() => closeModal(REMOVE_USER_MODAL)}
      actions={[
        <Button key="close" fullWidth  variant="error-light" onClick={() => blockUserFromRoom()}>
          Block From Room
        </Button>,
        <Button
          fullWidth
          key="record"
          onClick={() => removeUserFromRoom()}
        >
            Remove
        </Button>,
      ]}
    >
      <CardBody>
        <p className='text-error'>
         After blocking, {removeUser?.name} will be removed from the room and will not be able
          to rejoin.
        </p>
        
        
      </CardBody>
    </Modal>
  );
};

export default RemoveUserModal;
