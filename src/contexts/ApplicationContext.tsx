import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { PlayerState } from '../state/player/PlayerState';
import type { EmpireEvent } from '../types/EmpireEvent';
import type { PlayerProfile } from '../state/player/PlayerProfile';
import type { LandPosition } from '../state/map/land/LandPosition';
import type { ManaType } from '../types/Mana';

/**
 * Top Left position of the window/dialog/popup
 */
export interface ScreenPosition {
  x: number;
  y: number;
}
/**
 * Width and height of the window/dialog/popup
 */
export interface FrameSize {
  width: number;
  height: number;
}

interface MoveArmyPath {
  from: LandPosition;
  to: LandPosition;
}

interface SpellAnimationState {
  manaType: ManaType;
  battlefieldPosition: LandPosition;
  screenPosition: ScreenPosition;
}

interface ApplicationContextType {
  // Selected land position and action
  selectedLandAction: string | null;
  setSelectedLandAction: (item: string | null) => void;
  actionLandPosition: LandPosition | undefined;
  setActionLandPosition: (position: LandPosition | undefined) => void;
  moveArmyPath: MoveArmyPath | undefined;
  setMoveArmyPath: (position: MoveArmyPath | undefined) => void;

  // Arcane Exchange mode
  isArcaneExchangeMode: boolean;
  setIsArcaneExchangeMode: (mode: boolean) => void;

  // Dialog states
  showStartWindow: boolean;
  showSaveDialog: boolean;
  showCastSpellDialog: boolean;
  showEmpireTreasureDialog: boolean;
  showConstructBuildingDialog: boolean;
  showRecruitArmyDialog: boolean;
  showSendHeroInQuestDialog: boolean;
  showSelectOpponentDialog: boolean;
  showProgressPopup: boolean;

  // Quest Results Popup
  showHeroOutcomePopup: boolean;
  setShowHeroOutcomePopup: (show: boolean) => void;
  heroOutcome: EmpireEvent[];
  setHeroOutcome: (results: EmpireEvent[]) => void;

  // Dialog data
  selectedOpponent: PlayerState | undefined;
  opponentScreenPosition: ScreenPosition;
  selectOpponentExcludedIds: string[];
  selectOpponentCallback: ((player: PlayerProfile) => void) | null;
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

  // Save Game Dialog states
  saveGameName: string;

  // Game states
  gameStarted: boolean;
  glowingTiles: Set<string>;

  // Spell animation state
  spellAnimation: SpellAnimationState | null;
  setSpellAnimation: (animation: SpellAnimationState | null) => void;
  showSpellAnimation: (
    manaType: ManaType,
    battlefieldPosition: LandPosition,
    screenPosition: ScreenPosition
  ) => void;
  hideSpellAnimation: () => void;

  // Dialog actions
  setShowStartWindow: (show: boolean) => void;
  setShowSaveDialog: (show: boolean) => void;
  setShowCastSpellDialog: (show: boolean) => void;
  setShowEmpireTreasureDialog: (show: boolean) => void;
  setShowConstructBuildingDialog: (show: boolean) => void;
  setShowRecruitArmyDialog: (show: boolean) => void;
  setShowSendHeroInQuestDialog: (show: boolean) => void;
  setShowSelectOpponentDialog: (show: boolean) => void;
  setShowProgressPopup: (show: boolean) => void;
  setSelectedOpponent: (opponent: PlayerState | undefined) => void;
  setOpponentScreenPosition: (position: ScreenPosition) => void;
  setSelectOpponentExcludedIds: (ids: string[]) => void;
  setSelectOpponentCallback: (callback: ((player: PlayerProfile) => void) | null) => void;
  setAllowEmptyPlayer: (allow: boolean) => void;
  setProgressMessage: (message: string) => void;

  // HexTile popup actions
  setLandPopupPosition: (position: LandPosition | undefined) => void;
  setLandPopupScreenPosition: (position: ScreenPosition) => void;
  showLandPopup: (battlefieldPosition: LandPosition, screenPosition: ScreenPosition) => void;
  hideLandPopup: () => void;

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
  showOpponentInfo: (opponent: PlayerState, screenPosition: ScreenPosition) => void;
  hideOpponentInfo: () => void;
  showSelectOpponentDialogWithConfig: (
    excludedPlayerIds: string[],
    onSelect: (player: PlayerProfile) => void,
    allowEmptyPlayer?: boolean
  ) => void;
  hideSelectOpponentDialog: () => void;

  // Hero Outcome actions
  showHeroOutcome: (results: EmpireEvent[]) => void;
  hideHeroOutcome: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Selected land position and action
  const [selectedLandAction, setSelectedLandAction] = useState<string | null>(null);
  const [actionLandPosition, setActionLandPosition] = useState<LandPosition | undefined>(undefined);
  const [moveArmyPath, setMoveArmyPath] = useState<MoveArmyPath | undefined>(undefined);

  // Arcane Exchange mode
  const [isArcaneExchangeMode, setIsArcaneExchangeMode] = useState<boolean>(false);

  // Dialog states
  const [showStartWindow, setShowStartWindow] = useState<boolean>(true);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [showCastSpellDialog, setShowCastSpellDialog] = useState<boolean>(false);
  const [showEmpireTreasureDialog, setShowEmpireTreasureDialog] = useState<boolean>(false);
  const [showConstructBuildingDialog, setShowConstructBuildingDialog] = useState<boolean>(false);
  const [showRecruitArmyDialog, setShowRecruitArmyDialog] = useState<boolean>(false);
  const [showSendHeroInQuestDialog, setShowSendHeroInQuestDialog] = useState<boolean>(false);
  const [showSelectOpponentDialog, setShowSelectOpponentDialog] = useState<boolean>(false);
  const [showProgressPopup, setShowProgressPopup] = useState<boolean>(false);

  // Quest Results Popup states
  const [showHeroOutcomePopup, setShowHeroOutcomePopup] = useState<boolean>(false);
  const [heroOutcome, setHeroOutcome] = useState<EmpireEvent[]>([]);

  // Dialog data
  const [selectedOpponent, setSelectedOpponent] = useState<PlayerState | undefined>(undefined);
  const [opponentScreenPosition, setOpponentScreenPosition] = useState<ScreenPosition>({
    x: 0,
    y: 0,
  });
  const [selectOpponentExcludedIds, setSelectOpponentExcludedIds] = useState<string[]>([]);
  const [selectOpponentCallback, setSelectOpponentCallback] = useState<
    ((player: PlayerProfile) => void) | null
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

  // Save Game Dialog states
  const [saveGameName, setSaveGameName] = useState<string>('');

  // Player Selection states

  // Game states
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [glowingTiles, setGlowingTiles] = useState<Set<string>>(new Set());

  // Spell animation state
  const [spellAnimation, setSpellAnimation] = useState<SpellAnimationState | null>(null);

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

  // Save Game Dialog actions
  const resetSaveGameDialog = useCallback(() => {
    setSaveGameName('');
  }, []);

  // Combined actions
  const showOpponentInfo = useCallback(
    (opponent: PlayerState | undefined, screenPosition: ScreenPosition) => {
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
      onSelect: (player: PlayerProfile) => void,
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

  // Hero Outcome actions
  const showHeroOutcome = useCallback((results: EmpireEvent[]) => {
    setHeroOutcome(results);
    setShowHeroOutcomePopup(true);
  }, []);

  const hideHeroOutcome = useCallback(() => {
    setShowHeroOutcomePopup(false);
    setHeroOutcome([]);
  }, []);

  // Spell animation actions
  const showSpellAnimation = useCallback(
    (manaType: ManaType, battlefieldPosition: LandPosition, screenPosition: ScreenPosition) => {
      setSpellAnimation({
        manaType,
        battlefieldPosition,
        screenPosition,
      });
    },
    []
  );

  const hideSpellAnimation = useCallback(() => {
    setSpellAnimation(null);
  }, []);

  return (
    <ApplicationContext.Provider
      value={{
        // Selected land position and action
        selectedLandAction,
        setSelectedLandAction,
        actionLandPosition,
        setActionLandPosition,
        moveArmyPath,
        setMoveArmyPath,

        // Arcane Exchange mode
        isArcaneExchangeMode,
        setIsArcaneExchangeMode,

        // Dialog states
        showStartWindow,
        showSaveDialog,
        showCastSpellDialog,
        showEmpireTreasureDialog,
        showConstructBuildingDialog,
        showRecruitArmyDialog,
        showSendHeroInQuestDialog,
        showSelectOpponentDialog,
        showProgressPopup,

        // Quest Results Popup
        showHeroOutcomePopup,
        setShowHeroOutcomePopup,
        heroOutcome,
        setHeroOutcome,

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

        // Save Game Dialog states
        saveGameName,

        // Player Selection states

        // Game states
        gameStarted,
        glowingTiles,

        // Spell animation state
        spellAnimation,
        setSpellAnimation,
        showSpellAnimation,
        hideSpellAnimation,

        // Dialog actions
        setShowStartWindow,
        setShowSaveDialog,
        setShowCastSpellDialog,
        setShowEmpireTreasureDialog,
        setShowConstructBuildingDialog,
        setShowRecruitArmyDialog,
        setShowSendHeroInQuestDialog,
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

        // Hero Outcome actions
        showHeroOutcome,
        hideHeroOutcome,
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
