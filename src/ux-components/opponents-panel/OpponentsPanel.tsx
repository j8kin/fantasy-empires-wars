import React, { useCallback } from 'react';
import styles from './css/OpponentsPanel.module.css';

import Avatar from '../avatars/Avatar';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getLandId } from '../../state/map/land/LandId';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getPlayerLands } from '../../selectors/landSelectors';
import { getPlayerColorValue } from '../../domain/ui/playerColors';
import type { PlayerState } from '../../state/player/PlayerState';

const OpponentsPanel: React.FC = () => {
  const { gameState } = useGameContext();
  const { showOpponentInfo, addGlowingTile } = useApplicationContext();

  const handleShowOpponentInfo = useCallback(
    (opponent: PlayerState, screenPosition: { x: number; y: number }) => {
      showOpponentInfo(opponent, screenPosition);

      setTimeout(() => {
        getPlayerLands(gameState!, opponent.id).forEach((land) =>
          addGlowingTile(getLandId(land.mapPos))
        );
      }, 0);
    },
    [showOpponentInfo, addGlowingTile, gameState]
  );

  if (gameState == null) return null;
  // Get all players except the selected player (opponents)
  const selectedPlayer = getTurnOwner(gameState);
  const opponents = gameState.players.filter((player) => player.id !== selectedPlayer.id);

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
          key={`${rowIndex}-${opponentIndex}-${opponent.id}`}
          className={styles.avatarContainer}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const screenPosition = { x: rect.left, y: rect.top };
            handleShowOpponentInfo(opponent, screenPosition);
          }}
        >
          <Avatar
            player={opponent.playerProfile}
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
