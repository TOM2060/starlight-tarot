/* ============================================================
   星语 · Starlight Tarot — 彩蛋
   三种：
   ① 稀有牌抽中时爆发星光
   ② 特定牌组合触发隐藏短句
   ③ 连续签到里程碑
   ============================================================ */

import { store, todayKey } from './store.js';

/* ------------------------------------------------------------
   ① 稀有牌
   ------------------------------------------------------------ */
const RARE = {
  'major-21': { name: '世界', line: '一个循环，在这里合上了。' },
  'major-19': { name: '太阳', line: '这是牌里最亮的一张。你值得。' },
  'major-17': { name: '星星', line: '你身上有伤，但你还站在这里。' },
  'major-06': { name: '恋人', line: '允许自己说出"我想要什么"。' },
  'major-20': { name: '审判', line: '那个召唤你很久了。今天可以回应。' },
  'major-00': { name: '愚者', line: '所有伟大的故事，都从这一步开始。' },
  'major-11': { name: '正义', line: '你值得被公平地对待——包括被你自己。' },
  'major-14': { name: '节制', line: '刚刚好，是最难也最值得的状态。' },
};

export function rareOf(cardId) {
  return RARE[cardId] || null;
}

/* ------------------------------------------------------------
   ② 隐藏组合
   ------------------------------------------------------------ */
const COMBO = [
  { key: ['major-06', 'major-06'], line: '抽到两张恋人。\n有些相遇值得被认真对待。' },
  { key: ['major-21', 'major-19'], line: '圆满之后，还能发光。\n这张组合很少见，收好了。' },
  { key: ['major-16', 'major-17'], line: '高塔之后是星星。\n塌掉的从来不是全部。' },
  { key: ['major-13', 'major-00'], line: '结束之后是开始。\n你正走在这条线上。' },
  { key: ['cups-10', 'coins-10'], line: '心里满了，日子也满了。\n这很难得。' },
  { key: ['major-18', 'major-19'], line: '云散了，太阳在。\n会好的。' },
];

export function comboOf(draws) {
  if (draws.length < 2) return null;
  const ids = draws.map((d) => d.card.id);
  for (const c of COMBO) {
    if (c.key.every((k) => ids.includes(k))) return c;
  }
  return null;
}

/* ------------------------------------------------------------
   ③ 连续签到里程碑
   ------------------------------------------------------------ */
const MILESTONE = {
  3:  '第三天。你已经把它当成习惯的一部分了。',
  7:  '整整一周。\n有些东西，是靠坚持才有意义的。',
  14: '两周。14 个夜晚，你都来看了一眼。',
  30: '三十天。\n这已经不是随手点开，是属于你的仪式了。',
  100: '一百天。\n我们不说坚持，只说：你还在。',
};

export function milestoneOf(streak) {
  return MILESTONE[streak] || null;
}

/* ------------------------------------------------------------
   ④ 深夜彩蛋：夜里来抽，招呼语不一样
   ------------------------------------------------------------ */
export function nightMode() {
  const h = new Date().getHours();
  return h >= 23 || h < 5;
}

export function nightLine() {
  const L = [
    '这个点还醒着的人，往往有心事。',
    '夜里抽的牌，比白天诚实一点。',
    '睡不着的时候，牌会陪你坐一会儿。',
    '深夜的牌不急着告诉你答案。',
  ];
  return L[(new Date().getDate()) % L.length];
}

/* ------------------------------------------------------------
   ⑤ 首次抽牌彩蛋记录
   ------------------------------------------------------------ */
export const firstDrawKey = 'egg.firstDraw';

export function markFirstDraw(ids) {
  if (store.get(firstDrawKey)) return null;
  store.set(firstDrawKey, { ids, at: new Date().toISOString(), day: todayKey() });
  return '这是你在星语抽的第一副牌。\n它会一直记在这里。';
}

/* ============================================================
   彩蛋 · 第二批
   ============================================================ */

/** 三张全同花色 */
export function sameSuit(draws) {
  if (draws.length < 2) return null;
  const suits = new Set(draws.map((d) => d.card.suit));
  if (suits.size !== 1) return null;
  const suit = [...suits][0];
  const NAME = { wands: '权杖', cups: '圣杯', swords: '宝剑', coins: '星币', major: '大牌' };
  return {
    tag: '同 一 花 色',
    name: NAME[suit] || suit,
    line: `这副牌里有 ${draws.length} 张${NAME[suit] || ''}。\n同一件事说了三遍——它大概真的很想被听见。`,
  };
}

/** 三张全逆位 */
export function allReversed(draws) {
  if (draws.length < 2 || draws.some((d) => !d.reversed)) return null;
  return {
    tag: '全 逆 位',
    name: '沉 下 来 了',
    line: '全部朝下。\n这不是坏事，是提醒你：这件事该从内部看看了。',
  };
}

/** 连续 3 次抽到同一张牌 */
export function repeatCard(draws, history) {
  if (!draws.length) return null;
  const id = draws[0].card.id;
  const hit = history.filter((h) => h.cards[0]?.id === id).length;
  if (hit < 3) return null;
  return {
    tag: '第 ' + hit + ' 次 相 遇',
    name: draws[0].card.name,
    line: '同一张牌已经来找你 ' + hit + ' 次了。\n它大概有话没说完。',
  };
}

/** 星座 × 守护牌 */
const ZODIAC = {
  aries:     { cards: ['wands-01', 'wands-knight'], line: '白羊的守护元素是火。这张牌正烧着。' },
  taurus:    { cards: ['coins-01', 'coins-king'], line: '金牛的守护元素是土。这张牌踩得很稳。' },
  gemini:    { cards: ['swords-01', 'swords-page'], line: '双子的守护元素是风。这张牌来得很快。' },
  cancer:    { cards: ['cups-02', 'cups-queen'], line: '巨蟹的守护元素是水。这张牌有点想靠近你。' },
  leo:       { cards: ['major-19'], line: '狮子的守护牌是太阳。难怪你今天很亮。' },
  virgo:     { cards: ['swords-03'], line: '处女的守护牌是宝剑三。看清，比感觉难。' },
  libra:     { cards: ['major-11'], line: '天秤的守护牌是正义。你一向在意公平。' },
  scorpio:   { cards: ['major-18'], line: '天蝎的守护牌是月亮。你一向看得很深。' },
  sagittarius: { cards: ['wands-knight'], line: '射手的守护牌是权杖骑士。该跑了。' },
  capricorn: { cards: ['coins-king'], line: '摩羯的守护牌是星币国王。稳是你的天赋。' },
  aquarius:  { cards: ['major-17'], line: '水瓶的守护牌是星星。你身上有点不一样的东西。' },
  pisces:    { cards: ['cups-01'], line: '双鱼的守护牌是圣杯首牌。你的感受力是天赋。' },
};

/** 心情与牌的反差 */
const MOOD_CONTRAST = {
  lost:    { cards: ['major-19', 'major-21', 'major-17'], line: '迷茫的时候抽到这张——\n说明方向早就在了，只是你还没低头看见。' },
  anxious: { cards: ['major-21', 'major-19'], line: '不踏实的时候抽到这张——\n你正在担心的事，可能已经在往好的方向走了。' },
  tired:   { cards: ['major-00', 'major-17', 'cups-01'], line: '很累的时候抽到这张——\n它不是让你再撑，是允许你重新开始。' },
  love:    { cards: ['swords-01', 'major-15'], line: '心里装着一个人的时候抽到这张——\n看清对方，比更喜欢更重要。' },
  happy:   { cards: ['major-12', 'coins-05'], line: '心情好的时候抽到这张——\n提醒你：好日子也值得认真过。' },
  calm:    { cards: ['major-07', 'wands-08'], line: '平静的时候抽到这张——\n它说的是一件还在往前走的事。' },
};

export function zodiacResonance(draws, signKey) {
  const z = ZODIAC[signKey];
  if (!z) return null;
  const hit = draws.find((d) => z.cards.includes(d.card.id));
  if (!hit) return null;
  return { tag: '星 座 共 鸣', name: z.line.slice(0, 5), line: z.line };
}

export function moodContrast(draws, moodId) {
  const m = MOOD_CONTRAST[moodId];
  if (!m) return null;
  const hit = draws.find((d) => m.cards.includes(d.card.id));
  if (!hit) return null;
  return { tag: '心 情 呼 应', name: '★', line: m.line };
}

/** 连续 7 天抽牌 */
export function drawStreak(history) {
  const days = new Set(history.map((h) => h.day));
  let n = 0;
  const d = new Date();
  for (;;) {
    const p = (x) => String(x).padStart(2, '0');
    const key = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    if (days.has(key)) n++;
    else if (n > 0) break;
    else if (key !== todayKey()) break;
    d.setDate(d.getDate() - 1);
    if (n > 400) break;
  }
  if (n < 7) return null;
  return { tag: '连 续 抽 牌', name: `${n} 天`, line: `你已经连着 ${n} 天来了。\n这不叫习惯，这叫惦记。` };
}

/** 本月见过的不同牌数里程碑 */
const COLLECT = {
  10: '见了 10 张不同的牌。你在认它们了。',
  30: '见过 30 张不同的牌。这副牌开始有你的样子。',
  50: '见过 50 张。再多点，就能凑齐一整副。',
  78: '七十八张，全部见过。\n你可以闭着眼睛翻牌了。',
};
export function collectMilestone(seenCount) {
  if (!COLLECT[seenCount]) return null;
  return { tag: '牌 库 收 集', name: `${seenCount} / 78`, line: COLLECT[seenCount] };
}
