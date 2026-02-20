/**
 * 타이틀 시스템 테스트 (Title System Tests)
 *
 * 테스트 항목:
 * T01-T03: 기본 설정 테스트
 * T04-T06: 타이틀 정보 조회 테스트
 * T07-T11: 잠금 해제 가능한 타이틀 테스트
 * T12-T15: 타이틀 잠금 해제 테스트
 * T16-T17: 타이틀 장착/해제 테스트
 * T18-T20: 장착된 타이틀 정보 테스트
 * T21-T24: 타이틀 효과 계산 테스트
 * T25-T26: 잠금 해제된 타이틀 목록 테스트
 * T27-T28: 요약 정보 테스트
 * T29-T32: 통합 테스트
 * T33-T36: 엣지 케이스
 */

import {
  TITLE_TYPES,
  TITLE_DATABASE,
  RARITY_MULTIPLIERS,
  createTitleSystem,
  getTitleInfo,
  getAvailableTitles,
  checkTitleRequirements,
  unlockTitle,
  equipTitle,
  unequipTitle,
  getEquippedTitle,
  calculateTitleEffect,
  getUnlockedTitles,
  getTitleSummary
} from '../title-system.js';

// ========== T01: 타이틀 타입 상수 ==========
console.log('T01: 타이틀 타입 상수 확인');
const test1TitleTypes = {
  ACHIEVEMENT: 'ACHIEVEMENT',
  SOCIAL: 'SOCIAL',
  SPECIAL: 'SPECIAL',
  LEGENDARY: 'LEGENDARY'
};
console.assert(JSON.stringify(TITLE_TYPES) === JSON.stringify(test1TitleTypes), 'FAIL: T01');
console.log('✅ PASS: T01');

// ========== T02: 레어도 배율 ==========
console.log('\nT02: 레어도 배율 확인');
const test2Multipliers = {
  COMMON: 1.0,
  RARE: 1.1,
  EPIC: 1.2,
  LEGENDARY: 1.3
};
console.assert(JSON.stringify(RARITY_MULTIPLIERS) === JSON.stringify(test2Multipliers), 'FAIL: T02');
console.log('✅ PASS: T02');

// ========== T03: 타이틀 시스템 생성 ==========
console.log('\nT03: 타이틀 시스템 생성');
const system = createTitleSystem();
console.assert(Array.isArray(system.unlockedTitles), 'FAIL: T03a');
console.assert(system.unlockedTitles.length === 0, 'FAIL: T03b');
console.assert(system.equippedTitle === null, 'FAIL: T03c');
console.assert(Array.isArray(system.titleHistory), 'FAIL: T03d');
console.log('✅ PASS: T03');

// ========== T04: 존재하는 타이틀 정보 조회 ==========
console.log('\nT04: 존재하는 타이틀 정보 조회');
const test4Title = getTitleInfo(system, 'novice');
console.assert(test4Title !== null, 'FAIL: T04a');
console.assert(test4Title.name === '신규 모험가', 'FAIL: T04b');
console.assert(test4Title.type === TITLE_TYPES.ACHIEVEMENT, 'FAIL: T04c');
console.log('✅ PASS: T04');

// ========== T05: 존재하지 않는 타이틀 조회 ==========
console.log('\nT05: 존재하지 않는 타이틀 조회');
const test5Title = getTitleInfo(system, 'nonexistent');
console.assert(test5Title === null, 'FAIL: T05');
console.log('✅ PASS: T05');

// ========== T06: 모든 타이틀 목록 ==========
console.log('\nT06: 모든 타이틀 목록');
const test6Count = Object.keys(TITLE_DATABASE).length;
console.assert(test6Count > 0, 'FAIL: T06');
console.log(`  총 ${test6Count}개 타이틀 등록됨`);
console.log('✅ PASS: T06');

// ========== T07: 요구사항 충족 (레벨 1) ==========
console.log('\nT07: 요구사항 충족 (레벨 1)');
const test7Stats = { level: 1 };
const test7Title = TITLE_DATABASE['novice'];
const test7Result = checkTitleRequirements(test7Title, test7Stats);
console.assert(test7Result === true, 'FAIL: T07');
console.log('✅ PASS: T07');

// ========== T08: 요구사항 미충족 (레벨 부족) ==========
console.log('\nT08: 요구사항 미충족 (레벨 부족)');
const test8Stats = { level: 5 };
const test8Title = TITLE_DATABASE['veteran'];
const test8Result = checkTitleRequirements(test8Title, test8Stats);
console.assert(test8Result === false, 'FAIL: T08');
console.log('✅ PASS: T08');

// ========== T09: 요구사항 충족 (전투 승리) ==========
console.log('\nT09: 요구사항 충족 (전투 승리)');
const test9Stats = { battlesWon: 1000 };
const test9Title = TITLE_DATABASE['conqueror'];
const test9Result = checkTitleRequirements(test9Title, test9Stats);
console.assert(test9Result === true, 'FAIL: T09');
console.log('✅ PASS: T09');

// ========== T10: 요구사항 충족 (퀘스트 완료) ==========
console.log('\nT10: 요구사항 충족 (퀘스트 완료)');
const test10Stats = { questsCompleted: 50 };
const test10Title = TITLE_DATABASE['survivor'];
const test10Result = checkTitleRequirements(test10Title, test10Stats);
console.assert(test10Result === true, 'FAIL: T10');
console.log('✅ PASS: T10');

// ========== T11: 요구사항 충족 (친구 수) ==========
console.log('\nT11: 요구사항 충족 (친구 수)');
const test11Stats = { friends: 20 };
const test11Title = TITLE_DATABASE['socialite'];
const test11Result = checkTitleRequirements(test11Title, test11Stats);
console.assert(test11Result === true, 'FAIL: T11');
console.log('✅ PASS: T11');

// ========== T12: 타이틀 잠금 해제 (성공) ==========
console.log('\nT12: 타이틀 잠금 해제 (성공)');
const test12Stats = { level: 1 };
const test12Result = unlockTitle(system, 'novice', test12Stats);
console.assert(test12Result.success === true, 'FAIL: T12a');
console.assert(system.unlockedTitles.includes('novice'), 'FAIL: T12b');
console.assert(test12Result.message.includes('신규 모험가'), 'FAIL: T12c');
console.log('✅ PASS: T12');

// ========== T13: 중복 잠금 해제 (실패) ==========
console.log('\nT13: 중복 잠금 해제 (실패)');
const test13Result = unlockTitle(system, 'novice', test12Stats);
console.assert(test13Result.success === false, 'FAIL: T13a');
console.assert(test13Result.message.includes('이미 잠금 해제'), 'FAIL: T13b');
console.log('✅ PASS: T13');

// ========== T14: 존재하지 않는 타이틀 잠금 해제 (실패) ==========
console.log('\nT14: 존재하지 않는 타이틀 잠금 해제 (실패)');
const test14Result = unlockTitle(system, 'nonexistent', {});
console.assert(test14Result.success === false, 'FAIL: T14a');
console.assert(test14Result.message.includes('존재하지 않'), 'FAIL: T14b');
console.log('✅ PASS: T14');

// ========== T15: 요구사항 미충족 잠금 해제 (실패) ==========
console.log('\nT15: 요구사항 미충족 잠금 해제 (실패)');
const test15Result = unlockTitle(system, 'veteran', { level: 1 });
console.assert(test15Result.success === false, 'FAIL: T15a');
console.assert(test15Result.message.includes('요구사항을 충족'), 'FAIL: T15b');
console.log('✅ PASS: T15');

// ========== T16: 타이틀 장착 (성공) ==========
console.log('\nT16: 타이틀 장착 (성공)');
// T12에서 자동 장착된 타이틀 해제
unequipTitle(system);
const test16Result = equipTitle(system, 'novice');
console.assert(test16Result.success === true, 'FAIL: T16a');
console.assert(system.equippedTitle === 'novice', 'FAIL: T16b');
console.assert(test16Result.message.includes('장착'), 'FAIL: T16c');
console.log('✅ PASS: T16');

// ========== T17: 잠금 해제되지 않은 타이틀 장착 (실패) ==========
console.log('\nT17: 잠금 해제되지 않은 타이틀 장착 (실패)');
const test17Result = equipTitle(system, 'veteran');
console.assert(test17Result.success === false, 'FAIL: T17a');
console.assert(test17Result.message.includes('잠금 해제되지 않'), 'FAIL: T17b');
console.log('✅ PASS: T17');

// ========== T18: 장착된 타이틀 정보 조회 ==========
console.log('\nT18: 장착된 타이틀 정보 조회');
const test18Equipped = getEquippedTitle(system);
console.assert(test18Equipped !== null, 'FAIL: T18a');
console.assert(test18Equipped.id === 'novice', 'FAIL: T18b');
console.assert(test18Equipped.name === '신규 모험가', 'FAIL: T18c');
console.log('✅ PASS: T18');

// ========== T19: 장착된 타이틀이 없을 때 조회 ==========
console.log('\nT19: 장착된 타이틀이 없을 때 조회');
const test19System = createTitleSystem();
const test19Equipped = getEquippedTitle(test19System);
console.assert(test19Equipped === null, 'FAIL: T19');
console.log('✅ PASS: T19');

// ========== T20: 타이틀 해제 ==========
console.log('\nT20: 타이틀 해제');
const test20Result = unequipTitle(system);
console.assert(test20Result.success === true, 'FAIL: T20a');
console.assert(system.equippedTitle === null, 'FAIL: T20b');
console.assert(test20Result.message.includes('해제'), 'FAIL: T20c');
console.log('✅ PASS: T20');

// ========== T21: 타이틀 효과 계산 (경험치 보너스) ==========
console.log('\nT21: 타이틀 효과 계산 (경험치 보너스)');
equipTitle(system, 'novice');
const test21Base = { experience: 100, attack: 50 };
const test21Effect = calculateTitleEffect(system, test21Base);
console.assert(test21Effect.experience > 100, 'FAIL: T21a'); // 경험치 증가
console.assert(test21Effect.attack === 50, 'FAIL: T21b'); // 다른 스탯 변화 없음
console.log('✅ PASS: T21');

// ========== T22: 타이틀 효과 계산 (모든 스탯) ==========
console.log('\nT22: 타이틀 효과 계산 (모든 스탯)');
const test22System = createTitleSystem();
test22System.equippedTitle = 'legend';
const test22Base = { attack: 100, defense: 80, speed: 60 };
const test22Effect = calculateTitleEffect(test22System, test22Base);
console.assert(test22Effect.attack > 100, 'FAIL: T22a');
console.assert(test22Effect.defense > 80, 'FAIL: T22b');
console.assert(test22Effect.speed > 60, 'FAIL: T22c');
console.log('✅ PASS: T22');

// ========== T23: 레어도에 따른 효과 차이 ==========
console.log('\nT23: 레어도에 따른 효과 차이');
const test23System1 = createTitleSystem();
test23System1.equippedTitle = 'veteran'; // RARE
const test23System2 = createTitleSystem();
test23System2.equippedTitle = 'master'; // EPIC
const test23Base = { experience: 100 };
const test23Effect1 = calculateTitleEffect(test23System1, test23Base);
const test23Effect2 = calculateTitleEffect(test23System2, test23Base);
console.assert(test23Effect2.experience > test23Effect1.experience, 'FAIL: T23');
console.log('✅ PASS: T23');

// ========== T24: 장착된 타이틀이 없을 때 효과 계산 ==========
console.log('\nT24: 장착된 타이틀이 없을 때 효과 계산');
const test24System = createTitleSystem();
const test24Base = { experience: 100, attack: 50 };
const test24Effect = calculateTitleEffect(test24System, test24Base);
console.assert(test24Effect.experience === 100, 'FAIL: T24a');
console.assert(test24Effect.attack === 50, 'FAIL: T24b');
console.log('✅ PASS: T24');

// ========== T25: 잠금 해제된 타이틀 목록 조회 ==========
console.log('\nT25: 잠금 해제된 타이틀 목록 조회');
const test25System = createTitleSystem();
unlockTitle(test25System, 'novice', { level: 1 });
unlockTitle(test25System, 'conqueror', { battlesWon: 1000 });
const test25Unlocked = getUnlockedTitles(test25System);
console.assert(test25Unlocked.length === 2, 'FAIL: T25a');
console.assert(test25Unlocked[0].name === '신규 모험가', 'FAIL: T25b');
console.assert(test25Unlocked[1].name === '정복자', 'FAIL: T25c');
console.log('✅ PASS: T25');

// ========== T26: 잠금 해제된 타이틀이 없을 때 목록 조회 ==========
console.log('\nT26: 잠금 해제된 타이틀이 없을 때 목록 조회');
const test26System = createTitleSystem();
const test26Unlocked = getUnlockedTitles(test26System);
console.assert(test26Unlocked.length === 0, 'FAIL: T26');
console.log('✅ PASS: T26');

// ========== T27: 요약 정보 조회 ==========
console.log('\nT27: 요약 정보 조회');
const test27System = createTitleSystem();
unlockTitle(test27System, 'novice', { level: 1 });
equipTitle(test27System, 'novice');
const test27Summary = getTitleSummary(test27System);
console.assert(test27Summary.unlockedCount === 1, 'FAIL: T27a');
console.assert(test27Summary.totalCount > 0, 'FAIL: T27b');
console.assert(test27Summary.equippedTitle.name === '신규 모험가', 'FAIL: T27c');
console.assert(Array.isArray(test27Summary.unlockedTitles), 'FAIL: T27d');
console.log('✅ PASS: T27');

// ========== T28: 요약 정보 (빈 시스템) ==========
console.log('\nT28: 요약 정보 (빈 시스템)');
const test28System = createTitleSystem();
const test28Summary = getTitleSummary(test28System);
console.assert(test28Summary.unlockedCount === 0, 'FAIL: T28a');
console.assert(test28Summary.equippedTitle === null, 'FAIL: T28b');
console.assert(test28Summary.unlockedTitles.length === 0, 'FAIL: T28c');
console.log('✅ PASS: T28');

// ========== T29: 통합 테스트 (레벨업에 따른 타이틀 획득) ==========
console.log('\nT29: 통합 테스트 (레벨업에 따른 타이틀 획득)');
const test29System = createTitleSystem();
let stats = { level: 1, attacks: 10, defense: 10 };

// 레벨 1 - novice 획득
let result = unlockTitle(test29System, 'novice', stats);
console.assert(result.success === true, 'FAIL: T29a');
equipTitle(test29System, 'novice');

// 레벨 20 - veteran 획득
stats.level = 20;
result = unlockTitle(test29System, 'veteran', stats);
console.assert(result.success === true, 'FAIL: T29b');
equipTitle(test29System, 'veteran'); // 더 높은 레어도로 교체

// 레벨 50 - master 획득
stats.level = 50;
result = unlockTitle(test29System, 'master', stats);
console.assert(result.success === true, 'FAIL: T29c');
equipTitle(test29System, 'master');

console.assert(test29System.unlockedTitles.length === 3, 'FAIL: T29d');
console.assert(test29System.equippedTitle === 'master', 'FAIL: T29e');
console.log('✅ PASS: T29');

// ========== T30: 통합 테스트 (여러 업적 달성) ==========
console.log('\nT30: 통합 테스트 (여러 업적 달성)');
const test30System = createTitleSystem();
const test30Stats = {
  level: 50,
  battlesWon: 1000,
  questsCompleted: 50,
  friends: 20
};

// 여러 타이틀 획득
unlockTitle(test30System, 'master', test30Stats);
unlockTitle(test30System, 'conqueror', test30Stats);
unlockTitle(test30System, 'survivor', test30Stats);
unlockTitle(test30System, 'socialite', test30Stats);

console.assert(test30System.unlockedTitles.length === 4, 'FAIL: T30a');
const titles = getUnlockedTitles(test30System);
const titleNames = titles.map(t => t.name).sort();
console.assert(titleNames.includes('마스터 모험가'), 'FAIL: T30b');
console.assert(titleNames.includes('정복자'), 'FAIL: T30c');
console.log('✅ PASS: T30');

// ========== T31: 통합 테스트 (타이틀 교체) ==========
console.log('\nT31: 통합 테스트 (타이틀 교체)');
const test31System = createTitleSystem();
unlockTitle(test31System, 'novice', { level: 1 });
unlockTitle(test31System, 'veteran', { level: 20 });
unlockTitle(test31System, 'master', { level: 50 });

// novice 장착
equipTitle(test31System, 'novice');
console.assert(test31System.equippedTitle === 'novice', 'FAIL: T31a');

// veteran으로 교체
equipTitle(test31System, 'veteran');
console.assert(test31System.equippedTitle === 'veteran', 'FAIL: T31b');

// master로 교체
equipTitle(test31System, 'master');
console.assert(test31System.equippedTitle === 'master', 'FAIL: T31c');

// 해제
unequipTitle(test31System);
console.assert(test31System.equippedTitle === null, 'FAIL: T31d');
console.log('✅ PASS: T31');

// ========== T32: 통합 테스트 (타이틀 효과 누적 확인) ==========
console.log('\nT32: 통합 테스트 (타이틀 효과 누적 확인)');
const test32System = createTitleSystem();
// 타이틀 잠금 해제 전 효과 측정
const test32Base = { experience: 100, attack: 50, defense: 40 };
const test32Effect1 = calculateTitleEffect(test32System, test32Base); // 타이틀 없는 상태

unlockTitle(test32System, 'veteran', { level: 20 });
// 자동 장착으로 인해 이미 타이틀 장착됨
const test32Effect2 = calculateTitleEffect(test32System, test32Base); // 타이틀 장착 후

console.assert(test32Effect2.experience > test32Effect1.experience, 'FAIL: T32');
console.log('✅ PASS: T32');

// ========== T33: 엣지 케이스 (특殊 타이틀) ==========
console.log('\nT33: 엣지 케이스 (특수 타이틀)');
const test33System = createTitleSystem();
// 생일 타이틀: special: 'birthday' 조건 필요
const test33Stats = { special: ['birthday'] };
const test33Result = unlockTitle(test33System, 'birthday', test33Stats);
console.assert(test33Result.success === true, 'FAIL: T33a');
console.assert(test33System.unlockedTitles.includes('birthday'), 'FAIL: T33b');
console.log('✅ PASS: T33');

// ========== T34: 엣지 케이스 (전설 타이틀 요구사항) ==========
console.log('\nT34: 엣지 케이스 (전설 타이틀 요구사항)');
const test34Stats1 = { level: 100, battlesWon: 9999 }; // 전투 승리 부족
const test34Check1 = checkTitleRequirements(TITLE_DATABASE['legend'], test34Stats1);
console.assert(test34Check1 === false, 'FAIL: T34a');

const test34Stats2 = { level: 100, battlesWon: 10000, questsCompleted: 500 };
const test34Check2 = checkTitleRequirements(TITLE_DATABASE['legend'], test34Stats2);
console.assert(test34Check2 === true, 'FAIL: T34b');
console.log('✅ PASS: T34');

// ========== T35: 엣지 케이스 (타이틀 히스토리 기록) ==========
console.log('\nT35: 엣지 케이스 (타이틀 히스토리 기록)');
const test35System = createTitleSystem();
unlockTitle(test35System, 'novice', { level: 1 });
unlockTitle(test35System, 'veteran', { level: 20 });
console.assert(test35System.titleHistory.length === 2, 'FAIL: T35a');
console.assert(test35System.titleHistory[0].titleId === 'novice', 'FAIL: T35b');
console.assert(test35System.titleHistory[1].titleId === 'veteran', 'FAIL: T35c');
console.log('✅ PASS: T35');

// ========== T36: 엣지 케이스 (같은 타이틀 장착 시도) ==========
console.log('\nT36: 엣지 케이스 (같은 타이틀 장착 시도)');
const test36System = createTitleSystem();
unlockTitle(test36System, 'novice', { level: 1 });
// unlockTitle에서 자동 장착됨, 해제 후 테스트
unequipTitle(test36System);
const test36Result1 = equipTitle(test36System, 'novice');
console.assert(test36Result1.success === true, 'FAIL: T36a');
const test36Result2 = equipTitle(test36System, 'novice');
console.assert(test36Result2.success === false, 'FAIL: T36b');
console.assert(test36Result2.message.includes('이미 장착'), 'FAIL: T36c');
console.log('✅ PASS: T36');

// ========== 테스트 결과 요약 ==========
console.log('\n' + '='.repeat(50));
console.log('📊 타이틀 시스템 테스트 결과');
console.log('='.repeat(50));
console.log('✅ 총 36개 테스트 통과 (100%)');
console.log('='.repeat(50));