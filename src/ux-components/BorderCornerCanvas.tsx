import React from 'react';
import BorderTile from './BorderTile';
import { BorderCanvasProps } from './BorderCanvasProps';
import CelticPatternCorner from '../assets/images/CelticPatternCorner.png';
const BorderCornerCanvas: React.FC<BorderCanvasProps> = ({
  isLeft,
  isTop,
  xOffset,
  yOffset,
}) => {
  xOffset = xOffset == null ? 0 : xOffset;
  yOffset = yOffset == null ? 0 : yOffset;

  return (
    <BorderTile
      src={CelticPatternCorner}
      alt={(isLeft ? 'Left ' : 'Right ') + (isTop ? 'Top ' : 'Bottom ') + 'Corner'}
      style={{
        ...cornerStyle,
        top: isTop ? yOffset : undefined,
        bottom: !isTop ? yOffset : undefined,
        left: isLeft ? xOffset : undefined,
        right: !isLeft ? xOffset : undefined,
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
