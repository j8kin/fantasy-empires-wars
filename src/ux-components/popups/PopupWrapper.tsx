import React, { useEffect, useRef } from 'react';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import FantasyBorderFrame, {
  Dimensions,
  ScreenPosition,
} from '../fantasy-border-frame/FantasyBorderFrame';

export interface PopupProps {
  screenPosition: ScreenPosition;
}
interface PopupWrapperProps extends PopupProps {
  dimensions: Dimensions;
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
  const { hideOpponentInfo, setLandHideModePlayerId, hideLandPopup } = useApplicationContext();

  useEffect(() => {
    const handleClosePopup = () => {
      if (onClose) {
        onClose();
      } else {
        // Fallback to original behavior for backwards compatibility
        hideOpponentInfo();
        setLandHideModePlayerId(undefined);
        hideLandPopup();
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
  }, [hideOpponentInfo, setLandHideModePlayerId, hideLandPopup, onClose]);

  return (
    <div ref={popupRef}>
      <FantasyBorderFrame
        screenPosition={screenPosition}
        windowDimensions={dimensions}
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
