import React from 'react';
import styles from './css/GameButton.module.css';
import { GameButtonProps } from './GameButtonProps';

const MoveButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleMove = () => {
    alert('MoveButton clicked! onClick handler: ' + (onClick ? 'present' : 'not provided'));
    if (onClick) {
      onClick();
    }
  };

  return (
    <button className={styles.textButton} onClick={handleMove}>
      Move
    </button>
  );
};

export default MoveButton;
