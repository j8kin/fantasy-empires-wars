import React from 'react';
import styles from './css/GameButton.module.css';
import StartGame from '../../assets/images/StartGame.png';
import { GameButtonProps } from './GameButtonProps';

const StartGameButton: React.FC<GameButtonProps> = ({ onClick }) => {
  return (
    <div className={styles.buttonContainerCentered}>
      <img src={StartGame} alt="Start Game" className={styles.buttonImage} onClick={onClick} />
    </div>
  );
};

export default StartGameButton;
