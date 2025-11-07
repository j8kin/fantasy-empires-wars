import React from 'react';
import styles from './css/GameButton.module.css';
import { getButtonImg } from '../../assets/getButtonImg';
import { ButtonName } from '../../types/ButtonName';

export interface GameButtonProps {
  buttonName: ButtonName;
  // Use the standard React mouse event handler for an img element; callers may ignore the event
  onClick?: React.MouseEventHandler<HTMLImageElement>;
}

const GameButton: React.FC<GameButtonProps> = ({ buttonName, onClick }) => {
  const handleButton = (event: React.MouseEvent<HTMLImageElement>) => {
    if (onClick) {
      onClick(event);
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
