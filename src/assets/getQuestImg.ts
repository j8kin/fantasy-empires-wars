import type { QuestType } from '../types/Quest';

import theEchoingRuinsImg from './quest/the-echoing-ruins.png';
import theWhisperingGroveImg from './quest/the-whispering-grove.png';
import theAbyssalCryptImg from './quest/the-abyssal-crypt.png';
import theShatteredSkyImg from './quest/the-shattered-sky.png';

const questImg: Record<QuestType, string> = {
  'The Echoing Ruins': theEchoingRuinsImg,
  'The Whispering Grove': theWhisperingGroveImg,
  'The Abyssal Crypt': theAbyssalCryptImg,
  'The Shattered Sky': theShatteredSkyImg,
};

export const getQuestImg = (questType: QuestType): string => {
  return questImg[questType];
};
