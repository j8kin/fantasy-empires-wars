import React from 'react';
import BorderTile from './BorderTile';
import { BorderCanvasProps } from './BorderCanvasProps';
import CelticPatternCorner from '../assets/images/CelticPatternCorner.png';
const BorderCornerCanvas: React.FC<BorderCanvasProps> = ({
  isLeft,
  isTop,
  leftOffset,
  topOffset,
}) => {
  leftOffset = leftOffset == null ? 0 : leftOffset;
  topOffset = topOffset == null ? 0 : topOffset;

  return (
    <BorderTile
      src={CelticPatternCorner}
      alt={(isLeft ? 'Left ' : 'Right ') + (isTop ? 'Top ' : 'Bottom ') + 'Corner'}
      style={{
        ...cornerStyle,
        top: isTop ? topOffset : undefined,
        bottom: !isTop ? topOffset : undefined,
        left: isLeft ? leftOffset : undefined,
        right: !isLeft ? leftOffset : undefined,
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
