import React from 'react';
import styles from './css/GameButton.module.css';
import { GameButtonProps } from './GameButtonProps';

import Build from '../../assets/buttons/Build.png';
import Cancel from '../../assets/buttons/Cancel.png';
import Cast from '../../assets/buttons/Cast.png';
import EndOfTurn from '../../assets/buttons/EndOfTurn.png';
import LoadGame from '../../assets/buttons/LoadGame.png';
import Move from '../../assets/buttons/Move.png';
import NewGame from '../../assets/buttons/NewGame.png';
import Ok from '../../assets/buttons/Ok.png';
import Quest from '../../assets/buttons/Quest.png';
import Recruit from '../../assets/buttons/Recruit.png';
import SaveGame from '../../assets/buttons/SaveGame.png';
import StartGame from '../../assets/buttons/StartGame.png';

const GameButton: React.FC<GameButtonProps> = ({ buttonName, onClick }) => {
  const handleButton = () => {
    if (onClick) {
      onClick();
    } else {
      alert(`${buttonName} clicked! onClick handler: 'not provided'`);
    }
  };

  const getButtonImage = (name: string) => {
    switch (name.toLowerCase()) {
      case 'build':
        return { src: Build, alt: 'Construct a building' };
      case 'cancel':
        return { src: Cancel, alt: 'Cancel' };
      case 'cast':
        return { src: Cast, alt: 'Cast Spell' };
      case 'endofturn':
        return { src: EndOfTurn, alt: 'End Turn' };
      case 'loadgame':
        return { src: LoadGame, alt: 'Load Game' };
      case 'move':
        return { src: Move, alt: 'Move army' };
      case 'newgame':
        return { src: NewGame, alt: 'New Game' };
      case 'ok':
        return { src: Ok, alt: 'OK' };
      case 'quest':
        return { src: Quest, alt: 'Quest' };
      case 'recruit':
        return { src: Recruit, alt: 'Recruit' };
      case 'savegame':
        return { src: SaveGame, alt: 'Save Game' };
      case 'startgame':
        return { src: StartGame, alt: 'Start Game' };
      default:
        return { src: Ok, alt: buttonName };
    }
  };

  const { src, alt } = getButtonImage(buttonName);

  return <img src={src} alt={alt} className={styles.buttonImage} onClick={handleButton} />;
};

export default GameButton;
