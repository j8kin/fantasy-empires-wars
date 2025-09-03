import React, { useState, useCallback } from 'react';
import { MapSize } from '../types/MapSize';
import { GamePlayer, PREDEFINED_PLAYERS, PLAYER_COLORS } from '../types/GamePlayer';
import BorderVerticalCanvas from './BorderVerticalCanvas';
import BorderHorizontalCanvas from './BorderHorizontalCanvas';
import BorderCornerCanvas from './BorderCornerCanvas';
import PlayerAvatar from './PlayerAvatar';
import StartGameButton from './StartGameButton';
import styles from './css/StartGameWindow.module.css';

interface StartGameConfig {
  mapSize: MapSize;
  selectedPlayer: GamePlayer;
  playerColor: string;
  numberOfOpponents: number;
}

interface StartGameWindowProps {
  onStartGame: (config: StartGameConfig) => void;
  onCancel?: () => void;
}

const getMaxOpponents = (mapSize: MapSize): number => {
  switch (mapSize) {
    case 'small':
      return 2;
    case 'medium':
      return 4;
    case 'large':
      return 6;
    case 'huge':
      return 8;
    default:
      return 2;
  }
};

const StartGameWindow: React.FC<StartGameWindowProps> = ({ onStartGame, onCancel }) => {
  const [mapSize, setMapSize] = useState<MapSize>('medium');
  const [selectedPlayer, setSelectedPlayer] = useState<GamePlayer>(PREDEFINED_PLAYERS[0]);
  const [playerColor, setPlayerColor] = useState<string>(PREDEFINED_PLAYERS[0].defaultColor);
  const [numberOfOpponents, setNumberOfOpponents] = useState<number>(2);

  const maxOpponents = getMaxOpponents(mapSize);

  const handleMapSizeChange = useCallback(
    (newMapSize: MapSize) => {
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
    setPlayerColor(player.defaultColor);
  }, []);

  const handleStartGame = useCallback(() => {
    const config: StartGameConfig = {
      mapSize,
      selectedPlayer,
      playerColor,
      numberOfOpponents,
    };
    onStartGame(config);
  }, [mapSize, selectedPlayer, playerColor, numberOfOpponents, onStartGame]);

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

  return (
    <div className={styles.overlay}>
      <div className={styles.window}>
        {/* Border System */}
        <BorderVerticalCanvas isLeft={true} />
        <BorderVerticalCanvas isLeft={false} />
        <BorderHorizontalCanvas isTop={true} yOffset={0} />
        <BorderHorizontalCanvas isTop={false} yOffset={0} />
        <BorderCornerCanvas isTop={true} isLeft={true} />
        <BorderCornerCanvas isTop={true} isLeft={false} />
        <BorderCornerCanvas isTop={false} isLeft={true} />
        <BorderCornerCanvas isTop={false} isLeft={false} />

        <div className={styles.content}>
          <h1 className={styles.title}>Start New Game</h1>

          {/* Map Size and Opponents Selection */}
          <div className={styles.horizontalControls}>
            <div className={styles.section}>
              <label className={styles.label}>Map Size:</label>
              <select
                className={styles.dropdown}
                value={mapSize}
                onChange={(e) => handleMapSizeChange(e.target.value as MapSize)}
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
                          style={{ color: getClassColor(player.class) }}
                        >
                          {player.class.toUpperCase()}
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
                      style={{ color: getClassColor(selectedPlayer.class) }}
                    >
                      {selectedPlayer.class.toUpperCase()} - Level {selectedPlayer.level}
                    </div>
                  </div>

                  <PlayerAvatar
                    player={selectedPlayer}
                    size={120}
                    shape="circle"
                    borderColor="#d4af37"
                    className={styles.selectedAvatarContainer}
                  />

                  <div className={styles.selectedPlayerDescription}>
                    {selectedPlayer.description}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Player Color Selection */}
          <div className={styles.section}>
            <label className={styles.label}>Your Color:</label>
            <div className={styles.colorPicker}>
              {PLAYER_COLORS.map((color) => (
                <div
                  key={color}
                  className={`${styles.colorOption} ${
                    playerColor === color ? styles.selectedColor : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setPlayerColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.buttonContainer}>
            {onCancel && (
              <button className={styles.cancelButton} onClick={onCancel}>
                Cancel
              </button>
            )}
            <StartGameButton onClick={handleStartGame} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartGameWindow;
