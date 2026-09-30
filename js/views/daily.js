/* ============================================================
   星语 · Starlight Tarot — 每日一牌
   每天固定一张（由日期决定），抽过就锁定，第二天才更新
   ============================================================ */

import { ARROW_BACK, cardBack } from '../core/parts.js';
import { renderCard } from '../core/card-art.js';
import { artOf } from '../core/art-index.js';
import { CARDS, getCard } from '../../data/cards.js';
import { zodiacOf } from '../../data/zodiac.js';
import { makePoster, showPoster, posterLine } from '../core/poster.js';
import { store, todayKey } from '../core/store.js';

/** 由日期字符串生成稳定的伪随机数 */
function seedOf(day) {
  let h = 2166136261;
  for (let i = 0; i < day.length; i++) {
    h ^= day.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}

/** 今天的牌：同一天永远是同一张 */
export function todayCard(day = todayKey()) {
  const pool = CARDS;
  const i = seedOf(day) % pool.length;
  const card = pool[i];
  return { card, reversed: (seedOf(day + 'r') % 100) < 40 };
}

/** 今日是否已抽 */
export const drawnToday = () => !!store.get(`daily.${todayKey()}`, null);

/* ------------------------------------------------------------
   视图
   ------------------------------------------------------------ */
export function renderDaily(root, { onBack, onRecord, onShare } = {}) {
  root.innerHTML = '<div class="draw" id="daily"></div>';
  const el = root.querySelector('#daily');

  const day = todayKey();
  const saved = store.get(`daily.${day}`, null);
  const today = todayCard(day);
  const pick = saved || { card: today.card, reversed: today.reversed };

  const face = pick.reversed ? pick.card.reversed : pick.card.upright;
  const z = zodiacOf(store.get('birth.month'), store.get('birth.day'));

  el.innerHTML = `
  <header class="draw__bar">
    <button class="draw__back" type="button" data-back>${ARROW_BACK}<span>返回</span></button>
    <span class="draw__step">今 日 一 牌</span>
  </header>

  <div class="draw__body draw__body--top daily">
    <p class="daily__date">${day}</p>
    ${saved
      ? `<div class="daily__card is-revealed">
           ${renderCard(pick.card, artOf(pick.card.id), { uid: '-d1' })}
         </div>
         <div class="daily__meta">
           <h2 class="daily__name">${pick.card.name}</h2>
           <span class="rcard__dir">${pick.reversed ? '逆位' : '正位'}</span>
         </div>
         <div class="daily__kw">${face.kw.map((k) => `<span>${k}</span>`).join('')}</div>
         <div class="rtext daily__text">${face.text}</div>
         ${z ? `<div class="rdiv">✦</div><div class="rtext rtext--tail">${z.line}</div>` : ''}
         <div class="draw__acts">
           <button class="act" type="button" id="share">生成今日海报</button>
           <button class="act act--ghost" type="button" id="rec">看看全部记录</button>
         </div>`
      : `<div class="daily__card" id="reveal">
           <button class="daily__back" type="button" aria-label="翻开今日牌">${cardBack('-d1b')}</button>
         </div>
         <p class="daily__hint">每天只有一张，明天才换。<br>轻触翻开今天属于你的牌。</p>`}
  </div>
  `;

  el.querySelector('[data-back]').addEventListener('click', () => onBack?.());
  el.querySelector('#rec')?.addEventListener('click', () => onRecord?.());
  el.querySelector('#share')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true; btn.textContent = '正在生成…';
    try {
      const url = await makePoster(pick.card, pick.reversed, day, posterLine(pick.card));
      showPoster(url);
    } catch (err) { console.error(err); btn.textContent = '生成失败，请重试';
      setTimeout(() => { btn.textContent = '生成今日海报'; btn.disabled = false; }, 1600); return; }
    btn.textContent = '生成今日海报'; btn.disabled = false;
  });

  el.querySelector('#reveal')?.addEventListener('click', () => {
    store.set(`daily.${day}`, { card: pick.card.id, reversed: pick.reversed });
    render();
  });
}
