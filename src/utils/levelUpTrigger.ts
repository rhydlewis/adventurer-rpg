import { useLevelUpStore } from '../stores/levelUpStore';
import { useCharacterStore } from '../stores/characterStore';

/**
 * Trigger a level-up for the current character
 * This should be called from campaign narrative nodes at level-up milestones
 *
 * @param newLevel - The level to advance to
 * @returns true if level-up was triggered successfully, false otherwise
 *
 * @example
 * // In a narrative choice or campaign node:
 * onSelect: () => {
 *   triggerLevelUp(2); // Advance to level 2
 *   navigateToLevelUpScreen();
 * }
 */
export function triggerLevelUp(newLevel: number): boolean {
  const character = useCharacterStore.getState().character;
  if (!character) {
    console.error('Cannot trigger level-up: no character loaded');
    return false;
  }

  const currentLevel = character.level;
  if (newLevel <= currentLevel) {
    console.error(`Cannot level up: new level ${newLevel} is not greater than current level ${currentLevel}`);
    return false;
  }

  if (newLevel > 5) {
    console.error(`Cannot level up: new level ${newLevel} exceeds maximum level 5`);
    return false;
  }

  const result = useLevelUpStore.getState().triggerLevelUp(newLevel);
  if (!result) {
    console.error(`Failed to calculate level-up to level ${newLevel}`);
    return false;
  }

  return true;
}

/**
 * Check if a level-up is currently in progress
 */
export function isLevelUpInProgress(): boolean {
  return useLevelUpStore.getState().levelUpInProgress;
}

/**
 * Get information about the pending level-up
 */
export function getPendingLevelUp() {
  return useLevelUpStore.getState().pendingLevelUp;
}

/**
 * Complete the current level-up
 * This should be called after the player has made all their choices
 * (feats, skills, spells)
 */
export function completeLevelUp(): void {
  const { levelUpInProgress, pendingLevelUp } = useLevelUpStore.getState();

  if (!levelUpInProgress || !pendingLevelUp) {
    console.error('Cannot complete level-up: no level-up in progress');
    return;
  }

  // Check if feat selection is required and completed
  if (pendingLevelUp.featGained) {
    const { selectedFeat } = useLevelUpStore.getState();
    if (!selectedFeat) {
      console.warn('Feat selection required but not completed - continuing anyway');
    }
  }

  // Check if skill points need to be allocated
  if (pendingLevelUp.skillPoints > 0) {
    const { allocatedSkillPoints, skillPointsToAllocate } = useLevelUpStore.getState();
    const totalAllocated = Object.values(allocatedSkillPoints).reduce(
      (sum, points) => sum + (points || 0),
      0
    );
    if (totalAllocated < skillPointsToAllocate) {
      console.warn(
        `Not all skill points allocated (${totalAllocated}/${skillPointsToAllocate}) - continuing anyway`
      );
    }
  }

  // Check if spells need to be selected
  const { spellsToSelect, selectedSpells } = useLevelUpStore.getState();
  if (spellsToSelect > 0 && selectedSpells.length < spellsToSelect) {
    console.warn(
      `Not all spells selected (${selectedSpells.length}/${spellsToSelect}) - continuing anyway`
    );
  }

  useLevelUpStore.getState().completeLevelUp();
}

/**
 * Cancel the current level-up
 * Useful for testing or if the player backs out
 */
export function cancelLevelUp(): void {
  useLevelUpStore.getState().cancelLevelUp();
}

/**
 * Auto-complete a level-up with default choices
 * Useful for testing or for NPCs
 *
 * @param newLevel - The level to advance to
 */
export function autoLevelUp(newLevel: number): boolean {
  const success = triggerLevelUp(newLevel);
  if (!success) return false;

  const { pendingLevelUp } = useLevelUpStore.getState();
  if (!pendingLevelUp) return false;

  // Auto-select first available feat if needed
  if (pendingLevelUp.featGained) {
    useLevelUpStore.getState().loadAvailableFeats();
    const { availableFeats } = useLevelUpStore.getState();
    if (availableFeats.length > 0) {
      useLevelUpStore.getState().selectFeat(availableFeats[0].id);
    }
  }

  // Auto-allocate skill points evenly if needed
  if (pendingLevelUp.skillPoints > 0) {
    const character = useCharacterStore.getState().character;
    if (character) {
      const skills = Object.keys(character.skills);
      let pointsRemaining = pendingLevelUp.skillPoints;
      let skillIndex = 0;

      while (pointsRemaining > 0 && skillIndex < skills.length) {
        const skillName = skills[skillIndex] as
          | 'Athletics'
          | 'Stealth'
          | 'Perception'
          | 'Arcana'
          | 'Medicine'
          | 'Intimidate';
        useLevelUpStore.getState().allocateSkillPoint(skillName);
        pointsRemaining--;
        skillIndex = (skillIndex + 1) % skills.length;
      }
    }
  }

  // Auto-select spells if needed
  const { spellsToSelect } = useLevelUpStore.getState();
  if (spellsToSelect > 0) {
    useLevelUpStore.getState().loadAvailableSpells();
    const { availableSpells } = useLevelUpStore.getState();

    for (let i = 0; i < Math.min(spellsToSelect, availableSpells.length); i++) {
      useLevelUpStore.getState().selectSpell(availableSpells[i].id);
    }
  }

  completeLevelUp();
  return true;
}
