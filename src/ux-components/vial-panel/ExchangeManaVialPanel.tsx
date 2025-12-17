import React, { useCallback } from 'react';
import styles from './css/ExchangeManaVialPanel.module.css';

import ManaVial from './ManaVial';
import type { ManaType } from '../../types/Mana';

// Component for exchange mode vials that show conversion rates and handle clicking
interface ExchangeVialProps {
  color: ManaType;
  conversionAmount: number;
  onExchange: (manaType: ManaType) => void;
  isHovered: boolean;
  onHover: (manaType: ManaType | null) => void;
}

const ExchangeManaVialPanel: React.FC<ExchangeVialProps> = ({
  color,
  conversionAmount,
  onExchange,
  isHovered,
  onHover,
}) => {
  const handleClick = useCallback(() => {
    onExchange(color);
  }, [color, onExchange]);

  const handleMouseEnter = useCallback(() => {
    onHover(color);
  }, [color, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  const vialStyle = isHovered
    ? {
        filter: 'brightness(1.5)',
        cursor: 'pointer',
        transform: 'scale(1.1)',
        transition: 'all 0.2s ease',
      }
    : {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      };

  return (
    <div
      className={styles.exchangeVialContainer}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={vialStyle}
      title={`Exchange to ${conversionAmount} ${color} mana`}
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

export default ExchangeManaVialPanel;
