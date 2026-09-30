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
