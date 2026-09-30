/* ============================================================
   星语 · Starlight Tarot — 闯关 · 牌阵模式
   场景 → 抽三张 → 牌阵解读 → 共鸣星级
   ============================================================ */

import { ARROW_BACK, cardBack } from '../core/parts.js';
import { renderCard } from '../core/card-art.js';
import { artOf } from '../core/art-index.js';
import { sfx } from '../core/audio.js';
import { getCard } from '../../data/cards.js';
import { CHAPTERS, ALL, levelOf } from '../../data/levels.js';
import { store } from '../core/store.js';

const K_CLEAR = 'quest.cleared';
const K_STARS = 'quest.stars';
const REVEAL_MS = 880;

const cleared = () => new Set(store.get(K_CLEAR, []) || []);
const starsOf = (no) => (store.get(K_STARS, {}) || {})[no] || 0;
const isUnlocked = (no) => no === 101 || cleared().has(no - 1) || cleared().has(no);

function shuffle(a, rand = Math.random) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function renderQuest(root, { onBack } = {}) {
  root.innerHTML = '<div class="draw" id="quest"></div>';
  const el = root.querySelector('#quest');

  const box = (html) => { el.innerHTML = html; return el; };
  const shell = (label, body, foot = '', cls = 'draw__body--top quest') => `
    <header class="draw__bar">
      <button class="draw__back" type="button" data-back>${ARROW_BACK}<span>${label}</span></button>
      <span class="draw__step">闯 关</span>
    </header>
    <div class="draw__body ${cls}">${body}</div>
    ${foot ? `<div class="draw__acts">${foot}</div>` : ''}`;

  const toMap = () => { sfx('close'); map(); };

  /* ================= 地图 ================= */
  function map() {
    const done = cleared();
    const stars = store.get(K_STARS, {}) || {};
    const got = ALL.filter((l) => done.has(l.no)).length;
    const starSum = Object.values(stars).reduce((a, b) => a + b, 0);

    box(shell('地图', `
      <div class="quest__head">
        <div class="quest__num"><b>${got}</b><span>/ ${ALL.length}</span></div>
        <p class="quest__hint">${got === 0 ? '每一幕是一件事。抽三张牌，听听牌怎么说。'
          : got === ALL.length ? '三十幕都走完了。牌已经认得你了。'
          : `已走 ${got} 幕，收集 ${starSum} 颗星。`}</p>
      </div>

      ${CHAPTERS.map((c) => `
        <section class="chapter" style="--tint:${c.tint}">
          <div class="chapter__h">
            <b>第${'一二三'[c.id - 1]}章</b>
            <span>${c.name}</span>
            <em>${c.sub}</em>
          </div>
          <div class="chapter__track">
            ${ALL.filter((l) => l.chapter === c.id).map((l, i) => {
              const d = done.has(l.no);
              const open = isUnlocked(l.no);
              const st = stars[l.no] || 0;
              return `
              <button class="node ${d ? 'is-done' : ''} ${open ? 'is-open' : 'is-locked'}"
                      type="button" data-no="${l.no}" ${open ? '' : 'disabled'}>
                <span class="node__dot">${d ? '★' : i + 1}</span>
                ${d && st ? `<span class="node__stars">${'★'.repeat(st)}</span>` : ''}
                <span class="node__tip">${d ? `${st} 星` : open ? '可进入' : '未解锁'}</span>
              </button>`;
            }).join('')}
            <i class="chapter__line"></i>
          </div>
        </section>
      `).join('')}
    `, ''));

    el.querySelector('[data-back]').addEventListener('click', () => { sfx('close'); onBack?.(); });
    el.querySelectorAll('.node').forEach((b) =>
      b.addEventListener('click', () => { sfx('tap'); scene(Number(b.dataset.no)); }));
  }

  /* ================= 场景 ================= */
  function scene(no) {
    const lv = levelOf(no);
    if (!lv) return map();
    const ch = CHAPTERS[lv.chapter - 1];

    box(shell('返回', `
      <div class="scene">
        <div class="scene__ch">${ch.name} · ${lv.indexInChapter}/10</div>
        <h2 class="scene__t">${lv.scene}</h2>
        <div class="scene__pool">
          ${lv.pool.map((id) => `<span class="scene__card">${getCard(id).name}</span>`).join('')}
        </div>
        <p class="scene__hint">这一场从这 ${lv.pool.length} 张里洗出三张。<br>抽到什么，牌就解什么——没有对错。</p>
      </div>
    `, `<button class="act" type="button" id="go">洗牌</button>
        <button class="act act--ghost" type="button" data-back>回到地图</button>`));

    el.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', toMap));
    el.querySelector('#go').addEventListener('click', () => {
      sfx('press'); sfx('shuffle');
      spread(no, lv);
    });
  }

  /* ================= 抽牌 ================= */
  function spread(no, lv) {
    const drawn = shuffle(lv.pool).slice(0, 3);

    box(shell('抽牌', `
      <p class="scene__ch">${lv.scene}</p>
      <div class="spread spread--three" id="sp">
        ${drawn.map((id, i) => `
          <div class="flip" data-i="${i}">
            <div class="flip__inner">
              <div class="flip__face flip__face--back">${cardBack(`-qb${i}`)}</div>
              <div class="flip__face flip__face--front" data-front="${i}"></div>
            </div>
            <div class="flip__pulse"></div>
            <div class="flip__glare"></div>
            <div class="flip__pos"></div>
          </div>`).join('')}
      </div>
      <p class="tapme" id="hint">轻触任意一张翻开</p>
    `, `<button class="act act--ghost" type="button" data-back>回场景</button>`));

    let flipped = 0;
    el.querySelectorAll('[data-back]').forEach((b) =>
      b.addEventListener('click', () => { sfx('close'); scene(no); }));

    el.querySelector('#sp').addEventListener('click', (e) => {
      const node = e.target.closest('.flip');
      if (!node || node.classList.contains('is-up')) return;

      const i = Number(node.dataset.i);
      const card = getCard(drawn[i]);
      node.querySelector('[data-front]').innerHTML =
        renderCard(card, artOf(card.id), { uid: `-s${i}` });
      node.classList.add('is-up', 'is-open');

      sfx('flipLift');
      setTimeout(() => sfx('flipMid'), 280);
      node.querySelector('.flip__inner')?.addEventListener('transitionend', (ev) => {
        if (ev.propertyName === 'transform') sfx('flipLand');
      }, { once: true });
      setTimeout(() => sfx('flipLand'), REVEAL_MS);

      el.querySelectorAll('.flip.is-current').forEach((n) => n.classList.remove('is-current'));
      node.classList.add('is-current');

      if (++flipped < 3) {
        el.querySelector('#hint').textContent = `还剩 ${3 - flipped} 张`;
      } else {
        setTimeout(() => { sfx('reveal'); result(no, lv, drawn); }, REVEAL_MS + 140);
      }
    });
  }

  /* ================= 结算 ================= */
  function result(no, lv, drawn) {
    const cards = drawn.map(getCard);
    const hitIds = drawn.filter((id) => lv.core.includes(id));
    const star = hitIds.length;
    const prev = starsOf(no);

    // 首次星级才记录，避免重抽刷分
    if (star > prev) {
      const st = { ...(store.get(K_STARS, {}) || {}) };
      st[no] = star;
      store.set(K_STARS, st);
    }
    const cd = cleared();
    if (!cd.has(no)) { cd.add(no); store.set(K_CLEAR, [...cd]); }

    const missed = lv.core.filter((c) => !drawn.includes(c)).map(getCard);
    const isLast = no >= ALL[ALL.length - 1].no;
    const verdict = star === 3 ? '三张全中'
      : star === 2 ? '两张相合'
      : star === 1 ? '一张正中'
      : '这一场没对上——但牌已经给你看了';

    box(shell('解读', `
      <div class="res2">
        <div class="res2__stars">${[1, 2, 3].map((n) => `<span class="${n <= star ? 'on' : ''}">★</span>`).join('')}</div>
        <div class="res2__verdict">${verdict}</div>

        <div class="res2__spread">
          ${cards.map((c) => `
            <div class="res2__cell">
              <div class="res2__art">${renderCard(c, artOf(c.id), { uid: `-rs${c.id}` })}</div>
              <span class="res2__n">${c.name}</span>
            </div>`).join('')}
        </div>

        <div class="reading">
          ${cards.map((c) => `<div class="rtext">${c.upright.text.split('\n').slice(0, 2).join(' ')}</div>`).join('')}
        </div>

        <div class="rdiv">✦</div>
        <p class="res2__core">这一幕的核心三张是 <b>${lv.core.map((c) => getCard(c).name).join('、')}</b></p>
        ${hitIds.length ? `<p class="res2__hit res2__hit--on">你抽中了：${hitIds.map((c) => getCard(c).name).join('、')}</p>` : ''}
        ${missed.length ? `<p class="res2__miss">你没抽到：${missed.map((c) => c.name).join('、')}——下次也许会。</p>` : ''}
        <p class="res2__text">${lv.text}</p>
      </div>
    `, `
      <button class="act" type="button" id="next">${isLast ? '回到地图' : '下一幕'}</button>
      <button class="act act--ghost" type="button" id="again">再抽一次</button>
      <button class="act act--ghost" type="button" data-back>回到地图</button>
    `));

    if (star >= 3) sfx('rare');
    else if (star > 0) sfx('right');
    else sfx('save');

    el.querySelector('#next').addEventListener('click', () => {
      sfx('tap');
      isLast ? map() : scene(no + 1);
    });
    el.querySelector('#again').addEventListener('click', () => { sfx('tap'); spread(no, lv); });
    el.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', toMap));
  }

  /* ---------- 启动 ---------- */
  const q = new URLSearchParams(location.search).get('no');
  if (q && isUnlocked(Number(q))) scene(Number(q));
  else map();
}
