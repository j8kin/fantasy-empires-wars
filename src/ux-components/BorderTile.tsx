import React from 'react';

interface BorderTileProps {
  src: string;
  alt: string;
  style: React.CSSProperties;
}

const BorderTile: React.FC<BorderTileProps> = ({ src, alt, style }) => {
  return <img src={src} alt={alt} style={style} />;
};

export default BorderTile;
