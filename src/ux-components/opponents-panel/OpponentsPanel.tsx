import React, { useCallback, useMemo } from 'react';
import { DiplomacyStatus, GamePlayer, NO_PLAYER, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import PlayerAvatar from '../avatars/PlayerAvatar';
import { useGameState } from '../../contexts/GameContext';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import styles from './css/OpponentsPanel.module.css';

// TODO: Remove since Diplomacy status is created during new game and read game state
const getRandomDiplomacyStatus = (): DiplomacyStatus => {
  const statuses: DiplomacyStatus[] = Object.values(DiplomacyStatus);
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getRandomOpponents = (excludePlayer?: GamePlayer, count: number = 2): GamePlayer[] => {
  const availablePlayers = PREDEFINED_PLAYERS.filter(
    (player) => !excludePlayer || player.id !== excludePlayer.id
  );

  const shuffled = [...availablePlayers].sort(() => 0.5 - Math.random());
  const selectedPlayers = shuffled.slice(0, Math.min(count, shuffled.length));

  // If we need more opponents than available unique players, add random duplicates
  // This shouldn't happen in practice since we have enough predefined players
  while (selectedPlayers.length < count && availablePlayers.length > 0) {
    const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    selectedPlayers.push(randomPlayer);
  }

  return selectedPlayers.map((player) => ({
    ...player,
    diplomacyStatus: getRandomDiplomacyStatus(),
  }));
};

const OpponentsPanel: React.FC = () => {
  const { gameState } = useGameState();
  const { setLandHideModePlayerId, showOpponentInfo } = useApplicationContext();

  const handleShowOpponentInfo = useCallback(
    (opponent: GamePlayer, screenPosition: { x: number; y: number }) => {
      showOpponentInfo(opponent, screenPosition);
      setLandHideModePlayerId(opponent.id);
    },
    [setLandHideModePlayerId, showOpponentInfo]
  );

  const selectedPlayer = gameState?.selectedPlayer;
  const providedOpponents = gameState?.opponents;
  const numberOfOpponents = providedOpponents?.length || 2;
  const opponents = useMemo(() => {
    // If we have provided opponents from the game config, use only those
    // This takes precedence over numberOfOpponents parameter
    if (providedOpponents && providedOpponents.length > 0) {
      const filteredOpponents = providedOpponents.filter(
        (opponent) => opponent.id !== NO_PLAYER.id
      );
      // If after filtering EmptyPlayer we have no valid opponents, generate random ones
      if (filteredOpponents.length === 0) {
        return getRandomOpponents(selectedPlayer, numberOfOpponents);
      }
      return filteredOpponents.map((opponent) => ({
        ...opponent,
        diplomacyStatus: getRandomDiplomacyStatus(),
      })) as GamePlayer[];
    }
    // Only generate random opponents if no specific opponents were provided
    return getRandomOpponents(selectedPlayer, numberOfOpponents);
  }, [providedOpponents, selectedPlayer, numberOfOpponents]);

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
      {avatars.map((opponent) => (
        <div
          key={opponent.id}
          className={styles.avatarContainer}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const screenPosition = { x: rect.left, y: rect.top };
            handleShowOpponentInfo(opponent, screenPosition);
          }}
        >
          <PlayerAvatar
            player={opponent}
            size={numberOfOpponents <= 4 ? 120 : 90}
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
