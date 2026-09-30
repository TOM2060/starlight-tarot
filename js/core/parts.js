/* ============================================================
   星语 · Starlight Tarot — 共用 UI 片段
   ============================================================ */

/** 牌背（游戏与牌库共用的核心视觉符号） */
export function cardBack(uid = '') {
  const U = (n) => `${n}${uid}`;
  return `
  <svg class="back__art" viewBox="0 0 120 210" aria-hidden="true">
    <defs>
      <linearGradient id="${U('bk-fill')}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0"   stop-color="#2d1a63"/>
        <stop offset=".48" stop-color="#1a0f45"/>
        <stop offset="1"   stop-color="#0d0729"/>
      </linearGradient>
      <linearGradient id="${U('bk-gold')}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0"   stop-color="#ffe9c0"/>
        <stop offset=".45" stop-color="#e3bd7d"/>
        <stop offset="1"   stop-color="#a98044"/>
      </linearGradient>
      <radialGradient id="${U('bk-halo')}" cx=".5" cy=".46" r=".5">
        <stop offset="0"   stop-color="#8b6cff" stop-opacity=".5"/>
        <stop offset=".6"  stop-color="#8b6cff" stop-opacity=".08"/>
        <stop offset="1"   stop-color="#8b6cff" stop-opacity="0"/>
      </radialGradient>
      <pattern id="${U('bk-dots')}" width="11" height="11" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r=".55" fill="#f3d19a" opacity=".26"/>
        <circle cx="8" cy="7" r=".4"  fill="#c9b4ff" opacity=".2"/>
      </pattern>
      <filter id="${U('bk-glow')}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <rect x="2" y="2" width="116" height="206" rx="12" fill="url(#${U('bk-fill')})"/>
    <rect x="2" y="2" width="116" height="206" rx="12" fill="url(#${U('bk-dots')})"/>
    <rect x="2" y="2" width="116" height="206" rx="12" fill="url(#${U('bk-halo')})"/>

    <rect x="2.5" y="2.5" width="115" height="205" rx="12"
          fill="none" stroke="url(#${U('bk-gold')})" stroke-width="1.6"/>
    <rect x="9" y="9" width="102" height="192" rx="7.5"
          fill="none" stroke="url(#${U('bk-gold')})" stroke-width=".7" opacity=".65"/>

    <g stroke="url(#${U('bk-gold')})" stroke-width=".9" fill="none" opacity=".8">
      <path d="M13 32 v-8 h8"/><path d="M107 32 v-8 h-8"/>
      <path d="M13 178 v8 h8"/><path d="M107 178 v8 h-8"/>
    </g>

    <g filter="url(#${U('bk-glow')})">
      <path d="M60 36 l3.1 7.6 7.9.5-6 5 1.9 7.7L60 52.6l-6.9 4.2 1.9-7.7-6-5 7.9-.5Z"
            fill="#f3d19a" opacity=".9"/>
      <path d="M60 158.4 l-3.1-7.6-7.9-.5 6-5-1.9-7.7L60 141.8l6.9-4.2-1.9 7.7 6 5-7.9.5Z"
            fill="#f3d19a" opacity=".62"/>
    </g>

    <g transform="translate(60 106)" filter="url(#${U('bk-glow')})">
      <circle r="30" fill="none" stroke="url(#${U('bk-gold')})" stroke-width=".7" opacity=".5"/>
      <circle r="24" fill="none" stroke="url(#${U('bk-gold')})" stroke-width=".5" opacity=".3"
              stroke-dasharray="1.5 3.5"/>
      <path d="M0 -30 C3.4 -12 12 -3.4 30 0 C12 3.4 3.4 12 0 30 C-3.4 12 -12 3.4 -30 0 C-12 -3.4 -3.4 -12 0 -30Z"
            fill="url(#${U('bk-gold')})" opacity=".92"/>
      <path d="M0 -17 C2.4 -6.8 6.8 -2.4 17 0 C6.8 2.4 2.4 6.8 0 17 C-2.4 6.8 -6.8 2.4 -17 0 C-6.8 -2.4 -2.4 -6.8 0 -17Z"
            fill="#1a0f45" opacity=".8"/>
    </g>

    <g fill="#f3d19a" opacity=".5">
      <circle cx="26" cy="106" r="1"/><circle cx="94" cy="106" r="1"/>
      <circle cx="60" cy="74" r=".7"/><circle cx="60" cy="138" r=".7"/>
    </g>
  </svg>`;
}

/** 对勾 */
export const CHECK = `<svg class="pick__mark" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 12.5l5.2 5.2L20 7"/></svg>`;

/** 返回箭头 */
export const ARROW_BACK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M15 5l-7 7 7 7"/></svg>`;
