import React from 'react';
import styles from './css/GameButton.module.css';
import { getButtonImg } from '../../assets/getButtonImg';
import { ButtonName } from '../../types/ButtonName';

export interface GameButtonProps {
  buttonName: ButtonName;
  onClick?: () => void;
}

const GameButton: React.FC<GameButtonProps> = ({ buttonName, onClick }) => {
  const handleButton = () => {
    if (onClick) {
      onClick();
    } else {
      console.log(`${buttonName} clicked! onClick handler: 'not provided'`);
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
        alert(`${buttonName} clicked! onClick handler: 'not provided'`);
      }
    }
  };

  return (
    <img
      src={getButtonImg(buttonName)}
      alt={buttonName}
      className={styles.buttonImage}
      onClick={handleButton}
    />
  );
};

export default GameButton;
