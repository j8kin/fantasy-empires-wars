import React from 'react';
import { GamePlayer } from '../../types/GamePlayer';
import styles from './css/PlayerAvatar.module.css';

export const EMPTY_PLAYER: GamePlayer = {
  id: 'empty',
  name: 'Empty',
  avatar: '',
  color: 'gray',
  alignment: 'neutral',
  level: 0,
  race: 'Human',
  description: 'Remove opponent',
};

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
  const dynamicStyles: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderColor,
    ...style,
  };

  const containerClassName = `${styles.container} ${styles[`container--${shape}`]} ${className || ''}`;

  // Check if this is an empty player
  if (player.id === EMPTY_PLAYER.id) {
    return (
      <div style={dynamicStyles} className={containerClassName}>
        <div
          style={{
            color: '#8b7355',
            fontSize: '12px',
            textAlign: 'center',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          EMPTY
        </div>
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

export default PlayerAvatar;
