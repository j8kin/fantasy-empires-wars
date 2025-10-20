import React, { useMemo, useEffect, useCallback } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import PlayerSelection from '../player-selection/PlayerSelection';
import GameButton from '../buttons/GameButton';

import { NO_PLAYER, PlayerInfo, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import { ButtonName } from '../../types/ButtonName';

export interface SelectOpponentDialogProps {
  excludedPlayerIds: string[];
  allowEmptyPlayer?: boolean;
  onSelect?: (player: PlayerInfo) => void;
  onCancel?: () => void;
}

const SelectOpponentDialog: React.FC<SelectOpponentDialogProps> = ({
  excludedPlayerIds,
  allowEmptyPlayer = true,
  onSelect,
  onCancel,
}) => {
  const {
    selectOpponentSelectedPlayer,
    selectOpponentCallback,
    setSelectOpponentSelectedPlayer,
    resetSelectOpponentDialog,
    hideSelectOpponentDialog,
  } = useApplicationContext();

  const availablePlayers = useMemo(
    (): PlayerInfo[] => [
      ...(allowEmptyPlayer ? [NO_PLAYER] : []),
      ...PREDEFINED_PLAYERS.filter((player) => !excludedPlayerIds.includes(player.id)),
    ],
    [excludedPlayerIds, allowEmptyPlayer]
  );

  useEffect(() => {
    resetSelectOpponentDialog(availablePlayers);
  }, [availablePlayers, resetSelectOpponentDialog]);

  const handleOpponentSelect = useCallback(
    (player: PlayerInfo) => {
      if (onSelect) {
        onSelect(player);
      } else if (selectOpponentCallback) {
        selectOpponentCallback(player);
        hideSelectOpponentDialog();
      }
    },
    [onSelect, selectOpponentCallback, hideSelectOpponentDialog]
  );

  const handleOpponentDialogCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      hideSelectOpponentDialog();
    }
  }, [onCancel, hideSelectOpponentDialog]);

  const handlePlayerSelect = (player: PlayerInfo) => {
    setSelectOpponentSelectedPlayer(player);
    handleOpponentSelect(player);
  };

  const isClient = typeof window !== 'undefined';
  const dialogWidth = Math.min(700, isClient ? window.innerWidth * 0.7 : 700);
  const dialogHeight = Math.min(500, isClient ? window.innerHeight * 0.6 : 500);
  const dialogX = isClient ? (window.innerWidth - dialogWidth) / 2 : 0;
  const dialogY = isClient ? (window.innerHeight - dialogHeight) / 2 : 0;

  return (
    <FantasyBorderFrame
      screenPosition={{ x: dialogX, y: dialogY }}
      frameSize={{ width: dialogWidth, height: dialogHeight }}
      secondaryButton={
        <GameButton buttonName={ButtonName.CANCEL} onClick={handleOpponentDialogCancel} />
      }
      zIndex={1010}
    >
      <PlayerSelection
        label="Select Opponent"
        selectedPlayer={selectOpponentSelectedPlayer}
        onPlayerChange={handlePlayerSelect}
        availablePlayers={availablePlayers}
      />
    </FantasyBorderFrame>
  );
};

export default SelectOpponentDialog;
