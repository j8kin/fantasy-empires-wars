import React, { useMemo, useEffect, useCallback, useState } from 'react';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import PlayerSelection from '../player-selection/PlayerSelection';
import GameButton from '../buttons/GameButton';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { NO_PLAYER, PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';

import { ButtonName } from '../../types/ButtonName';
import type { PlayerProfile } from '../../state/player/PlayerProfile';

export interface SelectOpponentDialogProps {
  excludedPlayerIds: string[];
  allowEmptyPlayer?: boolean;
  onSelect?: (player: PlayerProfile) => void;
  onCancel?: () => void;
}

const SelectOpponentDialog: React.FC<SelectOpponentDialogProps> = ({
  excludedPlayerIds,
  allowEmptyPlayer = true,
  onSelect,
  onCancel,
}) => {
  const { selectOpponentCallback, hideSelectOpponentDialog } = useApplicationContext();

  // Local state for dialog-specific values
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile>(PREDEFINED_PLAYERS[0]);

  const availablePlayers = useMemo(
    (): PlayerProfile[] => [
      ...(allowEmptyPlayer ? [NO_PLAYER] : []),
      ...PREDEFINED_PLAYERS.filter((player) => !excludedPlayerIds.includes(player.id)),
    ],
    [excludedPlayerIds, allowEmptyPlayer]
  );

  // Reset selected player when available players change
  useEffect(() => {
    setSelectedPlayer(availablePlayers[0] || PREDEFINED_PLAYERS[0]);
  }, [availablePlayers]);

  const handleOpponentSelect = useCallback(
    (player: PlayerProfile) => {
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

  const handlePlayerSelect = (player: PlayerProfile) => {
    setSelectedPlayer(player);
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
      secondaryButton={<GameButton buttonName={ButtonName.CANCEL} onClick={handleOpponentDialogCancel} />}
      zIndex={1010}
    >
      <PlayerSelection
        label="Select Opponent"
        selectedPlayer={selectedPlayer}
        onPlayerChange={handlePlayerSelect}
        availablePlayers={availablePlayers}
      />
    </FantasyBorderFrame>
  );
};

export default SelectOpponentDialog;
