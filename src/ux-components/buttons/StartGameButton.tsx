import React from 'react';
import styles from './css/GameButton.module.css';
import StartGame from '../../assets/buttons/StartGame.png';
import { GameButtonProps } from './GameButtonProps';

const StartGameButton: React.FC<GameButtonProps> = ({ onClick }) => {
  return <img src={StartGame} alt="Start Game" className={styles.buttonImage} onClick={onClick} />;
};

export default StartGameButton;
