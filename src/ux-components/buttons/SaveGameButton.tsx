import React from 'react';
import styles from './css/GameButton.module.css';
import SaveGame from '../../assets/images/SaveGame.png';

interface SaveGameButtonProps {
  onClick?: () => void;
}

const SaveGameButton: React.FC<SaveGameButtonProps> = ({ onClick }) => {
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
