import React from 'react';
import Ornament from './Ornament';
import CelticPatternVertical from '../../assets/border/CelticPatternVertical.png';
import { OrnamentPositionProps } from './OrnamentPositionProps';
import { useContainerDimensions } from './hooks/useContainerDimensions';
import './css/BorderStyles.css';

const HorizontalOrnament: React.FC<OrnamentPositionProps> = ({ isTop, yOffset }) => {
  const { containerRef, dimensions } = useContainerDimensions();
  const availableWidth = dimensions.width;
  const tileWidth = 50;
  const tileHeight = 180;
  // After rotating by 90deg, each tile occupies tileHeight horizontally
  const numTiles = Math.ceil(availableWidth / tileHeight);
  const initialLeftOffset = 0;
  const initialTopOffset = (tileWidth - tileHeight) / 2 + (yOffset == null ? 0 : yOffset);

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
        const position = initialLeftOffset + index * tileHeight;

        return (
          <Ornament
            key={index}
            src={CelticPatternVertical}
            alt={isTop ? 'Horizontal Side Top' : 'Horizontal Side Bottom'}
            className={`border-horizontal ${isTop ? 'border-horizontal--top' : 'border-horizontal--bottom'}`}
            style={{
              left: position,
              ...(isTop
                ? { top: initialTopOffset } // Styles for top row
                : { bottom: initialTopOffset }), // Styles for bottom row
            }}
          />
        );
      })}
    </div>
  );
};

export default HorizontalOrnament;
