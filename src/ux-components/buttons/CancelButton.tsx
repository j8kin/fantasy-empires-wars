import React from 'react';
import { GameButtonProps } from './GameButtonProps';
import Cancel from '../../assets/buttons/Cancel.png';
import styles from './css/GameButton.module.css';

const CancelButton: React.FC<GameButtonProps> = ({ onClick, style }) => {
  const handleCancel = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={styles.buttonContainer} style={style}>
      <img src={Cancel} alt="Cancel" className={styles.buttonImage} onClick={handleCancel} />
    </div>
  );
};

export default CancelButton;
