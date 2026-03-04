# game-core 模块

## 文件: game.js (~3470行)

## 核心系统

### 角色系统
- `createCharacter(name, classId)` — 创建角色
- 职业: warrior/mage/priest/rogue（战士/法师/牧师/盗贼）
- `calculateStats(char)` — 基于等级+装备计算属性
- `learnedSkills` — 按职业初始化技能

### 战斗系统（回合制）
- `startBattle(zoneId)` — 进入战斗
- `battleAction(type)` — 执行战斗动作（attack/skill/item/defend/escape）
- `victory()` — 胜利处理（经验+金币+掉落）
- `defeat()` — 失败处理（恢复50%HP/扣10%金币）
- `returnFromBattle()` — 战斗结束返回（检查fromWorldExploration标志）

### 装备系统
- `generateEquipment(type, level, rarity)` — 生成装备
- 部位: weapon/helmet/armor/boots/ring/amulet
- 稀有度: common/uncommon/rare/epic/legendary

### 强化系统
- `ENHANCE_CONFIG` — 强化配置（+1到+15）
- `performEnhance(charIndex, slot)` — 执行强化
- 材料: common/magic/rare/epic/legendary

### 技能系统
- `SKILL_SYSTEM` — 按职业的技能树
- 技能类型: attack/heal/buff/debuff/steal/drain/escape/revive/dispel/counter/dot

### 道具系统
- `CONSUMABLE_ITEMS` — 消耗品定义
- `createConsumable(type)` — 创建道具
- 类型: smallPotion/mediumPotion/largePotion/antidote/revivePotion

### 场景管理
- `showScene(sceneId)` — 切换场景（隐藏/显示DOM + 调用渲染函数）
- `renderMenu()` — 菜单（根据isGameStarted切换内容）
- `renderParty()` — 队伍
- `renderMap()` — 地图
- `renderBestiary()` — 图鉴
- `renderCosmetics()` — 外观

### 存档
- `saveGame()` — localStorage保存
- `loadGame()` — localStorage加载
- `init()` — 初始化入口

## 关键全局变量
- `gameState` — 所有游戏状态
- `battleState` — 当前战斗状态
- `isGameStarted` — 菜单状态切换标志
- `currentDialog` / `dialogCallback` — 剧情对话系统
