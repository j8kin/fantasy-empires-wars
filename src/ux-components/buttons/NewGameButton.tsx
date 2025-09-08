import React from 'react';
import styles from './css/GameButton.module.css';
import NewGame from '../../assets/buttons/NewGame.png';
import { GameButtonProps } from './GameButtonProps';

const NewGameButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleNewGame = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <img src={NewGame} alt="New Game" className={styles.buttonImage} onClick={handleNewGame} />
  );
};

export default NewGameButton;
