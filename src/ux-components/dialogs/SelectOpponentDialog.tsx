import React, { useCallback, useState } from 'react';
import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import { GamePlayer, PREDEFINED_PLAYERS, NO_PLAYER } from '../../types/GamePlayer';
import PlayerSelection from '../player-selection/PlayerSelection';
import GameButton from '../buttons/GameButton';

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
  const availablePlayers = [
    ...(allowEmptyPlayer ? [NO_PLAYER] : []),
    ...PREDEFINED_PLAYERS.filter((player) => !excludedPlayerIds.includes(player.id)),
  ];

  const [selectedPlayer, setSelectedPlayer] = useState<GamePlayer>(availablePlayers[0]);

  const handlePlayerSelect = useCallback(
    (player: GamePlayer) => {
      setSelectedPlayer(player);
      onSelect(player);
    },
    [onSelect]
  );

  const dialogWidth = Math.min(700, typeof window !== 'undefined' ? window.innerWidth * 0.7 : 700);
  const dialogHeight = Math.min(
    500,
    typeof window !== 'undefined' ? window.innerHeight * 0.6 : 500
  );
  const dialogX = typeof window !== 'undefined' ? (window.innerWidth - dialogWidth) / 2 : 0;
  const dialogY = typeof window !== 'undefined' ? (window.innerHeight - dialogHeight) / 2 : 0;

  return (
    <FantasyBorderFrame
      screenPosition={{ x: dialogX, y: dialogY }}
      windowDimensions={{ width: dialogWidth, height: dialogHeight }}
      secondaryButton={<GameButton buttonName="cancel" onClick={onCancel} />}
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
