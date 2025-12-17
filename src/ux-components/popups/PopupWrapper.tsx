import React, { useEffect, useRef } from 'react';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import type { FrameSize, ScreenPosition } from '../../contexts/ApplicationContext';

export interface PopupProps {
  screenPosition: ScreenPosition;
}
interface PopupWrapperProps extends PopupProps {
  dimensions: FrameSize;
  accessible?: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}

const PopupWrapper: React.FC<PopupWrapperProps> = ({
  screenPosition,
  dimensions,
  accessible = true,
  children,
  onClose,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const { hideOpponentInfo, hideLandPopup, setShowErrorMessagePopup } = useApplicationContext();

  useEffect(() => {
    const handleClosePopup = () => {
      if (onClose) {
        onClose();
      } else {
        // Fallback to original behavior for backwards compatibility
        hideOpponentInfo();
        hideLandPopup();
        setShowErrorMessagePopup(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        handleClosePopup();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClosePopup();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [hideOpponentInfo, hideLandPopup, onClose, setShowErrorMessagePopup]);

  return (
    <div ref={popupRef}>
      <FantasyBorderFrame
        screenPosition={screenPosition}
        frameSize={dimensions}
        tileDimensions={{ width: 20, height: 70 }}
        accessible={accessible}
        flexibleSizing={true}
      >
        {children}
      </FantasyBorderFrame>
    </div>
  );
};

export default PopupWrapper;
