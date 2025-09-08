import React from 'react';
import Ornament from './Ornament';
import CelticPatternVertical from '../../assets/border/CelticPatternVertical.png';
import { OrnamentPositionProps } from './OrnamentPositionProps';
import { useContainerDimensions } from './hooks/useContainerDimensions';
import './css/BorderStyles.css';

const VerticalOrnament: React.FC<OrnamentPositionProps> = ({ isLeft }) => {
  const { containerRef, dimensions } = useContainerDimensions();
  const availableHeight = dimensions.height;
  const tileHeight = 180;
  const numTiles = Math.ceil(availableHeight / tileHeight);
  const yOffset = 0; // Start from top corner

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
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
          <Ornament
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
    </div>
  );
};

export default VerticalOrnament;
