export const LEVELS = [
  { level: 1, xpRequired: 0, title: 'Rookie Runner' },
  { level: 2, xpRequired: 100, title: 'Trail Beginner' },
  { level: 3, xpRequired: 300, title: 'Path Finder' },
  { level: 4, xpRequired: 600, title: 'Territory Scout' },
  { level: 5, xpRequired: 1000, title: 'Land Claimer' },
  { level: 6, xpRequired: 1500, title: 'Zone Master' },
  { level: 7, xpRequired: 2200, title: 'Area Commander' },
  { level: 8, xpRequired: 3000, title: 'Region Conqueror' },
  { level: 9, xpRequired: 4000, title: 'Domain Ruler' },
  { level: 10, xpRequired: 5500, title: 'Territory King' },
  { level: 11, xpRequired: 7500, title: 'Empire Builder' },
  { level: 12, xpRequired: 10000, title: 'Legend' },
];

export const FREE_TERRITORY_LIMIT = 3;

export const POINTS_PER_KM = 10;
export const POINTS_PER_TERRITORY = 50;
export const POINTS_PER_DAY_HOLDING = 5;

export function getLevelInfo(xp: number) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];
  
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }
  
  const xpInCurrentLevel = xp - currentLevel.xpRequired;
  const xpToNextLevel = nextLevel.xpRequired - currentLevel.xpRequired;
  const progress = xpToNextLevel > 0 ? xpInCurrentLevel / xpToNextLevel : 1;
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    xpToNextLevel: nextLevel.xpRequired - xp,
    progress,
  };
}
