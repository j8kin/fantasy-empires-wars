import React from 'react';
import styles from './css/GameButton.module.css';
import { GameButtonProps } from './GameButtonProps';

const CastButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleCast = () => {
    alert('CastButton clicked! onClick handler: ' + (onClick ? 'present' : 'not provided'));
    if (onClick) {
      onClick();
    }
  };

  return (
    <button className={styles.textButton} onClick={handleCast}>
      Cast
    </button>
  );
};

export default CastButton;
