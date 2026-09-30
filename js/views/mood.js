/* ============================================================
   星语 · Starlight Tarot — 心情签到
   每天一次，只点选，不用键盘
   ============================================================ */

import { ARROW_BACK, CHECK } from '../core/parts.js';
import { MOODS } from '../../data/cards.js';
import { store, todayKey } from '../core/store.js';
import { sfx } from '../core/audio.js';
import { milestoneOf } from '../core/eggs.js';
import { showEgg } from '../ui.js';

function streakAfter(today) {
  const log = store.get('moodLog', {}) || {};
  let n = 0;
  const d = new Date();
  for (;;) {
    const p = (x) => String(x).padStart(2, '0');
    const key = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    if (log[key]) n++;
    else if (key !== today) break;   // 今天还没签不算断
    d.setDate(d.getDate() - 1);
    if (n > 400) break;
  }
  return n;
}

export function renderMood(root, { onBack, onDone } = {}) {
  root.innerHTML = '<div class="draw" id="moodview"></div>';
  const el = root.querySelector('#moodview');

  const today = todayKey();
  const log = store.get('moodLog', {}) || {};
  const done = log[today];

  function render() {
    el.innerHTML = `
    <header class="draw__bar">
      <button class="draw__back" type="button" data-back>${ARROW_BACK}<span>返回</span></button>
      <span class="draw__step">心 情 签 到</span>
    </header>

    <div class="draw__body">
      ${done ? `
        <div class="mood__done">
          <div class="mood__ring">${streakAfter(today)}</div>
          <h2 class="draw__title">今天已经记下了</h2>
          <p class="draw__sub">连续 ${streakAfter(today)} 天。<br>明天这个时候，我还在。</p>
          <button class="act" type="button" id="draw">去抽一张牌</button>
        </div>
      ` : `
        <h2 class="draw__title">此刻的你</h2>
        <p class="draw__sub">给今天留一个记号。<br>它不影响运势，只让你看见自己。</p>
        <div class="picks mood" id="picks">
          ${MOODS.map((m, i) => `
            <button class="pick" type="button" data-m="${m.id}" style="animation-delay:${.05 * i}s">
              ${CHECK}
              <div class="pick__name">${m.label}</div>
              <div class="pick__hint">${m.hint}</div>
            </button>`).join('')}
        </div>
      `}
    </div>
    `;

    el.querySelector('[data-back]').addEventListener('click', () => { sfx('close'); onBack?.(); });
    el.querySelector('#draw')?.addEventListener('click', () => onDone?.());

    el.querySelector('#picks')?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      sfx('star');
      const cur = { ...(store.get('moodLog', {}) || {}) };
      cur[today] = b.dataset.m;
      store.set('moodLog', cur);
      sfx('star');
      const ms = milestoneOf(streakAfter(today));
      render();
      onDone?.();
      if (ms) showEgg({ tag: '连 续 签 到', name: `${streakAfter(today)} 天`, line: ms });
    });
  }

  render();
}
