import React, { useState } from 'react';
import styles from './css/PlayerSelection.module.css';

import Avatar from '../avatars/Avatar';

import { PlayerProfile, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { getAlignmentColor } from '../../types/Alignment';
import { getPlayerColorValue } from '../../types/PlayerColors';

interface PlayerSelectionProps {
  label?: string;
  selectedPlayer: PlayerProfile;
  onPlayerChange: (player: PlayerProfile) => void;
  availablePlayers?: PlayerProfile[];
}

const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  label = 'Choose Your Character:',
  selectedPlayer,
  onPlayerChange,
  availablePlayers = PREDEFINED_PLAYERS,
}) => {
  const [hoveredPlayer, setHoveredPlayer] = useState<PlayerProfile | null>(null);

  const displayPlayer = hoveredPlayer || selectedPlayer;

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
                className={`${styles.playerListItem} playerListItem ${
                  selectedPlayer.id === player.id ? `${styles.selected} selected` : ''
                }`}
                role="button"
                aria-label={player.name}
                onClick={() => onPlayerChange(player)}
                onMouseEnter={() => setHoveredPlayer(player)}
                onMouseLeave={() => setHoveredPlayer(null)}
              >
                <div className={styles.playerName}>{player.name}</div>
                <div className={styles.playerSummary}>
                  <span
                    className={styles.playerClass}
                    style={{ color: getAlignmentColor(player.alignment) }}
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
              <h3 className={styles.selectedPlayerName}>{displayPlayer.name}</h3>
              <div
                className={styles.selectedPlayerClass}
                style={{ color: getAlignmentColor(displayPlayer.alignment) }}
              >
                {displayPlayer.alignment.toUpperCase()} - {displayPlayer.race} - Level{' '}
                {displayPlayer.level}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <Avatar
                player={displayPlayer}
                size={120}
                shape="circle"
                borderColor={getPlayerColorValue(displayPlayer.color)}
                className={styles.selectedAvatarContainer}
              />

              <div className={styles.selectedPlayerDescription}>{displayPlayer.description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelection;
