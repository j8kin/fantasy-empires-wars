import React from 'react';
import { Dimensions } from 'react-native';
import BorderTile from './BorderTile';
import CelticPatternVertical from '../assets/images/CelticPatternVertical.png';
import { BorderCanvasProps } from './BorderCanvasProps';

const BorderHorizontalCanvas: React.FC<BorderCanvasProps> = ({ isTop, yOffset }) => {
  const tileWidth = 50;
  const tileHeight = 180;
  const availableWidth = window.innerWidth;
  // Use tileWidth (50px) as spacing since that's the actual width after rotation
  const tileSpacing = tileWidth;
  const numTiles = Math.floor(availableWidth / tileSpacing);
  const initialLeftOffset = 0;
  const initialTopOffset = (tileWidth - tileHeight) / 2 + (yOffset == null ? 0 : yOffset);

  return (
    <>
      {Array.from({ length: numTiles }).map((_, index) => {
        const position = initialLeftOffset + index * tileSpacing;

        // Skip tiles that would extend beyond viewport
        if (position + tileWidth > availableWidth) return null;

        return (
          <BorderTile
            key={index}
            src={CelticPatternVertical}
            alt={isTop ? 'Horizontal Side Top' : 'Horizontal Side Bottom'}
            style={{
              position: 'absolute',
              width: tileWidth,
              height: tileHeight,
              zIndex: 2,
              transform: 'rotate(90deg)',
              left: position,
              ...(isTop
                ? { top: initialTopOffset } // Styles for top row
                : { bottom: initialTopOffset }), // Styles for bottom row
            }}
          />
        );
      })}
    </>
  );
};

export default BorderHorizontalCanvas;
