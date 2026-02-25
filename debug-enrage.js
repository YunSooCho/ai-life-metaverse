/**
 * Debug Enrage Trigger
 */

import RaidBoss from './backend/raid-system/RaidBoss.js';

const testBoss = new RaidBoss({
  bossId: 'boss-1',
  name: 'Test Boss',
  maxHp: 1000000,
  level: 100,
  type: 'normal'
});

console.log('Initial state:');
console.log('  currentHp:', testBoss.currentHp);
console.log('  maxHp:', testBoss.maxHp);
console.log('  isEnraged:', testBoss.isEnraged);
console.log('  enrageThreshold:', testBoss.enrageThreshold);
console.log('');

console.log('After takeDamage(900000):');
const result1 = testBoss.takeDamage(900000);
console.log('  currentHp:', testBoss.currentHp);
console.log('  hpPercent:', testBoss.currentHp / testBoss.maxHp);
console.log('  isEnraged:', testBoss.isEnraged);
console.log('  enrageTriggered (result1):', result1.enrageTriggered);
console.log('  Should enrage?', testBoss.currentHp / testBoss.maxHp <= testBoss.enrageThreshold);
console.log('');

console.log('After takeDamage(1):');
const result2 = testBoss.takeDamage(1);
console.log('  currentHp:', testBoss.currentHp);
console.log('  hpPercent:', testBoss.currentHp / testBoss.maxHp);
console.log('  isEnraged:', testBoss.isEnraged);
console.log('  enrageTriggered (result2):', result2.enrageTriggered);
console.log('  Should enrage?', testBoss.currentHp / testBoss.maxHp <= testBoss.enrageThreshold);
console.log('');

console.log('Expected:');
console.log('  result2.enrageTriggered should be true');
console.log('  testBoss.isEnraged should be true');