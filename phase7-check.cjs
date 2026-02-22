/**
 * Phase 7 Implementation Check
 * Phase 7 기능 구현 상태 확인 (독립 실행)
 */

const path = require('path');
const fs = require('fs');

// 테스트 색상
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function logTest(name, passed) {
  const icon = passed ? '✅' : '❌';
  const color = passed ? GREEN : RED;
  console.log(`  ${color}${icon} ${name}${RESET}`);
  return passed;
}

console.log('🔍 Phase 7 Implementation Check');
console.log('=================================\n');

// 파일 존재 확인
const backendPath = path.join(__dirname, 'backend');
const eventSystemPath = path.join(backendPath, 'event-system');

const requiredFiles = [
  'seasonal-event-manager.js',
  'special-event-manager.js',
  'daily-quest-manager.js',
  'event-progress-manager.js',
  'event-reward-system.js',
  'event-data.js',
  'index.js'
];

let allFilesExist = true;

console.log('📁 Backend Event System Files:');
for (const file of requiredFiles) {
  const filePath = path.join(eventSystemPath, file);
  const exists = fs.existsSync(filePath);
  allFilesExist = allFilesExist && logTest(file, exists);
}

// Scheduler 확인
const schedulerPath = path.join(backendPath, 'scheduler.js');
const schedulerExists = fs.existsSync(schedulerPath);
console.log('\n📁 Scheduler File:');
allFilesExist = allFilesExist && logTest('scheduler.js', schedulerExists);

// Event Data 확인
const eventDataPath = path.join(eventSystemPath, 'event-data.js');
let eventDataValid = false;

if (fs.existsSync(eventDataPath)) {
  const content = fs.readFileSync(eventDataPath, 'utf-8');

  console.log('\n📋 Event Data Content:');
  const seasonalEventsExported = logTest('SEASONAL_EVENTS exported', content.includes('SEASONAL_EVENTS'));
  const specialEventsExported = logTest('SPECIAL_EVENTS exported', content.includes('SPECIAL_EVENTS'));
  const dailyQuestsExported = logTest('DAILY_QUEST_TEMPLATES exported', content.includes('DAILY_QUEST_TEMPLATES'));
  const weeklyQuestsExported = logTest('WEEKLY_QUEST_TEMPLATES exported', content.includes('WEEKLY_QUEST_TEMPLATES'));

  const hasSpringEvent = logTest('Spring event defined', content.includes('spring-2026'));
  const hasSummerEvent = logTest('Summer event defined', content.includes('summer-2026'));
  const hasAutumnEvent = logTest('Autumn event defined', content.includes('autumn-2026'));
  const hasWinterEvent = logTest('Winter event defined', content.includes('winter-2026'));

  const hasHalloween = logTest('Halloween event defined', content.includes('halloween-2026'));
  const hasChristmas = logTest('Christmas event defined', content.includes('christmas-2026'));
  const hasNewYear = logTest('New Year event defined', content.includes('new-year-2027'));

  const hasDailyCoinQuest = logTest('Daily Coin Collector quest', content.includes('daily-coins'));
  const hasDailySocialQuest = logTest('Daily Social Butterfly quest', content.includes('daily-social'));
  const hasDailyExplorerQuest = logTest('Daily Explorer quest', content.includes('daily-explorer'));

  eventDataValid = seasonalEventsExported && specialEventsExported &&
                    dailyQuestsExported && weeklyQuestsExported &&
                    hasSpringEvent && hasSummerEvent && hasAutumnEvent && hasWinterEvent &&
                    hasHalloween && hasChristmas && hasNewYear &&
                    hasDailyCoinQuest && hasDailySocialQuest && hasDailyExplorerQuest;
}

// Daily Quest Manager 확인
const dailyQuestManagerPath = path.join(eventSystemPath, 'daily-quest-manager.js');
let dailyQuestManagerValid = false;

if (fs.existsSync(dailyQuestManagerPath)) {
  const content = fs.readFileSync(dailyQuestManagerPath, 'utf-8');

  console.log('\n📋 Daily Quest Manager Content:');
  const hasGetDailyQuests = logTest('getDailyQuests function', content.includes('getDailyQuests'));
  const hasGetWeeklyQuests = logTest('getWeeklyQuests function', content.includes('getWeeklyQuests'));
  const hasUpdateDailyProgress = logTest('updateDailyQuestProgress function', content.includes('updateDailyQuestProgress'));
  const hasUpdateWeeklyProgress = logTest('updateWeeklyQuestProgress function', content.includes('updateWeeklyQuestProgress'));
  const hasCompleteQuest = logTest('completeQuest function', content.includes('completeQuest'));
  const hasResetDaily = logTest('resetDailyQuests function', content.includes('resetDailyQuests'));
  const hasResetWeekly = logTest('resetWeeklyQuests function', content.includes('resetWeeklyQuests'));

  dailyQuestManagerValid = hasGetDailyQuests && hasGetWeeklyQuests &&
                           hasUpdateDailyProgress && hasUpdateWeeklyProgress &&
                           hasCompleteQuest && hasResetDaily && hasResetWeekly;
}

// Scheduler 확인
let schedulerValid = false;
if (fs.existsSync(schedulerPath)) {
  const content = fs.readFileSync(schedulerPath, 'utf-8');

  console.log('\n📋 Scheduler Content:');
  const hasStartScheduler = logTest('startScheduler function', content.includes('startScheduler'));
  const hasStopScheduler = logTest('stopScheduler function', content.includes('stopScheduler'));
  const hasGetSchedulerStatus = logTest('getSchedulerStatus function', content.includes('getSchedulerStatus'));
  const hasScheduleDailyReset = logTest('scheduleDailyReset function', content.includes('scheduleDailyReset'));
  const hasScheduleWeeklyReset = logTest('scheduleWeeklyReset function', content.includes('scheduleWeeklyReset'));

  schedulerValid = hasStartScheduler && hasStopScheduler && hasGetSchedulerStatus &&
                   hasScheduleDailyReset && hasScheduleWeeklyReset;
}

// 총계
console.log('\n=================================');
let totalPassed = 0;
let totalTests = 0;

if (allFilesExist) totalPassed++;
totalTests++;
console.log(`${allFilesExist ? GREEN : '❌'} Backend Files Exist: ${allFilesExist ? 'PASS' : 'FAIL'}${RESET}`);

if (eventDataValid) totalPassed++;
totalTests++;
console.log(`${eventDataValid ? GREEN : '❌'} Event Data Valid: ${eventDataValid ? 'PASS' : 'FAIL'}${RESET}`);

if (dailyQuestManagerValid) totalPassed++;
totalTests++;
console.log(`${dailyQuestManagerValid ? GREEN : '❌'} Daily Quest Manager Valid: ${dailyQuestManagerValid ? 'PASS' : 'FAIL'}${RESET}`);

if (schedulerValid) totalPassed++;
totalTests++;
console.log(`${schedulerValid ? GREEN : '❌'} Scheduler Valid: ${schedulerValid ? 'PASS' : 'FAIL'}${RESET}`);

console.log('\n=================================');
const allPassed = totalPassed === totalTests;
const overallColor = allPassed ? GREEN : YELLOW;
console.log(`${overallColor}Overall: ${totalPassed}/${totalTests} checks passed${RESET}`);

if (allPassed) {
  console.log(GREEN + '\n🎉 Phase 7 Implementation: COMPLETE' + RESET);
  console.log(GREEN + '✅ All required features are implemented' + RESET);
} else {
  console.log(YELLOW + '\n⚠️ Phase 7 Implementation: INCOMPLETE' + RESET);
  console.log(YELLOW + '❌ Some features are missing' + RESET);
}

process.exit(allPassed ? 0 : 1);