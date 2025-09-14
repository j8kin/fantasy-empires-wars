import React, { useCallback } from 'react';
import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import { GamePlayer, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import PlayerAvatar from '../avatars/PlayerAvatar';
import CancelButton from '../buttons/CancelButton';
import styles from './css/StartGameWindow.module.css';

interface SelectOpponentDialogProps {
  excludedPlayerIds: string[];
  onSelect: (player: GamePlayer) => void;
  onCancel: () => void;
}

const SelectOpponentDialog: React.FC<SelectOpponentDialogProps> = ({
  excludedPlayerIds,
  onSelect,
  onCancel,
}) => {
  const availablePlayers = PREDEFINED_PLAYERS.filter(
    (player) => !excludedPlayerIds.includes(player.id)
  );

  const handlePlayerSelect = useCallback(
    (player: GamePlayer) => {
      onSelect(player);
    },
    [onSelect]
  );

  const getClassColor = (playerClass: string): string => {
    switch (playerClass) {
      case 'lawful':
        return '#4A90E2';
      case 'neutral':
        return '#95A5A6';
      case 'chaotic':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  };

  const dialogWidth = Math.min(700, typeof window !== 'undefined' ? window.innerWidth * 0.7 : 700);
  const dialogHeight = Math.min(
    500,
    typeof window !== 'undefined' ? window.innerHeight * 0.6 : 500
  );
  const dialogX = typeof window !== 'undefined' ? (window.innerWidth - dialogWidth) / 2 : 0;
  const dialogY = typeof window !== 'undefined' ? (window.innerHeight - dialogHeight) / 2 : 0;

  return (
    <FantasyBorderFrame
      x={dialogX}
      y={dialogY}
      width={dialogWidth}
      height={dialogHeight}
      secondaryButton={<CancelButton onClick={onCancel} />}
      zIndex={1010}
    >
      <div className={styles.content}>
        <h2 className={styles.title}>Select Opponent</h2>

        <div className={styles.section}>
          <div className={styles.playerSelection}>
            <div className={styles.playerListContainer} style={{ width: '100%' }}>
              <div className={styles.playerList}>
                {availablePlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`${styles.playerListItem}`}
                    onClick={() => handlePlayerSelect(player)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <PlayerAvatar
                        player={player}
                        size={50}
                        shape="circle"
                        borderColor={player.color}
                      />
                      <div>
                        <div className={styles.playerName}>{player.name}</div>
                        <div className={styles.playerSummary}>
                          <span
                            className={styles.playerClass}
                            style={{ color: getClassColor(player.alignment) }}
                          >
                            {player.alignment.toUpperCase()}
                          </span>
                          <span className={styles.playerLevel}>Level {player.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FantasyBorderFrame>
  );
};

export default SelectOpponentDialog;
