import React from 'react';
import styles from './css/GameButton.module.css';
import SaveGame from '../../assets/buttons/SaveGame.png';
interface SaveGameButtonProps {
  onClick?: (saveName: string) => void;
  style?: React.CSSProperties;
}

const SaveGameButton: React.FC<SaveGameButtonProps> = ({ onClick }) => {
  const handleSaveGame = () => {
    if (onClick) {
      const saveName = prompt('Enter save game name:') || 'Untitled Save';
      onClick(saveName);
    }
  };

  return (
    <img src={SaveGame} alt="Save Game" className={styles.buttonImage} onClick={handleSaveGame} />
  );
};

export default SaveGameButton;
