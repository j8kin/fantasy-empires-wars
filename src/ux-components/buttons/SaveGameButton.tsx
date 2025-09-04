import React from 'react';
import styles from './css/GameButton.module.css';
import SaveGame from '../../assets/images/SaveGame.png';
import { GameButtonProps } from './GameButtonProps';

const SaveGameButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleSaveGame = () => {
    alert('Save Game clicked');
    if (onClick) {
      onClick();
    }
  };

  return (
    <img src={SaveGame} alt="Save Game" className={styles.buttonImage} onClick={handleSaveGame} />
  );
};

export default SaveGameButton;
