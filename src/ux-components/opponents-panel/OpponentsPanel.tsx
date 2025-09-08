import React, { useState, useMemo } from 'react';
import { GamePlayer, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import PlayerAvatar from '../avatars/PlayerAvatar';
import OpponentInfoDialog, {
  OpponentWithDiplomacy,
  DiplomacyStatus,
} from '../dialogs/OpponentInfoDialog';
import styles from './css/OpponentsPanel.module.css';

interface OpponentsPanelProps {
  selectedPlayer?: GamePlayer;
  numberOfOpponents: number;
}

const OpponentsPanel: React.FC<OpponentsPanelProps> = ({ selectedPlayer, numberOfOpponents }) => {
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentWithDiplomacy | null>(null);
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

  const opponents = useMemo(
    () => getRandomOpponents(selectedPlayer, numberOfOpponents),
    [selectedPlayer, numberOfOpponents]
  );

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
          className={`${styles.avatarContainer} ${selectedOpponent?.id === opponent.id ? styles.selected : ''}`}
          onClick={() => setSelectedOpponent(opponent)}
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
      <OpponentInfoDialog opponent={selectedOpponent} onClose={() => setSelectedOpponent(null)} />
    </div>
  );
};

export default OpponentsPanel;
