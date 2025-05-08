import React from 'react';
import CelticPatternCorner from '../assets/images/CelticPatternCorner.png';
interface BorderCanvasCornerProps {
  isLeftCorner: boolean;
  isTopCorner: boolean;
  topSlide?: number;
}

const BorderCornerCanvas: React.FC<BorderCanvasCornerProps> = ({ isLeftCorner, isTopCorner }) => {
  return (
    <img
      src={CelticPatternCorner}
      alt={(isLeftCorner ? 'Left ' : 'Right ') + (isTopCorner ? 'Top ' : 'Bottom ') + 'Corner'}
      style={{
        ...cornerStyle,
        top: isTopCorner ? 0 : undefined,
        bottom: !isTopCorner ? 0 : undefined,
        left: isLeftCorner ? 0 : undefined,
        right: !isLeftCorner ? 0 : undefined,
      }}
    />
  );
};

const cornerStyle: React.CSSProperties = {
  position: 'absolute',
  width: '50px',
  height: '50px',
  zIndex: 3, // Ensure corners are above vertical images
};

export default BorderCornerCanvas;
