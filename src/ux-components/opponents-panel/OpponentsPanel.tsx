import React, { useCallback } from 'react';
import styles from './css/OpponentsPanel.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import PlayerAvatar from '../avatars/PlayerAvatar';

import { GamePlayer } from '../../types/GamePlayer';

const OpponentsPanel: React.FC = () => {
  const { gameState } = useGameContext();
  const { setLandHideModePlayerId, showOpponentInfo } = useApplicationContext();

  const handleShowOpponentInfo = useCallback(
    (opponent: GamePlayer, screenPosition: { x: number; y: number }) => {
      showOpponentInfo(opponent, screenPosition);
      setLandHideModePlayerId(opponent.id);
    },
    [setLandHideModePlayerId, showOpponentInfo]
  );

  // Simply use opponents directly from gameState - they are set during game initialization
  const opponents = gameState?.opponents || [];

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
          <PlayerAvatar
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
