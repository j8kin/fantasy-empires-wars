import React from 'react';
import { Dimensions } from 'react-native';
import ManaPanelTile from './ManaPanelTile';
import CelticPatternVertical from '../assets/images/CelticPatternVertical.png';

interface BorderCanvasProps {
  isTop: boolean;
  isRotated: boolean;
}

const BorderCanvas: React.FC<BorderCanvasProps> = ({ isTop, isRotated }) => {
  const tileWidth = 180;
  const tileHeight = 50;
  const slideCanvas = '-65px';
  const frameWidth = Dimensions.get('window').width;
  const numTiles = Math.ceil(frameWidth / tileWidth) - 1;

  return (
    <>
      {Array.from({ length: numTiles }).map((_, index) => {
        const position = tileHeight + index * tileWidth;

        return (
          <ManaPanelTile
            key={index}
            src={CelticPatternVertical}
            alt={isTop ? 'Horizontal Side Top' : 'Horizontal Side Bottom'}
            style={{
              position: 'absolute',
              width: isRotated ? tileHeight : tileWidth,
              height: isRotated ? tileWidth : tileHeight,
              zIndex: 2,
              transform: isRotated ? 'rotate(90deg)' : undefined,
              left: position,
              ...(isTop
                ? { top: slideCanvas } // Styles for top row
                : { bottom: slideCanvas }), // Styles for bottom row
            }}
          />
        );
      })}
    </>
  );
};

export default BorderCanvas;
