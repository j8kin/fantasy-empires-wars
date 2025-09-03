import React from 'react';

interface BorderTileProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const BorderTile: React.FC<BorderTileProps> = ({ src, alt, className, style }) => {
  return <img src={src} alt={alt} className={className} style={style} />;
};

export default BorderTile;
