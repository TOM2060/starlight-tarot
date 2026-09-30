/* ============================================================
   星语 · Starlight Tarot — 闯关 · 牌阵模式
   ------------------------------------------------------------
   每关给一个真实场景，玩家亲手抽 3 张牌，系统解读这一副牌阵，
   再告诉你它和这一关想说的"核心三张"重合了几张。

   为什么不是选对错：
     78 张牌里没有唯一正确答案。牌阵的乐趣是"我抽到了什么"，
     不是"我答对了吗"。所以判定的是"共鸣"——你抽的牌里，
     有几张正好是这一幕该出现的那几张。

   star = 命中的核心牌数量（0~3）
   0 星也算通过：牌阵本身已经被解读过了，探索已经发生。
   ============================================================ */

export const CHAPTERS = [
  { id: 1, name: '还没问出口的事', sub: '你会先遇见的三张', tint: '#a98cff' },
  { id: 2, name: '要先受得住的',   sub: '有些牌不好听',   tint: '#7fb8ff' },
  { id: 3, name: '牌记得你了',     sub: '你问得越来越准', tint: '#f3d19a' },
];

/* pool = 8 张候选，其中 3 张是核心 */
export const LEVELS = [
  /* ---------------- 第一章 ---------------- */
  {
    scene: '你想开始一件事，但总觉得"还不是时候"。',
    core: ['major-00', 'major-01', 'major-07'],
    pool: ['major-00', 'major-01', 'major-07', 'major-09', 'major-12', 'major-18', 'swords-02', 'coins-07'],
    text: '这一幕里没有"坏时机"，只有还没开始的准备。',
  },
  {
    scene: '你心里其实已经有答案了，只是不敢说出口。',
    core: ['major-02', 'major-18', 'major-20'],
    pool: ['major-02', 'major-18', 'major-20', 'major-05', 'major-11', 'swords-03', 'major-16', 'major-01'],
    text: '答案早就有了。你缺的只是允许自己相信它。',
  },
  {
    scene: '你最近一直在照顾别人，忘了自己也需要被照顾。',
    core: ['major-03', 'major-14', 'major-17'],
    pool: ['major-03', 'major-14', 'major-17', 'major-09', 'major-12', 'major-19', 'cups-04', 'coins-09'],
    text: '丰盛不是从别处来的，是从你开始好好吃饭睡觉那一刻开始的。',
  },
  {
    scene: '你想要一点安定，但心里总有一处不安。',
    core: ['major-04', 'major-09', 'major-18'],
    pool: ['major-04', 'major-09', 'major-18', 'major-02', 'major-11', 'swords-04', 'cups-05', 'coins-04'],
    text: '安定和不安可以同时存在。你不必先解决一个，才配拥有另一个。',
  },
  {
    scene: '有人给你指了一条路，你不确定该不该信。',
    core: ['major-05', 'major-06', 'major-11'],
    pool: ['major-05', 'major-06', 'major-11', 'major-01', 'major-20', 'swords-01', 'wands-08', 'coins-03'],
    text: '别人的经验可以听，但最后那一步，只能你自己踩下去。',
  },
  {
    scene: '你在两个人之间摇摆不定，谁都放不下。',
    core: ['major-06', 'major-15', 'major-16'],
    pool: ['major-06', 'major-15', 'major-16', 'major-13', 'swords-05', 'cups-02', 'major-21', 'wands-05'],
    text: '摇摆说明两边都有你舍不得的东西——先分清舍不得的是什么。',
  },
  {
    scene: '事情没按计划走，你有点撑不住。',
    core: ['major-07', 'major-08', 'major-16'],
    pool: ['major-07', 'major-08', 'major-16', 'major-12', 'swords-08', 'wands-09', 'major-15', 'cups-08'],
    text: '撑不住是身体在给你信号，不是不够坚强。',
  },
  {
    scene: '你觉得自己不够好。',
    core: ['major-08', 'major-17', 'major-19'],
    pool: ['major-08', 'major-17', 'major-19', 'major-03', 'major-21', 'cups-01', 'major-12', 'coins-09'],
    text: '温柔一点对你自己。这张牌没有要你更强，是要你别再更苛责。',
  },
  {
    scene: '你需要一个人待一会儿。',
    core: ['major-09', 'major-12', 'major-18'],
    pool: ['major-09', 'major-12', 'major-18', 'major-14', 'swords-04', 'major-02', 'cups-04', 'major-16'],
    text: '独处不是逃避，是把散落的自己重新收回来。',
  },
  {
    scene: '一切都在动，你什么都抓不住。',
    core: ['major-10', 'major-12', 'major-21'],
    pool: ['major-10', 'major-12', 'major-21', 'major-07', 'major-20', 'wands-08', 'swords-06', 'coins-08'],
    text: '抓不住是因为它在转。等它停，或者学会跟着转。',
  },

  /* ---------------- 第二章 ---------------- */
  {
    scene: '真相突然摊开在面前。',
    core: ['major-16', 'swords-03', 'major-18'],
    pool: ['major-16', 'swords-03', 'major-18', 'swords-10', 'major-13', 'swords-01', 'major-20', 'cups-05'],
    text: '疼是真的，但这是长句子的最后一个字。',
  },
  {
    scene: '你开始看清一些事，过程并不好受。',
    core: ['major-18', 'major-13', 'major-14'],
    pool: ['major-18', 'major-13', 'major-14', 'swords-03', 'major-09', 'major-12', 'cups-05', 'coins-05'],
    text: '看清和看清之后，是两件事。别急着要求自己马上好起来。',
  },
  {
    scene: '你陷在一种说不出的执念里。',
    core: ['major-15', 'major-08', 'major-14'],
    pool: ['major-15', 'major-08', 'major-14', 'major-12', 'coins-04', 'swords-05', 'major-16', 'major-09'],
    text: '锁链很松，是自己不想走。承认这一点，就已经松了一半。',
  },
  {
    scene: '结束一件事，比开始难得多。',
    core: ['major-13', 'major-12', 'coins-10'],
    pool: ['major-13', 'major-12', 'coins-10', 'major-10', 'swords-10', 'cups-08', 'major-21', 'wands-10'],
    text: '结束不是消失，是给另一段腾地方。',
  },
  {
    scene: '你在两个选择之间，动不了。',
    core: ['swords-02', 'major-20', 'major-17'],
    pool: ['swords-02', 'major-20', 'major-17', 'swords-01', 'major-11', 'major-09', 'cups-07', 'major-12'],
    text: '动不了有时候不是选择难，是你还没允许自己选。',
  },
  {
    scene: '你觉得自己在原地打转。',
    core: ['major-14', 'major-08', 'major-09'],
    pool: ['major-14', 'major-08', 'major-09', 'swords-08', 'major-12', 'coins-07', 'major-02', 'cups-04'],
    text: '原地不一定是退后。可能在补一块你一直跳过的地基。',
  },
  {
    scene: '很多人劝过你，但你没听。',
    core: ['major-05', 'major-11', 'major-16'],
    pool: ['major-05', 'major-11', 'major-16', 'swords-01', 'major-20', 'wands-08', 'major-06', 'major-15'],
    text: '不听有时候是固执，有时候是你早就知道。分清是哪一种。',
  },
  {
    scene: '你很累，只想停下来。',
    core: ['swords-04', 'major-14', 'major-09'],
    pool: ['swords-04', 'major-14', 'major-09', 'swords-08', 'major-17', 'wands-09', 'cups-04', 'major-12'],
    text: '停下不是失败，是这套系统本来就有的零件。',
  },
  {
    scene: '你赢了一场，但没觉得赢。',
    core: ['swords-05', 'major-11', 'major-18'],
    pool: ['swords-05', 'major-11', 'major-18', 'swords-03', 'major-15', 'cups-02', 'swords-09', 'major-13'],
    text: '赢了道理，输了关系，这局其实不算赢。',
  },
  {
    scene: '你终于想通了。',
    core: ['major-20', 'major-17', 'major-19'],
    pool: ['major-20', 'major-17', 'major-19', 'major-21', 'major-11', 'major-10', 'swords-01', 'major-08'],
    text: '想通不是变聪明了，是终于肯面对了。',
  },

  /* ---------------- 第三章 ---------------- */
  {
    scene: '你想知道：我做得对不对。',
    core: ['major-11', 'major-21', 'major-14'],
    pool: ['major-11', 'major-21', 'major-14', 'swords-04', 'major-08', 'major-20', 'coins-10', 'major-10'],
    text: '对不对不重要，合适不合适才重要。',
  },
  {
    scene: '你想知道：接下来会怎样。',
    core: ['major-10', 'major-19', 'major-16'],
    pool: ['major-10', 'major-19', 'major-16', 'major-07', 'wands-08', 'swords-06', 'major-21', 'major-15'],
    text: '牌不预测未来，它只指出你此刻站在哪。',
  },
  {
    scene: '你想知道：我该相信谁。',
    core: ['major-05', 'major-06', 'major-18'],
    pool: ['major-05', 'major-06', 'major-18', 'major-02', 'swords-01', 'cups-02', 'major-16', 'major-11'],
    text: '别人给你的意见，牌只会帮他翻译他真正想说的话。',
  },
  {
    scene: '你想知道：我值不值得被爱。',
    core: ['major-06', 'major-19', 'major-17'],
    pool: ['major-06', 'major-19', 'major-17', 'cups-01', 'cups-02', 'major-03', 'major-14', 'major-21'],
    text: '这张牌没有说"你会"，它说的是"你本来就"。',
  },
  {
    scene: '你想知道：什么时候。',
    core: ['major-10', 'major-14', 'major-09'],
    pool: ['major-10', 'major-14', 'major-09', 'coins-07', 'swords-04', 'major-12', 'major-20', 'major-02'],
    text: '牌不给日期。给的是：这件事到了它自己会动的时候。',
  },
  {
    scene: '你想知道：要不要放手。',
    core: ['major-13', 'major-15', 'major-12'],
    pool: ['major-13', 'major-15', 'major-12', 'swords-05', 'cups-08', 'coins-04', 'major-18', 'major-09'],
    text: '放不放手不是判断题。先看清你抓着的是什么。',
  },
  {
    scene: '你想知道：我是不是走错路了。',
    core: ['major-16', 'major-21', 'major-08'],
    pool: ['major-16', 'major-21', 'major-08', 'major-12', 'swords-09', 'major-13', 'major-10', 'wands-10'],
    text: '走错和绕路不是一回事。有些人是在找一条本来就有的路。',
  },
  {
    scene: '你想知道：我什么时候能好起来。',
    core: ['major-17', 'major-19', 'major-18'],
    pool: ['major-17', 'major-19', 'major-18', 'swords-04', 'major-14', 'cups-05', 'major-13', 'major-03'],
    text: '不会一下子好。但从你开始问这个问题的那天，就已经在好了。',
  },
  {
    scene: '你想知道：什么是真的。',
    core: ['major-18', 'swords-03', 'major-17'],
    pool: ['major-18', 'swords-03', 'major-17', 'swords-01', 'major-02', 'major-11', 'major-20', 'cups-07'],
    text: '真话通常不好听。但你其实早就知道了。',
  },
  {
    scene: '你只是想被安慰一下。',
    core: ['major-19', 'major-21', 'major-03'],
    pool: ['major-19', 'major-21', 'major-03', 'cups-01', 'major-17', 'major-06', 'major-14', 'major-08'],
    text: '想被安慰也没错。牌说这不丢人——这本来就该有的。',
  },
];

/* ---------------- 派生 ---------------- */
export const ALL = LEVELS.map((lv, i) => ({
  ...lv,
  no: i + 101,
  chapter: Math.floor(i / 10) + 1,
  indexInChapter: (i % 10) + 1,
}));

export const levelOf = (no) => ALL.find((l) => l.no === no) || null;
