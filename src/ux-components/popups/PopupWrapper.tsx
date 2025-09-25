import React, { useEffect, useRef } from 'react';
import FantasyBorderFrame, { ScreenPosition } from '../fantasy-border-frame/FantasyBorderFrame';

interface PopupWrapperProps {
  screenPosition: ScreenPosition;
  dimensions: { width: number; height: number };
  accessible?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const PopupWrapper: React.FC<PopupWrapperProps> = ({
  screenPosition,
  dimensions,
  accessible = true,
  onClose,
  children,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div ref={popupRef}>
      <FantasyBorderFrame
        screenPosition={screenPosition}
        dimensions={dimensions}
        tileSize={{ width: 20, height: 70 }}
        accessible={accessible}
        flexibleSizing={true}
      >
        {children}
      </FantasyBorderFrame>
    </div>
  );
};

export default PopupWrapper;
