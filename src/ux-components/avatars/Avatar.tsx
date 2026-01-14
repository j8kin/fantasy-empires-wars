import React from 'react';
import styles from './css/Avatar.module.css';

import { getAvatarImg } from '../../assets/getAvatarImg';
import { NO_PLAYER } from '../../domain/player/playerRepository';
import type { PlayerProfile } from '../../state/player/PlayerProfile';

type AvatarShape = 'circle' | 'rectangle';

interface AvatarProps {
  player: PlayerProfile;
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
  if (player == null || player.id === NO_PLAYER.id) {
    return (
      <div style={dynamicStyles} className={containerClassName}>
        <div className={styles['empty-placeholder']}>EMPTY</div>
      </div>
    );
  }

  if (!getAvatarImg(player.id)) {
    return null;
  }

  return (
    <div style={dynamicStyles} className={containerClassName}>
      <img
        src={getAvatarImg(player.id)}
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
