import React from 'react';

interface ManaPanelCornerProps {
  src: string;
  alt: string;
  style: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const ManaPanelCorner: React.FC<ManaPanelCornerProps> = ({ src, alt, style, onError }) => {
  return <img src={src} alt={alt} style={style} onError={onError} />;
};

export default ManaPanelCorner;
