import React from 'react';
import PopupWrapper, { PopupProps } from './PopupWrapper';
import styles from './css/QuestResultsPopup.module.css';
import { useApplicationContext } from '../../contexts/ApplicationContext';

const HeroOutcomePopup: React.FC<PopupProps> = ({ screenPosition }) => {
  const { questResults, hideQuestResults } = useApplicationContext();

  if (!questResults || questResults.length === 0) {
    return null;
  }
  const headerHeight = 80;
  const popupHeight = questResults.reduce(
    // 54 + 8 for 2 lines of text, 79 + 8 for 3 lines of text
    (acc, msg) => (msg.length < 125 ? acc + 54 + 8 : acc + 79 + 8),
    0
  );

  return (
    <PopupWrapper
      screenPosition={screenPosition}
      dimensions={{ width: 500, height: Math.max(150, headerHeight + popupHeight) }}
      accessible={true}
      onClose={hideQuestResults}
    >
      <div className={styles.popupContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>Quest Results</h3>
        </div>
        <div className={styles.results}>
          {questResults.map((result, index) => (
            <div key={index} className={styles.resultMessage}>
              {result}
            </div>
          ))}
        </div>
      </div>
    </PopupWrapper>
  );
};

export default HeroOutcomePopup;
