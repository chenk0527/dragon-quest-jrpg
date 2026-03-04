# 项目上下文

## 技术栈
- **前端:** 纯 HTML5 + CSS3 + Vanilla JavaScript（无框架）
- **渲染:** Canvas 2D（世界探索）+ DOM（其他界面）
- **音频:** Web Audio API（8-bit 音效）
- **字体:** Press Start 2P（fonts.loli.net 镜像，国内可访问）
- **部署:** GitHub Pages 静态托管

## 文件结构
```
├── index.html          — 主入口（178行），所有场景DOM结构
├── game.js             — 核心游戏逻辑（3470+行）
├── world-explore.js    — 世界探索Canvas系统（760行）
├── audio-system.js     — Web Audio 8-bit音效（852行）
├── styles.css          — 全部样式（2000+行）
├── assets/             — 资源清单
│   └── manifest.json
├── PLAN.md             — 扩展计划（2h→10h内容）
└── .helloagents/       — 知识库（本目录）
```

## 架构模式
- **全局作用域:** 所有函数和变量都在全局作用域，通过 `window.xxx` 导出
- **场景系统:** `showScene(id)` 切换，场景ID格式 `scene` + 首字母大写（sceneMenu/sceneParty/sceneWorld/sceneMap/sceneBattle/sceneBestiary/sceneCosmetics）
- **状态管理:** 全局 `gameState` 对象，`localStorage` 持久化
- **战斗系统:** 回合制，`battleState` 管理战斗状态

## 关键约束
1. **不改游戏逻辑和数据** — 100+怪物、50+外观、职业系统等保持不变
2. **window.xxx 导出必须保留** — 其他模块和HTML onclick依赖
3. **mobile-first** — 主要在iPhone Safari和飞书内置浏览器中使用
4. **中国大陆网络** — Google Fonts 被墙，使用 fonts.loli.net 镜像 + async loading
5. **单页应用** — 所有内容在一个 HTML 文件中

## 核心全局变量
- `gameState` — 游戏状态（队伍/背包/金币/地图/成就等）
- `battleState` — 战斗状态（敌人/回合/日志）
- `W` — 世界探索状态（Canvas/玩家/相机/地图）
- `isGameStarted` — 是否已进入游戏（控制菜单显示）

## 场景渲染函数
| 场景 | 渲染函数 | 说明 |
|------|---------|------|
| menu | renderMenu() | 主菜单/游戏中菜单 |
| party | renderParty() | 队伍管理 |
| world | WorldSystem.init() | Canvas世界探索 |
| map | renderMap() | 区域选择地图 |
| battle | startBattle(zone) | 战斗系统 |
| bestiary | renderBestiary() | 怪物图鉴 |
| cosmetics | renderCosmetics() | 外观时装 |
