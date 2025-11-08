import React from 'react';
import PopupWrapper, { PopupProps } from './PopupWrapper';
import styles from './css/HeroOutcomePopup.module.css';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { HeroOutcomeType } from '../../types/HeroOutcome';

const getMessageHeight = (messages: string) => {
  // one text line contain ~ 65 characters and 26px height + 8px padding (see css)
  return (Math.floor(messages.length / 65) + 1) * 25 + 13;
};

const getEventBorderColor = (status: HeroOutcomeType): string => {
  switch (status) {
    case 'negative':
      return '#ff0000';
    case 'success':
      return '#2fd700';
    case 'neutral':
      return '#555555';
    case 'minor':
      return '#ffa500';
    case 'positive':
      return '#4169E1';
    case 'legendary':
      return '#6A0DAD';
  }
  return '#ffd700';
};

const HeroOutcomePopup: React.FC<PopupProps> = ({ screenPosition }) => {
  const { heroOutcome, hideHeroOutcome } = useApplicationContext();

  if (!heroOutcome || heroOutcome.length === 0) {
    return null;
  }

  const headerHeight = 82;
  const popupHeight = heroOutcome.reduce(
    (acc, heroOutcome) => acc + getMessageHeight(heroOutcome.message),
    0
  );

  return (
    <PopupWrapper
      screenPosition={screenPosition}
      dimensions={{ width: 500, height: Math.max(150, headerHeight + popupHeight) }}
      accessible={true}
      onClose={hideHeroOutcome}
    >
      <div className={styles.popupContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>Quest Results</h3>
        </div>
        <div className={styles.results}>
          {heroOutcome.map((result, index) => (
            <div
              key={index}
              className={styles.resultMessage}
              style={{ borderLeftColor: getEventBorderColor(result.status) }}
            >
              {result.message}
            </div>
          ))}
        </div>
      </div>
    </PopupWrapper>
  );
};

export default HeroOutcomePopup;
