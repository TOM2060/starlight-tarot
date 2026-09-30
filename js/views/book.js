/* ============================================================
   星语 · Starlight Tarot — 记录本
   展示全部抽牌历史、每日签到与连续天数
   ============================================================ */

import { ARROW_BACK, CHECK } from '../core/parts.js';
import { renderCard } from '../core/card-art.js';
import { artOf } from '../core/art-index.js';
import { getCard, MOODS, TOPICS } from '../../data/cards.js';
import { zodiacOf, MONTHS, DAYS } from '../../data/zodiac.js';
import { store, todayKey } from '../core/store.js';

const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.id, m]));
const TOPIC_MAP = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

/* ------------------------------------------------------------
   连续签到天数
   ------------------------------------------------------------ */
function streak() {
  const days = store.get('moodLog', {}) || {};
  let n = 0;
  const d = new Date();
  for (;;) {
    const p = (x) => String(x).padStart(2, '0');
    const key = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    if (days[key]) n++;
    else if (n > 0) break;          // 今天还没签到不算断
    else if (key !== todayKey()) break;
    d.setDate(d.getDate() - 1);
    if (n > 400) break;
  }
  return n;
}

/* ------------------------------------------------------------
   月历热力：最近 28 天
   ------------------------------------------------------------ */
function monthGrid() {
  const days = store.get('moodLog', {}) || {};
  const out = [];
  const d = new Date();
  d.setDate(d.getDate() - 27);
  for (let i = 0; i < 28; i++) {
    const p = (x) => String(x).padStart(2, '0');
    const key = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    out.push({ day: d.getDate(), mood: days[key] || null });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/* ------------------------------------------------------------
   视图
   ------------------------------------------------------------ */
export function renderBook(root, { onBack, onDraw, onCheckIn } = {}) {
  root.innerHTML = '<div class="draw" id="book"></div>';
  const el = root.querySelector('#book');

  function render() {
    const hist = store.get('history', []) || [];
    const days = store.get('moodLog', {}) || {};
    const signedToday = !!days[todayKey()];
    const grid = monthGrid();
    const s = streak();
    const bm = store.get('birth.month');
    const bd = store.get('birth.day');
    const z = zodiacOf(bm, bd);

    el.innerHTML = `
    <header class="draw__bar">
      <button class="draw__back" type="button" data-back>${ARROW_BACK}<span>返回</span></button>
      <span class="draw__step">记 录 本</span>
    </header>

    <div class="draw__body draw__body--top book">
      <!-- 概览 -->
      <div class="book__stats">
        <div class="stat">
          <b>${hist.length}</b>
          <span>次占卜</span>
        </div>
        <div class="stat">
          <b>${Object.keys(days).length}</b>
          <span>天签到</span>
        </div>
        <div class="stat">
          <b>${s}</b>
          <span>连续天</span>
        </div>
      </div>

      <!-- 签到 -->
      <section class="book__sec">
        <h3 class="book__h">心情签到</h3>
        <div class="cal">
          ${grid.map((g) => `
            <i class="cal__d ${g.mood ? 'is-on' : ''}" style="--i:${MOODS.findIndex((m) => m.id === g.mood)}"
               title="${g.day}日${g.mood ? ' · ' + (MOOD_MAP[g.mood]?.label || '') : ''}"></i>`).join('')}
        </div>
        <button class="act ${signedToday ? 'act--ghost' : ''}" type="button" id="checkin" ${signedToday ? 'disabled' : ''}>
          ${signedToday ? '今天已签到 ✓' : '今天还没签到'}
        </button>
      </section>

      <!-- 星座（可选） -->
      <section class="book__sec">
        <h3 class="book__h">星座</h3>
        ${z ? `
          <div class="zod">
            <div class="zod__head">
              <span class="zod__name">${z.name}</span>
              <button class="zod__edit" type="button" id="zedit">修改</button>
            </div>
            <p class="zod__line">${z.line}</p>
          </div>
        ` : `
          <div class="zod zod--off">
            <p class="zod__hint">填了星座，之后每次解牌都会多一段属于你的话。<br>只需要月和日，不问年份。</p>
            <div class="wheel" id="wM">
              ${MONTHS.map((m) => `<button class="chip ${m === 6 ? 'is-on' : ''}" type="button" data-v="${m}">${m}月</button>`).join('')}
            </div>
            <div class="wheel" id="wD">
              ${DAYS.map((d) => `<button class="chip ${d === 15 ? 'is-on' : ''}" type="button" data-v="${d}">${d}日</button>`).join('')}
            </div>
            <div class="zod__res" id="zres"></div>
            <button class="act" type="button" id="zsave">就这样</button>
          </div>
        `}
      </section>

      <section class="book__sec">
        <h3 class="book__h">抽牌记录</h3>
        ${hist.length === 0
          ? `<p class="book__empty">还没有记录。<br>去抽一张牌，让它成为第一页。</p>`
          : hist.map((h, i) => {
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
                  <div class="row__meta">
                    ${h.day}
                    ${mood ? ` · ${mood.label}` : ''}
                    ${topic && h.topic !== 'any' ? ` · ${topic.label}` : ''}
                  </div>
                </div>
              </button>`;
            }).join('')}
      </section>
    </div>
    `;

    el.querySelector('[data-back]').addEventListener('click', () => onBack?.());
    el.querySelector('#checkin')?.addEventListener('click', () => onCheckIn?.(() => render()));
    el.querySelectorAll('[data-open]').forEach((b) => {
      b.addEventListener('click', () => openDetail(Number(b.dataset.open)));
    });

    /* ---------- 星座设置：月 + 日，纯点选 ---------- */
    if (!z) {
      let m = 6, d = 15;
      const res = el.querySelector('#zres');

      const paint = () => {
        const zz = zodiacOf(m, d);
        res.innerHTML = zz
          ? `<span class="zod__nm">${zz.name}</span><p class="zod__rl">${zz.line}</p>`
          : '<span class="zod__nm">—</span>';
      };

      const bind = (sel, key, after) => {
        el.querySelector(sel).addEventListener('click', (e) => {
          const b = e.target.closest('[data-v]');
          if (!b) return;
          el.querySelectorAll(`${sel} .chip`).forEach((c) => c.classList.remove('is-on'));
          b.classList.add('is-on');
          after(Number(b.dataset.v));
          paint();
        });
      };
      bind('#wM', 'm', (v) => { m = v; });
      bind('#wD', 'd', (v) => { d = v; });

      el.querySelector('#zsave').addEventListener('click', () => {
        store.set('birth.month', m);
        store.set('birth.day', d);
        render();
      });
      paint();
    } else {
      el.querySelector('#zedit').addEventListener('click', () => {
        store.set('birth.month', null);
        store.set('birth.day', null);
        render();
      });
    }
  }

  /* ---------- 展开一条记录 ---------- */
  function openDetail(i) {
    const h = (store.get('history', []) || [])[i];
    if (!h) return;
    const reading = h.reading;

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
        ${reading?.bridge ? '<div class="rdiv">✦</div><div class="rtext rtext--bridge">' + reading.bridge + '</div>' : ''}
      </div>
    </div>
    `;
    el.querySelector('[data-back]').addEventListener('click', render);
  }

  render();
}
