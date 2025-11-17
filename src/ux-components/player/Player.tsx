import React from 'react';
import styles from './css/Player.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import Avatar from '../avatars/Avatar';

import { battlefieldLandId, getTurnOwner } from '../../types/GameState';
import { getLands } from '../../map/utils/getLands';

export interface PlayerProps {
  avatarSize: number;
}

const Player: React.FC<PlayerProps> = ({ avatarSize }) => {
  const { addGlowingTile } = useApplicationContext();
  const { gameState } = useGameContext();

  const turnOwner = getTurnOwner(gameState)!;

  const handleAvatarClick = () => {
    // Find all lands controlled by the selected player
    setTimeout(() => {
      getLands({ lands: gameState!.battlefield.lands, players: [turnOwner.id] }).forEach((land) => {
        addGlowingTile(battlefieldLandId(land.mapPos));
      });
    }, 0);
  };

  return (
    <div className={styles.playerContainer}>
      <div onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
        <Avatar
          player={turnOwner}
          size={avatarSize}
          shape="rectangle"
          borderColor={turnOwner.color}
        />
      </div>
      <div className={styles.playerDetails}>
        <div className={styles.playerName}>{turnOwner.name}</div>
        <div className={styles.moneyInfo}>
          <div className={styles.moneyItem}>Gold: {turnOwner.vault}</div>
          <div className={styles.moneyItem}>+{turnOwner.income}/turn</div>
        </div>
      </div>
    </div>
  );
};

export default Player;
