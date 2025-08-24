# Fantasy Empires Wars

This is a turn-based single-player strategy game.

## Map

The game map consists of hexagonal tiles (Lands).

### Lands

Land can be the following types:

- Green Forest (Lawful) - homeland for Elves
- Mountains (Lawful) - homeland for Dwarves
- Plains (Neutral) - homeland for Humans
- Hills (Neutral) - homeland for Halflings (?)
- Swamp (Chaotic) - homeland for Orcs
- Dark Forest (Chaotic) - homeland for Dark Elves
- Volcano/Lava (Chaotic) - homeland for Necromancers

Each land can produce Gold (amount randomly set up during map generation).

When an army moves on neutral land, 10% of regular warriors, 5% of veteran, or 1% of elite army units will be killed by neutrals (and not less than 50-20-5 units). The Land becomes temporarily under your control and you may build only a Stronghold on it.

If all units are killed by neutrals, then the temporary Land becomes Neutral.

If the Land is in radius 2 from your Stronghold and from an enemy army Stronghold, it would be treated as Land belonging to the Player which has an army there; otherwise it will not produce gold for any player.

## Buildings

On each Land only one building can be built:

- Stronghold - all Lands around the stronghold not far from it produce Gold associated with this land:
  - Land with Stronghold produces 100% Gold
  - Land next to Land with Stronghold produces 90% Gold
  - Land next to Land next to Land with Stronghold produces 80% Gold
  - Two Strongholds cannot be on neighboring Lands
  - If Land with Stronghold is destroyed, all Lands around become neutral
  - Any other buildings can be built only on Lands in radius 2 from a Stronghold
  - Buildings can be demolished only if you control the land where they are located
- Barracks - you may recruit melee units (Elves, Dwarves, Humans), Heroes (Fighter, Hammerlord, Ranger) and war-machines (Ballista, Catapult)
- Mage-tower - you may recruit Mages, based on Land-type and your alignment (Cleric, Necromancer, Enchanter, Pyromancer, Druid)
- Watch-tower - it will open fog-of-war for you in radius 4
- Castle-wall - protect from any attacks (can be attacked only with Mages or Catapults) and allow quick movement of forces. It is enough to have one garrison on 5 Lands around; it will protect all the walls.

Each building has a gold cost to build and gold per turn maintenance.

## Units

- War-machines - can be recruited on any lands by any players
- Warriors - only Neutral and Lawful Players can recruit, can be recruited on any land type (except Desert)
- Elves - only Neutral and Lawful Players can recruit, can be recruited on Green Forest
- Dwarves - only Neutral and Lawful Players can recruit, can be recruited on Mountains
- Orcs - only Chaotic and Neutral Players can recruit, can be recruited on Swamp
- Dark Elves - only Chaotic and Neutral Players can recruit, can be recruited on Dark Forest
- Halflings - only Neutral Players can recruit, can be recruited on Hills
- Undead - only Necromancers can produce them as part of Magic usage; any other Chaotic players can produce them via magic-rod which can be obtained in Hero-quests. Undead do not cost money to recruit and per turn, and use only black and red mana to live. If you don't have enough mana, then some undead will be destroyed (for example, you have 400 undead and only 100 black mana, then on next turn you will have only 100 undead and 0 mana + mana produced by your mages)

Regular units can be enhanced into Veteran if they win 2 battles without any help (For example, we have a battle and 300 survive, and if some new regular units were added and they win the second battle, all of the survived units become veteran)

Veteran units are enhanced into Elite if they win 2 battles. Two groups of veteran units can be joined between battles; it will not reset the veteran counter.

## Heroes

In Barracks and Mage-tower you may recruit melee heroes and mage heroes.

Each hero is treated as one unit in Army.

When a Hero is recruited, it has level 1 and can be max level 32.

If a hero survives in battle, it will gain +1 level.

Also you may send a Hero into a hero-quest (TBD: right now not clear how it would be implemented) where they gain level and can find artifacts for themselves (for example, boots of speed or special Sword) or some magic item which can be used on Map (for example, reveal fog of war for one turn)

### Heroes Quests

TBD: right now not clear how it would be implemented

## Mana

There are five sources of mana which produced by Mages:

- White Mana (Cleric)
- Black Mana (Necromancer)
- Blue Mana (Enchanter)
- Red Mana (Pyromancer)
- Green Mana (Druid)

Each Mage produces mana based on their level (formula TBD)

### Mana Usage

- White Spells
  - Kill undead (spell point: TBD, Kill: TBD undead units)
  - etc
- Black Spells
  - Turn Undead (spell points: TBD, raise: TBD undead units)
  - etc
- Blue Spells
  - Hurricane (sp: TBD, 10% chance to destroy building + 5% units killed)
  - etc
- Red Spells
  - Meteor Storm (sp: TBD, 50% chance to destroy the building + 15% units killed)
  - etc
- Green Spells
  - Reveal (sp: TBD, remove fog of war for one turn for radius 3 not far from land under your control)
  - etc
