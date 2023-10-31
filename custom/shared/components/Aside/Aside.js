import React from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as IconClose } from '../../icons/close-sm.svg';
import Button from '../Button';
export const ASIDE_WIDTH = 340;

export const Aside = ({ onClose, children }) => (
  <aside className="call-aside">
    <div className="inner">{children}</div>
    <div className="close">
      <Button
        size="small-square"
        variant="white"
        className="closeButton"
        onClick={onClose}
      >
        <IconClose />
      </Button>
    </div>
    <style jsx>{`
      .call-aside {
        background: white;
        position: relative;
        flex-shrink: 0;
        flex-grow: 0;
        width: ${ASIDE_WIDTH}px;
        height: 100vh;
        box-sizing: border-box;
        box-shadow: 0px 15px 35px rgba(18, 26, 36, 0.25);
        color: var(--text-default);
        border-radius: var(--radius-sm) !important;
        border: 1px solid var(--gray-wash);
      
      }

      .call-aside .inner {
        overflow-x: hidden;
        overflow-y: scroll;
        height: 100%;
        display: flex;
        flex-flow: column wrap;
      }

      .call-aside .close {
        position: absolute;
        top: 0;
        right:10px;
        border: 1px solid var(--gray-wash);
        background: var(--gray-wash);
        z-index: 99;
        border-radius: 50%;
      }

      .call-aside :global(.closeButton) {
        border-radius: 50%;
        height: 40px;
        background: var(--gray-wash);
      }
      @media (max-width: 1200px) {
        .call-aside {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 99;
        }
        .call-aside .inner {
          width: 100%;
          height: 100vh;
          overflow-y: scroll;
          overflow-x: hidden;
          padding: var(--spacing-xxs);
        }
        
      }
      @media (max-width: 480px) {
        .call-aside {
        height: 100dvh;
        }
        .call-aside .inner {
          height: 100dvh;
        }
      }
      @media (max-width: 480px) {
        .call-aside {
        height: 100dvh;
        }
        .call-aside .inner {
          height: 100dvh;
        }
      }
    `}</style>
  </aside>
);

Aside.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func,
};

export default Aside;
