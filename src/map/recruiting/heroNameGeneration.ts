import { getRandomElement } from '../../domain/utils/random';
import { HeroUnitName } from '../../types/UnitType';
import type { HeroUnitType } from '../../types/UnitType';

const humanMaleNames: string[] = [
  'Cedric',
  'Rowan',
  'Gareth',
  'Edric',
  'Thorne',
  'Lucan',
  'Daren',
  'Corvin',
  'Maelor',
  'Roderic',
  'Eamon',
  'Halden',
  'Tristam',
  'Osric',
];
const humanFemaleNames: string[] = [
  'Isolde',
  'Lyria',
  'Maera',
  'Aveline',
  'Catrin',
  'Elora',
  'Brienne',
  'Talia',
  'Rowena',
  'Lysandra',
  'Miren',
  'Elys',
  'Serah',
  'Adela',
];
const humanSecondNames: string[] = [
  'Brightshield',
  'Ashborne',
  'Dawnhart',
  'Valeon',
  'Storme',
  'Halewyn',
  'Frostmere',
  'Blackwood',
  'Cinderval',
  'Ironhall',
  'Thorneveil',
  'Goldmere',
  'Fenwall',
  'Duskmoor',
  'Ravenfell',
];

const elfMaleNames: string[] = [
  'Aelir',
  'Thalor',
  'Eryndor',
  'Saelis',
  'Loryn',
  'Faelar',
  'Calen',
  'Tharion',
  'Ilendil',
  'Raevan',
  'Sylir',
  'Arannis',
  'Vael',
  'Lethar',
  'Coren',
];
const elfFemaleNames: string[] = [
  'Lythiel',
  'Aerya',
  'Thalara',
  'Eirwen',
  'Maelira',
  'Selis',
  'Nyara',
  'Ilanis',
  'Faenra',
  'Olyssia',
  'Thaera',
  'Liriel',
  'Vaena',
  'Essera',
  'Myrra',
];
const elfSecondNames: string[] = [
  'Silverbranch',
  'Moonveil',
  'Starleaf',
  'Windwhisper',
  'Thornsong',
  'Suncrest',
  'Faelora',
  'Dewstride',
  'Nightpetal',
  'Riverlight',
  'Shadowfern',
  'Dawnroot',
  'Lunevale',
  'Whispergrove',
  'Gladesong',
];

const dwarfMaleNames: string[] = [
  'Balric',
  'Grend',
  'Durn',
  'Korrim',
  'Haldrik',
  'Brom',
  'Edran',
  'Garrim',
  'Rurik',
  'Brann',
  'Dolm',
  'Keld',
  'Orin',
  'Sturgan',
];
const dwarfFemaleNames: string[] = [
  'Brynja',
  'Helda',
  'Thrainna',
  'Korga',
  'Dilda',
  'Merra',
  'Astrid',
  'Brunha',
  'Torra',
  'Eldra',
  'Grena',
  'Volda',
  'Raga',
  'Marn',
  'Hilda',
];

const dwarfSecondNames: string[] = [
  'Brightwood',
  'Dawnwood',
  'Frostwood',
  'Moonwood',
  'Starwood',
  'Whisperwood',
  'Frostleaf',
  'Moonleaf',
  'Starleaf',
  'Stonebeard',
  'Deepdelve',
  'Emberhall',
  'Runebreaker',
  'Anvilmark',
  'Goldgrip',
];

const ogrMaleNames: string[] = [
  'Gor',
  'Thrak',
  'Uld',
  'Brak',
  'Mok',
  'Zarg',
  'Korr',
  'Drok',
  'Harg',
  'Ugar',
  'Varn',
  'Rok',
  'Dush',
  'Grath',
  'Zog',
];
const ogrFemaleNames: string[] = [
  'Ulza',
  'Kraga',
  'Mura',
  'Drasha',
  'Vorna',
  'Zura',
  'Orsha',
  'Garka',
  'Lurn',
  'Branna',
  'Skara',
  'Vorga',
  'Narka',
  'Trul',
  'Ozma',
];

const ogrSecondNames: string[] = [
  'Bloodfang',
  'Bonebreaker',
  'Skarnash',
  'Doomhide',
  'Ironmaw',
  'Goretusk',
  'Warshard',
  'Blackspine',
  'Skullrend',
  'Ashfang',
  'Stormclaw',
  'Brimhide',
  'Firemaw',
  'Helltide',
  'Foeskull',
];

// Lore-wise, Undead names are not given — they emerge like whispers in the dark mana currents.
// These names are typically single, harsh, and echo-like — Zerath, Vhailen, Odriss, Nymora — as if incomplete memories of who they once were.
const undeadNames: string[] = [
  'Zerath',
  'Nymora',
  'Odriss',
  'Vhailen',
  'Kaelth',
  'Morwen',
  'Serris',
  'Draen',
  'Velith',
  'Luthra',
  'Enkar',
  'Myrr',
  'Zhaed',
  'Korrun',
  'Thessa',
];
// undead names are not used for now will be used in future when hero converted to undead
// the message like "“The soul of ${hero.name} has been unbound and reborn as ${newName}, a shadow of its former glory.”
// or “${hero.name} was claimed by shadow and reborn as ${newName}, their former self but a whisper in the void.”
// could be used to show the new name of the undead hero
export const generateUndeadName = (): string => {
  return getRandomElement(undeadNames);
};

const generateHumanName = () => {
  const maleFemale = getRandomElement(['male', 'female']);
  const firstName = getRandomElement(maleFemale === 'male' ? humanMaleNames : humanFemaleNames);
  const lastName = getRandomElement(humanSecondNames);
  return `${firstName} ${lastName}`;
};

const generateElfName = () => {
  const maleFemale = getRandomElement(['male', 'female']);
  const firstName = getRandomElement(maleFemale === 'male' ? elfMaleNames : elfFemaleNames);
  const lastName = getRandomElement(elfSecondNames);
  return `${firstName} ${lastName}`;
};

const generateDwarfName = () => {
  const maleFemale = getRandomElement(['male', 'female']);
  const firstName = getRandomElement(maleFemale === 'male' ? dwarfMaleNames : dwarfFemaleNames);
  const lastName = getRandomElement(dwarfSecondNames);
  return `${firstName} ${lastName}`;
};

const generateOgrName = () => {
  const maleFemale = getRandomElement(['male', 'female']);
  const firstName = getRandomElement(maleFemale === 'male' ? ogrMaleNames : ogrFemaleNames);
  const lastName = getRandomElement(ogrSecondNames);
  return `${firstName} ${lastName}`;
};

export const generateHeroName = (unitType: HeroUnitType): string => {
  switch (unitType) {
    case HeroUnitName.FIGHTER:
      return generateHumanName();
    case HeroUnitName.HAMMER_LORD:
      return generateDwarfName();
    case HeroUnitName.OGR:
      return generateOgrName();
    case HeroUnitName.RANGER:
      return generateElfName();
    case HeroUnitName.PYROMANCER:
      return generateOgrName();
    case HeroUnitName.CLERIC:
      return generateHumanName();
    case HeroUnitName.DRUID:
      if (Math.random() < 0.5) {
        return generateHumanName();
      }
      return generateElfName();
    case HeroUnitName.ENCHANTER:
      if (Math.random() < 0.5) {
        return generateHumanName();
      }
      return generateDwarfName();
    case HeroUnitName.NECROMANCER:
      switch (getRandomElement(['human', 'elf', 'dwarf', 'ogr'])) {
        case 'human':
          return generateHumanName();
        case 'elf':
          return generateElfName();
        case 'dwarf':
          return generateDwarfName();
        case 'ogr':
          return generateOgrName();
      }
  }
  return generateOgrName();
};
