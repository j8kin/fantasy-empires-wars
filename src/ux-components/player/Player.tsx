import React from 'react';
import styles from './css/Player.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import Avatar from '../avatars/Avatar';

import { battlefieldLandId, getSelectedPlayer } from '../../types/GameState';
import { getLands } from '../../map/utils/mapLands';

export interface PlayerProps {
  avatarSize: number;
}

const Player: React.FC<PlayerProps> = ({ avatarSize }) => {
  const { addGlowingTile } = useApplicationContext();
  const { gameState } = useGameContext();

  const selectedPlayer = getSelectedPlayer(gameState);

  if (!selectedPlayer) {
    return null;
  }

  const handleAvatarClick = () => {
    if (!gameState || !selectedPlayer) return;
    // Find all lands controlled by the selected player
    setTimeout(() => {
      getLands(gameState.battlefield.lands, [selectedPlayer]).forEach((land) => {
        addGlowingTile(battlefieldLandId(land.mapPos));
      });
    }, 0);
  };

  return (
    <div className={styles.playerContainer}>
      <div onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
        <Avatar
          player={selectedPlayer}
          size={avatarSize}
          shape="rectangle"
          borderColor={selectedPlayer.color}
        />
      </div>
      <div className={styles.playerDetails}>
        <div className={styles.playerName}>{selectedPlayer.name}</div>
        <div className={styles.moneyInfo}>
          <div className={styles.moneyItem}>Gold: {selectedPlayer.money}</div>
          <div className={styles.moneyItem}>+{selectedPlayer.income}/turn</div>
        </div>
      </div>
    </div>
  );
};

export default Player;
