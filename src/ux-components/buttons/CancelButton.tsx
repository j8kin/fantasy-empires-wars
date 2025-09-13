import React from 'react';
import { GameButtonProps } from './GameButtonProps';
import Cancel from '../../assets/buttons/Cancel.png';
import styles from './css/GameButton.module.css';

const CancelButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleCancel = () => {
    if (onClick) {
      onClick();
    }
  };

  return <img src={Cancel} alt="Cancel" className={styles.buttonImage} onClick={handleCancel} />;
};

export default CancelButton;
