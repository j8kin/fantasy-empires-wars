import React from 'react';
import styles from './css/GameButton.module.css';
import { ButtonName, GameButtonProps } from './GameButtonProps';

import BuildImg from '../../assets/buttons/Build.png';
import CancelImg from '../../assets/buttons/Cancel.png';
import CastImg from '../../assets/buttons/Cast.png';
import EndOfTurnImg from '../../assets/buttons/EndOfTurn.png';
import LoadGameImg from '../../assets/buttons/LoadGame.png';
import MoveImg from '../../assets/buttons/Move.png';
import NewGameImg from '../../assets/buttons/NewGame.png';
import OkImg from '../../assets/buttons/Ok.png';
import QuestImg from '../../assets/buttons/Quest.png';
import RecruitImg from '../../assets/buttons/Recruit.png';
import SaveGameImg from '../../assets/buttons/SaveGame.png';
import StartGameImg from '../../assets/buttons/StartGame.png';

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

  const getButtonImage = (name: ButtonName) => {
    switch (name) {
      case ButtonName.BUILD:
        return BuildImg;
      case ButtonName.CANCEL:
        return CancelImg;
      case ButtonName.CAST:
        return CastImg;
      case ButtonName.TURN:
        return EndOfTurnImg;
      case ButtonName.LOAD:
        return LoadGameImg;
      case ButtonName.MOVE:
        return MoveImg;
      case ButtonName.NEW:
        return NewGameImg;
      case ButtonName.OK:
        return OkImg;
      case ButtonName.QUEST:
        return QuestImg;
      case ButtonName.RECRUIT:
        return RecruitImg;
      case ButtonName.SAVE:
        return SaveGameImg;
      case ButtonName.START:
        return StartGameImg;
      default:
        return OkImg;
    }
  };

  return (
    <img
      src={getButtonImage(buttonName)}
      alt={buttonName}
      className={styles.buttonImage}
      onClick={handleButton}
    />
  );
};

export default GameButton;
