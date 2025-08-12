import React from 'react';
import { Dimensions } from 'react-native';
import BorderTile from './BorderTile';
import CelticPatternVertical from '../assets/images/CelticPatternVertical.png';
import { BorderCanvasProps } from './BorderCanvasProps';

const BorderVerticalCanvas: React.FC<BorderCanvasProps> = ({ isLeft }) => {
  const tileWidth = 50;
  const tileHeight = 180;
  const availableHeight = window.innerHeight;
  const numTiles = Math.floor(availableHeight / tileHeight);
  const yOffset = 0; // Start from top corner

  return (
    <>
      {Array.from({ length: numTiles }).map((_, index) => {
        const position = yOffset + index * tileHeight;

        // Skip tiles that would extend beyond viewport
        if (position + tileHeight > availableHeight) return null;

        return (
          <BorderTile
            key={index}
            src={CelticPatternVertical}
            alt={isLeft ? 'Vertical Side Left' : 'Vertical Side Right'}
            style={{
              position: 'absolute',
              width: tileWidth,
              height: tileHeight,
              top: position,
              zIndex: 2,
              ...(isLeft ? { left: 0 } : { right: 0 }),
            }}
          />
        );
      })}
    </>
  );
};

export default BorderVerticalCanvas;
