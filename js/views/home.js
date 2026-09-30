/* ============================================================
   星语 · Starlight Tarot — 首页
   ============================================================ */

import { cardBack } from '../core/parts.js';
import { isMuted, toggleMute, sfx, audioSettings } from '../core/audio.js';
import { openSettings } from '../ui.js';
import { store, todayKey } from '../core/store.js';
import { getCard } from '../../data/cards.js';

/* ---------- 每日星语：按日期取一句，保证当天固定 ---------- */
const DAILY_LINES = [
  '夜色不是黑暗，是星星正在赶路。',
  '月亮从不着急，它只是习惯等待。',
  '你今天抬头的样子，像极了被点亮的星图。',
  '风会记得一朵花开过。',
  '有些答案，要等到你愿意慢下来才看得见。',
  '宇宙很安静，但它一直在听。',
  '你不是迷路，你是在寻找自己的星。',
  '把心事交给夜空，它会替你保守秘密。',
];

function dailyLine() {
  const d = new Date();
  const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
  return DAILY_LINES[seed % DAILY_LINES.length];
}

/* ---------- 图标 ---------- */
const ICONS = {
  today: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.5 14.3A8.5 8.5 0 1 1 9.7 3.5a6.8 6.8 0 0 0 10.8 10.8Z"/>
    <path d="M17.5 4.2l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7Z" fill="currentColor" stroke="none"/>
  </svg>`,

  free: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round">
    <rect x="8.2" y="3.4" width="9" height="14" rx="1.8" transform="rotate(-13 12.7 10.4)"/>
    <rect x="6.5" y="5.6" width="9" height="14" rx="1.8" transform="rotate(9 11 12.6)" opacity=".55"/>
  </svg>`,

  mood: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 20.3S3.6 15.4 3.6 9.6A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8.4 2.3c0 5.8-8.4 10.7-8.4 10.7Z"/>
  </svg>`,

  quest: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3.1"/>
    <ellipse cx="12" cy="12" rx="9" ry="3.7"/>
    <ellipse cx="12" cy="12" rx="9" ry="3.7" transform="rotate(60 12 12)"/>
    <ellipse cx="12" cy="12" rx="9" ry="3.7" transform="rotate(120 12 12)"/>
  </svg>`,

  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 4.6A1.6 1.6 0 0 1 5.6 3H10a2.4 2.4 0 0 1 2 1.1A2.4 2.4 0 0 1 14 3h4.4A1.6 1.6 0 0 1 20 4.6v12a1.4 1.4 0 0 1-1.4 1.4H14a2 2 0 0 0-2 1.6 2 2 0 0 0-2-1.6H5.4A1.4 1.4 0 0 1 4 16.6Z"/>
    <path d="M12 5.6v13.6"/>
  </svg>`,
};

/* ---------- 首页 ---------- */
export function renderHome(app, { onSelect } = {}) {
  const line = dailyLine();

  const drewDaily = !!store.get(`daily.${todayKey()}`, null);
  const signed = !!store.get(`moodLog.${todayKey()}`, null);

  /* 第一次抽到的那张牌，常驻首页 */
  const first = store.get('egg.firstDraw', null);
  const firstName = first ? (getCard(first.ids[0]) || {}).name : null;

  app.innerHTML = `
  <header class="hero rise">
    <div class="hero__mark" aria-hidden="true">
      <svg viewBox="0 0 40 40">
        <path d="M20 3l3 8.6 8.9.6-6.9 5.8 2.2 8.7L20 21.9l-7.2 4.8 2.2-8.7-6.9-5.8 8.9-.6Z"
              fill="#f3d19a" opacity=".92"/>
        <circle cx="20" cy="20" r="15" fill="none" stroke="#c9a15e" stroke-width=".7"
                opacity=".45" stroke-dasharray="1.5 4"/>
      </svg>
    </div>

    <h1 class="hero__title display">星语</h1>
    <p class="hero__sub">S T A R L I G H T &nbsp; T A R O T</p>

    <div class="hero__divider" aria-hidden="true"><i></i><b>✦</b><i></i></div>

    <p class="hero__line">${line}</p>
  </header>

  <section class="oracle rise" style="animation-delay:.1s">
    <button class="oracle__btn" type="button" data-action="draw" aria-label="抽取今日牌">
      <span class="oracle__halo" aria-hidden="true"></span>
      ${cardBack('-h')}
      <span class="oracle__hint">${drewDaily ? '今日一牌已翻开 · 再抽一张' : '触碰牌面 · 抽取今日之牌'}</span>
      ${firstName ? `<span class="oracle__first">你的第一张牌，是「${firstName}」</span>` : ''}
    </button>
  </section>

  <nav class="menu rise" style="animation-delay:.2s">
    <button class="entry ${drewDaily ? 'is-done' : 'is-todo'}" type="button" data-action="today">
      <span class="entry__ico">${ICONS.today}</span>
      <span class="entry__name">今日一牌</span>
      <span class="entry__desc">${drewDaily ? '已翻开' : '每日限定'}</span>
    </button>
    <button class="entry" type="button" data-action="free">
      <span class="entry__ico">${ICONS.free}</span>
      <span class="entry__name">自由抽牌</span>
      <span class="entry__desc">随时想问</span>
    </button>
    <button class="entry ${signed ? 'is-done' : 'is-todo'}" type="button" data-action="mood">
      <span class="entry__ico">${ICONS.mood}</span>
      <span class="entry__name">心情签到</span>
      <span class="entry__desc">${signed ? '已签到' : '今天如何'}</span>
    </button>
    <button class="entry" type="button" data-action="quest">
      <span class="entry__ico">${ICONS.quest}</span>
      <span class="entry__name">闯关地图</span>
      <span class="entry__desc">牌意修习</span>
    </button>
  </nav>

  <footer class="foot rise" style="animation-delay:.3s">
    <button class="foot__btn" type="button" data-action="book">
      ${ICONS.book}<span>我的记录本</span>
    </button>
    <button class="foot__btn foot__btn--icon" type="button" data-action="atlas"
            aria-label="牌库图鉴">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
           stroke-linejoin="round">
        <rect x="3" y="3" width="7.4" height="7.4" rx="1.4"/>
        <rect x="13.6" y="3" width="7.4" height="7.4" rx="1.4"/>
        <rect x="3" y="13.6" width="7.4" height="7.4" rx="1.4"/>
        <rect x="13.6" y="13.6" width="7.4" height="7.4" rx="1.4"/>
      </svg>
    </button>
    <button class="foot__btn foot__btn--icon ${isMuted() ? 'is-muted' : ''}" type="button"
            data-action="sound" aria-label="声音开关：点击切换，长按打开设置">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 9.5v5M8 6.5v11M12 4v16M16 7.5v9M20 10v4"/>
      </svg>
      <i class="foot__slash" aria-hidden="true"></i>
    </button>
  </footer>
  `;

  app.querySelector('.oracle__btn')?.addEventListener('click', () => onSelect?.('draw'));

  /* 声音按钮：点一下静音/恢复，长按进设置 */
  const sndBtn = app.querySelector('[data-action="sound"]');
  if (sndBtn) {
    let timer = null, longFired = false;

    const beginHold = () => {
      longFired = false;
      clearTimeout(timer);
      timer = setTimeout(() => { longFired = true; openSettings(); }, 480);
    };
    const endHold = () => clearTimeout(timer);

    sndBtn.addEventListener('pointerdown', beginHold);
    sndBtn.addEventListener('pointerup', endHold);
    sndBtn.addEventListener('pointercancel', endHold);
    sndBtn.addEventListener('pointerleave', endHold);

    sndBtn.addEventListener('click', () => {
      if (longFired) { longFired = false; return; }
      const muted = toggleMute();
      sndBtn.classList.toggle('is-muted', muted);
      if (!muted) sfx('tap');
    });
  }

  app.querySelectorAll('.entry').forEach((btn) => {
    btn.addEventListener('click', () => onSelect?.(btn.dataset.action));
  });
  app.querySelector('.foot__btn')?.addEventListener('click', () => onSelect?.('book'));
}
