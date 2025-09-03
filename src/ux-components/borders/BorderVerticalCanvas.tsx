import React from 'react';
import BorderTile from './BorderTile';
import CelticPatternVertical from '../../assets/images/CelticPatternVertical.png';
import { BorderCanvasProps } from './BorderCanvasProps';
import './css/BorderStyles.css';

const BorderVerticalCanvas: React.FC<BorderCanvasProps> = ({ isLeft }) => {
  const tileHeight = 180;
  const availableHeight = window.innerHeight;
  const numTiles = Math.ceil(availableHeight / tileHeight);
  const yOffset = 0; // Start from top corner

  return (
    <>
      {Array.from({ length: numTiles }).map((_, index) => {
        const position = yOffset + index * tileHeight;

        // For the last tile, adjust height if it would extend beyond viewport
        const isLastTile = index === numTiles - 1;
        const adjustedHeight =
          isLastTile && position + tileHeight > availableHeight
            ? availableHeight - position
            : tileHeight;

        // Skip if no height left for tile
        if (adjustedHeight <= 0) return null;

        return (
          <BorderTile
            key={index}
            src={CelticPatternVertical}
            alt={isLeft ? 'Vertical Side Left' : 'Vertical Side Right'}
            className={`border-vertical ${isLeft ? 'border-vertical--left' : 'border-vertical--right'}`}
            style={{
              height: adjustedHeight,
              top: position,
            }}
          />
        );
      })}
    </>
  );
};

export default BorderVerticalCanvas;
