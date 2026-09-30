/* ============================================================
   星语 · Starlight Tarot — 牌面绘制索引
   ------------------------------------------------------------
   重要：所有 renderCard() 的调用点都必须从这里取 art 函数。
   之前各视图直接引用 MAJOR_ART，导致抽到小阿尔克那时
   art 函数为 undefined，画出"只有星点与边框"的空白牌。
   ============================================================ */

import { MAJOR_ART } from './major-art.js';
import { MINOR_ART } from './minor-art.js';

/** 全部 78 张牌的画面函数（当前已解锁 62 张） */
export const ART = { ...MAJOR_ART, ...MINOR_ART };

/** 安全取值：拿不到时返回 null，而不是 undefined 混进模板 */
export const artOf = (id) => ART[id] || null;
