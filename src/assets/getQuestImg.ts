import { QuestType } from '../types/Quest';

import theEchoingRuinsImg from './quest/the-echoing-ruins.png';
import theWhisperingGroveImg from './quest/the-whispering-grove.png';

export const getQuestImg = (questType: QuestType): string | undefined => {
  switch (questType) {
    case 'The Echoing Ruins':
      return theEchoingRuinsImg;
    case 'The Whispering Grove':
      return theWhisperingGroveImg;
  }
  return undefined;
};
