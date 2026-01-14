import React from 'react';
import styles from './css/GameButton.module.css';

import buttonImg from '../../assets/buttons/Button.png';

import { ButtonName } from '../../types/ButtonName';
import type { ButtonType } from '../../types/ButtonName';

export interface GameButtonProps {
  buttonName: ButtonType;
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

  const buttonTxt = Object.entries(ButtonName).filter((n) => n[1] === buttonName)[0][0];
  const isLongText = buttonTxt.length > 5;
  const textClassName = isLongText ? `${styles.buttonText} ${styles.buttonTextSmall}` : styles.buttonText;

  return (
    <div className={styles.buttonContainer} onClick={handleButton}>
      <img src={buttonImg} alt={buttonName} className={styles.buttonImage} />
      <span className={textClassName}>{buttonTxt}</span>
    </div>
  );
};

export default GameButton;
