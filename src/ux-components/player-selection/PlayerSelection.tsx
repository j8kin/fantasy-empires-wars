import React from 'react';
import { GamePlayer, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import PlayerAvatar from '../avatars/PlayerAvatar';
import styles from './css/PlayerSelection.module.css';

interface PlayerSelectionProps {
  label?: string;
  selectedPlayer: GamePlayer;
  onPlayerChange: (player: GamePlayer) => void;
  availablePlayers?: GamePlayer[];
}

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

const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  label = 'Choose Your Character:',
  selectedPlayer,
  onPlayerChange,
  availablePlayers = PREDEFINED_PLAYERS,
}) => {
  return (
    <div className={styles.section}>
      <label className={styles.label}>{label}</label>
      <div className={styles.playerSelection}>
        {/* Left Side - Player List */}
        <div className={styles.playerListContainer}>
          <div className={styles.playerList}>
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                className={`${styles.playerListItem} ${
                  selectedPlayer.id === player.id ? styles.selected : ''
                }`}
                onClick={() => onPlayerChange(player)}
              >
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
            ))}
          </div>
        </div>

        {/* Right Side - Player Details */}
        <div className={styles.playerDetailsContainer}>
          <div className={styles.playerDetails}>
            <div className={styles.playerDetailHeader}>
              <h3 className={styles.selectedPlayerName}>{selectedPlayer.name}</h3>
              <div
                className={styles.selectedPlayerClass}
                style={{ color: getClassColor(selectedPlayer.alignment) }}
              >
                {selectedPlayer.alignment.toUpperCase()} - {selectedPlayer.race} - Level{' '}
                {selectedPlayer.level}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <PlayerAvatar
                player={selectedPlayer}
                size={120}
                shape="circle"
                borderColor={selectedPlayer.color}
                className={styles.selectedAvatarContainer}
              />

              <div className={styles.selectedPlayerDescription}>{selectedPlayer.description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelection;
