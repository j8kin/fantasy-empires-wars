import React from 'react';
import styles from './css/PlayerInfo.module.css';
import PlayerAvatar from '../avatars/PlayerAvatar';
import { useGameContext } from '../../contexts/GameContext';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { battlefieldLandId } from '../../types/GameState';
import { getLands } from '../../map/utils/mapLands';

export interface PlayerInfoProps {
  avatarSize: number;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ avatarSize }) => {
  const { gameState, getTotalPlayerGold } = useGameContext();
  const { addGlowingTile } = useApplicationContext();
  const selectedPlayer = gameState?.selectedPlayer;

  if (!selectedPlayer) {
    return null;
  }

  const money = selectedPlayer.money ?? getTotalPlayerGold(selectedPlayer);
  const income = selectedPlayer.income ?? 0; // TODO: calculate from battlefield lands

  const handleAvatarClick = () => {
    if (!gameState) return;
    // Find all lands controlled by the selected player
    setTimeout(() => {
      getLands(gameState.battlefieldLands, [gameState.selectedPlayer]).forEach((land) => {
        addGlowingTile(battlefieldLandId(land.mapPos));
      });
    }, 0);
  };

  return (
    <div className={styles.playerInfoContainer}>
      <div onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
        <PlayerAvatar
          player={selectedPlayer}
          size={avatarSize}
          shape="rectangle"
          borderColor={selectedPlayer.color}
        />
      </div>
      <div className={styles.playerDetails}>
        <div className={styles.playerName}>{selectedPlayer.name}</div>
        <div className={styles.moneyInfo}>
          <div className={styles.moneyItem}>Gold: {money.toLocaleString()}</div>
          <div className={styles.moneyItem}>+{income}/turn</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
