import React from 'react';
import styles from './css/GameButton.module.css';
import { GameButtonProps } from './GameButtonProps';
import Quest from '../../assets/buttons/Quest.png';

const QuestButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const handleCast = () => {
    alert('RecruitButton clicked! onClick handler: ' + (onClick ? 'present' : 'not provided'));
    if (onClick) {
      onClick();
    }
  };

  return (
    <img
      src={Quest}
      alt="Send Hero on a quest"
      className={styles.buttonImage}
      onClick={handleCast}
    />
  );
};

export default QuestButton;
