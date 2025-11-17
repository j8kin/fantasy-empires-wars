import React, { useCallback } from 'react';
import styles from './css/OpponentsPanel.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import Avatar from '../avatars/Avatar';

import { GamePlayer } from '../../types/GamePlayer';
import { battlefieldLandId, getTurnOwner } from '../../types/GameState';
import { getLands } from '../../map/utils/getLands';

const OpponentsPanel: React.FC = () => {
  const { gameState } = useGameContext();
  const { showOpponentInfo, addGlowingTile } = useApplicationContext();

  const handleShowOpponentInfo = useCallback(
    (opponent: GamePlayer, screenPosition: { x: number; y: number }) => {
      showOpponentInfo(opponent, screenPosition);

      setTimeout(() => {
        getLands({ lands: gameState!.battlefield.lands, players: [opponent.id] }).forEach(
          (land) => {
            addGlowingTile(battlefieldLandId(land.mapPos));
          }
        );
      }, 0);
    },
    [showOpponentInfo, addGlowingTile, gameState]
  );

  // Get all players except the selected player (opponents)
  const selectedPlayer = getTurnOwner(gameState);
  const opponents = gameState?.players?.filter((player) => player.id !== selectedPlayer?.id) || [];

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

  const renderAvatarRow = (avatars: GamePlayer[], rowIndex: number) => (
    <div key={rowIndex} className={styles.avatarRow}>
      {avatars.map((opponent, opponentIndex) => (
        <div
          key={`${rowIndex}-${opponentIndex}-${opponent.id}`}
          className={styles.avatarContainer}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const screenPosition = { x: rect.left, y: rect.top };
            handleShowOpponentInfo(opponent, screenPosition);
          }}
        >
          <Avatar
            player={opponent}
            size={opponents.length <= 4 ? 120 : 90}
            shape="circle"
            borderColor={opponent.color}
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
