import React from 'react';

interface OrnamentProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const Ornament: React.FC<OrnamentProps> = ({ src, alt, className, style }) => {
  return <img src={src} alt={alt} className={className} style={style} />;
};

export default Ornament;
