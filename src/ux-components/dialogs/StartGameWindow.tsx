import React, { useState, useCallback } from 'react';
import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import { BattlefieldSize } from '../../types/BattlefieldSize';
import { GamePlayer, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import PlayerAvatar from '../avatars/PlayerAvatar';
import StartGameButton from '../buttons/StartGameButton';
import { GameConfig } from '../../types/GameConfig';
import styles from './css/StartGameWindow.module.css';

interface StartGameWindowProps {
  onStartGame: (config: GameConfig) => void;
}

const getMaxOpponents = (mapSize: BattlefieldSize): number => {
  switch (mapSize) {
    case 'small':
      return 2;
    case 'medium':
      return 4;
    case 'large':
      return 6;
    case 'huge':
      return 7;
    default:
      return 2;
  }
};

const StartGameWindow: React.FC<StartGameWindowProps> = ({ onStartGame }) => {
  const [mapSize, setMapSize] = useState<BattlefieldSize>('medium');
  const [selectedPlayer, setSelectedPlayer] = useState<GamePlayer>(PREDEFINED_PLAYERS[0]);
  const [numberOfOpponents, setNumberOfOpponents] = useState<number>(2);

  const maxOpponents = getMaxOpponents(mapSize);

  const handleMapSizeChange = useCallback(
    (newMapSize: BattlefieldSize) => {
      setMapSize(newMapSize);
      const newMaxOpponents = getMaxOpponents(newMapSize);
      if (numberOfOpponents > newMaxOpponents) {
        setNumberOfOpponents(newMaxOpponents);
      }
    },
    [numberOfOpponents]
  );

  const handlePlayerChange = useCallback((player: GamePlayer) => {
    setSelectedPlayer(player);
  }, []);

  const handleStartGame = useCallback(() => {
    const config: GameConfig = {
      mapSize,
      selectedPlayer,
      playerColor: selectedPlayer.color,
      numberOfOpponents,
    };
    onStartGame(config);
  }, [mapSize, selectedPlayer, numberOfOpponents, onStartGame]);

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

  // Calculate dialog dimensions
  const dialogWidth = Math.min(
    1200,
    typeof window !== 'undefined' ? window.innerWidth * 0.9 : 1200
  );
  const dialogHeight = Math.min(
    650,
    typeof window !== 'undefined' ? window.innerHeight * 0.75 : 650
  );
  const dialogX = typeof window !== 'undefined' ? (window.innerWidth - dialogWidth) / 2 : 0;
  const dialogY = typeof window !== 'undefined' ? (window.innerHeight - dialogHeight) / 2 : 0;

  return (
    <FantasyBorderFrame
      x={dialogX}
      y={dialogY}
      width={dialogWidth}
      height={dialogHeight}
      primaryButton={<StartGameButton onClick={handleStartGame} />}
    >
      <div className={styles.content}>
        <h1 className={styles.title}>Start New Game</h1>

        {/* Map Size and Opponents Selection */}
        <div className={styles.horizontalControls}>
          <div className={styles.section}>
            <label className={styles.label}>Map Size:</label>
            <select
              className={styles.dropdown}
              value={mapSize}
              onChange={(e) => handleMapSizeChange(e.target.value as BattlefieldSize)}
            >
              <option value="small">Small (6x13)</option>
              <option value="medium">Medium (9x18)</option>
              <option value="large">Large (11x23)</option>
              <option value="huge">Huge (15x31)</option>
            </select>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Opponents (Max {maxOpponents}):</label>
            <select
              className={styles.dropdown}
              value={numberOfOpponents}
              onChange={(e) => setNumberOfOpponents(Number(e.target.value))}
            >
              {Array.from({ length: maxOpponents - 1 }, (_, i) => i + 2).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Player Selection */}
        <div className={styles.section}>
          <label className={styles.label}>Choose Your Character:</label>
          <div className={styles.playerSelection}>
            {/* Left Side - Player List */}
            <div className={styles.playerListContainer}>
              <div className={styles.playerList}>
                {PREDEFINED_PLAYERS.map((player) => (
                  <div
                    key={player.id}
                    className={`${styles.playerListItem} ${
                      selectedPlayer.id === player.id ? styles.selected : ''
                    }`}
                    onClick={() => handlePlayerChange(player)}
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
    </FantasyBorderFrame>
  );
};

export default StartGameWindow;
