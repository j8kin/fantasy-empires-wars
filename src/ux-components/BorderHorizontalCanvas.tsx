import React from 'react';
import { Dimensions } from 'react-native';
import BorderTile from './BorderTile';
import CelticPatternVertical from '../assets/images/CelticPatternVertical.png';
import { BorderCanvasProps } from './BorderCanvasProps';
const BorderHorizontalCanvas: React.FC<BorderCanvasProps> = ({ isTop }) => {
  const tileWidth = 50;
  const tileHeight = 180;
  const frameLength = Dimensions.get('window').width;
  const numTiles = Math.ceil(frameLength / tileHeight) - 1;
  const slideCanvas = (frameLength - numTiles * tileHeight) / 2 + tileHeight / 4;

  return (
    <>
      {Array.from({ length: numTiles }).map((_, index) => {
        const position = slideCanvas + index * tileHeight;

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
                ? { top: (tileWidth - tileHeight) / 2 } // Styles for top row
                : { bottom: (tileWidth - tileHeight) / 2 }), // Styles for bottom row
            }}
          />
        );
      })}
    </>
  );
};

export default BorderHorizontalCanvas;
