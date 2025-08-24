# Fantasy Empires Wars
This is turn based single-player strategy game
## Map
Game map consists of hexagonal tiles (Lands).
### Lands 
Land could be the following types:
- Green Forest (Lawful) - homeland for Elfs
- Mountains (Lawful) - homeland for Dwarfs
- Plains (Neutral) - homeland for Humans
- Hills (Neutral) - homeland for halflings (?)
- Swamp (Chaotic) - homeland for Orcs
- Dark Forest (Chaotic) - homeland for Dark Elfs
- Volcano/Lava (Chaotic) - homeland for Necromancers

Each land could produce Gold (amount randomly setup during map generation)

When army moved on neutral land 10% of regular wariors, 5% of veteran or 1% of elite army units will be killed by neutrals (and not less then 50-20-5 units). The Land became temporary under your control and you may build only Stronghold on it.

If all units are killed by neutrals then temporary Land became Neutral.

If the Land is in radious 2 from your Stronghold and from enemy army Stronghold it would be treated as Land belong to the Payer which have an army there other wise it will not produce gold for any player.
 
## Buildings
On each Land only one building could be build:
- Stronghold - all Lands around stronghold not far from it produce Gold associated with this land:
  - Land with Stronghold produces 100% Gold
  - Land next to Land with Stronghold produces 90% Gold
  - Land next to Land next to Land with Stronghold produces 80% Gold
  - Two Strongholds could not be on neighbour Lands
  - If Land with Stronghold is destroyed, all Lands around became neutral
  - Any other buildings could be build only on Lands in radius 2 from a Stronghold
  - Building could be demolished only if you control the land where they are located
- Barracks - you may recruit melee units (Elfs, Dwarfs, Humans), Heroes (Fighter, Hammerlord, Ranger) and war-machines (Ballista, Catapult)
- Mage-tower - you may recruit Mages, based on Land-type and your aligment (Cleric, Necromancer, Enchanter, Pyromancer, Druid)
- Watch-tower - it will open fog-of-war for you in radius 4 for you
- Castle-wall - protect from eny attacks (could be attack only with Mages or Catapults) allow quickly move forces. It is enough to have one garnishe on 5 Lands around it will protect all the walls.

Each building has cost gold to build and gold per turn.

## Units
- War-machines - could be recruited on any lands by any players
- Warriors - only Neutral and Lawful Player could recruit, could be recruited on any land type (except Desert)
- Elfs - only Neutral and Lawful Player could recruit, could be recruited on Green Forest
- Dwarfs - only Neutral and Lawful Player could recruit, could be recruited on Mountains
- Orcs - only Chaotic and Neutral Player could recruit, could be recruited on Swamp
- Dark Elfs - only Chaotic and Neutral Player could recruit, could be recruited on Dark Forest
- Halflings - only Neutral Player could recruit, could be recruited on Hills
- Undead - only Necromancer could produce them and part of Magic usage, any other Chaotic players could produce them via magic-rod which could be obtain in Hero-quests. Undead are not cost money to recruit and per turn and use only black and red mana to live. If you dont have enough mana then some undead would be destroyed (for example you have 400 undead and only 100 black mana then on next turn you will have only 100 undead and 0 mana + mana produced by your mages)

Regular units could be enchnced into Veteran if they win 2 battles without any help (For example we have a battle and 300 survive and if some new regular units were added and they win the second battle all of survived units became veteran)

Veteran units enchaned into Elite if they win 2 battles. Two group of veteran units could be joined between battles it will not skip veteran counter.

## Heroes
In Barracs and Mage-tower you may recruit melee heroes and mage heroes.

Each hero treated as one unit in Army.

When Hero recruted it have level 1 and could be max level 32.

If hero survive in battle it will gain +1 level.

Also you may send Hero into a hero-quest (TBD: right now not clear how it would be implemented) where he gain level and could find artifact for him-self (for example, boots of speed or special Sword) or some magic item which could be used on Map (for example reveal fog of war for one turn) 

### Heroes Quests
TBD: right now not clear how it would be implemented 

## Mana
There are five sources of mana which produced by Mages:
- White Mana (Cleric)
- Black Mana (Necromancer)
- Blue Mana (Enchanter)
- Red Mana (Pyromancer)
- Green Mana (Druid)

Each Mage produce mana based on his level (formula TBD)

### Mana Usage
- White Spells
  - Kill undead (spell point: TBD, Kill: TBD undead units)
  - etc
- Black Spells
  - Turn Undead (spell points: TBD, raise: TBD undead units)
  - etc
- Blue Spells
  - Hurracane (sp: TBD, 10% cahnce to destroy building + 5% units killed)
  - etc
- Red Spells
  - Meteor Storm (sp: TBD, 50% chance to destroy the building + 15% units killed)
  - etc 
- Green Spells
  - Reveal (sp: TBD,  remove fog of war for one turn for radius 3 not har from land under your control)
  - etc
