import type { QuestType, Quest } from '../../types/Quest';

const ALL_QUESTS: Quest[] = [
  {
    id: 'The Echoing Ruins',
    level: 1,
    length: 4,
    description:
      'Whispers of lost ages linger among crumbling halls where the past refuses to rest.',
  },
  {
    id: 'The Whispering Grove',
    level: 2,
    length: 5,
    description: 'Roots drink old blood as the wind recalls names the forest swore to forget.',
  },
  {
    id: 'The Abyssal Crypt',
    level: 3,
    length: 6,
    description:
      'Shadows coil beneath the earth, guarding the silence of those who should not wake.',
  },
  {
    id: 'The Shattered Sky',
    level: 4,
    length: 7,
    description:
      'The heavens cracked once, and from the wound still seeps the color of forgotten light.',
  },
];

/**
 * Maps quest level (1-4) to quest type name
 * @param questLevel - The level of the quest
 * @returns The corresponding quest type
 */
export const getQuestType = (questLevel: number): QuestType => {
  return ALL_QUESTS.find((q) => q.level === questLevel)?.id || ALL_QUESTS[0].id;
};

/**
 * Retrieves full quest data by quest type
 * @param questType - The type of quest to retrieve
 * @returns Complete quest data including level, length, and description
 */
export const getQuest = (questType: QuestType): Quest =>
  ALL_QUESTS.find((q) => q.id === questType) || ALL_QUESTS[0];

/**
 * Returns all available quests
 * @returns Array of all quest configurations
 */
export const getAllQuests = (): Quest[] => ALL_QUESTS;
