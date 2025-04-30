import React from 'react';
import { Dimensions } from 'react-native';
import ManaPanelTile from './ManaPanelTile';
import CelticPatternVertical from '../assets/images/CelticPatternVertical.png';

interface BorderCanvasProps {
  isTop: boolean;
}

const BorderCanvas: React.FC<BorderCanvasProps> = ({ isTop }) => {
  const tileWidth = 180;
  const frameWidth = Dimensions.get('window').width;
  const numTiles = Math.ceil(frameWidth / tileWidth) - 1;

  return (
    <>
      {Array.from({ length: numTiles }).map((_, index) => {
        const leftPosition = 50 + index * tileWidth;

        return (
          <ManaPanelTile
            key={index}
            src={CelticPatternVertical}
            alt={isTop ? 'Horizontal Side Top' : 'Horizontal Side Bottom'}
            style={{
              position: 'absolute',
              width: '50px',
              height: '180px',
              zIndex: 2,
              transform: 'rotate(90deg)',
              left: leftPosition,
              ...(isTop
                ? { top: '-65px' } // Styles for top row
                : { bottom: '-65px' }), // Styles for bottom row
            }}
          />
        );
      })}
    </>
  );
};

export default BorderCanvas;
