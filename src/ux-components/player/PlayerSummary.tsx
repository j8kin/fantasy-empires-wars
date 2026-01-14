import React from 'react';
import styles from './css/Player.module.css';

import Avatar from '../avatars/Avatar';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getLandId } from '../../state/map/land/LandId';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getPlayerLands } from '../../selectors/landSelectors';
import { calculatePlayerIncome } from '../../map/vault/calculatePlayerIncome';

interface PlayerSummaryProps {
  avatarSize: number;
}

const PlayerSummary: React.FC<PlayerSummaryProps> = ({ avatarSize }) => {
  const { addGlowingTile } = useApplicationContext();
  const { gameState } = useGameContext();

  if (gameState == null) return null;

  const turnOwner = getTurnOwner(gameState);
  const currentIncome = calculatePlayerIncome(gameState);

  const handleAvatarClick = () => {
    // Find all lands controlled by the selected player
    setTimeout(() => {
      getPlayerLands(gameState).forEach((land) => addGlowingTile(getLandId(land.mapPos)));
    }, 0);
  };

  if (turnOwner == null) return null;

  return (
    <div className={styles.playerContainer}>
      <div onClick={handleAvatarClick} className={styles.clickableAvatar}>
        <Avatar player={turnOwner.playerProfile} size={avatarSize} shape="rectangle" borderColor={turnOwner.color} />
      </div>
      <div className={styles.playerDetails}>
        <div className={styles.playerName}>{turnOwner.playerProfile.name}</div>
        <div className={styles.moneyInfo}>
          <div className={styles.moneyItem}>Gold: {turnOwner.vault}</div>
          <div className={styles.moneyItem}>{currentIncome > 0 ? `+${currentIncome}` : currentIncome}/turn</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSummary;
