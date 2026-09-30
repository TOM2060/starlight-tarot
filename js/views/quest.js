/* ============================================================
   星语 · Starlight Tarot — 闯关地图
   3 章 30 关 · 牌意判断题
   ============================================================ */

import { ARROW_BACK, CHECK } from '../core/parts.js';
import { renderCard } from '../core/card-art.js';
import { artOf } from '../core/art-index.js';
import { getCard } from '../../data/cards.js';
import { CHAPTERS, levelOf, ALL_LEVELS } from '../../data/levels.js';
import { store } from '../core/store.js';
import { sfx } from '../core/audio.js';

const KEY = 'quest.cleared';

/* ---------------- 进度 ---------------- */
const cleared = () => new Set(store.get(KEY, []) || []);
/* 只有第一章第 1 关默认开启；其余需先通过前一关 */
const isUnlocked = (no) => {
  const done = cleared();
  return no === 101 || done.has(no - 1) || done.has(no);
};

export function renderQuest(root, { onBack, onToast, startAt } = {}) {
  root.innerHTML = '<div class="draw" id="quest"></div>';
  const el = root.querySelector('#quest');

  /* ================= 地图 ================= */
  function map() {
    const done = cleared();
    const total = ALL_LEVELS.length;
    const got = ALL_LEVELS.filter((l) => done.has(l.no)).length;

    el.innerHTML = `
    <header class="draw__bar">
      <button class="draw__back" type="button" data-back>${ARROW_BACK}<span>返回</span></button>
      <span class="draw__step">闯 关 地 图</span>
    </header>

    <div class="draw__body draw__body--top quest">
      <div class="quest__head">
        <div class="quest__num"><b>${got}</b><span>/ ${total}</span></div>
        <p class="quest__hint">${got === 0 ? '从第一章开始，认识每张牌想说的话。'
          : got === total ? '三十关全通。你已经能读懂这整副牌了。'
          : `已经点亮 ${got} 颗星，继续往前走。`}</p>
      </div>

      ${CHAPTERS.map((c) => `
        <section class="chapter" style="--tint:${c.tint}">
          <div class="chapter__h">
            <b>第${'一二三'[c.id - 1]}章</b>
            <span>${c.name}</span>
            <em>${c.sub}</em>
          </div>
          <div class="chapter__track">
            ${c.levels.map((lv, i) => {
              const no = c.id * 100 + i + 1;
              const done_ = done.has(no);
              const open = isUnlocked(no);
              const next = !done_ && open && !ALL_LEVELS.some((l) => l.no === no - 1 && !done.has(l.no));
              return `
              <button class="node ${done_ ? 'is-done' : ''} ${open ? 'is-open' : 'is-locked'} ${next ? 'is-next' : ''}"
                      type="button" data-no="${no}" ${open ? '' : 'disabled'}>
                <span class="node__dot">${done_ ? '★' : i + 1}</span>
                <span class="node__tip">${done_ ? '已通过' : open ? '可挑战' : '未解锁'}</span>
              </button>`;
            }).join('')}
            <i class="chapter__line"></i>
          </div>
        </section>
      `).join('')}
    </div>`;

    el.querySelector('[data-back]').addEventListener('click', () => onBack?.());
    el.querySelectorAll('.node').forEach((b) => {
      b.addEventListener('click', () => play(Number(b.dataset.no)));
    });
  }

  /* ================= 答题 ================= */
  function play(no) {
    const lv = levelOf(no);
    if (!lv) return;
    const card = getCard(lv.cardId);
    const ch = CHAPTERS.find((c) => c.id === lv.chapter);
    const idxInCh = (no % 100) - 1;
    let picked = null;

    el.innerHTML = `
    <header class="draw__bar">
      <button class="draw__back" type="button" data-quit>${ARROW_BACK}<span>地图</span></button>
      <span class="draw__step">${ch.name} · ${idxInCh + 1}/10</span>
    </header>

    <div class="draw__body draw__body--top quiz">
      <div class="quiz__art">${renderCard(card, artOf(card.id), { uid: `-q${no}` })}</div>
      <p class="quiz__name">${card.name}</p>
      <p class="quiz__scene">${lv.scene}</p>
      <p class="quiz__q">这张牌在提醒你什么？</p>

      <div class="quiz__opts" id="opts">
        ${lv.options.map((o, i) => `
          <button class="opt" type="button" data-i="${i}">
            <span class="opt__k">${'ABCD'[i]}</span>
            <span class="opt__t">${o.t}</span>
          </button>`).join('')}
      </div>

      <div class="quiz__result" id="res"></div>
    </div>`;

    const optsEl = el.querySelector('#opts');
    const resEl = el.querySelector('#res');

    el.querySelector('[data-quit]').addEventListener('click', map);

    optsEl.addEventListener('click', (e) => {
      const b = e.target.closest('.opt');
      if (!b || picked !== null) return;
      picked = Number(b.dataset.i);
      const right = lv.options[picked].ok;
      sfx(right ? 'right' : 'wrong');

      optsEl.querySelectorAll('.opt').forEach((o, i) => {
        o.disabled = true;
        if (lv.options[i].ok) o.classList.add('is-right');
        if (i === picked && !right) o.classList.add('is-wrong');
      });

      if (right) {
        const set = cleared();
        set.add(no);
        store.set(KEY, [...set]);
        onToast?.('答对了 ✦');
        resEl.className = 'quiz__result is-ok';
        resEl.innerHTML = `
          <div class="res__title">${CHECK} 答对了</div>
          <p class="res__text">${lv.explain}</p>
          <p class="res__face">${card.upright.kw.join(' · ')}</p>
          <button class="act" type="button" id="next">${no >= ALL_LEVELS[ALL_LEVELS.length - 1].no ? '回到地图' : '下一关'}</button>`;
      } else {
        onToast?.('再想想看');
        resEl.className = 'quiz__result is-hint';
        resEl.innerHTML = `
          <div class="res__title">还不是这张</div>
          <p class="res__text">${lv.explain}</p>
          <p class="res__hint">提示：这张牌的关键词里有
            <b>${card.upright.kw[0]}</b>、<b>${card.upright.kw[1]}</b>。再选一次。</p>
          <button class="act act--ghost" type="button" id="retry">再试一次</button>`;
        el.querySelector('#retry').addEventListener('click', () => play(no));
      }

      const nextBtn = el.querySelector('#next');
      nextBtn?.addEventListener('click', () => {
        const total = ALL_LEVELS[ALL_LEVELS.length - 1].no;
        if (no >= total) map();
        else play(no + 1);
      });

      resEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    /* 仅供自测：?__probe=ok|wrong 在渲染后自动作答 */
    const probe = new URLSearchParams(location.search).get('__probe');
    if (probe) {
      const pick = probe === 'ok'
        ? lv.options.findIndex((o) => o.ok)
        : lv.options.findIndex((o) => !o.ok);
      setTimeout(() => optsEl.querySelector(`.opt[data-i="${pick}"]`)?.click(), 120);
    }
  }

  // 支持 ?v=quest&no=101 直接进入某关（调试与深链）
  const q = new URLSearchParams(location.search).get('no');
  if (q && isUnlocked(Number(q))) play(Number(q));
  else map();
}
