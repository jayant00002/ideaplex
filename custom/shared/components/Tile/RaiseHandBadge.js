import React from 'react';
import { ReactComponent as RaiseHand } from '../../icons/raiseHand.svg';
import { useHandRaisedQueue } from '@custom/shared/hooks/useHandRaising';
export default function RaiseHandBadge({ id, isLocal }) {
  const handRaisedQueueNumber = useHandRaisedQueue(id);
  return (
    <>
    <div className='has-hand-raised'>
      <RaiseHand />    </div>
    <style jsx>{`
        .has-hand-raised {
            position: absolute;
            top: 0;
            left: 0;
            background-color: var(--red-default);
            border-radius: 4px;
            margin: 0.5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 4px;
            padding: 8px;
          }
       
        .local {
            background-color: var(--blue-default);
          }
          .queue-number {
            font-variant-numeric: tabular-nums;
          }
    `}</style>
    </>

  );
}