import React from 'react';
import PopupWrapper, { PopupProps } from './PopupWrapper';
import styles from './css/ProgressPopup.module.css';

interface ProgressPopupProps extends PopupProps {
  message: string;
}

const ProgressPopup: React.FC<ProgressPopupProps> = ({ screenPosition, message }) => {
  return (
    <>
      <div className={styles.blockingOverlay} />
      <PopupWrapper
        screenPosition={screenPosition}
        dimensions={{ width: 400, height: 200 }}
        accessible={false}
      >
        <div className={styles.content}>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFill} />
          </div>
          <div className={styles.message}>{message}</div>
        </div>
      </PopupWrapper>
    </>
  );
};

export default ProgressPopup;
