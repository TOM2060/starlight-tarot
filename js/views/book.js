/* ============================================================
   星语 · Starlight Tarot — 记录本
   月历总览 + 心情热力 + 抽牌历史 + 星座设置
   ============================================================ */

import { ARROW_BACK } from '../core/parts.js';
import { renderCard } from '../core/card-art.js';
import { artOf } from '../core/art-index.js';
import { sfx } from '../core/audio.js';
import { getCard, MOODS, TOPICS } from '../../data/cards.js';
import { zodiacOf, MONTHS, DAYS } from '../../data/zodiac.js';
import { store, todayKey } from '../core/store.js';

const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.id, m]));
const TOPIC_MAP = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
const WEEK = ['一', '二', '三', '四', '五', '六', '日'];

/* ------------------------------------------------------------
   数据整理
   ------------------------------------------------------------ */
function collect() {
  const hist = store.get('history', []) || [];
  const days = store.get('moodLog', {}) || {};
  const byDay = {};
  for (const h of hist) (byDay[h.day] ||= []).push(h);
  return { hist, days, byDay };
}

function keyOf(d) {
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 连续签到天数 */
function streak() {
  const { days } = collect();
  let n = 0;
  const d = new Date();
  for (;;) {
    if (days[keyOf(d)]) n++;
    else if (n > 0) break;
    else if (keyOf(d) !== todayKey()) break;
    d.setDate(d.getDate() - 1);
    if (n > 400) break;
  }
  return n;
}

/** 某个月的日历数据（周一为第一列） */
function monthData(y, m) {
  const { days, byDay } = collect();
  const total = new Date(y, m + 1, 0).getDate();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= total; d++) {
    const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      d, key,
      mood: days[key] || null,
      draws: byDay[key] || [],
      today: key === todayKey(),
    });
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

/* ------------------------------------------------------------
   视图
   ------------------------------------------------------------ */
export function renderBook(root, { onBack, onDraw, onCheckIn } = {}) {
  root.innerHTML = '<div class="draw" id="book"></div>';
  const el = root.querySelector('#book');

  const now = new Date();
  let viewY = now.getFullYear();
  let viewM = now.getMonth();
  let openDay = null;

  function render() {
    const { hist, days } = collect();
    const z = zodiacOf(store.get('birth.month'), store.get('birth.day'));
    const signedToday = !!days[todayKey()];

    // 本月统计
    const cells = monthData(viewY, viewM).filter(Boolean);
    const mSigned = cells.filter((c) => c.mood).length;
    const mDraws = cells.reduce((n, c) => n + c.draws.length, 0);
    const seen = new Set(hist.flatMap((h) => h.cards.map((c) => c.id)));

    el.innerHTML = `
    <header class="draw__bar">
      <button class="draw__back" type="button" data-back>${ARROW_BACK}<span>返回</span></button>
      <span class="draw__step">记 录 本</span>
    </header>

    <div class="draw__body draw__body--top book">
      <!-- 总览 -->
      <div class="book__stats">
        <div class="stat"><b>${hist.length}</b><span>次占卜</span></div>
        <div class="stat"><b>${Object.keys(days).length}</b><span>天签到</span></div>
        <div class="stat"><b>${streak()}</b><span>连续天</span></div>
      </div>

      <!-- 月历 -->
      <section class="book__sec">
        <div class="cal__bar">
          <button class="cal__nav" type="button" data-mv="-1" aria-label="上个月">‹</button>
          <span class="cal__title">${viewY} 年 ${viewM + 1} 月</span>
          <button class="cal__nav" type="button" data-mv="1" aria-label="下个月"
            ${viewY === now.getFullYear() && viewM === now.getMonth() ? 'disabled' : ''}>›</button>
        </div>

        <div class="cal cal--month">
          ${WEEK.map((w) => `<span class="cal__w">${w}</span>`).join('')}
          ${monthData(viewY, viewM).map((c) => {
            if (!c) return '<span class="cald cald--pad"></span>';
            const mi = MOODS.findIndex((m) => m.id === c.mood);
            const has = c.draws.length > 0;
            return `<button class="cald ${c.mood ? 'is-on' : ''} ${c.today ? 'is-today' : ''} ${has ? 'has-draw' : ''} ${openDay === c.key ? 'is-open' : ''}"
              style="--i:${mi}" type="button" data-day="${c.key}">
              <i class="cald__n">${c.d}</i>
              ${has ? `<i class="cald__s">✦</i>` : ''}
            </button>`;
          }).join('')}
        </div>

        <div class="cal__legend">
          <span><i style="--i:0"></i>还不错</span>
          <span><i style="--i:2"></i>迷茫</span>
          <span><i style="--i:5"></i>不踏实</span>
          <span class="cal__legend-x">✦ 当天抽过牌</span>
        </div>

        <div class="cal__sum">
          <span>本月签到 <b>${mSigned}</b> 天</span>
          <span>抽牌 <b>${mDraws}</b> 次</span>
          <span>见过 <b>${seen.size}</b> 张</span>
        </div>

        <div id="dayBox"></div>
      </section>

      <!-- 签到 -->
      <button class="act ${signedToday ? 'act--ghost' : ''}" type="button" id="checkin" ${signedToday ? 'disabled' : ''}>
        ${signedToday ? '今天已签到 ✓' : '今天还没签到'}
      </button>

      <!-- 星座 -->
      <section class="book__sec">
        <h3 class="book__h">星座</h3>
        ${z ? `
          <div class="zod">
            <div class="zod__head">
              <span class="zod__name">${z.name}</span>
              <button class="zod__edit" type="button" id="zedit">修改</button>
            </div>
            <p class="zod__line">${z.line}</p>
          </div>` : `
          <div class="zod zod--off">
            <p class="zod__hint">填了星座，解牌时会多一段属于你的话。<br>只需要月和日，不问年份。</p>
            <div class="wheel" id="wM">
              ${MONTHS.map((m) => `<button class="chip ${m === 6 ? 'is-on' : ''}" type="button" data-v="${m}">${m}月</button>`).join('')}
            </div>
            <div class="wheel" id="wD">
              ${DAYS.map((d) => `<button class="chip ${d === 15 ? 'is-on' : ''}" type="button" data-v="${d}">${d}日</button>`).join('')}
            </div>
            <div class="zod__res" id="zres"></div>
            <button class="act" type="button" id="zsave">就这样</button>
          </div>`}
      </section>

      <!-- 历史 -->
      <section class="book__sec">
        <h3 class="book__h">抽牌记录</h3>
        ${hist.length === 0
          ? `<p class="book__empty">还没有记录。<br>去抽一张牌，让它成为第一页。</p>`
          : hist.slice(0, 40).map((h, i) => {
              const cards = h.cards.map((c) => getCard(c.id)).filter(Boolean);
              const mood = MOOD_MAP[h.mood];
              const topic = TOPIC_MAP[h.topic];
              return `
              <button class="row" type="button" data-open="${i}">
                <div class="row__cards">
                  ${cards.map((c) => `
                    <div class="row__art ${h.cards.find((x) => x.id === c.id)?.reversed ? 'is-rev' : ''}">
                      ${renderCard(c, artOf(c.id), { uid: `-b${i}${c.id}` })}
                    </div>`).join('')}
                </div>
                <div class="row__info">
                  <div class="row__names">${cards.map((c) => c.name).join(' · ')}</div>
                  <div class="row__meta">${h.day}${mood ? ' · ' + mood.label : ''}${topic && h.topic !== 'any' ? ' · ' + topic.label : ''}</div>
                </div>
              </button>`;
            }).join('')}
      </section>
    </div>`;

    bind();
    if (openDay) renderDay(openDay);
  }

  /* ---------- 某一天的详情 ---------- */
  function renderDay(key) {
    const box = el.querySelector('#dayBox');
    if (!box) return;
    const { byDay } = collect();
    const items = byDay[key] || [];
    const d = new Date(key + 'T00:00:00');
    const title = `${d.getMonth() + 1} 月 ${d.getDate()} 日`;

    box.innerHTML = `
      <div class="daybox">
        <div class="daybox__h">${title}${items.length ? '' : ' · 没有抽牌'}</div>
        ${items.length ? items.map((h) => {
          const cards = h.cards.map((c) => getCard(c.id)).filter(Boolean);
          return `
            <div class="daybox__i">
              <div class="daybox__cards">
                ${cards.map((c) => `
                  <div class="daybox__art ${h.cards.find((x) => x.id === c.id)?.reversed ? 'is-rev' : ''}">
                    ${renderCard(c, artOf(c.id), { uid: `-dy${key}${c.id}` })}
                  </div>`).join('')}
              </div>
              <div class="daybox__t">
                ${cards.map((c) => c.name).join(' · ')}
                <span>${h.count > 1 ? h.count + ' 张' : ''}${MOOD_MAP[h.mood] ? ' · ' + MOOD_MAP[h.mood].label : ''}</span>
              </div>
            </div>`;
        }).join('') : '<p class="daybox__empty">这天没有记录。</p>'}
      </div>`;
  }

  /* ---------- 事件 ---------- */
  function bind() {
    el.querySelector('[data-back]').addEventListener('click', () => { sfx('close'); onBack?.(); });
    el.querySelector('#checkin')?.addEventListener('click', () => onCheckIn?.(() => render()));

    el.querySelectorAll('[data-mv]').forEach((b) => b.addEventListener('click', () => {
      sfx('tap');
      const d = new Date(viewY, viewM + Number(b.dataset.mv), 1);
      viewY = d.getFullYear(); viewM = d.getMonth();
      openDay = null;
      render();
    }));

    el.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => {
      sfx('tap');
      openDay = openDay === b.dataset.day ? null : b.dataset.day;
      el.querySelectorAll('[data-day]').forEach((x) => x.classList.toggle('is-open', x.dataset.day === openDay));
      openDay ? renderDay(openDay) : el.querySelector('#dayBox').innerHTML = '';
    }));

    el.querySelectorAll('[data-open]').forEach((b) =>
      b.addEventListener('click', () => openDetail(Number(b.dataset.open))));

    // 星座
    if (!zodiacOf(store.get('birth.month'), store.get('birth.day'))) {
      let m = 6, d = 15;
      const res = el.querySelector('#zres');
      const paint = () => {
        const zz = zodiacOf(m, d);
        res.innerHTML = zz
          ? `<span class="zod__nm">${zz.name}</span><p class="zod__rl">${zz.line}</p>`
          : '<span class="zod__nm">—</span>';
      };
      const bindChip = (sel, after) => {
        el.querySelector(sel).addEventListener('click', (e) => {
          const b = e.target.closest('[data-v]');
          if (!b) return;
          sfx('tap');
          el.querySelectorAll(`${sel} .chip`).forEach((c) => c.classList.remove('is-on'));
          b.classList.add('is-on');
          after(Number(b.dataset.v));
          paint();
        });
      };
      bindChip('#wM', (v) => { m = v; });
      bindChip('#wD', (v) => { d = v; });
      el.querySelector('#zsave').addEventListener('click', () => {
        store.set('birth.month', m);
        store.set('birth.day', d);
        store.set('birth.sign', (zodiacOf(m, d) || {}).key || null);
        sfx('star');
        render();
      });
      paint();
    } else {
      el.querySelector('#zedit').addEventListener('click', () => {
        store.set('birth.month', null);
        store.set('birth.day', null);
        store.set('birth.sign', null);
        render();
      });
    }
  }

  /* ---------- 单条记录详情 ---------- */
  function openDetail(i) {
    const h = (store.get('history', []) || [])[i];
    if (!h) return;
    el.innerHTML = `
    <header class="draw__bar">
      <button class="draw__back" type="button" data-back>${ARROW_BACK}<span>返回</span></button>
      <span class="draw__step">${h.day}</span>
    </header>
    <div class="draw__body draw__body--top">
      <div class="reading">
        ${h.cards.map((c, k) => {
          const card = getCard(c.id);
          if (!card) return '';
          const face = c.reversed ? card.reversed : card.upright;
          return `
          <article class="rcard">
            <div class="rcard__art">${renderCard(card, artOf(card.id), { uid: `-d${i}${k}` })}</div>
            <div class="rcard__main">
              <div class="rcard__head">
                <span class="rcard__name">${card.name}</span>
                <span class="rcard__dir">${c.reversed ? '逆位' : '正位'}</span>
              </div>
              <div class="rcard__kw">${face.kw.map((k2) => `<span>${k2}</span>`).join('')}</div>
            </div>
          </article>`;
        }).join('')}
        ${h.reading?.bridge ? '<div class="rdiv">✦</div><div class="rtext rtext--bridge">' + h.reading.bridge + '</div>' : ''}
      </div>
    </div>`;
    el.querySelector('[data-back]').addEventListener('click', () => { sfx('close'); render(); });
  }

  render();
}
