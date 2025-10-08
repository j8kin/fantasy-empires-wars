import React, { useMemo, useEffect } from 'react';
import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import { GamePlayer, NO_PLAYER, PREDEFINED_PLAYERS } from '../../types/GamePlayer';
import PlayerSelection from '../player-selection/PlayerSelection';
import GameButton from '../buttons/GameButton';
import { ButtonName } from '../buttons/GameButtonProps';
import { useApplicationContext } from '../../contexts/ApplicationContext';

export interface SelectOpponentDialogProps {
  excludedPlayerIds: string[];
  onSelect: (player: GamePlayer) => void;
  onCancel: () => void;
  allowEmptyPlayer?: boolean;
}

const SelectOpponentDialog: React.FC<SelectOpponentDialogProps> = ({
  excludedPlayerIds,
  onSelect,
  onCancel,
  allowEmptyPlayer = true,
}) => {
  const {
    selectOpponentSelectedPlayer,
    setSelectOpponentSelectedPlayer,
    resetSelectOpponentDialog,
  } = useApplicationContext();

  const availablePlayers = useMemo(
    () => [
      ...(allowEmptyPlayer ? [NO_PLAYER] : []),
      ...PREDEFINED_PLAYERS.filter((player) => !excludedPlayerIds.includes(player.id)),
    ],
    [excludedPlayerIds, allowEmptyPlayer]
  );

  useEffect(() => {
    resetSelectOpponentDialog(availablePlayers);
  }, [availablePlayers, resetSelectOpponentDialog]);

  const handlePlayerSelect = (player: GamePlayer) => {
    setSelectOpponentSelectedPlayer(player);
    onSelect(player);
  };

  const isClient = typeof window !== 'undefined';
  const dialogWidth = Math.min(700, isClient ? window.innerWidth * 0.7 : 700);
  const dialogHeight = Math.min(500, isClient ? window.innerHeight * 0.6 : 500);
  const dialogX = isClient ? (window.innerWidth - dialogWidth) / 2 : 0;
  const dialogY = isClient ? (window.innerHeight - dialogHeight) / 2 : 0;

  return (
    <FantasyBorderFrame
      screenPosition={{ x: dialogX, y: dialogY }}
      windowDimensions={{ width: dialogWidth, height: dialogHeight }}
      secondaryButton={<GameButton buttonName={ButtonName.CANCEL} onClick={onCancel} />}
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
