import { HeroUnit } from '../../types/Unit';
import { getRandomElement } from '../../types/getRandomElement';

export const heroRecruitingMessage = (heroUnit: HeroUnit): string => {
  const recruitingMessages = [
    `${heroUnit.name}, the ${heroUnit.id}, answers the call of fate once more.`,
    `From distant roads comes ${heroUnit.name}, a ${heroUnit.id} bound by unseen oaths.`,
    `The banners rise — ${heroUnit.name}, the ${heroUnit.id}, joins your cause.`,
    `Whispers spread: ${heroUnit.name}, ${heroUnit.id} of renown, has returned to service.`,
    `A shadow moves — ${heroUnit.name}, ${heroUnit.id} of legend, pledges allegiance.`,
    `Steel and will converge as ${heroUnit.name}, the ${heroUnit.id}, takes the field.`,
    `Ancient vows stir anew — ${heroUnit.name}, ${heroUnit.id}, stands beneath your banner.`,
    `From the silence of old wars comes ${heroUnit.name}, steadfast ${heroUnit.id}.`,
    `The halls echo once more with the tread of ${heroUnit.name}, ${heroUnit.id} of honor.`,
    `The realm shifts — ${heroUnit.name}, ${heroUnit.id}, answers destiny’s quiet summons.`,
  ];
  return getRandomElement(recruitingMessages);
};
