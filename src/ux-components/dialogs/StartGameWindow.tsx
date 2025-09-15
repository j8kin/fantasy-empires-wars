import React, { useState, useCallback } from 'react';
import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import { BattlefieldSize } from '../../types/BattlefieldSize';
import { GamePlayer, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { PlayerColorName, PLAYER_COLORS } from '../../types/PlayerColors';
import PlayerAvatar from '../avatars/PlayerAvatar';
import StartGameButton from '../buttons/StartGameButton';
import { GameConfig } from '../../types/GameConfig';
import PlayerSelection from '../player-selection/PlayerSelection';
import styles from './css/StartGameWindow.module.css';

interface StartGameWindowProps {
  onStartGame: (config: GameConfig) => void;
  onShowSelectOpponentDialog: (
    excludedPlayerIds: string[],
    onSelect: (player: GamePlayer) => void
  ) => void;
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

type OpponentSelectionMode = 'random' | 'manual';

const StartGameWindow: React.FC<StartGameWindowProps> = ({
  onStartGame,
  onShowSelectOpponentDialog,
}) => {
  const [mapSize, setMapSize] = useState<BattlefieldSize>('medium');
  const [selectedPlayer, setSelectedPlayer] = useState<GamePlayer>(PREDEFINED_PLAYERS[0]);
  const [opponentSelectionMode, setOpponentSelectionMode] =
    useState<OpponentSelectionMode>('manual');
  const [selectedOpponents, setSelectedOpponents] = useState<(GamePlayer | null)[]>([]);

  const maxOpponents = getMaxOpponents(mapSize);

  // Generate unique colors for opponents
  const getUniqueOpponentColors = useCallback((): PlayerColorName[] => {
    const usedColors = [selectedPlayer.color];
    const availableColors = PLAYER_COLORS.filter((color) => !usedColors.includes(color.name)).map(
      (c) => c.name
    );
    return availableColors.slice(0, maxOpponents);
  }, [selectedPlayer.color, maxOpponents]);

  // Initialize opponents based on selection mode
  const initializeOpponents = useCallback(
    (mode: OpponentSelectionMode) => {
      if (mode === 'random') {
        // Generate random opponents for max number
        const availablePlayers = PREDEFINED_PLAYERS.filter((p) => p.id !== selectedPlayer.id);
        const uniqueColors = getUniqueOpponentColors();
        const randomOpponents: GamePlayer[] = [];

        for (let i = 0; i < maxOpponents; i++) {
          const randomPlayer =
            availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
          randomOpponents.push({
            ...randomPlayer,
            color: uniqueColors[i] || randomPlayer.color,
          });
        }
        setSelectedOpponents(randomOpponents);
      } else {
        // Manual mode: start with 2 random opponents, rest empty
        const availablePlayers = PREDEFINED_PLAYERS.filter((p) => p.id !== selectedPlayer.id);
        const uniqueColors = getUniqueOpponentColors();
        const opponents: (GamePlayer | null)[] = new Array(maxOpponents).fill(null);

        // Add 2 random opponents
        for (let i = 0; i < Math.min(2, maxOpponents); i++) {
          const randomPlayer =
            availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
          opponents[i] = {
            ...randomPlayer,
            color: uniqueColors[i] || randomPlayer.color,
          };
        }
        setSelectedOpponents(opponents);
      }
    },
    [selectedPlayer.id, maxOpponents, getUniqueOpponentColors]
  );

  const handleMapSizeChange = useCallback((newMapSize: BattlefieldSize) => {
    setMapSize(newMapSize);
    // Reinitialize opponents for new map size
    setSelectedOpponents([]);
  }, []);

  const handleOpponentSelectionModeChange = useCallback(
    (mode: OpponentSelectionMode) => {
      setOpponentSelectionMode(mode);
      initializeOpponents(mode);
    },
    [initializeOpponents]
  );

  // Initialize opponents when component mounts or relevant dependencies change
  React.useEffect(() => {
    initializeOpponents(opponentSelectionMode);
  }, [initializeOpponents, opponentSelectionMode]);

  const handlePlayerChange = useCallback((player: GamePlayer) => {
    setSelectedPlayer(player);
  }, []);

  const handleOpponentClick = useCallback(
    (index: number) => {
      const excludedPlayerIds = [
        selectedPlayer.id,
        ...selectedOpponents
          .filter((opponent) => opponent !== null)
          .map((opponent) => opponent!.id),
      ];
      onShowSelectOpponentDialog(excludedPlayerIds, (opponent: GamePlayer) => {
        const newOpponents = [...selectedOpponents];
        const uniqueColors = getUniqueOpponentColors();
        newOpponents[index] = {
          ...opponent,
          color: uniqueColors[index] || opponent.color,
        };
        setSelectedOpponents(newOpponents);
      });
    },
    [selectedPlayer.id, selectedOpponents, onShowSelectOpponentDialog, getUniqueOpponentColors]
  );

  const handleStartGame = useCallback(() => {
    const opponents =
      opponentSelectionMode === 'random'
        ? (selectedOpponents as GamePlayer[])
        : (selectedOpponents.filter((opponent) => opponent !== null) as GamePlayer[]);

    const config: GameConfig = {
      mapSize,
      selectedPlayer,
      playerColor: selectedPlayer.color,
      numberOfOpponents: opponents.length,
      opponents,
    };
    onStartGame(config);
  }, [mapSize, selectedPlayer, opponentSelectionMode, selectedOpponents, onStartGame]);

  // Calculate dialog dimensions
  const dialogWidth = Math.min(900, typeof window !== 'undefined' ? window.innerWidth * 0.9 : 900);
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
      zIndex={1005}
    >
      <div className={styles.content}>
        <h1 className={styles.title}>Start New Game</h1>

        {/* Map Size and Opponent Selection Mode */}
        <div className={styles.horizontalControls}>
          <div className={styles.section}>
            <label className={styles.label}>Map Size:</label>
            <select
              className={styles.dropdown}
              value={mapSize}
              onChange={(e) => handleMapSizeChange(e.target.value as BattlefieldSize)}
              style={{ width: 'fit-content', minWidth: '120px' }}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="huge">Huge</option>
            </select>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Opponent Selection:</label>
            <select
              className={styles.dropdown}
              value={opponentSelectionMode}
              onChange={(e) =>
                handleOpponentSelectionModeChange(e.target.value as OpponentSelectionMode)
              }
            >
              <option value="manual">Choose Each Opponent</option>
              <option value="random">Random Opponents (Max {maxOpponents})</option>
            </select>
          </div>
        </div>

        {/* Opponent Selection */}
        <div className={styles.section}>
          <label className={styles.label}>
            Opponents (
            {opponentSelectionMode === 'random'
              ? maxOpponents
              : selectedOpponents.filter((o) => o !== null).length}{' '}
            of {maxOpponents}):
          </label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '15px',
              padding: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              border: '1px solid #8b7355',
              minHeight: '120px',
            }}
          >
            {selectedOpponents.map((opponent, index) => (
              <div
                key={index}
                onClick={() => opponentSelectionMode === 'manual' && handleOpponentClick(index)}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '3px solid #8b7355',
                  backgroundColor: opponent ? 'transparent' : 'rgba(139, 115, 85, 0.2)',
                  cursor: opponentSelectionMode === 'manual' ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (opponentSelectionMode === 'manual') {
                    e.currentTarget.style.borderColor = '#d4af37';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (opponentSelectionMode === 'manual') {
                    e.currentTarget.style.borderColor = '#8b7355';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {opponent ? (
                  opponentSelectionMode === 'random' ? (
                    // Don't show avatar for random mode, just colored circle
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background:
                          PLAYER_COLORS.find((c) => c.name === opponent.color)?.value || '#8b7355',
                      }}
                    />
                  ) : (
                    <PlayerAvatar
                      player={opponent}
                      size={74}
                      shape="circle"
                      borderColor={opponent.color}
                    />
                  )
                ) : (
                  <div
                    style={{
                      color: '#8b7355',
                      fontSize: '12px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    EMPTY
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Player Selection */}
        <PlayerSelection
          label="Choose Your Character:"
          selectedPlayer={selectedPlayer}
          onPlayerChange={handlePlayerChange}
        />
      </div>
    </FantasyBorderFrame>
  );
};

export default StartGameWindow;
