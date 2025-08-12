import React from 'react';
import BorderTile from './BorderTile';
import CelticPatternVertical from '../assets/images/CelticPatternVertical.png';
import { BorderCanvasProps } from './BorderCanvasProps';

const BorderHorizontalCanvas: React.FC<BorderCanvasProps> = ({ isTop, yOffset }) => {
  const tileWidth = 50;
  const tileHeight = 180;
  const availableWidth = window.innerWidth;
  // After rotating by 90deg, each tile occupies tileHeight horizontally
  const tileSpacing = tileHeight;
  const numTiles = Math.ceil(availableWidth / tileSpacing);
  const initialLeftOffset = 0;
  const initialTopOffset = (tileWidth - tileHeight) / 2 + (yOffset == null ? 0 : yOffset);

  return (
    <>
      {Array.from({ length: numTiles }).map((_, index) => {
        const position = initialLeftOffset + index * tileSpacing;

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
