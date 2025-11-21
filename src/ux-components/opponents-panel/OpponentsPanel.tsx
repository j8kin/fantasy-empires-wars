import React, { useCallback } from 'react';
import styles from './css/OpponentsPanel.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import Avatar from '../avatars/Avatar';

import { PlayerState } from '../../state/PlayerState';
import { getTurnOwner } from '../../state/GameState';
import { getLandId } from '../../state/LandState';

import { getPlayerColorValue } from '../../types/PlayerColors';

import { getLands } from '../../map/utils/getLands';

const OpponentsPanel: React.FC = () => {
  const { gameState } = useGameContext();
  const { showOpponentInfo, addGlowingTile } = useApplicationContext();

  const handleShowOpponentInfo = useCallback(
    (opponent: PlayerState, screenPosition: { x: number; y: number }) => {
      showOpponentInfo(opponent, screenPosition);

      setTimeout(() => {
        getLands({ gameState: gameState!, players: [opponent.playerId] }).forEach((land) => {
          addGlowingTile(getLandId(land.mapPos));
        });
      }, 0);
    },
    [showOpponentInfo, addGlowingTile, gameState]
  );

  // Get all players except the selected player (opponents)
  const selectedPlayer = getTurnOwner(gameState);
  const opponents =
    gameState?.players?.filter((player) => player.playerId !== selectedPlayer?.playerId) || [];

  const getAvatarLayout = (count: number) => {
    if (count <= 4) {
      return { rows: [count] };
    } else {
      const firstRowCount = Math.ceil(count / 2);
      const secondRowCount = count - firstRowCount;
      return { rows: [firstRowCount, secondRowCount] };
    }
  };

  const layout = getAvatarLayout(opponents.length);

  const renderAvatarRow = (avatars: PlayerState[], rowIndex: number) => (
    <div key={rowIndex} className={styles.avatarRow}>
      {avatars.map((opponent, opponentIndex) => (
        <div
          key={`${rowIndex}-${opponentIndex}-${opponent.playerId}`}
          className={styles.avatarContainer}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const screenPosition = { x: rect.left, y: rect.top };
            handleShowOpponentInfo(opponent, screenPosition);
          }}
        >
          <Avatar
            player={opponent.getProfile()}
            size={opponents.length <= 4 ? 120 : 90}
            shape="circle"
            borderColor={getPlayerColorValue(opponent.color)}
          />
        </div>
      ))}
    </div>
  );

  let avatarIndex = 0;
  const avatarRows = layout.rows.map((rowCount, rowIndex) => {
    const rowAvatars = opponents.slice(avatarIndex, avatarIndex + rowCount);
    avatarIndex += rowCount;
    return renderAvatarRow(rowAvatars, rowIndex);
  });

  return (
    <div className={styles.opponentsPanelContainer}>
      <div className={styles.opponentsGrid}>{avatarRows}</div>
    </div>
  );
};

export default OpponentsPanel;
