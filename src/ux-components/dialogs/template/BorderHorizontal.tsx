import React from 'react';
import CelticPatternVertical from '../../../assets/border/CelticPatternVertical.png';
import { BorderProps } from './BorderProps';

const BorderHorizontal: React.FC<BorderProps> = ({ side, tileSize, length }) => {
  const amount = length / tileSize.height;
  const images = Array.from({ length: amount }).map((_, index) => (
    <img
      key={`${side}-${index}`}
      src={CelticPatternVertical}
      alt={`${side.charAt(0).toUpperCase() + side.slice(1)} Border`}
      style={{
        position: 'absolute',
        [side]: side === 'top' ? 0 : tileSize.width - tileSize.height,

        // Place tiles along X-axis
        left: index * tileSize.height,

        // Swap dimensions after rotation
        width: tileSize.width,
        height: tileSize.height,

        transform: 'rotate(270deg)',
        transformOrigin: 'top right',
      }}
    />
  ));

  const placeHolderStyle: React.CSSProperties = {
    position: 'absolute',
    [side]: 0,
    left: 0,
    width: length,
    height: Math.min(tileSize.width, tileSize.height),
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'none',
    overflow: 'hidden',
  };

  return <div style={placeHolderStyle}>{images}</div>;
};

export default BorderHorizontal;
