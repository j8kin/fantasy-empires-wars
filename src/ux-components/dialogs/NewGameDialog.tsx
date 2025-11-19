import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './css/NewGameDialog.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import Avatar from '../avatars/Avatar';
import GameButton from '../buttons/GameButton';
import PlayerSelection from '../player-selection/PlayerSelection';

import { generateMap } from '../../map/generation/generateMap';
import { ButtonName } from '../../types/ButtonName';
import { GamePlayer, NO_PLAYER, PlayerInfo, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { DiplomacyStatus } from '../../types/Diplomacy';
import { getPlayerColorValue, PLAYER_COLORS, PlayerColorName } from '../../types/PlayerColors';
import { BattlefieldDimensions, GameState, TurnPhase } from '../../types/GameState';
import { Mana, ManaType } from '../../types/Mana';
import { toGamePlayer } from '../../__tests__/utils/toGamePlayer';

// Local map size type for this dialog only
type DialogMapSize = 'small' | 'medium' | 'large' | 'huge';

const getBattlefieldDimensions = (selectedMapSize: DialogMapSize): BattlefieldDimensions => {
  switch (selectedMapSize) {
    case 'small':
      return { rows: 6, cols: 13 };
    case 'medium':
      return { rows: 9, cols: 18 };
    case 'large':
      return { rows: 11, cols: 23 };
    case 'huge':
      return { rows: 15, cols: 31 };
    default:
      return { rows: 9, cols: 18 };
  }
};

const getMaxOpponents = (mapSize: DialogMapSize): number => {
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
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerInfo>(PREDEFINED_PLAYERS[0]);
  const [opponentSelectionMode, setOpponentSelectionMode] = useState<'random' | 'manual'>('manual');
  const [selectedOpponents, setSelectedOpponents] = useState<(PlayerInfo | null)[]>([]);

  const maxOpponents = getMaxOpponents(mapSize);

  // Initialize opponents when dialog opens (only if empty)
  useEffect(() => {
    if (selectedOpponents.length === 0) {
      const availablePlayers = PREDEFINED_PLAYERS.filter((p) => p.id !== selectedPlayer.id);
      const usedColors = [selectedPlayer.color];
      const availableColors = PLAYER_COLORS.filter((color) => !usedColors.includes(color.name)).map(
        (c) => c.name
      );
      const uniqueColors = availableColors.slice(0, maxOpponents);

      const opponents: (PlayerInfo | null)[] = new Array(maxOpponents).fill(null);
      const shuffledPlayers = [...availablePlayers].sort(() => 0.5 - Math.random());

      // Add 2 unique random opponents
      for (let i = 0; i < Math.min(2, maxOpponents, shuffledPlayers.length); i++) {
        opponents[i] = {
          ...shuffledPlayers[i],
          color: uniqueColors[i] || shuffledPlayers[i].color,
        };
      }
      setSelectedOpponents(opponents);
    }
  }, [
    selectedPlayer.id,
    selectedPlayer.color,
    maxOpponents,
    selectedOpponents.length,
    setSelectedOpponents,
  ]);
  const avatarSize = 54;

  // Generate unique colors for opponents
  const getUniqueOpponentColors = useCallback((): PlayerColorName[] => {
    const usedColors = [selectedPlayer.color];
    const availableColors = PLAYER_COLORS.filter((color) => !usedColors.includes(color.name)).map(
      (c) => c.name
    );
    return availableColors.slice(0, maxOpponents);
  }, [selectedPlayer.color, maxOpponents]);

  // Initialize opponents for a specific number of opponents (used when map size changes)
  const initializeOpponentsForMapSize = useCallback(
    (newMaxOpponents: number) => {
      const availablePlayers = PREDEFINED_PLAYERS.filter((p) => p.id !== selectedPlayer.id);
      const usedColors = [selectedPlayer.color];
      const availableColors = PLAYER_COLORS.filter((color) => !usedColors.includes(color.name)).map(
        (c) => c.name
      );
      const uniqueColors = availableColors.slice(0, newMaxOpponents);

      if (opponentSelectionMode === 'random') {
        // Generate unique random opponents for max number
        const shuffledPlayers = [...availablePlayers].sort(() => 0.5 - Math.random());
        const randomOpponents: PlayerInfo[] = [];

        for (let i = 0; i < newMaxOpponents && i < shuffledPlayers.length; i++) {
          randomOpponents.push({
            ...shuffledPlayers[i],
            color: uniqueColors[i] || shuffledPlayers[i].color,
          });
        }

        // If we need more opponents than available unique players, fill with random duplicates
        // This shouldn't happen in practice since we have enough predefined players
        while (randomOpponents.length < newMaxOpponents) {
          const randomPlayer =
            availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
          randomOpponents.push({
            ...randomPlayer,
            color: uniqueColors[randomOpponents.length] || randomPlayer.color,
          });
        }

        setSelectedOpponents(randomOpponents);
      } else {
        // Manual mode: start with 2 unique random opponents, rest empty
        const opponents: (PlayerInfo | null)[] = new Array(newMaxOpponents).fill(null);
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
    initializeOpponentsForMapSize(maxOpponents);
  }, [initializeOpponentsForMapSize, maxOpponents]);

  const handleMapSizeChange = useCallback(
    (newMapSize: DialogMapSize) => {
      setMapSize(newMapSize);
      // Reinitialize opponents for new map size immediately
      const newMaxOpponents = getMaxOpponents(newMapSize);
      initializeOpponentsForMapSize(newMaxOpponents);
    },
    [initializeOpponentsForMapSize, setMapSize]
  );

  const handleOpponentSelectionModeChange = useCallback(
    (mode: 'random' | 'manual') => {
      setOpponentSelectionMode(mode);
      initializeOpponents();
    },
    [initializeOpponents, setOpponentSelectionMode]
  );

  // Initialize opponents when component mounts or relevant dependencies change
  React.useEffect(() => {
    initializeOpponents();
  }, [initializeOpponents, opponentSelectionMode]);

  const handlePlayerChange = useCallback(
    (player: PlayerInfo) => {
      setSelectedPlayer(player);
    },
    [setSelectedPlayer]
  );

  const handleOpponentClick = useCallback(
    (index: number) => {
      const excludedPlayerIds = [
        selectedPlayer.id,
        ...selectedOpponents
          .filter((opponent) => opponent !== null)
          .map((opponent) => opponent!.id),
      ];

      // Calculate current number of selected opponents
      const currentOpponentCount = selectedOpponents.filter((opponent) => opponent !== null).length;
      // Don't allow EmptyPlayer when there are exactly 2 opponents (would leave only 1)
      const allowEmptyPlayer = currentOpponentCount > 2;

      showSelectOpponentDialogWithConfig(
        excludedPlayerIds,
        (opponent: PlayerInfo) => {
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
        ? selectedOpponents.filter((o) => o != null).map((o) => toGamePlayer(o, 'computer'))
        : selectedOpponents
            .filter((o) => o != null)
            .filter((o) => o.id !== NO_PLAYER.id)
            .map((opponent) => toGamePlayer(opponent, 'computer'));

    const initialMana: Mana = {
      [ManaType.GREEN]: 0,
      [ManaType.BLUE]: 0,
      [ManaType.RED]: 0,
      [ManaType.WHITE]: 0,
      [ManaType.BLACK]: 0,
    };

    const initialMoney = 15000;

    const createdOpponents: GamePlayer[] = opponents.map((opponent) => {
      return {
        ...opponent,
        diplomacy: {
          ...Object.fromEntries(
            opponents
              .filter((o) => o.id !== opponent.id)
              .map((op) => [op.id, DiplomacyStatus.NO_TREATY])
          ),
          [selectedPlayer.id]: DiplomacyStatus.NO_TREATY,
        },
        mana: initialMana,
        vault: initialMoney,
        income: 0, // will calculate on game start on the first turn
        playerType: 'computer', // all opponents for now are computer players
        quests: [], // no heroes are send to quests at game start
        empireTreasures: [], // no treasures at game start
      } as GamePlayer;
    });

    const createdPlayer: GamePlayer = {
      ...selectedPlayer,
      diplomacy: Object.fromEntries(opponents.map((op) => [op.id, DiplomacyStatus.NO_TREATY])),
      mana: initialMana,
      vault: initialMoney,
      income: 0, // will calculate on game start on first turn
      playerType: 'human',
      quests: [], // no heroes are send to quests at game start
      empireTreasures: [], // no treasures at game start
    };

    setShowStartWindow(false);
    setProgressMessage('Creating new game...');
    setShowProgressPopup(true);

    setTimeout(() => {
      const gameState: GameState = {
        battlefield: generateMap(getBattlefieldDimensions(mapSize)),
        turn: 1,
        turnOwner: createdPlayer.id,
        turnPhase: TurnPhase.START,
        players: [createdPlayer, ...createdOpponents],
      };

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
    const dialogWidth = Math.min(
      900,
      typeof window !== 'undefined' ? window.innerWidth * 0.9 : 900
    );
    const dialogHeight = Math.min(
      650,
      typeof window !== 'undefined' ? window.innerHeight * 0.75 : 650
    );
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
        gameState != null ? (
          <GameButton buttonName={ButtonName.CANCEL} onClick={handleCancel} />
        ) : undefined
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
              ? maxOpponents
              : selectedOpponents.filter((o) => o !== null).length}{' '}
            of {maxOpponents}):
          </label>
          <div
            style={{
              display: 'flex',
              padding: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              border: '1px solid #8b7355',
              minHeight: '100px',
              gap: '20px',
            }}
          >
            {/* Controls Section */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                paddingRight: '20px',
                borderRight: '1px solid #8b7355',
                minWidth: '200px',
              }}
            >
              {/* Map Size */}
              <div>
                <label
                  className={styles.label}
                  style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}
                >
                  Map Size:
                </label>
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
                <label
                  className={`${styles.label} ${styles.checkboxContainer}`}
                  style={{ fontSize: '14px' }}
                >
                  <input
                    type="checkbox"
                    checked={opponentSelectionMode === 'random'}
                    onChange={(e) =>
                      handleOpponentSelectionModeChange(e.target.checked ? 'random' : 'manual')
                    }
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
            <div
              style={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '10px',
                flex: 1,
                alignItems: 'flex-start',
                overflowX: 'auto',
              }}
            >
              {selectedOpponents.map((opponent, index) => (
                <div
                  key={index}
                  onClick={() => opponentSelectionMode === 'manual' && handleOpponentClick(index)}
                  style={{
                    cursor: opponentSelectionMode === 'manual' ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                  }}
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
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background:
                            PLAYER_COLORS.find((c) => c.name === opponent.color)?.value ||
                            '#8b7355',
                        }}
                      />
                    ) : (
                      <Avatar
                        player={opponent}
                        size={avatarSize}
                        shape="circle"
                        borderColor={getPlayerColorValue(opponent.color)}
                      />
                    )
                  ) : (
                    <Avatar
                      player={NO_PLAYER}
                      size={avatarSize}
                      shape="circle"
                      borderColor="#8b7355"
                    />
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
