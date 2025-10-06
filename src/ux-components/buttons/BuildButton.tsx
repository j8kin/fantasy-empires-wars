import React from 'react';
import styles from './css/GameButton.module.css';
import { GameButtonProps } from './GameButtonProps';
import Build from '../../assets/buttons/Build.png';

const BuildButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleBuild = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <img
      src={Build}
      alt="Construct a building"
      className={styles.buttonImage}
      onClick={handleBuild}
    />
  );
};

export default BuildButton;
