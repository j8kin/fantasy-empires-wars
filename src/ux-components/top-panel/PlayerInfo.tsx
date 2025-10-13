import React from 'react';
import styles from './css/PlayerInfo.module.css';
import PlayerAvatar from '../avatars/PlayerAvatar';
import { useGameContext } from '../../contexts/GameContext';

export interface PlayerInfoProps {
  avatarSize: number;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ avatarSize }) => {
  const { gameState, getTotalPlayerGold } = useGameContext();
  const selectedPlayer = gameState?.selectedPlayer;

  if (!selectedPlayer) {
    return null;
  }

  const money = selectedPlayer.money ?? getTotalPlayerGold(selectedPlayer);
  const income = selectedPlayer.income ?? 0; // TODO: calculate from battlefield lands

  return (
    <div className={styles.playerInfoContainer}>
      <PlayerAvatar
        player={selectedPlayer}
        size={avatarSize}
        shape="rectangle"
        borderColor={selectedPlayer.color}
      />
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
