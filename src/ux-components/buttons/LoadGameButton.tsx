import React from 'react';
import styles from './css/GameButton.module.css';
import LoadGame from '../../assets/images/LoadGame.png';
import { GameButtonProps } from './GameButtonProps';

const LoadGameButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleLoadGame = () => {
    alert('Load Game clicked');
    if (onClick) {
      onClick();
    }
  };

  return (
    <img src={LoadGame} alt="Load Game" className={styles.buttonImage} onClick={handleLoadGame} />
  );
};

export default LoadGameButton;
