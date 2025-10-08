import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { OpponentWithDiplomacy } from '../ux-components/popups/OpponentInfoPopup';
import { GamePlayer, PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { ScreenPosition } from '../ux-components/fantasy-border-frame/FantasyBorderFrame';
import { BattlefieldSize } from '../types/BattlefieldSize';
import { Position } from '../map/utils/mapTypes';

type OpponentSelectionMode = 'random' | 'manual';

interface ApplicationContextType {
  selectedItem: string | null;
  setSelectedItem: (item: string | null) => void;

  // Dialog states
  showStartWindow: boolean;
  showSaveDialog: boolean;
  showCastSpellDialog: boolean;
  showSelectOpponentDialog: boolean;
  showProgressPopup: boolean;

  // Dialog data
  selectedOpponent: OpponentWithDiplomacy | undefined;
  opponentScreenPosition: ScreenPosition;
  selectOpponentExcludedIds: string[];
  selectOpponentCallback: ((player: GamePlayer) => void) | null;
  allowEmptyPlayer: boolean;
  progressMessage: string;

  // HexTile popup states
  landPopupPosition: Position | null;
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

  // Player Selection states
  hoveredPlayer: GamePlayer | null;

  // Dialog actions
  setShowStartWindow: (show: boolean) => void;
  setShowSaveDialog: (show: boolean) => void;
  setShowCastSpellDialog: (show: boolean) => void;
  setShowSelectOpponentDialog: (show: boolean) => void;
  setShowProgressPopup: (show: boolean) => void;
  setSelectedOpponent: (opponent: OpponentWithDiplomacy | undefined) => void;
  setOpponentScreenPosition: (position: ScreenPosition) => void;
  setSelectOpponentExcludedIds: (ids: string[]) => void;
  setSelectOpponentCallback: (callback: ((player: GamePlayer) => void) | null) => void;
  setAllowEmptyPlayer: (allow: boolean) => void;
  setProgressMessage: (message: string) => void;

  // HexTile popup actions
  setLandPopupPosition: (position: Position | null) => void;
  setLandPopupScreenPosition: (position: ScreenPosition) => void;
  showLandPopup: (battlefieldPosition: Position, screenPosition: ScreenPosition) => void;
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
  setHoveredPlayer: (player: GamePlayer | null) => void;

  // Combined actions
  showOpponentInfo: (opponent: OpponentWithDiplomacy, screenPosition: ScreenPosition) => void;
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
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Dialog states
  const [showStartWindow, setShowStartWindow] = useState<boolean>(true);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [showCastSpellDialog, setShowCastSpellDialog] = useState<boolean>(false);
  const [showSelectOpponentDialog, setShowSelectOpponentDialog] = useState<boolean>(false);
  const [showProgressPopup, setShowProgressPopup] = useState<boolean>(false);

  // Dialog data
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentWithDiplomacy | undefined>(
    undefined
  );
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

  // HexTile popup states
  const [landPopupPosition, setLandPopupPosition] = useState<Position | null>(null);
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
  const [hoveredPlayer, setHoveredPlayer] = useState<GamePlayer | null>(null);

  // HexTile popup actions
  const showLandPopup = useCallback(
    (battlefieldPosition: Position, screenPosition: ScreenPosition) => {
      setLandPopupPosition(battlefieldPosition);
      setLandPopupScreenPosition(screenPosition);
    },
    []
  );

  const hideLandPopup = useCallback(() => {
    setLandPopupPosition(null);
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
    (opponent: OpponentWithDiplomacy, screenPosition: ScreenPosition) => {
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

  return (
    <ApplicationContext.Provider
      value={{
        selectedItem,
        setSelectedItem,

        // Dialog states
        showStartWindow,
        showSaveDialog,
        showCastSpellDialog,
        showSelectOpponentDialog,
        showProgressPopup,

        // Dialog data
        selectedOpponent,
        opponentScreenPosition,
        selectOpponentExcludedIds,
        selectOpponentCallback,
        allowEmptyPlayer,
        progressMessage,

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
        hoveredPlayer,

        // Dialog actions
        setShowStartWindow,
        setShowSaveDialog,
        setShowCastSpellDialog,
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
        setHoveredPlayer,

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

export const useSelection = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationContext must be used within a SelectionProvider');
  }
  return context;
};
