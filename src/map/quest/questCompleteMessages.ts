import { getRandomElement } from '../../domain/utils/random';
import type { Artifact, TreasureType } from '../../types/Treasures';

export const heroDieMessage = (name: string): string => {
  const messages = [
    `Hero ${name} ventured beyond the known paths of Orrivane and did not return.`,
    `Hero ${name} was lost to the mists of fate — their story ends where legends begin.`,
    `Hero ${name} vanished upon the quest, their fate whispered only by the winds.`,
    `Hero ${name} did not return from the quest; Orrivane itself has claimed their spirit.`,
    `Hero ${name} walked into the unknown and became one with the tales of old.`,
    `Hero ${name} has not returned. Some say the land remembers their name in silence.`,
    `Hero ${name} was swallowed by destiny’s shadow — only echoes remain.`,
    `Hero ${name} set forth seeking glory, but the realm offered only silence in return.`,
  ];
  return getRandomElement(messages);
};

export const heroGainArtifact = (hero: string, artifact: Artifact): string => {
  const artifactFullName = `${artifact.treasure.type}${artifact.level > 0 ? ` +${artifact.level}` : ''}`;
  const messages = [
    `${hero} returns from the veil of peril, their hands clasping the fabled '${artifactFullName}', as if Orrivane itself deemed them worthy.`,
    `From shadow and ruin, ${hero} emerges bearing '${artifactFullName}' — a token of power earned in silence and blood.`,
    `Whispers spread through the realm: ${hero} has returned, carrying the '${artifactFullName}', its glow still echoing the trials endured.`,
    `The winds speak of ${hero}’s triumph — they have brought back '${artifactFullName}', a relic once thought lost to myth.`,
    `When all had forsaken hope, ${hero} stepped forth, clutching the '${artifactFullName}', eyes alight with quiet victory.`,
    `${hero} returns from lands beyond sight, their soul tempered and their prize — '${artifactFullName}' — gleaming with otherworldly grace.`,
    `The stars themselves seemed to bend as ${hero} emerged from the unknown, the '${artifactFullName}' resting like a promise in their grasp.`,
    `${hero}’s journey has scarred and sanctified them alike — now they bear '${artifactFullName}', and the realm shall not forget.`,
    `They said none would return, yet ${hero} walks again beneath the sun, the '${artifactFullName}' singing softly of forgotten gods.`,
    `From the mists of peril, ${hero} reappears. In their grasp, the '${artifactFullName}' — proof that fate still honors the bold.`,
  ];
  return getRandomElement(messages);
};

export const heroGainItem = (hero: string, item: TreasureType): string => {
  const messages = [
    `From shadow and storm, ${hero} returns — the ${item} glimmering faintly, as if it remembers its former master.`,
    `${hero} emerges from the wilds, clutching the ${item} — a relic humming softly with untamed power.`,
    `The quest bore fruit: ${hero} now wields the ${item}, a prize wrested from forgotten hands.`,
    `${hero} walks back beneath dim skies, the ${item} whispering secrets of ancient magic.`,
    `Few have seen such fortune — ${hero} returns bearing the ${item}, its glow a quiet promise of destiny.`,
    `${hero} claims the ${item}, a shard of Orrivane’s hidden might reborn in mortal hands.`,
    `The winds carried whispers of success before ${hero} appeared, the ${item} gleaming like bottled lightning.`,
    `${hero} returns from perilous lands, the ${item} in hand — proof that the old powers still stir.`,
    `By wit and will, ${hero} secured the ${item}, a relic that hums in tune with Orrivane’s forgotten heart.`,
    `${hero} brings back the ${item}, its surface alive with shifting runes that fade when mortal eyes draw near.`,
  ];
  return getRandomElement(messages);
};

export const heroGainRelic = (hero: string, relic: TreasureType): string => {
  const messages = [
    `The world itself seemed to hold its breath as ${hero} emerged, the ${relic} pulsing with a light not seen since the Age of Dawning.`,
    `${hero} has returned bearing the ${relic} — a relic of such power that even the winds dared not speak its name aloud.`,
    `In the silence between thunder and dawn, ${hero} raised the ${relic}; Orrivane shuddered, remembering.`,
    `${hero} brings forth the ${relic}, its radiance cutting through the veil of ages — a gift and a warning from the old gods.`,
    `Legends stir anew: ${hero} has claimed the ${relic}, a relic once thought lost beyond time’s reach.`,
    `${hero} stands crowned by destiny, the ${relic} in hand — its presence alone warps the flow of mana around them.`,
    `When ${hero} found the ${relic}, the stars blinked — as if startled to see their reflection returned to earth.`,
    `${hero} returned from realms unknown, clutching the ${relic}; whispers say even death bowed aside to let them pass.`,
    `Songs will be sung of this day — ${hero} has unearthed the ${relic}, a relic whose name once shaped empires.`,
    `The earth trembled in quiet reverence as ${hero} revealed the ${relic}, and Orrivane’s ancient heart beat once more.`,
  ];
  return getRandomElement(messages);
};

export const emptyHanded = (hero: string): string => {
  const messages = [
    `${hero} returns weary and silent — no treasure in hand, yet the fire of resolve burns brighter in their eyes.`,
    `The road yielded no relics, only scars and wisdom. Still, ${hero} walks with the calm of one who has glimpsed truth.`,
    `${hero} returns with empty hands, but the weight of unseen battles clings to them like mist after rain.`,
    `Though fate offered no reward, ${hero} bears the mark of survival — and in Orrivane, that is gift enough.`,
    `The journey gave no gold nor glory, only echoes of what might have been — yet ${hero} endures, unbroken.`,
    `${hero} brings no prize from their quest, but in their silence hums the quiet strength of those who defied despair.`,
    `Not all journeys end in triumph. ${hero} returns without relic or tale, save the one their eyes can no longer tell.`,
    `The gods were silent this time. ${hero} returns with nothing but the dust of distant roads and a heart made heavier.`,
    `${hero} found no treasure in the ruins — only the understanding that some quests are meant to test, not reward.`,
    `No artifact shines in their grasp, yet ${hero} carries something rarer — the unspoken courage to begin again.`,
  ];
  return getRandomElement(messages);
};
