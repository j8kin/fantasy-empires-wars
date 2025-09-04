import React from 'react';
import styles from './css/GameButton.module.css';
import LoadGame from '../../assets/images/LoadGame.png';

interface LoadGameButtonProps {
  onClick?: () => void;
}

const LoadGameButton: React.FC<LoadGameButtonProps> = ({ onClick }) => {
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
