import React from 'react';
import BorderTile from './BorderTile';
import { BorderCanvasProps } from './BorderCanvasProps';
import CelticPatternCorner from '../../assets/border/CelticPatternCorner.png';
import './css/BorderStyles.css';
const BorderCornerCanvas: React.FC<BorderCanvasProps> = ({ isLeft, isTop, xOffset, yOffset }) => {
  xOffset = xOffset == null ? 0 : xOffset;
  yOffset = yOffset == null ? 0 : yOffset;

  const getCornerClassName = () => {
    if (xOffset !== 0 || yOffset !== 0) {
      return 'border-corner--with-offset';
    }

    if (isTop && isLeft) return 'border-corner border-corner--top-left';
    if (isTop && !isLeft) return 'border-corner border-corner--top-right';
    if (!isTop && isLeft) return 'border-corner border-corner--bottom-left';
    if (!isTop && !isLeft) return 'border-corner border-corner--bottom-right';

    return 'border-corner';
  };

  const getInlineStyles = () => {
    if (xOffset !== 0 || yOffset !== 0) {
      return {
        top: isTop ? yOffset : undefined,
        bottom: !isTop ? yOffset : undefined,
        left: isLeft ? xOffset : undefined,
        right: !isLeft ? xOffset : undefined,
      };
    }
    return {};
  };

  return (
    <BorderTile
      src={CelticPatternCorner}
      alt={(isLeft ? 'Left ' : 'Right ') + (isTop ? 'Top ' : 'Bottom ') + 'Corner'}
      className={getCornerClassName()}
      style={getInlineStyles()}
    />
  );
};

export default BorderCornerCanvas;
