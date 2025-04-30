import React from 'react';

interface ManaPanelTileProps {
  src: string;
  alt: string;
  style: React.CSSProperties;
}

const ManaPanelTile: React.FC<ManaPanelTileProps> = ({ src, alt, style }) => {
  return <img src={src} alt={alt} style={style} />;
};

export default ManaPanelTile;
