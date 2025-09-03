import React from 'react';
import { GamePlayer } from '../../types/GamePlayer';
import styles from './css/PlayerAvatar.module.css';

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

  const dynamicStyles: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderColor,
    ...style,
  };

  const containerClassName = `${styles.container} ${styles[`container--${shape}`]} ${className || ''}`;

  return (
    <div style={dynamicStyles} className={containerClassName}>
      <img
        src={player.avatar}
        alt={player.name}
        className={styles.image}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default PlayerAvatar;
