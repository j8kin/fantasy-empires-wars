# Fantasy Empires Wars — Phaser.io Integration & RTS Battles Specification

> Version: 0.2 (March 2026)
> Status: TBS Migration sections finalised. RTS sections are high-level concepts
> (separate future implementation).

---

## Table of Contents

1. [Scope & Goals](#1-scope--goals)
2. [Current State Analysis](#2-current-state-analysis)
3. [Target Architecture](#3-target-architecture)
4. [Phaser Setup & Infrastructure](#4-phaser-setup--infrastructure)
5. [TBS Overworld Scene](#5-tbs-overworld-scene)
6. [React–Phaser Communication Bridge](#6-reactphaser-communication-bridge)
7. [Asset Pipeline](#7-asset-pipeline)
8. [Auto-Resolve Battle (TBS mechanic)](#8-auto-resolve-battle-tbs-mechanic)
9. [RTS: Deploy Scene (future)](#9-rts-deploy-scene-future)
10. [RTS: Battle Scene (future)](#10-rts-battle-scene-future)
11. [TBS ↔ RTS Integration (future)](#11-tbs--rts-integration-future)
12. [Testing Strategy](#12-testing-strategy)
13. [Step-by-Step Development Migration Plan](#13-step-by-step-development-migration-plan)

---

## 1. Scope & Goals

### 1.1 What This Document Covers

**Primary focus (this iteration): TBS Phaser Migration**

Replace the current React/CSS hex grid (`Battlefield.tsx` + `LandTile.tsx`) with a
Phaser 3 `OverworldScene`, keeping all React UI overlays (dialogs, panels, popups)
unchanged. Implement auto-resolve battle resolution as a TBS-level mechanic
(required for AI vs AI, and for human "skip RTS" option).

**Secondary (future, separate implementation): Two RTS Battle Scenes**

- **Deploy Scene** — full-screen fantasy-framed window where the player arranges
  their army formation before a battle begins
- **Battle Scene** — full-screen fantasy-framed real-time battle

> RTS scenes are documented at concept level only (§9–11). Detailed specifications
> will be written when implementation begins.

### 1.2 Non-Goals (This Iteration)

- Game logic / rules changes (combat formulae, turn phases) are out of scope.
- React Context state management is **not** being replaced.
- RTS scene implementation (beyond auto-resolve).
- Game settings screen (required for "auto-resolve preference" option — tracked
  as a separate feature).

### 1.3 Success Criteria — TBS Migration

| Criterion                | Metric                                                     |
|--------------------------|------------------------------------------------------------|
| Hex grid in Phaser       | `OverworldScene` renders all land types, armies, buildings |
| React overlays unchanged | All 10 dialogs and 4 popups work identically               |
| Auto-resolve functional  | AI vs AI battles resolve correctly via formula             |
| Test suite green         | `yarn test` passes with ≥ current coverage                 |
| Build passes             | `yarn build` produces valid production bundle              |

---

## 2. Current State Analysis

### 2.1 Rendering Today

```
React DOM (MainView)
 ├── TopPanel.tsx              — player info, mana vials, controls
 ├── Battlefield.tsx           — CSS grid of hex tiles
 │    └── LandTile.tsx × N    — individual hex cell (click, images, glow)
 └── Dialogs / Popups          — modal overlays
```

The hex grid is purely DOM-based: CSS `display:grid`, PNG background images per
land type, CSS class toggling for glow effects, React `onClick` for interaction.
No canvas, no WebGL.

### 2.2 Ownership Split After Migration

| Concern                    | Today                     | After Migration             |
|----------------------------|---------------------------|-----------------------------|
| Hex tile rendering         | `Battlefield.tsx` CSS     | Phaser `OverworldScene`     |
| Land type texture          | CSS background-image      | Phaser sprite/graphic       |
| Player colour tint         | CSS `::after` overlay     | Phaser tint                 |
| Army presence marker       | DOM elements              | Phaser flag/banner sprite   |
| Building icons             | DOM `<img>`               | Phaser sprite on tile layer |
| Selection glow / highlight | CSS class toggle          | Phaser graphics outline     |
| Army movement animation    | None                      | Phaser tween along path     |
| Spell visual effect        | `SpellCastAnimation.tsx`  | Phaser particle emitter     |
| Dialogs                    | React (unchanged)         | React (unchanged)           |
| Popups                     | React (unchanged)         | React (unchanged)           |
| TopPanel / mana vials      | React (unchanged)         | React (unchanged)           |
| Game state                 | React Context (unchanged) | React Context (unchanged)   |
| Game logic                 | Pure TS layer (unchanged) | Pure TS layer (unchanged)   |

### 2.3 Files to Retire

| File                                                  | Fate                                |
|-------------------------------------------------------|-------------------------------------|
| `src/ux-components/battlefield/Battlefield.tsx`       | Replaced by `OverworldScene`        |
| `src/ux-components/battlefield/LandTile.tsx`          | Logic ported to Phaser hex objects  |
| `src/ux-components/animations/SpellCastAnimation.tsx` | Replaced by Phaser particle emitter |

---

## 3. Target Architecture

### 3.1 Layer Diagram (TBS + future RTS)

```
┌────────────────────────────────────────────────────────────────────────┐
│                         React DOM Layer                                │
│  TopPanel │ Dialogs │ Popups  (z-index above all canvases)             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │  FantasyBorderFrame (full-viewport, future RTS only)         │      │
│  │   ├── fantasy border decorations (React)                     │      │
│  │   └── content area  →  PhaserBattleInstance (canvas)         │      │
│  └──────────────────────────────────────────────────────────────┘      │
├────────────────────────────────────────────────────────────────────────┤
│                      phaserEventBus  (singleton EventEmitter)          │
│  React → Phaser: STATE_UPDATE, GLOW_TILES, CLEAR_GLOW                  │
│  Phaser → React: TILE_CLICKED, TILE_RIGHT_CLICKED, ARMY_CLICKED        │
│  Battle events:  START_DEPLOY, DEPLOY_CONFIRMED, BATTLE_OVER           │
├───────────────────────────┬────────────────────────────────────────────┤
│  PhaserGameInstance       │  PhaserBattleInstance (future RTS)         │
│  (TBS, always present)    │  (created on battle start, destroyed after)│
│                           │                                            │
│  OverworldScene           │  DeployScene → BattleScene                 │
│  ├── HexGrid              │  (mounted inside FantasyBorderFrame)       │
│  ├── ArmyLayer            │                                            │
│  ├── SelectionLayer       │                                            │
│  └── UIBridge             │                                            │
├───────────────────────────┴────────────────────────────────────────────┤
│               Game Logic Layer  (pure TypeScript, unchanged)           │
│  Systems │ Selectors │ Factories │ TurnManager │ AutoResolveBattle     │
├────────────────────────────────────────────────────────────────────────┤
│               State Layer  (unchanged)                                 │
│  GameState / PlayerState / ArmyState / MapState                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Two Separate Phaser.Game Instances

The TBS overworld and the RTS battle use **two independent** `Phaser.Game`
instances mounted in different DOM containers:

| Instance               | Class                        | DOM Container                                    | Lifecycle                                           |
|------------------------|------------------------------|--------------------------------------------------|-----------------------------------------------------|
| `PhaserGameInstance`   | `OverworldScene`             | `<div>` replacing `<Battlefield>`                | Alive for entire game session                       |
| `PhaserBattleInstance` | `DeployScene`, `BattleScene` | `<div>` inside `FantasyBorderFrame` content area | Created when battle starts; destroyed on battle end |

This avoids canvas resize complexity and keeps the two concerns fully isolated.

### 3.3 Phaser Scene Registry

| Scene Key        | Instance               | Status             |
|------------------|------------------------|--------------------|
| `OverworldScene` | `PhaserGameInstance`   | **This iteration** |
| `DeployScene`    | `PhaserBattleInstance` | Future             |
| `BattleScene`    | `PhaserBattleInstance` | Future             |

---

## 4. Phaser Setup & Infrastructure

### 4.1 Dependencies

```bash
yarn add phaser@^3.87
yarn add eventemitter3
yarn add -D jest-canvas-mock
```

> **Phaser version: 3.x** — Phaser 4 is not yet stable. Revisit when Phaser 4
> reaches GA.

### 4.2 Vite Integration

Phaser 3 is ESM-native and works with Vite without additional plugins.
If tree-shaking is needed:

```ts
// vite.config.ts — optional, only if bundle size is a concern
optimizeDeps: {
  exclude: ['phaser']
}
```

### 4.3 `PhaserGameInstance` Component

Thin React wrapper that mounts and destroys the TBS Phaser game:

```tsx
// src/phaser/PhaserGameInstance.tsx
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { OverworldScene } from './scenes/OverworldScene';

export function PhaserGameInstance() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,        // WebGL with Canvas fallback
      parent: containerRef.current!,
      width: '100%',
      height: '100%',
      backgroundColor: '#1a1a2e',
      scene: [OverworldScene],
    });
    return () => game.destroy(true);
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
```

This component replaces `<Battlefield />` inside `MainView.tsx`.

### 4.4 Event Bus

```ts
// src/phaser/phaserEventBus.ts
import { EventEmitter } from 'eventemitter3';

export const phaserEventBus = new EventEmitter();

export const PhaserEvents = {
  // Phaser → React
  TILE_CLICKED: 'TILE_CLICKED',        // payload: LandPosition
  TILE_RIGHT_CLICKED: 'TILE_RIGHT_CLICKED',  // payload: LandPosition
  ARMY_CLICKED: 'ARMY_CLICKED',        // payload: ArmyState
  SCENE_READY: 'SCENE_READY',         // payload: scene key

  // React → Phaser (Overworld)
  STATE_UPDATE: 'STATE_UPDATE',        // payload: GameState
  GLOW_TILES: 'GLOW_TILES',          // payload: LandPosition[]
  CLEAR_GLOW: 'CLEAR_GLOW',

  // Battle (future)
  START_DEPLOY: 'START_DEPLOY',        // payload: BattleConfig
  DEPLOY_CONFIRMED: 'DEPLOY_CONFIRMED',    // payload: DeploymentResult
  BATTLE_OVER: 'BATTLE_OVER',         // payload: BattleResult
} as const;
```

---

## 5. TBS Overworld Scene

### 5.1 `OverworldScene` Responsibilities

```
OverworldScene
 ├── preload()           — load terrain sprites / images from src/assets/
 ├── create()
 │    ├── initHexGrid(gameState.map)      — draw all hex cells
 │    ├── initArmyLayer()                 — sprite group per army
 │    ├── initSelectionLayer()            — highlight graphics
 │    ├── registerPointerHandlers()       — click → event bus
 │    ├── registerEventBusListeners()     — react to STATE_UPDATE / GLOW_TILES
 │    └── emit(SCENE_READY)
 └── update(time, delta)  — drive active tweens only; no game logic
```

### 5.2 Coordinate System

The existing game uses `LandPosition { row, col }` (offset coordinates).
`OverworldScene` uses axial coordinates `(q, r)` internally for geometry, then
converts back to `LandPosition` for all EventBus payloads. No Phaser-specific
coordinates ever leave the Phaser layer.

```ts
// src/phaser/utils/hexGeometry.ts
export function offsetToAxial(row: number, col: number): { q: number; r: number }

export function axialToPixel(q: number, r: number, size: number): { x: number; y: number }

export function hexCorners(cx: number, cy: number, size: number): Phaser.Geom.Point[]
```

These geometry utilities are **pure functions with no Phaser dependency** and are
therefore fully unit-testable.

### 5.3 Hex Grid Rendering

**Approach: procedural Phaser Graphics** — each tile drawn as a filled hexagon
with a texture, matching the current visual style. Sprite-based tilemap can be
introduced later when terrain art is available.

```ts
// Per-tile draw call
const drawHexCell = (graphics: Phaser.GameObjects.Graphics, cell: LandState) => {
  const { q, r } = offsetToAxial(cell.mapPos.row, cell.mapPos.col);
  const { x, y } = axialToPixel(q, r, this.hexSize);
  const corners = hexCorners(x, y, this.hexSize);

  // 1. Fill with terrain colour / texture
  graphics.fillStyle(landTypeToColor(cell.type));
  graphics.fillPoints(corners, true);

  // 2. Player ownership tint overlay
  if (cell.ownerId) {
    graphics.fillStyle(playerColorToHex(cell.ownerId), 0.35);
    graphics.fillPoints(corners, true);
  }
};
```

### 5.4 Army Layer

> **Rollback candidate** — evaluate visually during Phase 5 QA before committing.

Each `ArmyState` is represented by a small flag/banner sprite positioned at its
hex tile centre:

- Single shared flag/banner asset (~20–24 px), tinted with the owning player's colour
- No text badge, no unit count, no hero label — army details are available via
  right-click popup (existing behaviour, unchanged)
- Chosen over figurine/token approaches because it has a low visual footprint and
  can be swapped for a different sprite (shield, crest, avatar) with minimal effort
- Tweened position during movement animation

### 5.5 Building Icons

> **Rollback candidate** — evaluate visually during Phase 5 QA before committing.

Building sprites rendered on a dedicated layer above terrain, below armies.
One sprite per building type per tile; coordinates are the tile centre offset
slightly for visual clarity when multiple buildings exist.

### 5.6 Selection & Glow

On `GLOW_TILES` event: draw a coloured hexagonal outline over each specified
`LandPosition`.
On `CLEAR_GLOW`: destroy all outline graphics.

This replaces the current CSS class toggling on `LandTile`.

### 5.7 Army Movement Animation

When `STATE_UPDATE` brings a changed army position:

```ts
// OverworldScene — on position change detected
const path = computeDisplayPath(prev, next);   // straight line or last known path
this.tweens.add({
  targets: armySprite,
  x: destPixel.x,
  y: destPixel.y,
  duration: 400 * path.length,
  ease: 'Linear',
  onComplete: () => phaserEventBus.emit(PhaserEvents.MOVEMENT_COMPLETE),
});
```

### 5.8 Spell Effect (replacing `SpellCastAnimation.tsx`)

Phaser particle emitter fired on the target tile when React dispatches a spell
animation event. The emitter is pre-configured per spell school (Fire = red/orange
particles, etc.). No gameplay logic — visual only.

### 5.9 Camera

For large maps (20×20) the hex grid exceeds the viewport. `OverworldScene` sets
world bounds to the full grid size and enables camera drag (middle-mouse or
two-finger pan) + scroll-wheel zoom clamped to a reasonable range.

---

## 6. React–Phaser Communication Bridge

### 6.1 React → Phaser: State Push

Whenever `GameState` changes, the full new state is pushed via EventBus:

```tsx
// src/contexts/GameContext.tsx  (addition)
useEffect(() => {
  phaserEventBus.emit(PhaserEvents.STATE_UPDATE, gameState);
}, [gameState]);
```

`OverworldScene` diffs the received state against its cached copy and redraws
only changed tiles / army sprites.

### 6.2 Phaser → React: Tile Interaction

```tsx
// src/contexts/ApplicationContext.tsx  (addition)
useEffect(() => {
  const onTileClick = (pos: LandPosition) => setSelectedLandPosition(pos);
  const onRightClick = (pos: LandPosition) => openLandInfoPopup(pos);
  const onArmyClick = (army: ArmyState) => setSelectedArmy(army);

  phaserEventBus.on(PhaserEvents.TILE_CLICKED, onTileClick);
  phaserEventBus.on(PhaserEvents.TILE_RIGHT_CLICKED, onRightClick);
  phaserEventBus.on(PhaserEvents.ARMY_CLICKED, onArmyClick);

  return () => {
    phaserEventBus.off(PhaserEvents.TILE_CLICKED, onTileClick);
    phaserEventBus.off(PhaserEvents.TILE_RIGHT_CLICKED, onRightClick);
    phaserEventBus.off(PhaserEvents.ARMY_CLICKED, onArmyClick);
  };
}, []);
```

### 6.3 Full Interaction Flow (Post-Migration)

```
Player clicks tile in Phaser canvas
 → OverworldScene emits TILE_CLICKED(pos)
 → ApplicationContext.onTileClick(pos)
 → Same dialog-opening logic as today (unchanged)
 → Player acts in React dialog
 → GameContext.updateGameState(newState)
 → useEffect fires STATE_UPDATE
 → OverworldScene.onStateUpdate(newState) — rerenders tile
```

No dialog component changes required.

### 6.4 Glow / Highlight Flow

```
ApplicationContext sets glowingTiles (e.g., valid move destinations)
 → useEffect fires GLOW_TILES(positions)
 → OverworldScene draws hex outlines on those tiles

ApplicationContext clears glowingTiles
 → CLEAR_GLOW event
 → OverworldScene removes outlines
```

---

## 7. Asset Pipeline

### 7.1 Terrain Sprites (TBS Overworld)

Current land images (`src/assets/` PNGs loaded via `getLandImg.ts`) are loaded
into Phaser's asset cache during `OverworldScene.preload()`:

```ts
preload()
{
  LAND_TYPES.forEach(type => {
    this.load.image(`land_${type}`, getLandImgPath(type));
  });
  BUILDING_TYPES.forEach(type => {
    this.load.image(`building_${type}`, getBuildingImgPath(type));
  });
  // Spell effect sprite sheets (if replacing SpellCastAnimation)
  this.load.atlas('spell_effects', 'assets/spells/effects.png', 'assets/spells/effects.json');
}
```

New terrain art (if commissioned) goes to `src/assets/terrain/` following the
existing naming convention.

### 7.2 Unit Sprites (Future RTS)

Unit sprites (move / attack / die animations) will be placed in
`src/assets/units/<unitType>/` as sprite sheets, following the convention
established for existing assets. They are loaded only by `DeployScene` /
`BattleScene`, not by `OverworldScene`.

> Naming convention: `<unitType>_move.png`, `<unitType>_attack.png`,
> `<unitType>_die.png` + matching JSON atlas per animation.

### 7.3 Hero Sprites (Future RTS)

Hero sprites follow the same convention in `src/assets/heroes/<heroType>/`.
Heroes are distinct sprites from regular units and include a health bar rendered
as a Phaser 9-slice graphic.

---

## 8. Auto-Resolve Battle (TBS mechanic)

### 8.1 Why Auto-Resolve Is a TBS Concern

Auto-resolve is needed independently of the RTS scenes:

- AI vs AI battles **always** auto-resolve (no RTS scene shown)
- Human player can choose "Auto-Resolve" instead of launching RTS
- Directly addresses open issue **#61** in TBS_SPEC.md §Appendix B

### 8.2 Trigger Point

Auto-resolve fires inside `endTurn.ts` → `performMovements()` when two opposing
armies occupy the same tile at movement resolution time:

```ts
// src/map/move-army/performMovements.ts
if (hasCollision(movedArmy, existingArmy)) {
  const result = isAiVsAi(movedArmy, existingArmy, players)
    ? autoResolveBattle(movedArmy, existingArmy, terrain)
    : await promptBattleChoice(movedArmy, existingArmy);   // human choice dialog
  gameState = applyBattleResult(gameState, result);
}
```

### 8.3 Auto-Resolve Formula

Battle is resolved in rounds. Each round both sides deal damage simultaneously:

```
AttackerDamage = sum(unit.attack × unit.count × rankMultiplier)  for all attacker units
DefenderDamage = sum(unit.attack × unit.count × rankMultiplier)  for all defender units

DefenderHP    -= AttackerDamage × terrainDefenseModifier(terrain, side='defender')
AttackerHP    -= DefenderDamage × terrainDefenseModifier(terrain, side='attacker')
```

Round continues until one side's total HP reaches 0 or a morale break threshold
is hit (configurable, default 30% remaining).

Hero stats contribute their `CombatStats.attack` and `CombatStats.defense` directly.

Terrain modifiers:

| Terrain             | Defense Bonus (Defender) |
|---------------------|--------------------------|
| Mountains           | +20%                     |
| Forests             | +10%                     |
| Stronghold present  | +40%                     |
| Castle Wall present | +25%                     |
| Plains / other      | 0%                       |

> These values are initial defaults — balance tuning is a separate task.

### 8.4 Result Types

```ts
interface BattleResult {
  victor: 'attacker' | 'defender' | 'draw';
  attackerSurvivors: ArmyState;   // units remaining (counts reduced)
  defenderSurvivors: ArmyState;
  heroFates: Record<string, 'survived' | 'fled' | 'died'>;
  buildingDamage: Record<BuildingType, 0 | 1>;  // 0 = intact, 1 = destroyed
}
```

Building damage: 0 or 1 (survive / destroy) per OQ-7 answer — no partial damage
initially. Destroyed buildings are removed from `LandState.buildings` in
`applyBattleResult()`.

### 8.5 `BattleChoiceDialog`

When a human player is one of the combatants:

```
BattleChoiceDialog (React, uses FantasyBorderFrame)
 ├── Shows: attacker vs defender army summary
 ├── [Fight! (RTS)]        → launch DeployScene (future)
 └── [Auto-Resolve]        → run autoResolveBattle() immediately
```

Until RTS scenes are implemented, "Fight! (RTS)" is disabled (greyed out with
tooltip "Coming soon"). This allows the dialog to be built and tested now.

### 8.6 Files Involved

| File                                               | Change                                      |
|----------------------------------------------------|---------------------------------------------|
| `src/map/move-army/performMovements.ts`            | Add collision detection + battle dispatch   |
| `src/map/battle/autoResolveBattle.ts`              | New — pure function, fully testable         |
| `src/map/battle/applyBattleResult.ts`              | New — applies BattleResult to GameState     |
| `src/map/battle/battleTypes.ts`                    | New — BattleResult, BattleConfig interfaces |
| `src/ux-components/dialogs/BattleChoiceDialog.tsx` | New — React dialog                          |
| `src/turn/endTurn.ts`                              | Wire battle dispatch into END phase         |

---

## 9. RTS: Deploy Scene (future)

> **Status: Concept only. Implementation is a separate workstream.**

### 9.1 What It Is

A full-screen scene rendered inside `FantasyBorderFrame` (mounted to viewport
size). The player arranges their army units on a deployment zone before the
battle starts.

### 9.2 Container

```tsx
<FantasyBorderFrame
  screenPosition={{ x: 0, y: 0 }}
  frameSize={{ width: viewportWidth, height: viewportHeight }}
  accessible={true}    // no backdrop — this IS the screen
  primaryButton={<GameButton label="Deploy!" onClick={onDeployConfirm} />}
  secondaryButton={<GameButton label="Auto-Resolve" onClick={onAutoResolve} />}
>
  <PhaserBattleInstance
    scene="DeployScene"
    config={battleConfig}
    width={innerWidth}    // frameSize - cornerSize * 2
    height={innerHeight}
  />
</FantasyBorderFrame>
```

### 9.3 Mechanics (Concept)

- Battlefield shown as a grid/terrain matching the hex tile type
- Player's units displayed as draggable sprites
- Half the field is the deployment zone; enemy half is blurred/hidden
- Player can rearrange units freely within deployment zone
- Confirming deployment emits `DEPLOY_CONFIRMED` → transitions to `BattleScene`

---

## 10. RTS: Battle Scene (future)

> **Status: Concept only. Implementation is a separate workstream.**

### 10.1 What It Is

The real-time battle using the deployed armies. Rendered inside the same
`FantasyBorderFrame` container as the Deploy Scene (scene switch, same
`PhaserBattleInstance`).

### 10.2 Player Controls

Mixed model: point-and-click + high-level standing orders.

| Control                      | Mechanism                                                     |
|------------------------------|---------------------------------------------------------------|
| Select unit group            | Left-click sprite                                             |
| Move group                   | Click ground target                                           |
| Attack target                | Click enemy sprite                                            |
| Standing order: Advance      | React overlay button — group moves forward aggressively       |
| Standing order: Hold         | React overlay button — group holds position, attacks in range |
| Standing order: Range Attack | React overlay button — ranged units prioritise distance       |
| Standing order: Siege Walls  | React overlay button — war machines target walls/gate         |
| Standing order: Retreat      | React overlay button — group moves toward own deployment edge |

When no point-and-click command is given, each unit group follows its standing
order autonomously.

### 10.3 Unit Sprites

Each unit type has three animations (loaded from `src/assets/units/`):

- `move` — looping walk/march cycle
- `attack` — strike animation (triggers on attack)
- `die` — death animation; sprite removed on completion

Heroes are distinct sprites with a health bar (Phaser 9-slice graphic).

### 10.4 Hero Aura Effects

No spell casting in RTS. Heroes provide passive aura effects (range or melee
bonus to nearby units), rendered as a subtle radial glow around the hero sprite.

### 10.5 Battle Result

On victory/defeat/retreat, `BattleScene` emits `BATTLE_OVER(BattleResult)`.
React `GameContext` receives and applies it identically to an auto-resolve result.

---

## 11. TBS ↔ RTS Integration (future)

> **Status: Concept only.**

### 11.1 Battle Trigger in TBS

`performMovements()` → collision detected → `BattleChoiceDialog` shown:

```
[Fight! (RTS)]   → CREATE PhaserBattleInstance → start DeployScene
[Auto-Resolve]   → run autoResolveBattle() → skip RTS entirely
```

### 11.2 Lifecycle

```
1. Collision detected in endTurn
2. BattleChoiceDialog opens (React)
3. If "Fight!":
   a. PhaserBattleInstance created inside FantasyBorderFrame
   b. DeployScene starts
   c. Player deploys → DEPLOY_CONFIRMED
   d. BattleScene starts
   e. Battle plays out
   f. BATTLE_OVER emitted
   g. PhaserBattleInstance destroyed
   h. FantasyBorderFrame unmounted
   i. GameContext.applyBattleResult(result)
   j. TurnManager.END phase continues
4. If "Auto-Resolve":
   a. autoResolveBattle() runs synchronously
   b. GameContext.applyBattleResult(result)
   c. TurnManager.END phase continues
```

### 11.3 AI vs AI

Always auto-resolved. No dialog, no RTS scene. Human player may optionally observe
(opt-in via a game settings flag — game settings screen is a future feature).

---

## 12. Testing Strategy

### 12.1 Existing Tests Must Stay Green

All 62 test suites / 1 499 tests must pass after every phase of migration.

### 12.2 Phaser Layer Testing

Phaser scenes cannot run in jsdom (no WebGL / Canvas2D). Strategy by layer:

| Layer                                 | Approach                                          |
|---------------------------------------|---------------------------------------------------|
| Hex geometry utils (`hexGeometry.ts`) | Pure unit tests — no Phaser dependency            |
| `phaserEventBus`                      | Pure unit tests                                   |
| `autoResolveBattle`                   | Pure unit tests (most critical path)              |
| `applyBattleResult`                   | Pure unit tests                                   |
| `OverworldScene`                      | Integration tests with `jest-canvas-mock`         |
| React `PhaserGameInstance`            | Mock Phaser.Game constructor; assert div rendered |
| React-Phaser bridge (event listeners) | Mock `phaserEventBus` in component tests          |

```ts
// jest.config.ts — add to setup
setupFilesAfterFramework: ['jest-canvas-mock', '<rootDir>/src/setupTests.ts']

// src/__mocks__/phaserMock.ts  (for component tests that import phaser transitively)
export default { AUTO: 0, Game: jest.fn() };
```

### 12.3 Visual Regression Tests (future RTS)

For battle scenes, add visual regression screenshot tests using
`jest-image-snapshot` or Playwright. These run separately from the Jest unit suite
(`yarn test:visual`) and are gated in CI only for branches touching Phaser scene
files. Set up alongside RTS scene implementation, not TBS migration.

---

## 13. Step-by-Step Development Migration Plan

### Phase 0 — Preparation (no user-facing changes) ✅ COMPLETED

| #   | Task                                         | Files Affected      |
|-----|----------------------------------------------|---------------------|
| 0.1 | `yarn add phaser@^3.87 eventemitter3`        | `package.json`      |
| 0.2 | `yarn add -D jest-canvas-mock`               | `package.json`      |
| 0.3 | Import `jest-canvas-mock` in `setupTests.ts` | `src/setupTests.ts` |
| 0.4 | Create `src/__mocks__/phaserMock.ts` stub    | new                 |
| 0.5 | `yarn test` — must stay green                | —                   |
| 0.6 | `yarn build` — must stay green               | —                   |

### Phase 1 — Event Bus (no visual change) ✅ COMPLETED

| #   | Task                                                                                             | Files Affected                 |
|-----|--------------------------------------------------------------------------------------------------|--------------------------------|
| 1.1 | Create `src/phaser/phaserEventBus.ts`                                                            | new                            |
| 1.2 | Write unit tests for event bus                                                                   | new test                       |
| 1.3 | Add `STATE_UPDATE` emitter to `GameContext.tsx` (behind a check: only if Phaser instance exists) | `src/contexts/GameContext.tsx` |
| 1.4 | `yarn test` — must stay green                                                                    | —                              |

### Phase 2 — Phaser Canvas Stub (canvas appears, empty) ✅ COMPLETED

| #   | Task                                                                                                                | Files Affected |
|-----|---------------------------------------------------------------------------------------------------------------------|----------------|
| 2.1 | Create `src/phaser/scenes/OverworldScene.ts` (stub: black canvas, emits SCENE_READY)                                | new            |
| 2.2 | Create `src/phaser/PhaserGameInstance.tsx` (wrapper component)                                                      | new            |
| 2.3 | In `MainView.tsx`: render `<PhaserGameInstance>` **below** existing `<Battlefield>` for side-by-side dev comparison | `MainView.tsx` |
| 2.4 | Smoke test: `PhaserGameInstance` renders a `<div>` container (mock Phaser.Game)                                     | new test       |
| 2.5 | Visual QA: both old grid and new canvas visible                                                                     | manual         |

### Phase 3 — Hex Grid Rendering in Phaser ✅ COMPLETED

| #   | Task                                                                                                  | Files Affected                   |
|-----|-------------------------------------------------------------------------------------------------------|----------------------------------|
| 3.1 | Implement `src/phaser/utils/hexGeometry.ts` (`offsetToAxial`, `axialToPixel`, `hexCorners`)           | new                              |
| 3.2 | Unit tests for all geometry functions                                                                 | new test                         |
| 3.3 | Implement `landTypeToColor()` mapping                                                                 | `src/phaser/utils/landColors.ts` |
| 3.4 | Implement `HexGrid` in `OverworldScene.create()`: draws all tiles as filled hexagons from `GameState` | `OverworldScene.ts`              |
| 3.5 | Subscribe to `STATE_UPDATE`: diff + redraw only changed tiles                                         | `OverworldScene.ts`              |
| 3.6 | Preload land images from `src/assets/` (for future use)                                               | `OverworldScene.ts`              |
| 3.7 | Render player ownership tint overlay per cell                                                         | `OverworldScene.ts`              |
| 3.8 | Add comprehensive unit tests for `OverworldScene`                                                     | new test                         |
| 3.9 | Visual QA: Phaser canvas with solid-color hexagons matches current Battlefield appearance             | manual                           |

---

## Phase 4 — Sprite-Based Land Images (Texture Rendering) ✅ COMPLETED

### 4.1 Overview

Replace solid-color hex tiles with land-type texture images. Land images already exist in `src/assets/lands/`
and are imported in `src/assets/getLandImg.ts`. This phase loads them as Phaser textures and renders them
on each hex tile instead of solid colors. Borders and ownership tints remain as Graphics overlays.

### 4.2 Approach: Image-Based (Hybrid Graphics + Sprites)

**Rendering Stack:**

1. **Background**: Land texture image (Phaser.Image) placed at hex center, scaled to fit hex size
2. **Border**: Graphics.strokePoints() for hex outline (1px, dark gray)
3. **Ownership Tint**: Graphics overlay for player color tint (alpha 0.25)

**Why Hybrid?**

- Images provide visual richness (all terrain types pre-rendered)
- Graphics provide clean borders and tints without asset modifications
- Performant for typical maps (small to medium)
- Easy to debug and test

### 4.2.1 Dynamic Battlefield Sizing

The battlefield size (grid dimensions in rows and columns) is determined by the user's selection during game creation
and is stored in `GameState.map`. The hex grid rendering must:

1. **Read map dimensions** from `GameState.map.lands` (not hardcoded)
    - Determine grid size by counting unique rows and columns in the lands data
    - Example: 12×12 map = 144 land tiles, 10×10 = 100 tiles, etc.

2. **Support various map sizes** as selected by player during game creation
    - Small maps: 8×8 (64 tiles)
    - Standard maps: 10×10, 12×12 (100, 144 tiles)
    - Large maps: 15×15, 20×20 (225, 400 tiles)
    - Maximum: determined by game settings (TBD)

3. **Calculate camera bounds dynamically** based on grid dimensions
    - Instead of hardcoded `setBounds(0, 0, 2000, 2000)`
    - Calculate based on hex positioning: `maxX = col * hexSize * spacing`, `maxY = row * hexSize * spacing`

4. **Maintain aspect ratio** and responsive sizing
    - Camera bounds should accommodate all tiles with proper margins
    - Same approach as current solid-color rendering (no changes to interaction model)

### 4.3 Performance

| Metric          | Current (Solid Color) | With Images                    | Notes                                    |
|-----------------|-----------------------|--------------------------------|------------------------------------------|
| 10×10 map       | 1 graphics draw call  | 100 image sprites + 1 graphics | 100 tiles acceptable                     |
| 20×20 map       | 1 graphics draw call  | 400 image sprites + 1 graphics | May need optimization in Phase 8         |
| FPS (60 target) | 60                    | 55-60                          | Acceptable; optimize if < 50             |
| Draw calls      | ~5                    | ~400 + border graphics         | Within budget for single Phaser instance |

**Future Optimization (Phase 8):**
If performance is sub-optimal on 20×20+ maps, migrate to Tilemap system with single draw call.

| #    | Task                                                                                               | Files Affected           |
|------|----------------------------------------------------------------------------------------------------|--------------------------|
| 4.1  | Calculate grid dimensions dynamically from `GameState.map.lands` (rows/cols, not hardcoded)        | `OverworldScene.ts`      |
| 4.2  | Calculate camera bounds dynamically based on grid size and hex spacing                             | `OverworldScene.ts`      |
| 4.3  | Create `src/phaser/utils/landImageManager.ts`: map land type → image key (with corrupted variants) | new                      |
| 4.4  | Update `OverworldScene.preload()` to load all land type images as textures                         | `OverworldScene.ts`      |
| 4.5  | Refactor `drawHexTile()` to render image instead of solid color                                    | `OverworldScene.ts`      |
| 4.6  | Update `drawHexTile()` to scale and center image on hex center point                               | `OverworldScene.ts`      |
| 4.7  | Ensure borders (Graphics.strokePoints) render on top of images                                     | `OverworldScene.ts`      |
| 4.8  | Ensure ownership tint overlay renders on top of borders                                            | `OverworldScene.ts`      |
| 4.9  | Handle corrupted land variants (load corrupted images for corrupted lands)                         | `OverworldScene.ts`      |
| 4.10 | Update `OverworldScene` unit tests for image-based rendering + dynamic sizing                      | `OverworldScene.test.ts` |
| 4.11 | Performance check: various map sizes render at ≥ 55 fps (8×8, 12×12, 20×20)                        | manual                   |
| 4.12 | Visual QA: Image-based hexes match original Battlefield appearance (compare side-by-side)          | manual                   |

---

### Phase 5 — Tile Interaction (click wiring) ✅ COMPLETED

| #   | Task                                                                                 | Files Affected           |
|-----|--------------------------------------------------------------------------------------|--------------------------|
| 5.1 | Add left-click pointer handler per hex: emit `TILE_CLICKED(pos)`                     | `OverworldScene.ts`      |
| 5.2 | Add right-click handler: emit `TILE_RIGHT_CLICKED(pos)`                              | `OverworldScene.ts`      |
| 5.3 | Subscribe to `TILE_CLICKED` in `ApplicationContext.tsx` (replaces React onClick)     | `ApplicationContext.tsx` |
| 5.4 | Subscribe to `TILE_RIGHT_CLICKED` in `ApplicationContext.tsx`                        | `ApplicationContext.tsx` |
| 5.5 | Implement glow: listen `GLOW_TILES` → draw hex outlines; `CLEAR_GLOW` → remove       | `OverworldScene.ts`      |
| 5.6 | Wire `glowingTiles` from `ApplicationContext` to `phaserEventBus.emit(GLOW_TILES)`   | `ApplicationContext.tsx` |
| 5.7 | End-to-end manual QA: click tile → dialog opens; glow visible                        | manual                   |
| 5.8 | Remove `<Battlefield>` from `MainView.tsx`; delete `Battlefield.tsx`, `LandTile.tsx` | `MainView.tsx` + delete  |
| 5.9 | `yarn test` — fix any regressions from removed components                            | —                        |

### Phase 6 — Army & Building Sprites

> §6.1 and §6.4 are rollback candidates — if the map looks too cluttered during
> QA, remove the sprites and rely on the glow/selection system alone.

| #    | Task                                                                                            | Files Affected                                       |
|------|-------------------------------------------------------------------------------------------------|------------------------------------------------------|
| 6.1  | Implement `ArmyLayer`: one flag/banner sprite per `ArmyState`, tinted to player colour, no text | `OverworldScene.ts`                                  |
| 6.2  | Emit `ARMY_CLICKED(army)` on army sprite click (differentiated from tile click)                 | `OverworldScene.ts`                                  |
| 6.3  | **Visual QA checkpoint**: assess map noise from army flags; roll back 6.1 if too cluttered      | manual                                               |
| 6.4  | Implement building icon sprites on tile layer                                                   | `OverworldScene.ts`                                  |
| 6.5  | **Visual QA checkpoint**: assess map noise from building icons; roll back 6.4 if too cluttered  | manual                                               |
| 6.6  | Implement army movement tween (triggered by position delta in `STATE_UPDATE`)                   | `OverworldScene.ts`                                  |
| 6.7  | Replace `SpellCastAnimation.tsx` with Phaser particle emitter per spell school                  | `OverworldScene.ts`, delete `SpellCastAnimation.tsx` |
| 6.8  | Camera drag + scroll-zoom for large maps                                                        | `OverworldScene.ts`                                  |
| 6.9  | `yarn test` — must stay green                                                                   | —                                                    |
| 6.10 | `yarn build` — must stay green                                                                  | —                                                    |

### Phase 7 — Auto-Resolve Battle (TBS)

| #    | Task                                                                                     | Files Affected                                     |
|------|------------------------------------------------------------------------------------------|----------------------------------------------------|
| 7.1  | Define `BattleResult`, `BattleConfig` in `src/map/battle/battleTypes.ts`                 | new                                                |
| 7.2  | Implement `autoResolveBattle(attacker, defender, terrain): BattleResult` (pure function) | `src/map/battle/autoResolveBattle.ts`              |
| 7.3  | Write unit tests for auto-resolve formula (multiple scenarios)                           | new test                                           |
| 7.4  | Implement `applyBattleResult(gameState, result): GameState` (pure function)              | `src/map/battle/applyBattleResult.ts`              |
| 7.5  | Write unit tests for `applyBattleResult`                                                 | new test                                           |
| 7.6  | Add collision detection to `performMovements.ts`                                         | `src/map/move-army/performMovements.ts`            |
| 7.7  | Wire `BattleChoiceDialog` into `endTurn.ts` END phase for human player                   | `src/turn/endTurn.ts`                              |
| 7.8  | Create `BattleChoiceDialog.tsx` ("Fight! (RTS)" disabled for now, "Auto-Resolve" active) | `src/ux-components/dialogs/BattleChoiceDialog.tsx` |
| 7.9  | AI vs AI: call `autoResolveBattle()` directly, no dialog                                 | `endTurn.ts`                                       |
| 7.10 | Integration test: two armies collide → auto-resolve → game state updated                 | new test                                           |
| 7.11 | `yarn test` — must stay green                                                            | —                                                  |

### Phase 8 — Polish & Stabilisation (TBS)

| #   | Task                                                                          | Files Affected           |
|-----|-------------------------------------------------------------------------------|--------------------------|
| 8.1 | Responsive canvas sizing: Phaser canvas fills available height after TopPanel | `PhaserGameInstance.tsx` |
| 8.2 | Performance check: 20×20 map renders at ≥ 60 fps                              | manual                   |
| 8.3 | Verify all 10 dialogs and 4 popups work end-to-end                            | manual                   |
| 8.4 | Verify save/load: `GameState` round-trips and Phaser re-renders correctly     | manual                   |
| 8.5 | Full `yarn test` pass                                                         | —                        |
| 8.6 | `yarn build` + `yarn preview`                                                 | —                        |
| 8.7 | Update `TBS_SPEC.md §14` migration checklist to reflect completion            | `spec/TBS_SPEC.md`       |

### Phase 9 — RTS Scenes (separate workstream, future)

Phases 9+ (Deploy Scene, Battle Scene, full RTS integration) are documented in
§9–11 as concepts. A separate detailed spec will be written before implementation
begins.

---

*End of PHASER_RTS_SPEC.md v0.2*
