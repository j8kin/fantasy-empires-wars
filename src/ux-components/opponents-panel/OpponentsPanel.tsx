import React, { useMemo } from 'react';
import { GamePlayer, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import PlayerAvatar from '../avatars/PlayerAvatar';
import { OpponentWithDiplomacy, DiplomacyStatus } from '../dialogs/OpponentInfoDialog';
import styles from './css/OpponentsPanel.module.css';

interface OpponentsPanelProps {
  selectedPlayer?: GamePlayer;
  numberOfOpponents: number;
  opponents?: GamePlayer[];
  onOpponentSelect?: (opponent: OpponentWithDiplomacy) => void;
}

const getRandomDiplomacyStatus = (): DiplomacyStatus => {
  const statuses: DiplomacyStatus[] = ['No Treaty', 'Peace', 'War'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getRandomOpponents = (
  excludePlayer?: GamePlayer,
  count: number = 2
): OpponentWithDiplomacy[] => {
  const availablePlayers = PREDEFINED_PLAYERS.filter(
    (player) => !excludePlayer || player.id !== excludePlayer.id
  );

  const shuffled = [...availablePlayers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((player) => ({
    ...player,
    diplomacyStatus: getRandomDiplomacyStatus(),
  }));
};

const OpponentsPanel: React.FC<OpponentsPanelProps> = ({
  selectedPlayer,
  numberOfOpponents,
  opponents: providedOpponents,
  onOpponentSelect,
}) => {
  const opponents = useMemo(() => {
    if (providedOpponents && providedOpponents.length > 0) {
      return providedOpponents.map((opponent) => ({
        ...opponent,
        diplomacyStatus: getRandomDiplomacyStatus(),
      })) as OpponentWithDiplomacy[];
    }
    return getRandomOpponents(selectedPlayer, numberOfOpponents);
  }, [selectedPlayer, numberOfOpponents, providedOpponents]);

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

  const renderAvatarRow = (avatars: OpponentWithDiplomacy[], rowIndex: number) => (
    <div key={rowIndex} className={styles.avatarRow}>
      {avatars.map((opponent) => (
        <div
          key={opponent.id}
          className={styles.avatarContainer}
          onClick={() => onOpponentSelect?.(opponent)}
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
