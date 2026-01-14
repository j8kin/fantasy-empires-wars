import React, { useCallback, useEffectEvent, useEffect, useMemo, useState } from 'react';
import styles from './css/NewGameDialog.module.css';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import Avatar from '../avatars/Avatar';
import GameButton from '../buttons/GameButton';
import PlayerSelection from '../player-selection/PlayerSelection';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { addPlayerToGameState } from '../../systems/playerActions';
import { gameStateFactory } from '../../factories/gameStateFactory';
import { getPlayerColorValue } from '../../domain/ui/playerColors';
import { generateMap } from '../../map/generation/generateMap';
import { NO_PLAYER, PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';
import { PLAYER_COLORS } from '../../types/PlayerColors';
import { ButtonName } from '../../types/ButtonName';
import type { GameState } from '../../state/GameState';
import type { PlayerProfile } from '../../state/player/PlayerProfile';
import type { MapDimensions } from '../../state/map/MapDimensions';
import type { PlayerColorName } from '../../types/PlayerColors';

// Local map size type for this dialog only
type DialogMapSize = 'small' | 'medium' | 'large' | 'huge';

const mapSizeDimension: Record<DialogMapSize, MapDimensions> = {
  small: { rows: 6, cols: 13 },
  medium: { rows: 9, cols: 18 },
  large: { rows: 11, cols: 23 },
  huge: { rows: 15, cols: 31 },
};

const maxMapOpponents: Record<DialogMapSize, number> = {
  small: 2,
  medium: 4,
  large: 6,
  huge: 7,
};

const AVATAR_SIZE = 54;

const NewGameDialog: React.FC = () => {
  const {
    setShowStartWindow,
    setProgressMessage,
    setShowProgressPopup,
    setGameStarted,
    showSelectOpponentDialogWithConfig,
  } = useApplicationContext();

  const { startNewGame, gameState } = useGameContext();

  // Local state for dialog-specific values
  const [mapSize, setMapSize] = useState<DialogMapSize>('medium');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile>(PREDEFINED_PLAYERS[0]);
  const [opponentSelectionMode, setOpponentSelectionMode] = useState<'random' | 'manual'>('manual');
  const [selectedOpponents, setSelectedOpponents] = useState<(PlayerProfile | null)[]>([]);

  // Initialize opponents when the dialog opens (only if empty)
  useEffectEvent(() => {
    if (selectedOpponents.length === 0) {
      const availablePlayers = PREDEFINED_PLAYERS.filter((p) => p.id !== selectedPlayer.id);
      const usedColors = [selectedPlayer.color];
      const availableColors = PLAYER_COLORS.filter((color) => !usedColors.includes(color.name)).map((c) => c.name);
      const uniqueColors = availableColors.slice(0, maxMapOpponents[mapSize]);

      const opponents: (PlayerProfile | null)[] = new Array(maxMapOpponents[mapSize]).fill(null);
      const shuffledPlayers = [...availablePlayers].sort(() => 0.5 - Math.random());

      // Add 2 unique random opponents
      for (let i = 0; i < Math.min(2, maxMapOpponents[mapSize], shuffledPlayers.length); i++) {
        opponents[i] = {
          ...shuffledPlayers[i],
          color: uniqueColors[i] || shuffledPlayers[i].color,
        };
      }
      setSelectedOpponents(opponents);
    }
  });

  // Generate unique colors for opponents
  const getUniqueOpponentColors = useCallback((): PlayerColorName[] => {
    const usedColors = [selectedPlayer.color];
    const availableColors = PLAYER_COLORS.filter((color) => !usedColors.includes(color.name)).map((c) => c.name);
    return availableColors.slice(0, maxMapOpponents[mapSize]);
  }, [mapSize, selectedPlayer.color]);

  // Initialize opponents for a specific number of opponents (used when map size changes)
  const initializeOpponentsForMapSize = useCallback(
    (newMaxOpponents: number) => {
      const availablePlayers = PREDEFINED_PLAYERS.filter((p) => p.id !== selectedPlayer.id);
      const usedColors = [selectedPlayer.color];
      const availableColors = PLAYER_COLORS.filter((color) => !usedColors.includes(color.name)).map((c) => c.name);
      const uniqueColors = availableColors.slice(0, newMaxOpponents);

      if (opponentSelectionMode === 'random') {
        // Generate unique random opponents for max number
        const shuffledPlayers = [...availablePlayers].sort(() => 0.5 - Math.random());
        const randomOpponents: PlayerProfile[] = [];

        for (let i = 0; i < newMaxOpponents && i < shuffledPlayers.length; i++) {
          randomOpponents.push({
            ...shuffledPlayers[i],
            color: uniqueColors[i] || shuffledPlayers[i].color,
          });
        }

        // If we need more opponents than available unique players, fill with random duplicates
        // This shouldn't happen in practice since we have enough predefined players
        while (randomOpponents.length < newMaxOpponents) {
          const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
          randomOpponents.push({
            ...randomPlayer,
            color: uniqueColors[randomOpponents.length] || randomPlayer.color,
          });
        }

        setSelectedOpponents(randomOpponents);
      } else {
        // Manual mode: start with 2 unique random opponents, rest empty
        const opponents: (PlayerProfile | null)[] = new Array(newMaxOpponents).fill(null);
        const shuffledPlayers = [...availablePlayers].sort(() => 0.5 - Math.random());

        // Add 2 unique random opponents
        for (let i = 0; i < Math.min(2, newMaxOpponents, shuffledPlayers.length); i++) {
          opponents[i] = {
            ...shuffledPlayers[i],
            color: uniqueColors[i] || shuffledPlayers[i].color,
          };
        }
        setSelectedOpponents(opponents);
      }
    },
    [selectedPlayer.color, selectedPlayer.id, opponentSelectionMode, setSelectedOpponents]
  );

  // Initialize opponents based on selection mode
  const initializeOpponents = useCallback(() => {
    initializeOpponentsForMapSize(maxMapOpponents[mapSize]);
  }, [initializeOpponentsForMapSize, mapSize]);

  const handleMapSizeChange = useCallback(
    (newMapSize: DialogMapSize) => {
      setMapSize(newMapSize);
      // Reinitialize opponents for new map size immediately
      const newMaxOpponents = maxMapOpponents[newMapSize];
      initializeOpponentsForMapSize(newMaxOpponents);
    },
    [initializeOpponentsForMapSize]
  );

  const handleOpponentSelectionModeChange = useCallback(
    (mode: 'random' | 'manual') => {
      setOpponentSelectionMode(mode);
      initializeOpponents();
    },
    [initializeOpponents, setOpponentSelectionMode]
  );

  // Initialize opponents when component mounts or relevant dependencies change
  useEffect(() => {
    initializeOpponents();
  }, [initializeOpponents, opponentSelectionMode]);

  const handlePlayerChange = useCallback(
    (player: PlayerProfile) => {
      setSelectedPlayer(player);
    },
    [setSelectedPlayer]
  );

  const handleOpponentClick = useCallback(
    (index: number) => {
      const excludedPlayerIds = [
        selectedPlayer.id,
        ...selectedOpponents.filter((opponent) => opponent !== null).map((opponent) => opponent!.id),
      ];

      // Calculate current number of selected opponents
      const currentOpponentCount = selectedOpponents.filter((opponent) => opponent !== null).length;
      // Don't allow EmptyPlayer when there are exactly 2 opponents (would leave only 1)
      const allowEmptyPlayer = currentOpponentCount > 2;

      showSelectOpponentDialogWithConfig(
        excludedPlayerIds,
        (opponent: PlayerProfile) => {
          const newOpponents = [...selectedOpponents];
          const uniqueColors = getUniqueOpponentColors();
          newOpponents[index] = {
            ...opponent,
            color: uniqueColors[index] || opponent.color,
          };
          setSelectedOpponents(newOpponents);
        },
        allowEmptyPlayer
      );
    },
    [
      selectedPlayer.id,
      selectedOpponents,
      showSelectOpponentDialogWithConfig,
      getUniqueOpponentColors,
      setSelectedOpponents,
    ]
  );

  const handleStartGame = useCallback(() => {
    const opponents =
      opponentSelectionMode === 'random'
        ? selectedOpponents.filter((o) => o != null)
        : selectedOpponents.filter((o) => o != null).filter((o) => o.id !== NO_PLAYER.id);

    setShowStartWindow(false);
    setProgressMessage('Creating new game...');
    setShowProgressPopup(true);

    setTimeout(() => {
      const map = generateMap(mapSizeDimension[mapSize]);
      const gameState: GameState = gameStateFactory(map);
      addPlayerToGameState(gameState, selectedPlayer, 'human');
      opponents.forEach((o) => addPlayerToGameState(gameState, o, 'computer'));

      startNewGame(gameState);
      setGameStarted(true);
      setShowProgressPopup(false);
    }, 100);
  }, [
    mapSize,
    selectedPlayer,
    opponentSelectionMode,
    selectedOpponents,
    setShowStartWindow,
    setProgressMessage,
    setShowProgressPopup,
    startNewGame,
    setGameStarted,
  ]);

  const handleCancel = useCallback(() => {
    setShowStartWindow(false);
  }, [setShowStartWindow]);

  // Calculate dialog dimensions (memoized to avoid recalculation on every render)
  const dialogDimensions = useMemo(() => {
    const dialogWidth = Math.min(900, typeof window !== 'undefined' ? window.innerWidth * 0.9 : 900);
    const dialogHeight = Math.min(650, typeof window !== 'undefined' ? window.innerHeight * 0.75 : 650);
    const dialogX = typeof window !== 'undefined' ? (window.innerWidth - dialogWidth) / 2 : 0;
    const dialogY = typeof window !== 'undefined' ? (window.innerHeight - dialogHeight) / 2 : 0;

    return { dialogWidth, dialogHeight, dialogX, dialogY };
  }, []);

  return (
    <FantasyBorderFrame
      screenPosition={{ x: dialogDimensions.dialogX, y: dialogDimensions.dialogY }}
      frameSize={{ width: dialogDimensions.dialogWidth, height: dialogDimensions.dialogHeight }}
      primaryButton={<GameButton buttonName={ButtonName.START} onClick={handleStartGame} />}
      secondaryButton={
        gameState != null ? <GameButton buttonName={ButtonName.CANCEL} onClick={handleCancel} /> : undefined
      }
      zIndex={1005}
    >
      <div className={styles.content}>
        <h1 className={styles.title}>Start New Game</h1>

        {/* Player Selection */}
        <PlayerSelection
          label="Choose Your Character:"
          selectedPlayer={selectedPlayer}
          onPlayerChange={handlePlayerChange}
        />

        {/* Opponent Selection */}
        <div className={styles.section}>
          <label className={styles.label}>
            Opponents (
            {opponentSelectionMode === 'random'
              ? maxMapOpponents[mapSize]
              : selectedOpponents.filter((o) => o !== null).length}{' '}
            of {maxMapOpponents[mapSize]}):
          </label>
          <div className={styles.opponentSelectionContainer}>
            {/* Controls Section */}
            <div className={styles.opponentControlsSection}>
              {/* Map Size */}
              <div>
                <label className={`${styles.label} ${styles.mapSizeLabel}`}>Map Size:</label>
                <select
                  className={styles.dropdown}
                  value={mapSize}
                  onChange={(e) => handleMapSizeChange(e.target.value as DialogMapSize)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="huge">Huge</option>
                </select>
              </div>

              {/* Opponent Selection Mode */}
              <div>
                <label className={`${styles.label} ${styles.checkboxContainer} ${styles.checkboxLabel}`}>
                  <input
                    type="checkbox"
                    checked={opponentSelectionMode === 'random'}
                    onChange={(e) => handleOpponentSelectionModeChange(e.target.checked ? 'random' : 'manual')}
                    className={styles.hiddenCheckbox}
                  />
                  <div
                    className={`${styles.customCheckbox} ${opponentSelectionMode === 'random' ? styles.checked : ''}`}
                  />
                  Random Opponents
                </label>
              </div>
            </div>

            {/* Opponents Avatars Section */}
            <div className={styles.opponentAvatarsContainer}>
              {selectedOpponents.map((opponent, index) => (
                <div
                  key={index}
                  onClick={() => opponentSelectionMode === 'manual' && handleOpponentClick(index)}
                  className={`${styles.opponentAvatarContainer} ${
                    opponentSelectionMode === 'manual'
                      ? styles['opponentAvatarContainer--manual']
                      : styles['opponentAvatarContainer--random']
                  }`}
                  onMouseEnter={(e) => {
                    if (opponentSelectionMode === 'manual') {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (opponentSelectionMode === 'manual') {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {opponent ? (
                    opponentSelectionMode === 'random' ? (
                      // Don't show avatar for random mode, just colored circle
                      <div
                        className={styles.randomOpponentCircle}
                        style={{
                          background: PLAYER_COLORS.find((c) => c.name === opponent.color)?.value || '#8b7355',
                        }}
                      />
                    ) : (
                      <Avatar
                        player={opponent}
                        size={AVATAR_SIZE}
                        shape="circle"
                        borderColor={getPlayerColorValue(opponent.color)}
                      />
                    )
                  ) : (
                    <Avatar player={NO_PLAYER} size={AVATAR_SIZE} shape="circle" borderColor="#8b7355" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FantasyBorderFrame>
  );
};

export default NewGameDialog;
