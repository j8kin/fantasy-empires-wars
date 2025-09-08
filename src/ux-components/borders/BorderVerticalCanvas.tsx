import React, { useEffect, useRef, useState } from 'react';
import BorderTile from './BorderTile';
import CelticPatternVertical from '../../assets/border/CelticPatternVertical.png';
import { BorderCanvasProps } from './BorderCanvasProps';
import './css/BorderStyles.css';

const BorderVerticalCanvas: React.FC<BorderCanvasProps> = ({ isLeft }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState<number>(0);
  const tileHeight = 180;
  const numTiles = Math.ceil(availableHeight / tileHeight);
  const yOffset = 0; // Start from top corner

  useEffect(() => {
    const updateAvailableHeight = () => {
      if (containerRef.current) {
        const parentElement = containerRef.current.parentElement;
        if (parentElement) {
          setAvailableHeight(parentElement.clientHeight);
        }
      }
    };

    updateAvailableHeight();

    const handleResize = () => {
      updateAvailableHeight();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    </div>
  );
};

export default BorderVerticalCanvas;
