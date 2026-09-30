/* ============================================================
   星语 · Starlight Tarot — 牌库图鉴
   78 张全览，抽到过的高亮；没抽到的只留一个轮廓
   ============================================================ */

import { ARROW_BACK } from '../core/parts.js';
import { renderCard } from '../core/card-art.js';
import { artOf } from '../core/art-index.js';
import { sfx } from '../core/audio.js';
import { CARDS } from '../../data/cards.js';
import { store } from '../core/store.js';

const GROUPS = [
  { key: 'major',  name: '大阿尔克那', sub: '22 张 · 命运的骨架' },
  { key: 'wands',  name: '权杖',      sub: '14 张 · 火 · 行动与热情' },
  { key: 'cups',   name: '圣杯',      sub: '14 张 · 水 · 情感与关系' },
  { key: 'swords', name: '宝剑',      sub: '14 张 · 风 · 思考与冲突' },
  { key: 'coins',  name: '星币',      sub: '14 张 · 土 · 现实与身体' },
];

/** 从历史记录里统计每张牌的遇见情况（导出以便自测） */
export function seenIndex() {
  const map = {};
  const touch = (id, reversed, day) => {
    if (!id) return;
    const e = (map[id] ||= { count: 0, up: 0, rev: 0, days: new Set() });
    e.count++;
    reversed ? e.rev++ : e.up++;
    e.days.add(day);
  };

  for (const h of store.get('history', []) || []) {
    for (const c of h.cards) touch(c.id, c.reversed, h.day);
  }
  for (const [day, v] of Object.entries(store.get('daily', {}) || {})) {
    touch(v.card, v.reversed, day);
  }
  return map;
}

export function renderAtlas(root, { onBack } = {}) {
  root.innerHTML = '<div class="draw" id="atlas"></div>';
  const el = root.querySelector('#atlas');

  let filter = 'all';
  let openId = null;

  function render() {
    const seen = seenIndex();
    const total = CARDS.length;
    const got = CARDS.filter((c) => seen[c.id]).length;
    const pct = Math.round((got / total) * 100);
    const first = store.get('egg.firstDraw', null);

    const list = filter === 'all' ? CARDS : CARDS.filter((c) => c.suit === filter);

    el.innerHTML = `
    <header class="draw__bar">
      <button class="draw__back" type="button" data-back>${ARROW_BACK}<span>返回</span></button>
      <span class="draw__step">牌 库 图 鉴</span>
    </header>

    <div class="draw__body draw__body--top atlas">
      <!-- 进度 -->
      <div class="atlas__hero">
        <div class="atlas__ring" style="--p:${pct}">
          <b>${got}</b><span>/ ${total}</span>
        </div>
        <div class="atlas__hero-t">
          <p class="atlas__hero-t1">${got === 0 ? '你还没有翻开过任何一张牌。'
            : got === total ? '全部解锁。你能认出每一张了。'
            : `已遇见 ${got} 张，${total - got} 张还在牌堆里。`}</p>
          ${first ? `<p class="atlas__first">你的第一张是「${CARDS.find((c) => c.id === first.ids[0])?.name || '—'}」</p>` : ''}
        </div>
      </div>

      <!-- 筛选 -->
      <div class="atlas__tabs">
        ${[{ k: 'all', n: '全部' }, ...GROUPS.map((g) => ({ k: g.key, n: g.name }))]
          .map((t) => `<button class="atab ${filter === t.k ? 'is-on' : ''}" type="button" data-f="${t.k}">${t.n}</button>`).join('')}
      </div>

      <!-- 牌墙 -->
      ${filter === 'all' ? GROUPS.map((g) => {
        const cards = CARDS.filter((c) => c.suit === g.key);
        const n = cards.filter((c) => seen[c.id]).length;
        return `
        <section class="agroup">
          <div class="agroup__h">
            <b>${g.name}</b><span>${g.sub}</span>
            <i>${n}/${cards.length}</i>
          </div>
          <div class="awall">${cards.map((c) => cell(c, seen[c.id])).join('')}</div>
        </section>`;
      }).join('')
      : `<div class="awall awall--solo">${list.map((c) => cell(c, seen[c.id])).join('')}</div>`}

      <div class="atlas__more" id="atlasMore"></div>
    </div>`;

    bind();
  }

  /* ---------- 单张格子 ---------- */
  function cell(card, info) {
    const has = !!info;
    return `
    <button class="acell ${has ? 'is-got' : 'is-locked'} ${openId === card.id ? 'is-open' : ''}"
            type="button" data-card="${card.id}" data-got="${has ? 1 : 0}">
      <div class="acell__art">${renderCard(card, artOf(card.id), { uid: '-at' })}</div>
      <span class="acell__n">${card.name}</span>
    </button>`;
  }

  /* ---------- 展开详情 ---------- */
  function openDetail(id) {
    const card = CARDS.find((c) => c.id === id);
    const box = el.querySelector('#atlasMore');
    const node = el.querySelector(`[data-card="${id}"]`);

    if (node?.dataset.got !== '1') {
      sfx('press');
      node?.classList.add('is-shake');
      setTimeout(() => node?.classList.remove('is-shake'), 420);
      box.innerHTML = `<p class="atlas__locked">这张还没见过。<br>它还在牌堆里等着。</p>`;
      return;
    }
    if (openId === id) { box.innerHTML = ''; node?.classList.remove('is-open'); openId = null; return; }

    sfx('tap');
    el.querySelectorAll('.acell.is-open').forEach((x) => x.classList.remove('is-open'));
    node?.classList.add('is-open');
    openId = id;

    const info = seenIndex()[id];
    const days = info.days.size;
    box.innerHTML = `
      <div class="adetail">
        <div class="adetail__h">
          <span class="adetail__name">${card.name}</span>
          <span class="adetail__en">${card.en.toUpperCase()}</span>
        </div>
        <div class="adetail__stats">
          <div><b>${info.count}</b><span>遇见</span></div>
          <div><b>${info.up}</b><span>正位</span></div>
          <div><b>${info.rev}</b><span>逆位</span></div>
          <div><b>${days}</b><span>不同日子</span></div>
        </div>
        <p class="adetail__t">${info.up ? card.upright.kw.slice(0, 3).join(' · ') : card.reversed.kw.slice(0, 3).join(' · ')}</p>
      </div>`;
  }

  function bind() {
    el.querySelector('[data-back]').addEventListener('click', () => { sfx('close'); onBack?.(); });
    el.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => {
      sfx('tap');
      filter = b.dataset.f;
      openId = null;
      render();
      el.querySelector('.atlas').scrollTop = 0;
    }));
    el.querySelectorAll('[data-card]').forEach((b) =>
      b.addEventListener('click', () => openDetail(b.dataset.card)));
  }

  render();
}
