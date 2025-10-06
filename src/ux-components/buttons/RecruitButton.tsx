import React from 'react';
import styles from './css/GameButton.module.css';
import { GameButtonProps } from './GameButtonProps';
import Recruit from '../../assets/buttons/Recruit.png';

const RecruitButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleCast = () => {
    alert('RecruitButton clicked! onClick handler: ' + (onClick ? 'present' : 'not provided'));
    if (onClick) {
      onClick();
    }
  };

  return (
    <img src={Recruit} alt="Recruit Army" className={styles.buttonImage} onClick={handleCast} />
  );
};

export default RecruitButton;
