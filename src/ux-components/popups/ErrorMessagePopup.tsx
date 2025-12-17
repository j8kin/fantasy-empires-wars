import React from 'react';
import styles from './css/Popup.module.css';

import PopupWrapper from './PopupWrapper';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import type { PopupProps } from './PopupWrapper';

const ErrorMessagePopup: React.FC<PopupProps> = ({ screenPosition }) => {
  const { errorMessagePopupMessage } = useApplicationContext();
  return (
    <PopupWrapper
      screenPosition={screenPosition}
      dimensions={{ width: 400, height: 100 }}
      accessible={true}
    >
      <div className={styles.popupContent} style={{ height: '60px', justifyContent: 'center' }}>
        <div className={styles.message}>{errorMessagePopupMessage}</div>
      </div>
    </PopupWrapper>
  );
};

export default ErrorMessagePopup;
