import React from 'react';
import CelticPatternVertical from '../../../assets/border/CelticPatternVertical.png';

interface BorderVerticalProps {
  side: 'left' | 'right';
  tileSize: { width: number; height: number };
  length: number;
}

const BorderVertical: React.FC<BorderVerticalProps> = ({ side, tileSize, length }) => {
  const amount = Math.ceil(length / tileSize.height);
  const images = Array.from({ length: amount }).map((_, index) => (
    <img
      key={`${side}-${index}`}
      src={CelticPatternVertical}
      alt={`${side.charAt(0).toUpperCase() + side.slice(1)} Border`}
      style={{
        position: 'absolute',

        // Place tiles along X-axis
        top: index * tileSize.height,

        // Swap dimensions after rotation
        width: tileSize.width,
        height: tileSize.height,
      }}
    />
  ));

  const placeHolderStyle: React.CSSProperties = {
    position: 'absolute',
    [side]: 0,
    top: 0,
    height: length,
    width: Math.min(tileSize.width, tileSize.height),
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'none',
  };

  return <div style={placeHolderStyle}>{images}</div>;
};

export default BorderVertical;
