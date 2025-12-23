import React, { useCallback, useState } from 'react';
import styles from './css/VialPanel.module.css';

import ManaVial from './ManaVial';
import ExchangeManaVialPanel from './ExchangeManaVialPanel';

import { useGameContext } from '../../contexts/GameContext';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { castSpell } from '../../map/magic/castSpell';
import { calculateManaConversionAmount } from '../../utils/manaConversionUtils';
import { ManaKind } from '../../types/Mana';
import { SpellName } from '../../types/Spell';

import type { ManaType } from '../../types/Mana';

const VialPanel: React.FC = () => {
  const { gameState, updateGameState } = useGameContext();
  const { isArcaneExchangeMode, setIsArcaneExchangeMode } = useApplicationContext();
  const [hoveredMana, setHoveredMana] = useState<ManaType | null>(null);

  // Handle exchange of mana (always define this)
  const handleExchange = useCallback(
    (targetManaType: ManaType) => {
      if (gameState) {
        // Cast the spell with the selected mana type
        castSpell(gameState, SpellName.EXCHANGE, undefined, undefined, targetManaType);
        updateGameState(gameState);

        // Exit exchange mode
        setIsArcaneExchangeMode(false);
      }
    },
    [gameState, updateGameState, setIsArcaneExchangeMode]
  );

  if (!gameState) return null;
  const turnOwner = getTurnOwner(gameState);

  // Now do early returns after all hooks are defined
  if (!turnOwner || turnOwner.playerType !== 'human') return null;

  if (isArcaneExchangeMode) {
    // In exchange mode, show all mana types except blue at max level
    const exchangeableManaTypes = Object.values(ManaKind).filter((m) => m !== ManaKind.BLUE);
    return (
      <div className={styles.vialPanel} style={{ position: 'relative' }}>
        {exchangeableManaTypes.map((manaType) => (
          <ExchangeManaVialPanel
            key={manaType}
            color={manaType}
            conversionAmount={calculateManaConversionAmount(
              turnOwner.playerProfile.alignment,
              manaType
            )}
            onExchange={handleExchange}
            isHovered={hoveredMana === manaType}
            onHover={setHoveredMana}
          />
        ))}
      </div>
    );
  }

  // Normal mode
  return (
    <div className={styles.vialPanel}>
      {Object.values(ManaKind).map((m) => (
        <ManaVial key={m} color={m} mana={turnOwner?.mana?.[m]} />
      ))}
    </div>
  );
};

export default VialPanel;
