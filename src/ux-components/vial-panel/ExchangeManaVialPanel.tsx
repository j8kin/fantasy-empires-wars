import React, { useCallback, useState } from 'react';
import styles from './css/ExchangeManaVialPanel.module.css';
import vialPanelStyles from './css/VialPanel.module.css';
import cn from 'classnames';

import ManaVial from './ManaVial';
import { useGameContext } from '../../contexts/GameContext';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { castSpell } from '../../map/magic/castSpell';
import { calculateManaConversionAmount } from '../../utils/manaConversionUtils';
import { Mana } from '../../types/Mana';
import { SpellName } from '../../types/Spell';

import type { ManaType } from '../../types/Mana';

interface ExchangeVialProps {
  color: ManaType;
  conversionAmount: number;
  onExchange: (manaType: ManaType) => void;
  isHovered: boolean;
  onHover: (manaType: ManaType | null) => void;
}

const ExchangeVial: React.FC<ExchangeVialProps> = ({ color, conversionAmount, onExchange, isHovered, onHover }) => {
  const handleClick = useCallback(() => {
    onExchange(color);
  }, [color, onExchange]);

  const handleMouseEnter = useCallback(() => {
    onHover(color);
  }, [color, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  return (
    <div
      className={styles.exchangeVialContainer}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={`Exchange to ${conversionAmount} ${color} mana`}
      data-testid={`exchange-vial-${color}`}
    >
      <ManaVial color={color} mana={1000} />
      {isHovered && (
        <div className={styles.exchangeTooltip}>
          +{conversionAmount} {color}
        </div>
      )}
    </div>
  );
};

const ExchangeManaVialPanel: React.FC = () => {
  const { gameState, updateGameState } = useGameContext();
  const { setIsArcaneExchangeMode } = useApplicationContext();
  const [hoveredMana, setHoveredMana] = useState<ManaType | null>(null);

  // Handle exchange of mana
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

  if (!turnOwner || turnOwner.playerType !== 'human') return null;

  // In exchange mode, show all mana types except blue at max level
  const exchangeableManaTypes = Object.values(Mana).filter((m) => m !== Mana.BLUE);

  return (
    <div className={cn(vialPanelStyles.vialPanel, styles.vialPanel)} data-testid="exchange-vial-panel">
      {exchangeableManaTypes.map((manaType) => (
        <ExchangeVial
          key={manaType}
          color={manaType}
          conversionAmount={calculateManaConversionAmount(turnOwner.playerProfile.alignment, manaType)}
          onExchange={handleExchange}
          isHovered={hoveredMana === manaType}
          onHover={setHoveredMana}
        />
      ))}
    </div>
  );
};

export default ExchangeManaVialPanel;
