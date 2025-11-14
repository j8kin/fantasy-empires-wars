import { QuestType } from '../types/Quest';

import theEchoingRuinsImg from './quest/the-echoing-ruins.png';
import theWhisperingGroveImg from './quest/the-whispering-grove.png';
import theAbyssalCryptImg from './quest/the-abyssal-crypt.png';
import theShatteredSkyImg from './quest/the-shattered-sky.png';

export const getQuestImg = (questType: QuestType): string => {
  switch (questType) {
    case 'The Echoing Ruins':
      return theEchoingRuinsImg;
    case 'The Whispering Grove':
      return theWhisperingGroveImg;
    case 'The Abyssal Crypt':
      return theAbyssalCryptImg;
    case 'The Shattered Sky':
      return theShatteredSkyImg;
  }
};
