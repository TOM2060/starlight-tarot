/* ============================================================
   星语 · Starlight Tarot — 抽牌流程
   心情 → 主题 → 洗牌 → 翻牌 → 解读
   全程点选，不需要键盘
   ============================================================ */

import { cardBack, CHECK, ARROW_BACK } from '../core/parts.js';
import { renderCard } from '../core/card-art.js';
import { artOf } from '../core/art-index.js';
import { MOODS, TOPICS, drawCards, composeReading, SPREAD_POS } from '../../data/cards.js';
import { zodiacOf } from '../../data/zodiac.js';
import { makePoster, showPoster, posterLine } from '../core/poster.js';
import { store, todayKey } from '../core/store.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------
   逐字显示
   ------------------------------------------------------------ */
function typeInto(el, text, { speed = 26, onDone } = {}) {
  el.textContent = '';
  const caret = document.createElement('span');
  caret.className = 'caret';
  el.appendChild(caret);

  let i = 0;
  let stopped = false;

  const finish = () => {
    if (stopped) return;
    stopped = true;
    el.textContent = text;
    onDone?.();
  };

  const tick = () => {
    if (stopped) return;
    if (i >= text.length) { finish(); return; }
    caret.insertAdjacentText('beforebegin', text.slice(i, i + 1));
    i++;
    setTimeout(tick, speed);
  };
  tick();

  // 点一下就立刻显示全文
  const skip = () => { finish(); el.removeEventListener('click', skip); };
  el.addEventListener('click', skip);
  el.addEventListener('scroll', skip, { passive: true });
  return finish;
}

/* ------------------------------------------------------------
   视图
   ------------------------------------------------------------ */
export function renderDraw(root, { onBack, onSaved, onPoster } = {}) {
  const state = {
    step: 'mood',
    mood: null,
    topic: null,
    count: 1,
    draws: [],
    flipped: new Set(),
  };

  root.innerHTML = '<div class="draw" id="draw"></div>';
  const el = root.querySelector('#draw');
  const box = (html) => { el.innerHTML = html; return el; };

  /* ---------- 外壳 ---------- */
  const shell = (stepLabel, bodyHtml, footHtml = '', bodyClass = '') => `
    <header class="draw__bar">
      <button class="draw__back" type="button" data-back>${ARROW_BACK}<span>返回</span></button>
      <span class="draw__step">${stepLabel}</span>
    </header>
    <div class="draw__body ${bodyClass || ''}">${bodyHtml}</div>
    ${footHtml ? `<div class="draw__acts">${footHtml}</div>` : ''}
  `;

  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-back]')) { onBack?.(); return; }
  });

  /* ---------- 步骤 1：心情 ---------- */
  function stepMood() {
    state.step = 'mood';
    box(shell('第 1 步 · 共 3 步', `
      <h2 class="draw__title">今天的心情</h2>
      <p class="draw__sub">先说说此刻的你。不用想太多，选最接近的那个就好。</p>
      <div class="picks" id="moods">
        ${MOODS.map((m, i) => `
          <button class="pick" type="button" data-mood="${m.id}" style="animation-delay:${.05 * i}s">
            ${CHECK}
            <div class="pick__name">${m.label}</div>
            <div class="pick__hint">${m.hint}</div>
          </button>`).join('')}
      </div>
    `, `<button class="draw__skip" type="button" data-skip-mood>跳过，直接抽牌</button>`));

    el.querySelector('#moods').addEventListener('click', (e) => {
      const b = e.target.closest('[data-mood]');
      if (!b) return;
      state.mood = b.dataset.mood;
      stepTopic();
    });
    el.querySelector('[data-skip-mood]').addEventListener('click', () => {
      state.mood = null;
      stepTopic();
    });
  }

  /* ---------- 步骤 2：主题 ---------- */
  function stepTopic() {
    state.step = 'topic';
    box(shell('第 2 步 · 共 3 步', `
      <h2 class="draw__title">你想问什么</h2>
      <p class="draw__sub">牌会朝着这个方向，为你解读。</p>
      <div class="picks picks--topics" id="topics">
        ${TOPICS.map((t, i) => `
          <button class="pick" type="button" data-topic="${t.id}" style="animation-delay:${.06 * i}s">
            ${CHECK}
            <div class="pick__name">${t.label}</div>
            <div class="pick__hint">${t.hint}</div>
          </button>`).join('')}
      </div>
    `, `<button class="draw__skip" type="button" data-skip-topic>让牌自己决定</button>`));

    el.querySelector('#topics').addEventListener('click', (e) => {
      const b = e.target.closest('[data-topic]');
      if (!b) return;
      state.topic = b.dataset.topic;
      stepDeck();
    });
    el.querySelector('[data-skip-topic]').addEventListener('click', () => {
      state.topic = 'any';
      stepDeck();
    });
  }

  /* ---------- 步骤 3：洗牌 ---------- */
  async function stepDeck() {
    state.step = 'deck';
    const stacked = Array.from({ length: 6 }, (_, i) =>
      `<div class="deck__card" style="transform:translateY(${-i * 1.6}px);z-index:${6 - i}">${cardBack(`-d${i}`)}</div>`).join('');

    box(shell('第 3 步 · 共 3 步', `
      <h2 class="draw__title">洗一洗</h2>
      <p class="draw__sub" id="deckHint">深呼吸，让牌感受你的心情。</p>
      <div class="deck" id="deck">${stacked}</div>
    `, `<button class="act" type="button" id="goShuffle">开始洗牌</button>`));

    const deck = el.querySelector('#deck');
    const go = el.querySelector('#goShuffle');

    go.addEventListener('click', async () => {
      go.disabled = true;
      go.textContent = '洗牌中…';
      deck.classList.add('is-shuffling');
      el.querySelector('#deckHint').textContent = '牌正在流动…';

      await sleep(1700);
      deck.classList.remove('is-shuffling');
      deck.classList.add('is-ready');

      el.querySelector('#deckHint').textContent = '好了。抽几张？';
      go.remove();

      const counts = document.createElement('div');
      counts.className = 'counts';
      counts.innerHTML = [
        { n: 1, t: '一张' }, { n: 2, t: '两张' }, { n: 3, t: '三张' },
      ].map((o) => `<button class="act ${o.n === 2 ? '' : 'act--ghost'}" type="button" data-n="${o.n}">${o.t}</button>`).join('');

      const acts = el.querySelector('.draw__acts');
      acts.innerHTML = '';
      acts.appendChild(counts);

      counts.addEventListener('click', (e) => {
        const b = e.target.closest('[data-n]');
        if (!b) return;
        state.count = Number(b.dataset.n);
        goReveal();
      });
    });
  }

  /* ---------- 步骤 4：翻牌 ---------- */
  function goReveal() {
    state.step = 'reveal';
    state.draws = drawCards(state.count);
    state.flipped = new Set();

    box(shell('翻开', `
      <h2 class="draw__title">${state.count > 1 ? '翻开它们' : '翻开它'}</h2>
      <p class="draw__sub">${state.count > 1 ? '一次一张，顺序由你决定。' : '轻触牌面。'}</p>
      <div class="spread" id="spread">
        ${state.draws.map((d, i) => `
          <div class="flip" data-i="${i}">
            <div class="flip__inner">
              <div class="flip__face flip__face--back">${cardBack(`-b${i}`)}</div>
              <div class="flip__face flip__face--front" data-front="${i}"></div>
            </div>
            <div class="flip__pulse"></div>
            <div class="flip__glare"></div>
            <div class="flip__pos">${state.count > 1 ? SPREAD_POS[i] : ''}</div>
          </div>`).join('')}
      </div>
      <p class="tapme" id="tapme">${state.count > 1 ? `共 ${state.count} 张 · 轻触任意一张翻开` : '轻触牌面翻牌'}</p>
    `));

    el.querySelector('#spread').addEventListener('click', (e) => {
      const card = e.target.closest('.flip');
      if (!card || card.classList.contains('is-up')) return;
      flipCard(Number(card.dataset.i), card);
    });
  }

  /**
   * 翻开第 i 张。点哪张翻哪张，顺序完全由玩家决定。
   * 全部翻完（含光晕散尽）后才进入解读。
   */
  function flipCard(i, node) {
    const d = state.draws[i];
    if (!d || state.flipped.has(i)) return;

    // 正面内容在翻转开始时填充，避免背面状态下透出内容
    node.querySelector('[data-front]').innerHTML =
      renderCard(d.card, artOf(d.card.id), { uid: `-f${i}` });

    if (d.reversed) node.classList.add('is-rev');
    node.classList.add('is-up', 'is-open');
    state.flipped.add(i);

    // 只让最新翻开的一张保持高亮
    el.querySelectorAll('.flip.is-current').forEach((n) => n.classList.remove('is-current'));
    node.classList.add('is-current');

    const left = state.draws.length - state.flipped.size;
    if (left > 0) {
      el.querySelector('#tapme').textContent = `还剩 ${left} 张未翻开`;
      return;
    }

    // 等最后一张翻完 + 光晕脉冲散尽，再进入解读
    setTimeout(() => {
      el.querySelector('#tapme')?.remove();
      stepReading();
    }, 900);
  }

  /* ---------- 步骤 5：解读 ---------- */
  function stepReading() {
    state.step = 'reading';
    const reading = composeReading(state.draws, { mood: state.mood, topic: state.topic });

    const cardsHtml = reading.parts.map((p, i) => `
      <article class="rcard" style="animation-delay:${.08 * i}s">
        <div class="rcard__art">${renderCard(getCardById(p.id), artOf(p.id), { uid: `-r${i}` })}</div>
        <div class="rcard__main">
          ${p.pos ? `<div class="rcard__pos">${p.pos}</div>` : ''}
          <div class="rcard__head">
            <span class="rcard__name">${p.name}</span>
            <span class="rcard__dir">${p.reversed ? '逆位' : '正位'}</span>
          </div>
          <div class="rcard__kw">${p.kw.map((k) => `<span>${k}</span>`).join('')}</div>
        </div>
      </article>`).join('');

    box(shell('解读', `
      <div class="reading" id="reading">${cardsHtml}</div>
    `, `
      <button class="act" type="button" id="save">收进记录本</button>
      <button class="act act--ghost" type="button" id="poster">生成海报</button>
      <button class="act act--ghost" type="button" id="again">再抽一次</button>
    `, 'draw__body--top'));

    /* 正文逐字显现 */
    const texts = [];
    reading.parts.forEach((p) => {
      const sec = document.createElement('div');
      sec.className = 'rtext';
      document.querySelector('#reading').appendChild(sec);
      texts.push({ el: sec, text: p.text });
    });

    if (reading.bridge) {
      document.querySelector('#reading').insertAdjacentHTML('beforeend', '<div class="rdiv">✦</div>');
      const sec = document.createElement('div');
      sec.className = 'rtext rtext--bridge';
      document.querySelector('#reading').appendChild(sec);
      texts.push({ el: sec, text: reading.bridge });
    }

    if (reading.tail) {
      const sec = document.createElement('div');
      sec.className = 'rtext rtext--tail';
      document.querySelector('#reading').appendChild(sec);
      texts.push({ el: sec, text: reading.tail });
    }

    (async () => {
      for (const t of texts) {
        await new Promise((res) => {
          typeInto(t.el, t.text, { speed: 24, onDone: res });
        });
        await sleep(180);
      }
    })();

    /* 保存 */
    el.querySelector('#save').addEventListener('click', () => {
      const d = new Date();
      const z = zodiacOf(store.get('birth.month'), store.get('birth.day'));
      store.push('history', {
        at: d.toISOString(),
        day: todayKey(),
        mood: state.mood,
        topic: state.topic,
        count: state.count,
        cards: reading.parts.map((p) => ({ id: p.id, reversed: p.reversed })),
        // 存下完整文案，记录本回看时不必重新拼装
        reading: { bridge: reading.bridge, tail: z ? `${z.name}：${z.line}` : reading.tail },
      });
      const btn = el.querySelector('#save');
      btn.textContent = '已收好 ✓';
      btn.disabled = true;
      onSaved?.(reading);
    });

    el.querySelector('#poster')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.textContent = '正在生成…';
      try {
        // 三张时取第一张做主视觉
        const main = state.draws[0];
        const url = await makePoster(main.card, main.reversed, todayKey().replace(/-/g, '.'), posterLine(main.card));
        showPoster(url);
        onPoster?.();
      } catch (err) {
        console.error(err);
        btn.textContent = '生成失败，请重试';
        setTimeout(() => { btn.textContent = '生成海报'; btn.disabled = false; }, 1600);
        return;
      }
      btn.textContent = '生成海报';
      btn.disabled = false;
    });

    el.querySelector('#again').addEventListener('click', () => {
      state.topic = null;
      state.mood = null;
      stepTopic();
    });
  }

  /* ---------- 辅助 ---------- */
  function getCardById(id) {
    return state.draws.find((d) => d.card.id === id)?.card;
  }

  stepMood();
}
