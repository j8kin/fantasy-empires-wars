import { Artifact, Item } from '../../types/Treasures';

export const heroDieMessage = (name: string): string => {
  const messageId = Math.floor(Math.random() * 8);
  switch (messageId) {
    case 0:
      return `Hero ${name} ventured beyond the known paths of Orrivane and did not return.`;
    case 1:
      return `Hero ${name} was lost to the mists of fate — their story ends where legends begin.`;
    case 2:
      return `Hero ${name} vanished upon the quest, their fate whispered only by the winds.`;
    case 3:
      return `Hero ${name} did not return from the quest; Orrivane itself has claimed their spirit.`;
    case 4:
      return `Hero ${name} walked into the unknown and became one with the tales of old.`;
    case 5:
      return `Hero ${name} has not returned. Some say the land remembers their name in silence.`;
    case 6:
      return `Hero ${name} was swallowed by destiny’s shadow — only echoes remain.`;
    default:
      return `Hero ${name} set forth seeking glory, but the realm offered only silence in return.`;
  }
};

export const heroGainArtifact = (hero: string, artifact: Artifact): string => {
  const messageId = Math.floor(Math.random() * 10);
  switch (messageId) {
    case 0:
      return `${hero} returns from the veil of peril, their hands clasping the fabled '${artifact.id}' +${artifact.level} , as if Orrivane itself deemed them worthy.`;
    case 1:
      return `From shadow and ruin, ${hero} emerges bearing '${artifact.id}' +${artifact.level} — a token of power earned in silence and blood.`;
    case 2:
      return `Whispers spread through the realm: ${hero} has returned, carrying the '${artifact.id}' +${artifact.level}, its glow still echoing the trials endured.`;
    case 3:
      return `The winds speak of ${hero}’s triumph — they have brought back '${artifact.id}' +${artifact.level}, a relic once thought lost to myth.`;
    case 4:
      return `When all had forsaken hope, ${hero} stepped forth, clutching the '${artifact.id}' +${artifact.level}, eyes alight with quiet victory.`;
    case 5:
      return `${hero} returns from lands beyond sight, their soul tempered and their prize — '${artifact.id}' +${artifact.level} — gleaming with otherworldly grace.`;
    case 6:
      return `The stars themselves seemed to bend as ${hero} emerged from the unknown, the '${artifact.id}' +${artifact.level} resting like a promise in their grasp.`;
    case 7:
      return `${hero}’s journey has scarred and sanctified them alike — now they bear '${artifact.id}' +${artifact.level}, and the realm shall not forget.`;
    case 8:
      return `They said none would return, yet ${hero} walks again beneath the sun, the '${artifact.id}' +${artifact.level} singing softly of forgotten gods.`;
    default:
      return `From the mists of peril, ${hero} reappears. In their grasp, the '${artifact.id}' +${artifact.level} — proof that fate still honors the bold.`;
  }
};

export const heroGainItem = (hero: string, item: Item): string => {
  const messageId = Math.floor(Math.random() * 10);
  switch (messageId) {
    case 0:
      return `From shadow and storm, ${hero} returns — the ${item.id} glimmering faintly, as if it remembers its former master.`;
    case 1:
      return `${hero} emerges from the wilds, clutching the ${item.id} — a relic humming softly with untamed power.`;
    case 2:
      return `The quest bore fruit: ${hero} now wields the ${item.id}, a prize wrested from forgotten hands.`;
    case 3:
      return `${hero} walks back beneath dim skies, the ${item.id} whispering secrets of ancient magic.`;
    case 4:
      return `Few have seen such fortune — ${hero} returns bearing the ${item.id}, its glow a quiet promise of destiny.`;
    case 5:
      return `${hero} claims the ${item.id}, a shard of Orrivane’s hidden might reborn in mortal hands.`;
    case 6:
      return `The winds carried whispers of success before ${hero} appeared, the ${item.id} gleaming like bottled lightning.`;
    case 7:
      return `${hero} returns from perilous lands, the ${item.id} in hand — proof that the old powers still stir.`;
    case 8:
      return `By wit and will, ${hero} secured the ${item.id}, a relic that hums in tune with Orrivane’s forgotten heart.`;
    default:
      return `${hero} brings back the ${item.id}, its surface alive with shifting runes that fade when mortal eyes draw near.`;
  }
};

export const heroGainRelic = (hero: string, relic: Item): string => {
  const messageId = Math.floor(Math.random() * 10);
  switch (messageId) {
    case 0:
      return `The world itself seemed to hold its breath as ${hero} emerged, the ${relic.id} pulsing with a light not seen since the Age of Dawning.`;
    case 1:
      return `${hero} has returned bearing the ${relic.id} — a relic of such power that even the winds dared not speak its name aloud.`;
    case 2:
      return `In the silence between thunder and dawn, ${hero} raised the ${relic.id}; Orrivane shuddered, remembering.`;
    case 3:
      return `${hero} brings forth the ${relic.id}, its radiance cutting through the veil of ages — a gift and a warning from the old gods.`;
    case 4:
      return `Legends stir anew: ${hero} has claimed the ${relic.id}, a relic once thought lost beyond time’s reach.`;
    case 5:
      return `${hero} stands crowned by destiny, the ${relic.id} in hand — its presence alone warps the flow of mana around them.`;
    case 6:
      return `When ${hero} found the ${relic.id}, the stars blinked — as if startled to see their reflection returned to earth.`;
    case 7:
      return `${hero} returned from realms unknown, clutching the ${relic.id}; whispers say even death bowed aside to let them pass.`;
    case 8:
      return `Songs will be sung of this day — ${hero} has unearthed the ${relic.id}, a relic whose name once shaped empires.`;
    default:
      return `The earth trembled in quiet reverence as ${hero} revealed the ${relic.id}, and Orrivane’s ancient heart beat once more.`;
  }
};

export const emptyHanded = (hero: string): string => {
  const messageId = Math.floor(Math.random() * 10);
  switch (messageId) {
    case 0:
      return `${hero} returns weary and silent — no treasure in hand, yet the fire of resolve burns brighter in their eyes.`;
    case 1:
      return `The road yielded no relics, only scars and wisdom. Still, ${hero} walks with the calm of one who has glimpsed truth.`;
    case 2:
      return `${hero} returns with empty hands, but the weight of unseen battles clings to them like mist after rain.`;
    case 3:
      return `Though fate offered no reward, ${hero} bears the mark of survival — and in Orrivane, that is gift enough.`;
    case 4:
      return `The journey gave no gold nor glory, only echoes of what might have been — yet ${hero} endures, unbroken.`;
    case 5:
      return `${hero} brings no prize from their quest, but in their silence hums the quiet strength of those who defied despair.`;
    case 6:
      return `Not all journeys end in triumph. ${hero} returns without relic or tale, save the one their eyes can no longer tell.`;
    case 7:
      return `The gods were silent this time. ${hero} returns with nothing but the dust of distant roads and a heart made heavier.`;
    case 8:
      return `${hero} found no treasure in the ruins — only the understanding that some quests are meant to test, not reward.`;
    default:
      return `No artifact shines in their grasp, yet ${hero} carries something rarer — the unspoken courage to begin again.`;
  }
};
