import { DiceRoller, DiceRoll } from '@dice-roller/rpg-dice-roller';
import type { Character } from '../types/character';
import type { SkillName } from '../types/skill';
import type {
  Requirement,
  Choice,
  ChoiceOutcome,
  NodeEffect,
  LogEntry,
  WorldState,
  SkillCheckResult,
  OutcomeResolution,
  EffectResult,
} from '../types/narrative';
import { getTotalSkillBonus } from './skills';

const roller = new DiceRoller();

// =============================================================================
// Requirement Checking
// =============================================================================

/**
 * Check if a single requirement is met
 */
export function checkRequirement(
  req: Requirement,
  world: WorldState,
  player: Character
): boolean {
  switch (req.type) {
    case 'flag':
      return world.flags[req.flag] === req.value;

    case 'item':
      return world.inventory.includes(req.itemId);

    case 'attribute': {
      const score = player.attributes[req.attr];
      return score >= req.min;
    }

    case 'skill': {
      const ranks = player.skills[req.skill];
      return ranks >= req.minRanks;
    }

    case 'class':
      return player.class === req.class;

    case 'previousChoice':
      // This is checked against conversation state, not world state
      // The store will handle this separately
      return true;

    case 'nodeVisited':
      return world.visitedNodeIds.includes(req.nodeId);

    default:
      return false;
  }
}

/**
 * Check if all requirements are met (AND logic)
 */
export function checkAllRequirements(
  requirements: Requirement[],
  world: WorldState,
  player: Character
): boolean {
  return requirements.every((req) => checkRequirement(req, world, player));
}

/**
 * Filter choices to only those with met requirements
 */
export function getAvailableChoices(
  choices: Choice[],
  world: WorldState,
  player: Character,
  visitedChoiceIds: string[] = []
): Choice[] {
  return choices.filter((choice) => {
    // Check world/player requirements
    if (choice.requirements && choice.requirements.length > 0) {
      // Handle previousChoice requirements separately
      const worldReqs = choice.requirements.filter(
        (r) => r.type !== 'previousChoice'
      );
      const previousChoiceReqs = choice.requirements.filter(
        (r) => r.type === 'previousChoice'
      ) as { type: 'previousChoice'; choiceId: string }[];

      // All world requirements must pass
      if (!checkAllRequirements(worldReqs, world, player)) {
        return false;
      }

      // All previousChoice requirements must be in visitedChoiceIds
      for (const req of previousChoiceReqs) {
        if (!visitedChoiceIds.includes(req.choiceId)) {
          return false;
        }
      }
    }

    return true;
  });
}

// =============================================================================
// Skill Check Resolution
// =============================================================================

/**
 * Perform a skill check
 */
export function resolveSkillCheck(
  player: Character,
  skill: SkillName,
  dc: number
): SkillCheckResult {
  // Roll d20
  const result = roller.roll('1d20') as DiceRoll;
  const roll = result.total;

  // Get skill modifier
  const modifier = getTotalSkillBonus(player, skill);

  // Calculate total and compare to DC
  const total = roll + modifier;
  const success = total >= dc;

  return {
    skill,
    roll,
    modifier,
    total,
    dc,
    success,
  };
}

/**
 * Create a log entry for a skill check result
 */
export function createSkillCheckLogEntry(result: SkillCheckResult): LogEntry {
  return {
    type: 'skillCheck',
    skill: result.skill,
    roll: result.roll,
    modifier: result.modifier,
    total: result.total,
    dc: result.dc,
    success: result.success,
  };
}

// =============================================================================
// Outcome Resolution
// =============================================================================

/**
 * Recursively resolve a choice outcome
 */
export function resolveOutcome(
  outcome: ChoiceOutcome,
  player: Character,
  currentNodeId: string
): OutcomeResolution {
  switch (outcome.type) {
    case 'goto':
      return {
        nextNodeId: outcome.nodeId,
        logEntries: [],
        worldUpdates: {},
      };

    case 'loop':
      return {
        nextNodeId: currentNodeId,
        logEntries: [],
        worldUpdates: {},
      };

    case 'exit':
      return {
        nextNodeId: null,
        logEntries: [],
        worldUpdates: {},
      };

    case 'check': {
      // Perform the skill check
      const checkResult = resolveSkillCheck(player, outcome.skill, outcome.dc);
      const logEntry = createSkillCheckLogEntry(checkResult);

      // Recursively resolve the success or failure outcome
      const nextOutcome = checkResult.success
        ? outcome.success
        : outcome.failure;
      const resolution = resolveOutcome(nextOutcome, player, currentNodeId);

      return {
        nextNodeId: resolution.nextNodeId,
        logEntries: [logEntry, ...resolution.logEntries],
        worldUpdates: resolution.worldUpdates,
      };
    }

    case 'explore':
      // Trigger exploration UI - store will handle the exploration table lookup
      return {
        nextNodeId: currentNodeId, // Stay on current node until exploration resolves
        logEntries: [],
        worldUpdates: {},
        exploreTrigger: {
          tableId: outcome.tableId,
          onceOnly: outcome.onceOnly,
        },
      };

    case 'merchant':
      // Trigger merchant UI
      return {
        nextNodeId: currentNodeId, // Stay on current node until merchant closes
        logEntries: [],
        worldUpdates: {},
        merchantTrigger: {
          shopInventory: outcome.shopInventory,
          buyPrices: outcome.buyPrices,
        },
      };

    case 'characterCreation':
      // Trigger character creation UI
      return {
        nextNodeId: null, // Don't navigate yet
        logEntries: [],
        worldUpdates: {},
        characterCreationTrigger: {
          phase: outcome.phase,
          nextNodeId: outcome.nextNodeId,
        },
      };

    default:
      return {
        nextNodeId: null,
        logEntries: [],
        worldUpdates: {},
      };
  }
}

// =============================================================================
// Effect Processing
// =============================================================================

/**
 * Process node entry effects
 */
export function processNodeEffects(
  effects: NodeEffect[],
  world: WorldState
): EffectResult {
  const logEntries: LogEntry[] = [];
  const worldUpdates: Partial<WorldState> = {};
  let combatTrigger: EffectResult['combatTrigger'] = undefined;
  let levelUpTrigger: EffectResult['levelUpTrigger'] = undefined;

  // Clone arrays to avoid mutating original
  const newFlags = { ...world.flags };
  const newInventory = [...world.inventory];

  for (const effect of effects) {
    switch (effect.type) {
      case 'setFlag':
        newFlags[effect.flag] = effect.value;
        break;

      case 'giveItem':
        if (!newInventory.includes(effect.itemId)) {
          newInventory.push(effect.itemId);
          logEntries.push({
            type: 'effect',
            message: `Received: ${effect.itemId}`,
          });
        }
        break;

      case 'removeItem': {
        const index = newInventory.indexOf(effect.itemId);
        if (index !== -1) {
          newInventory.splice(index, 1);
          logEntries.push({
            type: 'effect',
            message: `Lost: ${effect.itemId}`,
          });
        }
        break;
      }

      case 'giveGold':
        // Will be handled by character store
        logEntries.push({
          type: 'effect',
          message: `Received ${effect.amount} gold`,
        });
        break;

      case 'startCombat':
        combatTrigger = {
          enemyId: effect.enemyId,
          onVictoryNodeId: effect.onVictoryNodeId,
        };
        break;

      case 'heal':
        // Will be handled by character store
        logEntries.push({
          type: 'effect',
          message:
            effect.amount === 'full'
              ? 'Fully healed!'
              : `Healed ${effect.amount} HP`,
        });
        break;

      case 'damage':
        // Will be handled by character store
        logEntries.push({
          type: 'effect',
          message: `Took ${effect.amount} damage!`,
        });
        break;

      case 'showCompanionHint':
        logEntries.push({
          type: 'companion',
          hint: effect.hint,
        });
        break;

      case 'levelUp':
        levelUpTrigger = {
          newLevel: effect.newLevel,
          featChoices: effect.featChoices,
        };
        logEntries.push({
          type: 'effect',
          message: `You've reached level ${effect.newLevel}!`,
        });
        break;
    }
  }

  // Only include updates if something changed
  if (Object.keys(newFlags).length !== Object.keys(world.flags).length ||
      Object.keys(newFlags).some(k => newFlags[k] !== world.flags[k])) {
    worldUpdates.flags = newFlags;
  }

  if (newInventory.length !== world.inventory.length ||
      newInventory.some((item, i) => item !== world.inventory[i])) {
    worldUpdates.inventory = newInventory;
  }

  return {
    logEntries,
    worldUpdates,
    combatTrigger,
    levelUpTrigger,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get display text for a choice (handles skill check formatting)
 */
export function getChoiceDisplayText(choice: Choice): string {
  if (choice.displayText) {
    return choice.displayText;
  }

  // Auto-generate display text for skill checks
  if (choice.outcome.type === 'check') {
    return `🎲 ${choice.outcome.skill} DC ${choice.outcome.dc} ${choice.text}`;
  }

  return choice.text;
}

/**
 * Check if a choice has a skill check
 */
export function choiceHasSkillCheck(choice: Choice): boolean {
  return choice.outcome.type === 'check';
}

/**
 * Format a skill check result for display
 */
export function formatSkillCheckResult(result: SkillCheckResult): string {
  const modSign = result.modifier >= 0 ? '+' : '';
  const successText = result.success ? 'Success!' : 'Failed';
  return `${result.skill}: ${result.roll}${modSign}${result.modifier} = ${result.total} vs DC ${result.dc} - ${successText}`;
}
