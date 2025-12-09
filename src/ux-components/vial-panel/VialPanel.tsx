import React, { useCallback, useState } from 'react';
import styles from './css/VialPanel.module.css';

import { useGameContext } from '../../contexts/GameContext';
import { useApplicationContext } from '../../contexts/ApplicationContext';

import ManaVial from './ManaVial';
import ExchangeManaVialPanel from './ExchangeManaVialPanel';

import { getTurnOwner } from '../../selectors/playerSelectors';
import { getMinManaCost } from '../../selectors/spellSelectors';
import { getSpellById } from '../../selectors/spellSelectors';

import { ManaType } from '../../types/Mana';
import { SpellName } from '../../types/Spell';
import { castSpell } from '../../map/magic/castSpell';
import { calculateManaConversionAmount } from '../../utils/manaConversionUtils';

const VialPanel: React.FC = () => {
  const { gameState, updateGameState } = useGameContext();
  const { isArcaneExchangeMode, setIsArcaneExchangeMode } = useApplicationContext();
  const [hoveredMana, setHoveredMana] = useState<ManaType | null>(null);

  // Handle exchange of mana (always define this)
  const handleExchange = useCallback(
    (targetManaType: ManaType) => {
      if (gameState) {
        const arcaneExchangeSpell = getSpellById(SpellName.EXCHANGE);
        // Cast the spell with the selected mana type
        castSpell(gameState, arcaneExchangeSpell, undefined, undefined, targetManaType);
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
    const exchangeableManaTypes = Object.values(ManaType).filter((m) => m !== ManaType.BLUE);
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

  // Normal mode - do not show mana vials if not enough mana to cast related school spells
  const availableMana = Object.values(ManaType).filter(
    (manaType) => turnOwner.mana?.[manaType]! > getMinManaCost(manaType)
  );

  return (
    <div className={styles.vialPanel}>
      {availableMana &&
        availableMana.map((m) => <ManaVial key={m} color={m} mana={turnOwner?.mana?.[m]} />)}
    </div>
  );
};

export default VialPanel;
