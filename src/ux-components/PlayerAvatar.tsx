import React from 'react';
import { GamePlayer } from '../types/GamePlayer';

type AvatarShape = 'circle' | 'rectangle';

interface PlayerAvatarProps {
  player: GamePlayer;
  size?: number;
  shape?: AvatarShape;
  borderColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  size = 60,
  shape = 'circle',
  borderColor = '#d4af37',
  className,
  style,
}) => {
  if (!player.avatar) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: shape === 'circle' ? '50%' : '8px',
    overflow: 'hidden',
    border: `2px solid ${borderColor}`,
    flexShrink: 0,
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  };

  return (
    <div style={containerStyle} className={className}>
      <img
        src={player.avatar}
        alt={player.name}
        style={imageStyle}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default PlayerAvatar;
