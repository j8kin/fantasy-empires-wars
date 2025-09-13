import React from 'react';
import { GameButtonProps } from './GameButtonProps';
import styles from './css/GameButton.module.css';
import SaveGame from '../../assets/buttons/SaveGame.png';

const OpenSaveDialogButton: React.FC<GameButtonProps> = ({ onClick }) => {
  return <img src={SaveGame} alt="Save Game" className={styles.buttonImage} onClick={onClick} />;
};

export default OpenSaveDialogButton;
