# Fantasy Empires Wars — Game Specification

> Version: 1.0 (March 2026)
> Status: Current implementation documented + planned Phaser migration + RTS Battles roadmap

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Game Entities & Data Models](#3-game-entities--data-models)
4. [Game Mechanics](#4-game-mechanics)
5. [Map & Terrain](#5-map--terrain)
6. [Combat & Battle System](#6-combat--battle-system)
7. [Magic System](#7-magic-system)
8. [Economy & Resources](#8-economy--resources)
9. [Diplomacy System](#9-diplomacy-system)
10. [Quests & Treasures](#10-quests--treasures)
11. [AI System](#11-ai-system)
12. [Architecture Overview](#12-architecture-overview)
13. [UI & UX](#13-ui--ux)
14. [Migration Plan: Phaser.io](#14-migration-plan-phaserio)
15. [Planned Feature: RTS Battles](#15-planned-feature-rts-battles)

---

## 1. Overview

**Fantasy Empires Wars** is a browser-based, turn-based fantasy strategy game. Multiple players (human or AI) build
empires on a hexagonal map, recruit armies, cast spells, construct buildings, and compete for territorial control.

### 1.1 Core Game Loop

```
Turn Start
  ├── Income collected
  ├── Mana generated
  ├── Effects decremented
  ├── Recruits completed
  └── Attrition applied

Player's Main Turn (human only)
  ├── Move armies
  ├── Cast spells
  ├── Recruit units
  ├── Construct buildings
  ├── Send heroes on quests
  └── Manage diplomacy

Turn End
  ├── Army movement completed
  ├── Battle resolution
  ├── Land ownership updated
  └── Next player activated
```

### 1.2 Victory Conditions

- **Domination**: Eliminate all opposing strongholds.
- _(Future)_ **Score Victory**: Highest score after N turns.

### 1.3 Game Scale

| Setting        | Value                       |
|----------------|-----------------------------|
| Players        | 2–8                         |
| Map sizes      | 10×10 / 15×15 / 20×20 hexes |
| Max turns      | Unlimited (until victory)   |
| Mana colors    | 5                           |
| Spell count    | 20                          |
| Unit types     | 23 (12 regular + 11 hero)   |
| Building types | 7                           |
| Treasure types | 19                          |

---

## 2. Technology Stack

### 2.1 Current Stack

| Layer        | Technology                   | Version     |
|--------------|------------------------------|-------------|
| UI Framework | React                        | 19.x        |
| Language     | TypeScript                   | 5.9.x       |
| Build Tool   | React Scripts (CRA)          | 5.x         |
| UI Library   | React Bootstrap              | 2.7.x       |
| State Mgmt   | React Context API            | —           |
| Animations   | React PageFlip               | 2.0.x       |
| IDs          | UUID                         | 13.x        |
| Testing      | Jest + React Testing Library | 30.x / 16.x |
| Deployment   | GitHub Pages                 | —           |

### 2.2 Planned Stack (Post-Phaser Migration)

| Layer            | Technology        | Notes                           |
|------------------|-------------------|---------------------------------|
| Game Renderer    | Phaser 3          | Replaces CSS hex grid           |
| UI Overlay       | React (DOM layer) | Dialogs, panels remain in React |
| State Mgmt       | React Context API | Unchanged                       |
| RTS Battle Scene | Phaser Scene      | New separate battle module      |
| Build Tool       | Vite              | Replaces CRA for better perf    |

---

## 3. Game Entities & Data Models

### 3.1 GameState (Root)

```typescript
interface GameState {
    map: MapState;
    players: PlayerState[];
    armies: ArmyState[];
    turn: number;
    turnOwner: string;        // Player ID
    turnPhase: TurnPhaseType; // START | MAIN | END
}
```

### 3.2 Player

```typescript
interface PlayerState {
    id: string;                       // UUID
    playerType: 'human' | 'computer';
    playerProfile: PlayerProfile;
    color: PlayerColor;
    vault: number;                    // Gold
    mana: Mana;                       // 5-color mana pools
    effects: Effect[];
    traits: PlayerTraits;
    diplomacy: Record<string, DiplomacyState>;
    empireTreasures: TreasureType[];
    quests: QuestState[];
    landsOwned: LandPosition[];
}

interface PlayerProfile {
    name: string;
    race: Race;                       // Human | Elf | Dwarf | Orc | Undead
    alignment: Alignment;             // Lawful | Neutral | Chaotic
    heroType: HeroUnitType;
    doctrine: Doctrine;               // See §3.2.1
}
```

#### 3.2.1 Doctrines

| Doctrine   | Description                                 | Restriction       |
|------------|---------------------------------------------|-------------------|
| Melee      | Regular army + magic support                | None              |
| Magic      | Mage-heavy + regular support                | None              |
| Anti-Magic | No magic recruitment or casting             | No mage heroes    |
| Pure Magic | Magic units only                            | No regular units  |
| Driven     | Undead/golem focus (requires Warsmith hero) | Requires Warsmith |

#### 3.2.2 Alignments

| Alignment | Character                   | Effect                                |
|-----------|-----------------------------|---------------------------------------|
| Lawful    | Order, strict code of honor | Bonus defense; restricted chaos units |
| Neutral   | Balanced                    | No bonuses/restrictions               |
| Chaotic   | Unpredictable, freedom      | Bonus attack; restricted lawful units |

### 3.3 Map

```typescript
interface MapState {
    dimensions: MapDimensions; // rows × cols
    lands: LandState[][];
}

interface LandState {
    type: LandType;
    mapPos: LandPosition;       // { row, col }
    goldPerTurn: number;        // 350–1150
    buildings: BuildingState[];
    effects: Effect[];
    corrupted: boolean;         // Permanent black mana flag
}
```

### 3.4 Army

```typescript
interface ArmyState {
    id: string;
    ownerId: string;            // Player ID
    position: LandPosition;
    heroes: HeroState[];
    regulars: RegularsState[];
    warMachines: WarMachineState[];
    movement: MovementState;
    effects: Effect[];
}
```

### 3.5 Hero

```typescript
interface HeroState {
    type: HeroUnitType;
    name: string;
    level: number;              // 1–32
    combatStats: CombatStats;
    mana?: ManaProduction;      // Only mage heroes
    cost: number;               // Maintenance per turn
    artifacts: TreasureType[];  // Max 1 per hero (currently)
}

interface CombatStats {
    attack: number;
    defense: number;
    health: number;
    speed: number;
    range?: number;
    rangeDamage?: number;
}
```

### 3.6 Regular Unit

```typescript
interface RegularsState {
    type: RegularUnitType;
    rank: Rank;                 // Regular | Veteran | Elite
    count: number;
}
```

#### Rank Bonuses & Attrition

| Rank    | Stat Bonus | Attrition / Distance | Durability |
|---------|------------|----------------------|------------|
| Regular | None       | 10%                  | 1×         |
| Veteran | +50%       | 7%                   | 2×         |
| Elite   | +100%      | 5%                   | 4×         |

### 3.7 War Machines

| Type          | Role             |
|---------------|------------------|
| Ballista      | Ranged damage    |
| Catapult      | Siege / AoE      |
| Battering Ram | Gate/wall breach |
| Siege Tower   | Wall assault     |

### 3.8 Building

```typescript
interface BuildingState {
    type: BuildingType;
    position: LandPosition;
    recruitmentSlots: RecruitmentSlot[];
}
```

#### Building Catalogue

| Building    | Cost    | Maintenance | Purpose                       |
|-------------|---------|-------------|-------------------------------|
| Stronghold  | 15,000g | 0           | Base; army protection; income |
| Barracks    | 10,000g | 1,000g/turn | Regular unit recruitment      |
| Mage Tower  | 15,000g | 2,000g/turn | Mage hero recruitment         |
| Watch Tower | 5,000g  | 300g/turn   | Visibility / early warning    |
| Outpost     | 10,000g | 1,000g/turn | Defense radius 4              |
| Castle Wall | 5,000g  | 100g/turn   | Defense bonuses               |
| Demolition  | 2,000g  | 0           | Remove existing buildings     |

---

## 4. Game Mechanics

### 4.1 Turn Phases

```
START  →  MAIN (human only)  →  END
```

**START Phase (automated):**

1. Gold income calculated → added to vault
2. Mana produced by heroes → added to pool
3. Quest completion checked → rewards given
4. Recruitment slots tick → completed units spawned
5. Same-position armies merged
6. Attrition penalties applied
7. Land ownership resolved
8. Effect durations decremented

> _Turn 1 is special: MAIN phase is skipped for all players. Players are placed on the map and turns end immediately._

**MAIN Phase (human players only):**
Player freely performs any combination of:

- Move army (select land tile → select destination)
- Cast spell
- Recruit unit (via building dialog)
- Construct building
- Send hero on quest
- Open diplomacy dialog
- End Turn (mandatory to proceed)

**END Phase (automated):**

1. All queued army movements completed
2. Battles resolved (see §6)
3. Land ownership updated
4. Turn counter advanced
5. Next player's START phase begins

### 4.2 Movement

- Movement range is limited by army speed (slowest unit determines range)
- Attrition applies to armies that venture far from realm:
    - Max safe distance: 4 hexes from homeland
    - Each additional hex triggers % troop loss based on rank (see §3.6)
- Armies at the same position after movement are merged automatically

### 4.3 Recruitment

- Requires appropriate building (Barracks for regulars, Mage Tower for mage heroes)
- Land type restricts available units
- Doctrine restricts available unit categories
- Alignment affects hero availability
- Completion is queued (multi-turn); completed units join the nearest army at building location

### 4.4 Attrition

Calculated at START of each turn:

```
attrition_loss = unit_count × attrition_rate × max(0, distance - 4)
```

Where `attrition_rate` = 10% / 7% / 5% for Regular / Veteran / Elite.

---

## 5. Map & Terrain

### 5.1 Hex Grid Layout

- **Orientation**: Pointy-top hexagons
- **Offset**: Even rows shifted by 0.5 tile width
- **Overlap**: 25% vertical overlap between rows
- **Coordinates**: `{ row, col }` system

### 5.2 Land Types & Properties

#### Standard Terrains

| Land Type    | Alignment | Gold Range | Key Recruits (Driven unit in parentheses)                                     |
|--------------|-----------|------------|-------------------------------------------------------------------------------|
| Plains       | Neutral   | 650–1,000g | Ward-hands, Warrior, (Golem), war machines, Fighter, all mage heroes          |
| Mountains    | Lawful    | 900–1,150g | Ward-hands, Dwarf, (Gargoyle), war machines, Hammer-Lord, all mage heroes     |
| Green Forest | Lawful    | 800–950g   | Ward-hands, Elf, (Dendrite), war machines, Ranger, all mage heroes            |
| Dark Forest  | Chaotic   | 800–950g   | Ward-hands, Dark-Elf, (Dendrite), war machines, Shadow Blade, all mage heroes |
| Hills        | Neutral   | 500–700g   | Ward-hands, Halfling, (Gargoyle), war machines, Fighter, all mage heroes      |
| Swamp        | Chaotic   | 350–550g   | Ward-hands, Orc, (Golem), war machines, Ogr, all mage heroes                  |
| Desert       | Neutral   | 150–270g   | Ward-hands, Golem, Battering Ram only, all might heroes (no mage heroes)      |

#### Special/Sacred Terrains

| Land Type       | Alignment | Gold Range     | Key Recruits (Driven unit in parentheses)                                            |
|-----------------|-----------|----------------|--------------------------------------------------------------------------------------|
| Sun Spire Peaks | Lawful    | 1,000g (fixed) | Ward-hands, Dwarf, (Gargoyle), war machines, Hammer-Lord, Cleric                     |
| Golden Plains   | Lawful    | 500–600g       | Ward-hands, Warrior, Dwarf, (Golem), war machines, Fighter, Cleric, Druid, Enchanter |
| Heartwood Grove | Lawful    | 1,000g (fixed) | Ward-hands, Elf, (Dendrite), war machines, Ranger, Druid                             |
| Verdant Glade   | Lawful    | 500–600g       | Ward-hands, Elf, (Dendrite), war machines, Ranger, Cleric, Druid, Enchanter          |
| Crystal Basin   | Neutral   | 1,000g (fixed) | Ward-hands, Warrior, (Golem), war machines, Fighter, Enchanter                       |
| Misty Glades    | Neutral   | 500–600g       | Ward-hands, Warrior, (Golem), war machines, Fighter, Druid, Enchanter, Pyromancer    |
| Volcano         | Chaotic   | 1,000g (fixed) | Ward-hands, Orc, (Gargoyle), war machines, Ogr, Pyromancer                           |
| Lava            | Chaotic   | 500–600g       | Ward-hands, Orc, (Gargoyle), war machines, Ogr, Enchanter, Pyromancer, Necromancer   |
| Shadow Mire     | Chaotic   | 1,000g (fixed) | Ward-hands, Orc, (Golem), war machines, Ogr, Necromancer                             |
| Blighted Fen    | Chaotic   | 500–600g       | Ward-hands, Orc, (Golem), war machines, Ogr, Enchanter, Pyromancer, Necromancer      |

> Driven doctrine units (Golem, Gargoyle, Dendrite) are only available when the player uses the Driven doctrine.

#### Corrupted Lands

When a land is permanently corrupted (Black magic Corruption spell), its recruitment list is replaced with:

- Orc, all war machines, Ogr, all mage heroes
- Exception: corrupted Green Forest also allows Dark-Elf and Shadow Blade

#### Land Lore

| Land Type       | Description                                                                                         |
|-----------------|-----------------------------------------------------------------------------------------------------|
| Plains          | Wide open fields where wind carries old war songs, and wanderers vanish beneath endless sky.        |
| Mountains       | Stone giants forged in ancient upheaval; their frozen peaks guard secrets older than kingdoms.      |
| Green Forest    | Sunlit woods where gentle spirits linger, guiding hunters, wanderers, and the lost.                 |
| Dark Forest     | A brooding woodland where moonlight falters, and unseen things watch from between twisted boughs.   |
| Hills           | Rolling highlands shaped by time and storms, favored by scouts who read stories in every ridge.     |
| Swamp           | Murk and moss entwine here, where each step sinks into whispers of forgotten, half-drowned tales.   |
| Desert          | Endless dunes scorched by merciless suns, hiding relics swallowed by empires long fallen.           |
| Sun Spire Peaks | Radiant heights bathed in celestial fire, said to echo with the hymns of the first dawn.            |
| Golden Plains   | Grasses shimmer like sun-forged metal, nurturing harvests blessed by the land's ancient warmth.     |
| Heartwood Grove | The cradle of living forests, where colossal trees whisper the pulse of Orrivane itself.            |
| Verdant Glade   | A lush sanctuary bursting with wild growth, where nature unfurls in joyous, untamed abundance.      |
| Crystal Basin   | A hollow of shimmering crystal veins that catch stray moonlight, bending it into spectral hues.     |
| Misty Glades    | Cool lowlands veiled in drifting blue mist, where sound softens and time feels strangely thin.      |
| Volcano         | A furious mountain whose molten heart roars beneath the world, hungry for offerings of stone.       |
| Lava            | A seething river of fire where earth's skin tears open, leaving only heat, ruin, and trembling air. |
| Shadow Mire     | A stagnant bog where shadows cling to the water, feeding on fear as readily as decay.               |
| Blighted Fen    | Rot-soaked marshland cursed by old sorcery, where every root and reed seems to wither in despair.   |

### 5.3 Land Ownership

- A land is owned by a player when their army is present or has captured it
- Ownership grants: gold per turn, building slots, recruitment access
- Land can be corrupted permanently (black magic) — changes recruitment pool, enables Summon Undead spell

---

## 6. Combat & Battle System

### 6.1 Current State

The battle system is a **placeholder** — army presence changes land ownership, but no detailed tactical combat exists
yet.

### 6.2 Planned Automatic TBS Battle Resolution

All battles between AI players will be resolved without RTS Battle resolutional logic.
Battle between Humand and AI could be resolved without RTS battle if this option is selected.
Exact implementation: TBD

### 6.3 Planned RTS Battle System (Post-Phaser Migration)

See §15 for the full RTS Battle specification.

---

## 7. Magic System

### 7.1 Mana Colors

| Color | Theme                       | Primary Hero | Max Pool |
|-------|-----------------------------|--------------|----------|
| White | Healing, protection, light  | Cleric       | 200      |
| Blue  | Illusion, teleport, control | Enchanter    | 200      |
| Black | Corruption, undead, death   | Necromancer  | 200      |
| Red   | Fire, destruction, chaos    | Pyromancer   | 200      |
| Green | Nature, growth, beasts      | Druid        | 200      |

### 7.2 Mana Generation

- Mage heroes produce mana per turn based on hero type
- Land type and alignment modulate production rates
- Doctrine determines which mana colors a player can accumulate

### 7.3 Spell Catalogue

#### White Magic

| Spell          | Cost | Duration | Effect                          |
|----------------|------|----------|---------------------------------|
| Turn Undead    | 0    | Instant  | Damage undead on opponent land  |
| View Territory | 25   | 1 turn   | Reveal full info of target land |
| Blessing       | 40   | 3 turns  | +20% defense on target land     |
| Heal           | 60   | Instant  | Restore 20–30% casualties       |

#### Blue Magic

| Spell    | Cost | Duration | Effect                                    |
|----------|------|----------|-------------------------------------------|
| Illusion | 25   | 3 turns  | Conceal territory from opponents          |
| Teleport | 45   | Instant  | Move own army to nearest stronghold       |
| Tornado  | 50   | Instant  | Kill 20–35% troops on target land         |
| Exchange | 100  | Instant  | Convert 100 Blue → other mana (penalized) |

#### Green Magic

| Spell            | Cost | Duration | Effect                                                      |
|------------------|------|----------|-------------------------------------------------------------|
| Fertile Land     | 40   | 2 turns  | +50% gold production on lands in radius 1                   |
| Entangling Roots | 60   | 1 turn   | Enemy army on territory cannot move for 1 turn              |
| Beast Attack     | 70   | Instant  | Kill 15–25% of all troops (heroes may be killed by level)   |
| Earthquake       | 100  | Instant  | Kill 10–20% of all troops; 40% chance to destroy a building |

#### Red Magic

| Spell         | Cost | Duration | Effect                                                                                                 |
|---------------|------|----------|--------------------------------------------------------------------------------------------------------|
| Ember Raid    | 30   | 3 turns  | Sabotages enemy recruitment: +1 turn to ongoing training; blocks re-cast on same territory for 3 turns |
| Forge of War  | 50   | Instant  | Instantly recruits a pack of a unique unit type available on the target territory                      |
| Firestorm     | 100  | Instant  | Damages troops on all lands in radius 1 by 15–20% each                                                 |
| Meteor Shower | 150  | Instant  | Kill 35–45% of all troops; 50% chance to destroy a building                                            |

#### Black Magic

| Spell           | Cost | Duration  | Effect                                                                              |
|-----------------|------|-----------|-------------------------------------------------------------------------------------|
| Summon Undead   | 25   | Instant   | Creates 30–60 undead troops (count scales with max Necromancer level)               |
| Plague          | 75   | Instant   | Kill 25–40% of all troops (heroes may be killed by level)                           |
| Raise Dead Hero | 100  | Instant   | Revives a fallen hero as an Undead Hero (loses original alignment)                  |
| Corruption      | 150  | Permanent | Converts a neutral land (no stronghold) into chaotic corrupted land; max 6 per game |

### 7.4 Effect System

```typescript
interface Effect {
    id: string;
    sourceId: SpellType | TreasureType;
    appliedBy: string;          // Player ID
    rules: {
        type: 'positive' | 'negative' | 'permanent';
        target: 'player' | 'army' | 'land';
        duration: number;         // Turns remaining; 0 = immediate
    };
}
```

Effects stack on their target and are decremented each START phase.

---

## 8. Economy & Resources

### 8.1 Gold

**Income per turn:**

```
net_income = sum(goldPerTurn for owned lands)
           + bonuses (Banner of Unity +25%)
           - penalties (Obsidian Chalice -10%)
           - building maintenance
           - unit maintenance
```

Gold income begins on Turn 3 (turns 1–2 are setup turns).

### 8.2 Unit Maintenance Costs

- Each hero has a `cost` in gold per turn
- Regular units and war machines also have maintenance
- Deficit vaults cause units to disband (TODO: implement)

### 8.3 Mana Economy

| Action                 | Mana Change                                           |
|------------------------|-------------------------------------------------------|
| Hero produces mana     | +N per matching color per turn                        |
| Cast spell             | −[spell cost] from matching color pool                |
| Arcane Exchange        | −100 Blue mana → +other color mana (penalized rate)   |
| Obsidian Chalice relic | −10% gold income per turn → +0.1% Black mana per turn |

---

## 9. Diplomacy System

### 9.1 States

| Status    | Description                                   |
|-----------|-----------------------------------------------|
| No Treaty | Initial state; no obligations                 |
| Peace     | Non-aggression pact; cannot attack each other |
| War       | Active conflict; can attack freely            |
| Alliance  | Mutual defense; shared visibility (future)    |

### 9.2 Data Model

```typescript
interface DiplomacyState {
    status: DiplomacyType;
    lastUpdated: number;        // Turn number
}
```

Relations are tracked per player pair. Changing status has turn-based cooldown (future).

---

## 10. Quests & Treasures

### 10.1 Quest Definitions

| Quest                | Level | Duration (turns) | Lore                                                                                   |
|----------------------|-------|------------------|----------------------------------------------------------------------------------------|
| The Echoing Ruins    | 1     | 4                | Whispers of lost ages linger among crumbling halls where the past refuses to rest.     |
| The Whispering Grove | 2     | 5                | Roots drink old blood as the wind recalls names the forest swore to forget.            |
| The Abyssal Crypt    | 3     | 6                | Shadows coil beneath the earth, guarding the silence of those who should not wake.     |
| The Shattered Sky    | 4     | 7                | The heavens cracked once, and from the wound still seeps the color of forgotten light. |

### 10.2 Quest Mechanics

**How to start a quest:**

- Send a hero from an army on any land you control
- Hero leaves the army and is unavailable for `length` turns

**Survival check:**

At quest completion the hero must pass a survival roll:

```
survival_chance = 80% + (hero.level − 1 − (quest.level − 1) × 5) × 5%
```

A level 1 hero on a level-1 quest has an 80% survival rate.
Higher hero level relative to quest level improves odds; under-levelled heroes face reduced survival.

**Reward conditions (both must hold):**

1. Hero passes survival check
2. Player still owns the land where the quest started

**Reward probability (chance to receive any reward):**

| Quest Level | Reward Chance | Empty-Handed |
|-------------|---------------|--------------|
| 1           | 55%           | 45%          |
| 2           | 50%           | 50%          |
| 3           | 45%           | 55%          |
| 4           | 40%           | 60%          |

**Reward type distribution (when a reward is granted):**

| Quest                | Artifact | Item | Relic |
|----------------------|----------|------|-------|
| The Echoing Ruins    | 100%     | —    | —     |
| The Whispering Grove | 70%      | 30%  | —     |
| The Abyssal Crypt    | 45%      | 35%  | 20%   |
| The Shattered Sky    | —        | 60%  | 40%   |

Relic rewards respect player alignment and uniqueness — a relic already held by any player is not eligible.

**Artifact level range from quest:**

| Quest                | Artifact Level Range |
|----------------------|----------------------|
| The Echoing Ruins    | 1–3                  |
| The Whispering Grove | 2–4                  |
| The Abyssal Crypt    | 3–5                  |
| The Shattered Sky    | n/a                  |

**Hero leveling on completion:**

If the hero's level is below `quest.level × 5`, the hero is promoted to at minimum `(quest.level − 1) × 5`:

| Quest Level | Guaranteed Minimum Level |
|-------------|--------------------------|
| 1           | 0 (no guarantee)         |
| 2           | 5                        |
| 3           | 10                       |
| 4           | 15                       |

**On hero death:**

- Hero is permanently lost from the army
- Exception: if the player holds a **Mercy of Orrivane** item and the hero is level ≥ 10, the hero escapes to the
  nearest stronghold (Mercy of Orrivane is consumed)

**On completion:** Hero returns to the originating land — joining an existing stationed army or forming a new one.

### 10.3 Treasure Catalogue

There are three treasure categories. Relics and some artifacts are unique — only one player may hold a given relic at a
time.

#### Artifacts (Hero-equippable)

Artifacts attach to a hero found during quests. `hasLevel` artifacts have a bonus level; non-level ones are
permanent passive bonuses.

| Treasure                   | Has Level | Effect                             | Lore                                                                                    |
|----------------------------|-----------|------------------------------------|-----------------------------------------------------------------------------------------|
| Boots of the Windstrider   | No        | Increase movement speed            | Woven from feathers of sky-born eagles, they hum with the breath of dawn itself.        |
| Gauntlets of the Ironheart | Yes       | Increase attack                    | Forged in molten stone by dwarven ancestors, they pulse with the rhythm of war.         |
| Amulet of Serenity         | Yes       | Increase defense                   | A crystal of purest calm, reflecting peace even in the heart of battle.                 |
| Helm of Insight            | No        | Reveals terrain in radius 2        | Bestowed by elven seers to those deemed worthy to see what others fear.                 |
| Ring of the Ascendant      | No        | Hero gains +2 levels instead of +1 | Forged from starlight that fell into mortal hands; it awakens hidden potential.         |
| Cloak of Shadows           | No        | +20% chance to evade damage        | Crafted by unseen hands in the dark between worlds; the air bends to its wearer's will. |

#### Items (Map-usable, Empire inventory)

Items are held in the empire inventory and can be activated on the strategic map like spells, targeting player-owned or
opponent lands.

| Treasure            | Target   | Duration  | Effect                                                                                        |
|---------------------|----------|-----------|-----------------------------------------------------------------------------------------------|
| Wand of Turning     | Opponent | Instant   | Turns undead on the selected land                                                             |
| Orb of Storms       | Opponent | Instant   | Casts Tornado spell on target land                                                            |
| Seed of Renewal     | Player   | Instant   | Restores one destroyed building (including Stronghold on neutral land)                        |
| Aegis Shard         | Player   | Permanent | Negates the next hostile spell cast on one land                                               |
| Phoenix Feather     | Player   | Instant   | Revives a fallen hero once                                                                    |
| Glyph of Severance  | Player   | Instant   | Removes one negative effect from a land                                                       |
| Compass of Dominion | Opponent | 2 turns   | Reveals all lands owned by the target player for 2 turns                                      |
| Deed of Reclamation | Neutral  | Permanent | Claims a neutral land for income and mana (no military occupation)                            |
| Mercy of Orrivane   | Player   | Passive   | If a quest hero dies at level ≥ 10, hero escapes to stronghold instead; item is then consumed |
| Hourglass of Delay  | Opponent | 1 turn    | All armies on the target land cannot move for 1 turn                                          |

#### Relics (Permanent passive, empire-wide)

Relics are unique — once a relic is in play no other player can obtain the same one. Some relics have alignment
restrictions.

| Treasure                  | Alignment  | Effect                                                                             | Lore                                                                                              |
|---------------------------|------------|------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| Banner of Unity           | Any        | +25% income from all lands                                                         | An ancient symbol of peace that rallies hearts even in distant provinces.                         |
| Mirror of Illusion        | Any        | Enemies see false army information on your lands                                   | Once owned by Selene Duskwhisper; it reflects not truth but intention.                            |
| Crown of Dominion         | Any        | −15% building and recruitment cost empire-wide                                     | Worn by the first High King, its weight commands the land itself.                                 |
| Scepter of Tempests       | Any        | +25% spell damage                                                                  | The air crackles with the echo of thunder whenever it's raised.                                   |
| Obsidian Chalice          | Any        | Converts 10% of gold income into 0.1% Black mana per turn                          | Said to be carved from a meteor; it thirsts for both power and blood.                             |
| Starwell Prism            | Any        | Each offensive spell has 15% chance to automatically repeat on a nearby enemy land | Said to resonate with the afterglow of the first dawn, it repeats what has once been cast.        |
| Heartstone of Orrivane    | Mages only | +1 mana from the land's natural source for each controlled special land            | Pulses with the rhythm of the living world — the first heartbeat of creation.                     |
| Verdant Idol              | Any        | All Green Mana spells cost 15% less                                                | Covered in moss that never dies; druids whisper that it breathes.                                 |
| Shard of the Silent Anvil | Non-mages  | Reduces enemy spell damage against you by 35%; +10% army morale                    | Forged in defiance of the arcane, this iron shard hums with a stillness that smothers spellcraft. |

---

## 11. AI System

### 11.1 Current State

The AI system is a **stub** — computer players automatically end their turn after a 2-second delay with no strategic
decision-making.

### 11.2 Planned AI Behavior (Short Term)

Phase 1 — Basic Reactive AI:

- Random movement toward nearest enemy stronghold
- Spell casting when mana > threshold
- Recruitment when vault > threshold
- No diplomacy

Phase 2 — Strategic AI:

- Territory expansion priority scoring
- Economic decisions (building investment vs. military)
- Threat assessment per opponent
- Diplomatic posturing

---

## 12. Architecture Overview

### 12.1 Layer Diagram

```
┌─────────────────────────────────────────────────┐
│              React UI Layer                      │
│  MainView → Battlefield → Dialogs → Popups       │
├─────────────────────────────────────────────────┤
│              Context Layer                       │
│  GameContext (game state)                        │
│  ApplicationContext (UI state)                   │
├─────────────────────────────────────────────────┤
│              Systems Layer (pure functions)      │
│  armyActions / playerActions / effectActions     │
├─────────────────────────────────────────────────┤
│              Domain Layer                        │
│  Selectors → read state                          │
│  Factories → create entities                     │
│  Map/* → game logic (movement, spells, turns)    │
├─────────────────────────────────────────────────┤
│              State Layer                         │
│  GameState / PlayerState / ArmyState / MapState  │
└─────────────────────────────────────────────────┘
```

### 12.2 State Update Pattern

```
User Action
  → Selector reads current state
  → System function computes new state (pure)
  → Context dispatches new state
  → React re-renders affected components
```

### 12.3 Turn Management

`TurnManager` class orchestrates all phase transitions:

- Enforces valid transitions: START → MAIN → END → START
- Fires lifecycle callbacks (`onTurnPhaseChange`, `onGameOver`, etc.)
- Blocks invalid concurrent operations
- Drives computer player turns via `onComputerMainTurn`

### 12.4 Key Design Patterns

| Pattern          | Usage                                                  |
|------------------|--------------------------------------------------------|
| Factory          | `gameStateFactory`, `armyFactory`, `heroFactory`, etc. |
| Selector         | `armySelectors`, `landSelectors`, `playerSelectors`    |
| System           | `armyActions`, `playerActions`, `effectActions`        |
| Context          | GameContext, ApplicationContext                        |
| Immutable update | `Object.assign()` + spread for state changes           |

---

## 13. UI & UX

### 13.1 Visual Style

- Fantasy aesthetic with Celtic border decorations
- Hexagonal tile grid with pointy-top orientation
- Player-colored land ownership indicators
- Glow effects on selected tiles
- Book-flip animations for dialogs (React PageFlip)

### 13.2 Component Hierarchy

```
MainView
 ├── TopPanel (player info, turn button, mana vials)
 ├── Battlefield
 │    └── LandTile ×N (hex cells)
 │         └── LandInfoPopup (right-click context menu)
 ├── Dialogs (modal overlays)
 │    ├── NewGameDialog
 │    ├── MoveArmyDialog
 │    ├── RecruitArmyDialog
 │    ├── ConstructBuildingDialog
 │    ├── CastSpellDialog
 │    ├── SendHeroInQuestDialog
 │    ├── EmpireTreasureDialog
 │    ├── SelectOpponentDialog
 │    ├── DiplomacyContactDialog
 │    └── SaveGameDialog
 └── Popups (non-blocking notifications)
      ├── ProgressPopup
      ├── ErrorMessagePopup
      ├── RealmEventsPopup
      └── OpponentInfoPopup
```

### 13.3 Controls

- **Left-click tile**: Select land / open context actions
- **Right-click tile**: Open LandInfoPopup
- **End Turn button**: Advance to END phase
- **Keyboard**: Not yet mapped

---

## 14. Migration Plan: Phaser.io

### 14.1 Goals

- Replace CSS hex grid with a Phaser 3 `Scene` for rich visual rendering
- Maintain all React UI overlays (dialogs, panels, popups) unchanged
- Add sprite-based units, terrain textures, animations on the hex map
- Prepare rendering engine for RTS battle scenes (§15)

### 14.2 Architecture After Migration

```
┌───────────────────────────────────────────────────┐
│              React DOM Layer (unchanged)          │
│  TopPanel | Dialogs | Popups                      │
├───────────────────────────────────────────────────┤
│              Phaser Canvas (new)                  │
│  OverworldScene  ←→  GameContext (React)          │
│  BattleScene     ←→  BattleContext (new)          │
├───────────────────────────────────────────────────┤
│              Game Logic Layer (unchanged)         │
│  Systems | Selectors | Factories | Turn Manager   │
├───────────────────────────────────────────────────┤
│              State Layer (unchanged)              │
└───────────────────────────────────────────────────┘
```

### 14.3 Phaser Integration Strategy

#### Step 1: Scaffold Phaser alongside React

- Install `phaser` package
- Add `<canvas>` element alongside React root in `index.html`
- Initialise `Phaser.Game` instance inside a React `useEffect` with cleanup
- Pass `GameState` into Phaser via a shared reactive store (Zustand or Context bridge)

#### Step 2: Implement OverworldScene

Replace `Battlefield.tsx` + `LandTile.tsx` with a Phaser Scene:

```
OverworldScene
 ├── HexGrid (Tilemap or procedural graphics)
 │    └── HexCell objects with land type textures
 ├── ArmyLayer (sprites per army)
 ├── SelectionLayer (highlight + glow)
 └── UIBridge (emits events → React context)
```

Key interactions:

- Tile click → emit `TILE_SELECTED` event → React opens dialogs
- Army click → emit `ARMY_SELECTED` event → React shows army panel
- React dispatches action → Phaser scene re-renders via event listener

#### Step 3: Phaser-React Communication

```typescript
// React → Phaser
phaserEventBus.emit('STATE_UPDATE', newGameState);

// Phaser → React
phaserEventBus.on('TILE_CLICKED', (pos) => {
    setSelectedTile(pos); // React state update
});
```

Use a singleton `EventEmitter` (`phaserEventBus`) as the bridge.

#### Step 4: Asset Migration

- Replace CSS background colors with terrain sprite sheets
- Introduce avatar sprites for heroes on the map
- Building icons rendered as Phaser sprites on tile layer
- Animate army movement along paths

#### Step 5: Build Tool Migration (CRA → Vite)

- Migrate from `react-scripts` to `Vite` + `@vitejs/plugin-react`
- Phaser 3 works best with Vite (ESM-native, fast HMR)
- Update `tsconfig.json` target to ES2020+
- Update test runner to Vitest

### 14.4 Migration Checklist

- [ ] Install Phaser 3 (`phaser@^3.70`)
- [ ] Migrate build from CRA to Vite
- [ ] Create `PhaserGameInstance` React component
- [ ] Create `OverworldScene.ts` (Phaser Scene class)
- [ ] Create `phaserEventBus.ts` (singleton EventEmitter)
- [ ] Port `Battlefield.tsx` logic into `OverworldScene`
- [ ] Port `LandTile.tsx` rendering into hex grid drawing
- [ ] Add terrain sprite sheets to `src/assets/`
- [ ] Add army/hero sprites
- [ ] Implement path animation for army movement
- [ ] Wire tile selection back to React dialogs
- [ ] Remove React Bootstrap grid CSS for battlefield
- [ ] Verify all existing tests still pass
- [ ] Add Phaser scene unit tests (jest-canvas-mock)

---

## 15. Planned Feature: RTS Battles

See separate Spec file (TBD) for details.

---

## Appendix A: Unit Type Reference

### Regular Units

| Unit       | Doctrine                                   | Available On Land                                                                            |
|------------|--------------------------------------------|----------------------------------------------------------------------------------------------|
| Ward-hands | Any                                        | All lands                                                                                    |
| Warrior    | Any (non-Driven)                           | Plains, Golden Plains, Crystal Basin, Misty Glades                                           |
| Dwarf      | Any (non-Driven)                           | Mountains, Sun Spire Peaks, Golden Plains                                                    |
| Orc        | Any (non-Driven)                           | Swamp, Volcano, Lava, Shadow Mire, Blighted Fen; corrupted lands                             |
| Halfling   | Any (non-Driven)                           | Hills                                                                                        |
| Elf        | Any (non-Driven)                           | Green Forest, Heartwood Grove, Verdant Glade                                                 |
| Dark-Elf   | Any (non-Driven)                           | Dark Forest; corrupted Green Forest                                                          |
| Golem      | Driven only                                | Plains, Swamp, Desert, Golden Plains, Crystal Basin, Misty Glades, Shadow Mire, Blighted Fen |
| Gargoyle   | Driven only                                | Mountains, Hills, Sun Spire Peaks, Volcano, Lava                                             |
| Dendrite   | Driven only                                | Green Forest, Dark Forest, Heartwood Grove, Verdant Glade                                    |
| Undead     | **Spell only** (Black magic Summon Undead) | Cannot be recruited — created exclusively via the Summon Undead spell (25 Black mana)        |

### Hero Units

| Hero         | Type       | Mana  | Alignment | Recruitment       |
|--------------|------------|-------|-----------|-------------------|
| Fighter      | Non-mage   | None  | Any       | Barracks          |
| Hammer-Lord  | Non-mage   | White | Lawful    | Barracks          |
| Ranger       | Non-mage   | Green | Any       | Barracks          |
| Shadow Blade | Non-mage   | Black | Chaotic   | Barracks          |
| Ogr          | Non-mage   | Red   | Chaotic   | Barracks          |
| Pyromancer   | Mage       | Red   | Chaotic   | Mage Tower        |
| Cleric       | Mage       | White | Lawful    | Mage Tower        |
| Druid        | Mage       | Green | Neutral   | Mage Tower        |
| Enchanter    | Mage       | Blue  | Neutral   | Mage Tower        |
| Necromancer  | Mage       | Black | Chaotic   | Mage Tower        |
| Warsmith     | Anti-Magic | None  | Neutral   | Barracks (Driven) |

---

## Appendix B: Open Issues & TODOs

| ID  | Area      | Description                                     |
|-----|-----------|-------------------------------------------------|
| #61 | Battle    | Implement battle system in endTurn phase        |
| —   | AI        | Implement strategic AI decision logic           |
| —   | Diplomacy | Alliance shared visibility                      |
| —   | Economy   | Deficit vault → unit disbanding                 |
| —   | Hero      | Multiple artifact slots (currently capped at 1) |
| —   | Alignment | Full alignment-based mechanics (partial)        |
| —   | Victory   | Define and implement victory condition checks   |
| —   | Save/Load | Multiple save game slots                        |
| —   | UI        | Keyboard shortcut mappings                      |
| —   | Testing   | Add Phaser scene unit tests (jest-canvas-mock)  |
