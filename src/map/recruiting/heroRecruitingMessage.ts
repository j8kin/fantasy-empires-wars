import { getRandomElement } from '../../domain/utils/random';
import type { HeroState } from '../../state/army/HeroState';

export const heroRecruitingMessage = (heroUnit: HeroState): string => {
  const recruitingMessages = [
    `${heroUnit.name}, the ${heroUnit.type}, answers the call of fate once more.`,
    `From distant roads comes ${heroUnit.name}, a ${heroUnit.type} bound by unseen oaths.`,
    `The banners rise — ${heroUnit.name}, the ${heroUnit.type}, joins your cause.`,
    `Whispers spread: ${heroUnit.name}, ${heroUnit.type} of renown, has returned to service.`,
    `A shadow moves — ${heroUnit.name}, ${heroUnit.type} of legend, pledges allegiance.`,
    `Steel and will converge as ${heroUnit.name}, the ${heroUnit.type}, takes the field.`,
    `Ancient vows stir anew — ${heroUnit.name}, ${heroUnit.type}, stands beneath your banner.`,
    `From the silence of old wars comes ${heroUnit.name}, steadfast ${heroUnit.type}.`,
    `The halls echo once more with the tread of ${heroUnit.name}, ${heroUnit.type} of honor.`,
    `The realm shifts — ${heroUnit.name}, ${heroUnit.type}, answers destiny’s quiet summons.`,
  ];
  return getRandomElement(recruitingMessages);
};
