import React from 'react';
import styles from './css/GameButton.module.css';
import { GameButtonProps } from './GameButtonProps';

const BuildButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleBuild = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <button className={styles.textButton} onClick={handleBuild}>
      Build
    </button>
  );
};

export default BuildButton;
