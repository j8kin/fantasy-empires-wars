import React from 'react';
import styles from './css/Avatar.module.css';

import { GamePlayer, NO_PLAYER } from '../../types/GamePlayer';

type AvatarShape = 'circle' | 'rectangle';

interface AvatarProps {
  player: GamePlayer;
  size?: number;
  shape?: AvatarShape;
  borderColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Avatar: React.FC<AvatarProps> = ({
  player,
  size = 60,
  shape = 'circle',
  borderColor = '#d4af37',
  className,
  style,
}) => {
  const dynamicStyles: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderColor,
    ...style,
  };

  const containerClassName = `${styles.container} ${styles[`container--${shape}`]} ${className || ''}`;

  // Check if this is an empty player
  if (player.id === NO_PLAYER.id) {
    return (
      <div style={dynamicStyles} className={containerClassName}>
        <div className={styles['empty-placeholder']}>EMPTY</div>
      </div>
    );
  }

  if (!player.avatar) {
    return null;
  }

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

export default Avatar;
