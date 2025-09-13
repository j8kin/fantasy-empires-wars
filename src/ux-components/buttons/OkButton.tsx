import React from 'react';
import { GameButtonProps } from './GameButtonProps';
import Ok from '../../assets/buttons/Ok.png';
import styles from './css/GameButton.module.css';

const OkButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleOk = () => {
    if (onClick) {
      onClick();
    }
  };

  return <img src={Ok} alt="Ok" className={styles.buttonImage} onClick={handleOk} />;
};

export default OkButton;
