import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { GamePlayer, PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { ScreenPosition } from '../ux-components/fantasy-border-frame/FantasyBorderFrame';
import { BattlefieldSize } from '../types/BattlefieldSize';
import { LandPosition } from '../map/utils/mapLands';

type OpponentSelectionMode = 'random' | 'manual';

interface ApplicationContextType {
  selectedLandAction: string | null;
  setSelectedLandAction: (item: string | null) => void;

  // Dialog states
  showStartWindow: boolean;
  showSaveDialog: boolean;
  showCastSpellDialog: boolean;
  showConstructBuildingDialog: boolean;
  showSelectOpponentDialog: boolean;
  showProgressPopup: boolean;

  // Dialog data
  selectedOpponent: GamePlayer | undefined;
  opponentScreenPosition: ScreenPosition;
  selectOpponentExcludedIds: string[];
  selectOpponentCallback: ((player: GamePlayer) => void) | null;
  allowEmptyPlayer: boolean;
  progressMessage: string;

  // Game Popups
  // Error Messages Popup
  showErrorMessagePopup: boolean;
  setShowErrorMessagePopup: (show: boolean) => void;
  errorMessagePopupMessage: string;
  setErrorMessagePopupMessage: (message: string) => void;

  // HexTile popup states
  landPopupPosition: LandPosition | undefined;
  landPopupScreenPosition: ScreenPosition;

  // New Game Dialog states
  newGameMapSize: BattlefieldSize;
  newGameSelectedPlayer: GamePlayer;
  newGameOpponentSelectionMode: OpponentSelectionMode;
  newGameSelectedOpponents: (GamePlayer | null)[];

  // Select Opponent Dialog states
  selectOpponentSelectedPlayer: GamePlayer;

  // Save Game Dialog states
  saveGameName: string;

  // Game states
  gameStarted: boolean;
  glowingTiles: Set<string>;

  // Dialog actions
  setShowStartWindow: (show: boolean) => void;
  setShowSaveDialog: (show: boolean) => void;
  setShowCastSpellDialog: (show: boolean) => void;
  setShowConstructBuildingDialog: (show: boolean) => void;
  setShowSelectOpponentDialog: (show: boolean) => void;
  setShowProgressPopup: (show: boolean) => void;
  setSelectedOpponent: (opponent: GamePlayer | undefined) => void;
  setOpponentScreenPosition: (position: ScreenPosition) => void;
  setSelectOpponentExcludedIds: (ids: string[]) => void;
  setSelectOpponentCallback: (callback: ((player: GamePlayer) => void) | null) => void;
  setAllowEmptyPlayer: (allow: boolean) => void;
  setProgressMessage: (message: string) => void;

  // HexTile popup actions
  setLandPopupPosition: (position: LandPosition | undefined) => void;
  setLandPopupScreenPosition: (position: ScreenPosition) => void;
  showLandPopup: (battlefieldPosition: LandPosition, screenPosition: ScreenPosition) => void;
  hideLandPopup: () => void;

  // New Game Dialog actions
  setNewGameMapSize: (size: BattlefieldSize) => void;
  setNewGameSelectedPlayer: (player: GamePlayer) => void;
  setNewGameOpponentSelectionMode: (mode: OpponentSelectionMode) => void;
  setNewGameSelectedOpponents: (opponents: (GamePlayer | null)[]) => void;
  resetNewGameDialog: () => void;

  // Select Opponent Dialog actions
  setSelectOpponentSelectedPlayer: (player: GamePlayer) => void;
  resetSelectOpponentDialog: (availablePlayers: GamePlayer[]) => void;

  // Save Game Dialog actions
  setSaveGameName: (name: string) => void;
  resetSaveGameDialog: () => void;

  // Player Selection actions

  // Game actions
  setGameStarted: (started: boolean) => void;
  setGlowingTiles: (tiles: Set<string>) => void;
  addGlowingTile: (tileId: string) => void;
  removeGlowingTile: (tileId: string) => void;
  clearAllGlow: () => void;

  // Combined actions
  showOpponentInfo: (opponent: GamePlayer, screenPosition: ScreenPosition) => void;
  hideOpponentInfo: () => void;
  showSelectOpponentDialogWithConfig: (
    excludedPlayerIds: string[],
    onSelect: (player: GamePlayer) => void,
    allowEmptyPlayer?: boolean
  ) => void;
  hideSelectOpponentDialog: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLandAction, setSelectedLandAction] = useState<string | null>(null);

  // Dialog states
  const [showStartWindow, setShowStartWindow] = useState<boolean>(true);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [showCastSpellDialog, setShowCastSpellDialog] = useState<boolean>(false);
  const [showConstructBuildingDialog, setShowConstructBuildingDialog] = useState<boolean>(false);
  const [showSelectOpponentDialog, setShowSelectOpponentDialog] = useState<boolean>(false);
  const [showProgressPopup, setShowProgressPopup] = useState<boolean>(false);

  // Dialog data
  const [selectedOpponent, setSelectedOpponent] = useState<GamePlayer | undefined>(undefined);
  const [opponentScreenPosition, setOpponentScreenPosition] = useState<ScreenPosition>({
    x: 0,
    y: 0,
  });
  const [selectOpponentExcludedIds, setSelectOpponentExcludedIds] = useState<string[]>([]);
  const [selectOpponentCallback, setSelectOpponentCallback] = useState<
    ((player: GamePlayer) => void) | null
  >(null);
  const [allowEmptyPlayer, setAllowEmptyPlayer] = useState<boolean>(true);
  const [progressMessage, setProgressMessage] = useState<string>('');

  // Popup Messages
  const [showErrorMessagePopup, setShowErrorMessagePopup] = useState<boolean>(false);
  const [errorMessagePopupMessage, setErrorMessagePopupMessage] = useState<string>('');

  // HexTile popup states
  const [landPopupPosition, setLandPopupPosition] = useState<LandPosition | undefined>(undefined);
  const [landPopupScreenPosition, setLandPopupScreenPosition] = useState<ScreenPosition>({
    x: 0,
    y: 0,
  });

  // New Game Dialog states
  const [newGameMapSize, setNewGameMapSize] = useState<BattlefieldSize>('medium');
  const [newGameSelectedPlayer, setNewGameSelectedPlayer] = useState<GamePlayer>(
    PREDEFINED_PLAYERS[0]
  );
  const [newGameOpponentSelectionMode, setNewGameOpponentSelectionMode] =
    useState<OpponentSelectionMode>('manual');
  const [newGameSelectedOpponents, setNewGameSelectedOpponents] = useState<(GamePlayer | null)[]>(
    []
  );

  // Select Opponent Dialog states
  const [selectOpponentSelectedPlayer, setSelectOpponentSelectedPlayer] = useState<GamePlayer>(
    PREDEFINED_PLAYERS[0]
  );

  // Save Game Dialog states
  const [saveGameName, setSaveGameName] = useState<string>('');

  // Player Selection states

  // Game states
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [glowingTiles, setGlowingTiles] = useState<Set<string>>(new Set());

  // HexTile popup actions
  const showLandPopup = useCallback(
    (battlefieldPosition: LandPosition, screenPosition: ScreenPosition) => {
      setLandPopupPosition(battlefieldPosition);
      setLandPopupScreenPosition(screenPosition);
    },
    []
  );

  const hideLandPopup = useCallback(() => {
    setLandPopupPosition(undefined);
  }, []);

  // New Game Dialog actions
  const resetNewGameDialog = useCallback(() => {
    setNewGameMapSize('medium');
    setNewGameSelectedPlayer(PREDEFINED_PLAYERS[0]);
    setNewGameOpponentSelectionMode('manual');
    setNewGameSelectedOpponents([]);
  }, []);

  // Select Opponent Dialog actions
  const resetSelectOpponentDialog = useCallback((availablePlayers: GamePlayer[]) => {
    setSelectOpponentSelectedPlayer(availablePlayers[0] || PREDEFINED_PLAYERS[0]);
  }, []);

  // Save Game Dialog actions
  const resetSaveGameDialog = useCallback(() => {
    setSaveGameName('');
  }, []);

  // Combined actions
  const showOpponentInfo = useCallback(
    (opponent: GamePlayer | undefined, screenPosition: ScreenPosition) => {
      setSelectedOpponent(opponent);
      setOpponentScreenPosition(screenPosition);
    },
    []
  );

  const hideOpponentInfo = useCallback(() => {
    setSelectedOpponent(undefined);
  }, []);

  const showSelectOpponentDialogWithConfig = useCallback(
    (
      excludedPlayerIds: string[],
      onSelect: (player: GamePlayer) => void,
      allowEmptyPlayer: boolean = true
    ) => {
      setSelectOpponentExcludedIds(excludedPlayerIds);
      setSelectOpponentCallback(() => onSelect);
      setAllowEmptyPlayer(allowEmptyPlayer);
      setShowSelectOpponentDialog(true);
    },
    []
  );

  const hideSelectOpponentDialog = useCallback(() => {
    setShowSelectOpponentDialog(false);
    setSelectOpponentCallback(null);
  }, []);

  // Glow management actions
  const addGlowingTile = useCallback((tileId: string) => {
    setGlowingTiles((prev) => new Set(prev).add(tileId));
  }, []);

  const removeGlowingTile = useCallback((tileId: string) => {
    setGlowingTiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tileId);
      return newSet;
    });
  }, []);

  const clearAllGlow = useCallback(() => {
    setGlowingTiles(new Set());
  }, []);

  return (
    <ApplicationContext.Provider
      value={{
        selectedLandAction,
        setSelectedLandAction,

        // Dialog states
        showStartWindow,
        showSaveDialog,
        showCastSpellDialog,
        showConstructBuildingDialog,
        showSelectOpponentDialog,
        showProgressPopup,

        // Dialog data
        selectedOpponent,
        opponentScreenPosition,
        selectOpponentExcludedIds,
        selectOpponentCallback,
        allowEmptyPlayer,
        progressMessage,

        // Popup Messages
        showErrorMessagePopup,
        setShowErrorMessagePopup,
        errorMessagePopupMessage,
        setErrorMessagePopupMessage,

        // HexTile popup states
        landPopupPosition,
        landPopupScreenPosition,

        // New Game Dialog states
        newGameMapSize,
        newGameSelectedPlayer,
        newGameOpponentSelectionMode,
        newGameSelectedOpponents,

        // Select Opponent Dialog states
        selectOpponentSelectedPlayer,

        // Save Game Dialog states
        saveGameName,

        // Player Selection states

        // Game states
        gameStarted,
        glowingTiles,

        // Dialog actions
        setShowStartWindow,
        setShowSaveDialog,
        setShowCastSpellDialog,
        setShowConstructBuildingDialog,
        setShowSelectOpponentDialog,
        setShowProgressPopup,
        setSelectedOpponent,
        setOpponentScreenPosition,
        setSelectOpponentExcludedIds,
        setSelectOpponentCallback,
        setAllowEmptyPlayer,
        setProgressMessage,

        // HexTile popup actions
        setLandPopupPosition,
        setLandPopupScreenPosition,
        showLandPopup,
        hideLandPopup,

        // New Game Dialog actions
        setNewGameMapSize,
        setNewGameSelectedPlayer,
        setNewGameOpponentSelectionMode,
        setNewGameSelectedOpponents,
        resetNewGameDialog,

        // Select Opponent Dialog actions
        setSelectOpponentSelectedPlayer,
        resetSelectOpponentDialog,

        // Save Game Dialog actions
        setSaveGameName,
        resetSaveGameDialog,

        // Player Selection actions

        // Game actions
        setGameStarted,
        setGlowingTiles,
        addGlowingTile,
        removeGlowingTile,
        clearAllGlow,

        // Combined actions
        showOpponentInfo,
        hideOpponentInfo,
        showSelectOpponentDialogWithConfig,
        hideSelectOpponentDialog,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationContext must be used within a ApplicationContextProvider');
  }
  return context;
};
