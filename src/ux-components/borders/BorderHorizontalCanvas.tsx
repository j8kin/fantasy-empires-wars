import React, { useRef, useEffect, useState } from 'react';
import BorderTile from './BorderTile';
import CelticPatternVertical from '../../assets/images/CelticPatternVertical.png';
import { BorderCanvasProps } from './BorderCanvasProps';
import './css/BorderStyles.css';

const BorderHorizontalCanvas: React.FC<BorderCanvasProps> = ({ isTop, yOffset }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number>(0);
  const tileWidth = 50;
  const tileHeight = 180;
  // After rotating by 90deg, each tile occupies tileHeight horizontally
  const numTiles = Math.ceil(availableWidth / tileHeight);
  const initialLeftOffset = 0;
  const initialTopOffset = (tileWidth - tileHeight) / 2 + (yOffset == null ? 0 : yOffset);

  useEffect(() => {
    const updateAvailableWidth = () => {
      if (containerRef.current) {
        const parentElement = containerRef.current.parentElement;
        if (parentElement) {
          setAvailableWidth(parentElement.clientWidth);
        }
      }
    };

    updateAvailableWidth();

    const handleResize = () => {
      updateAvailableWidth();
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
        const position = initialLeftOffset + index * tileHeight;

        return (
          <BorderTile
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

export default BorderHorizontalCanvas;
