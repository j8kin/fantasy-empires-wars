import React from 'react';
import styles from './css/StartGameButton.module.css';
import StartGame from '../assets/images/StartGame.png';

interface StartGameButtonProps {
  onClick: () => void;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({ onClick }) => {
  return (
    <div className={styles.startGameButtonContainer}>
      <img
        src={StartGame}
        alt="Start Game"
        className={styles.startGameImage}
        onClick={onClick}
      />
    </div>
  );
};

export default StartGameButton;