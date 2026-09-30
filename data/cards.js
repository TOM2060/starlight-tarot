/* ============================================================
   星语 · Starlight Tarot — 牌库
   ============================================================ */

import { MAJOR } from './major.js';
import { MINOR } from './minor.js';

/** 已解锁的牌：大阿尔克那 22 + 小阿尔克那 40（宫廷牌 16 张待补） */
export const CARDS = [...MAJOR, ...MINOR];

const BY_ID = new Map(CARDS.map((c) => [c.id, c]));
export const getCard = (id) => BY_ID.get(id) || null;

/* ------------------------------------------------------------
   心情
   ------------------------------------------------------------ */
export const MOODS = [
  { id: 'happy',   label: '还不错',   hint: '有点小开心' },
  { id: 'calm',    label: '挺平静',   hint: '没什么起伏' },
  { id: 'lost',    label: '有点迷茫', hint: '不知道该怎么做' },
  { id: 'tired',   label: '有点累',   hint: '想被好好歇一下' },
  { id: 'love',    label: '想被爱',   hint: '心里装着一个人' },
  { id: 'anxious', label: '不踏实',   hint: '说不上来的慌' },
];

/** 心情对解读的影响：一句呼应，不做命运判断 */
export const MOOD_ECHO = {
  happy:   '在你心情不错的时候抽到这张牌，像是宇宙给的好兆头。\n但真正的礼物可能不是"接下来会顺利"，而是"你已经准备好享受这一刻了"。',
  calm:    '平静的时候抽到的牌，说的往往是你没留意到的长期趋势。\n它不是急事，它会慢慢显形。',
  lost:    '迷茫的时候来抽牌，说明你其实已经在找答案了，只是还没允许自己承认。\n这张牌也许不会给你答案，但会给你一个提问的方向。',
  tired:   '累了的时候，我们更容易被"你该努力了"的话术打动。\n所以这张牌，先请你坐下来听。',
  love:    '心里装着一个人的时候，牌会不自觉地往那件事上靠。\n这不是你走神——这说明它对你真的很重要。',
  anxious: '不安的时候，塔罗最擅长做的事是"把模糊的变成具体的"。\n所以别怕看到答案。有时候看清反而安心。',
};

/* ------------------------------------------------------------
   主题
   ------------------------------------------------------------ */
export const TOPICS = [
  { id: 'love', label: '爱情与关系', hint: 'Ta · 我们 · 我' },
  { id: 'work', label: '工作与选择', hint: '去 · 留 · 换' },
  { id: 'self', label: '内心与成长', hint: '我 · 我自己' },
  { id: 'any',  label: '说不清',     hint: '就是想抽一张' },
];

/** 主题的提问模板（供组合牌义收尾使用） */
export const TOPIC_ECHO = {
  love: '关于感情，牌想说的其实只有一句：你值得被认真对待。',
  work: '关于选择，牌提醒你：没有"最优解"，只有"你想走的那条"。',
  self: '关于自己，牌说：你比自己以为的更有主意。',
  any:  '你没有说出口的问题，其实牌都收到了。',
};

/* ------------------------------------------------------------
   抽牌
   ------------------------------------------------------------ */

/** Fisher–Yates 洗牌 */
export function shuffle(arr, rand = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 抽 n 张牌，并决定每张的正逆位
 * @returns [{ card, reversed }]
 */
export function drawCards(n = 1, rand = Math.random) {
  const pool = shuffle(CARDS, rand);
  const out = [];
  for (let i = 0; i < n && i < pool.length; i++) {
    out.push({ card: pool[i], reversed: rand() < 0.42 });
  }
  return out;
}

/** 三张牌的位置说明 */
export const SPREAD_POS = ['此刻', '正在发生', '正在走向'];

/* ------------------------------------------------------------
   解读组装
   ------------------------------------------------------------ */

/** 把多张牌串成一段连贯叙述 */
export function composeReading(draws, { mood, topic }) {
  const parts = draws.map(({ card, reversed }, i) => {
    const face = reversed ? card.reversed : card.upright;
    return {
      id: card.id,
      name: card.name,
      en: card.en,
      reversed,
      pos: draws.length > 1 ? SPREAD_POS[i] : null,
      kw: face.kw,
      text: face.text,
    };
  });

  // 单张：牌义 + 心情呼应
  if (parts.length === 1) {
    return {
      parts,
      bridge: mood ? MOOD_ECHO[mood] : '',
      tail: topic && topic !== 'any' ? TOPIC_ECHO[topic] : '',
    };
  }

  // 多张：用位置串成故事
  const kwA = parts[0].kw[0];
  const kwB = parts[1].kw[0];
  const kwC = parts[2]?.kw[0];

  const bridge = parts.length === 2
    ? `如果把这两张牌连起来看：\n"${kwA}"是眼下的状态，"${kwB}"是它正在变成的方向。\n前者不是问题，后者是出口。`
    : `把这三张牌连成一句话：\n从"${kwA}"出发，经过"${kwB}"，走向"${kwC}"。\n你现在站在第二段。`;

  return {
    parts,
    bridge,
    tail: topic && topic !== 'any' ? TOPIC_ECHO[topic] : '',
  };
}
