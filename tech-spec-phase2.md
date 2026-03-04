# 对抗性审查 + Phase 2 优化 Tech Spec

## 🔴 HIGH - 必须修复的 Bug

### 1. learnedSkills 初始化硬编码所有职业技能
**位置**: game.js createCharacter() 函数
**问题**: 每个角色创建时都写死了 `learnedSkills: ['slash', 'fireball', 'aimedShot', 'cure', 'stab']`，意味着战士也会"治愈"，牧师也会"突刺"。应该根据 classId 只给对应职业的初始技能。
**修复**: 根据 classId 从 SKILL_SYSTEM 中筛选 level=1 的技能作为初始技能。

### 2. 物品系统形同虚设
**位置**: game.js showItemMenu() 函数
**问题**: 物品菜单只是"使用第一个治疗道具恢复固定50HP"，没有物品选择界面，没有不同药水效果，战斗中无法选择对谁使用。
**修复**: 添加物品选择弹窗，支持多种消耗品，选择目标。

### 3. 战斗中无法选择攻击目标
**位置**: game.js performAttack()
**问题**: selectedTarget 默认0且没有UI让玩家选择目标，多个敌人时永远打第一个。selectTarget() 函数存在但战斗UI里没有调用入口。
**修复**: 在敌人渲染时添加点击选择目标功能。

### 4. 很多技能类型没有实现
**位置**: game.js executeSkill()
**问题**: SKILL_SYSTEM 定义了 steal/dot/drain/escape/counter/revive/dispel/debuff 等类型，但 executeSkill 的 switch 里只处理了 attack/magic/aoe/heal/partyHeal/buff/partyBuff。其他类型会走 default 分支——只打印一条日志什么都不做。
**修复**: 实现缺失的技能类型逻辑。

### 5. 存档在 startNewGame 时不清除旧存档
**问题**: 如果玩家已有存档，点"开始新游戏"会直接覆盖，没有确认提示。
**修复**: 添加"是否覆盖存档"确认弹窗。

## 🟡 MEDIUM - 体验问题

### 6. 战斗日志用内联 style
**位置**: renderBattleLog() 函数
**问题**: 每条日志都用内联 `style="color: xxx"` 渲染，应该用 CSS class。

### 7. 没有加载界面
**问题**: AssetLoader.showLoadingScreen() 查找 `loadingScreen` 元素，但 index.html 里没有这个元素（之前重构时 loading.html 被删了但忘记把加载UI集成进来）。

### 8. 敌人攻击没有策略
**问题**: enemyTurn() 中敌人完全随机攻击，BOSS也是。应该给BOSS添加特殊技能和AI策略。

### 9. 装备对比缺失
**问题**: 获得新装备时无法和当前装备对比属性，玩家不知道新装备是否更好。

### 10. 没有背包管理界面
**问题**: inventory 有50个槽位限制但没有背包界面让玩家查看/整理/丢弃物品。

## 优化方案

### 本次执行（HIGH 优先级）：
1. 修复 learnedSkills 按职业初始化
2. 修复战斗目标选择（点击敌人选中）
3. 实现缺失的技能类型（steal/drain/revive/dispel/escape）
4. 改进物品系统（添加药水种类 + 选择界面）
5. 新游戏覆盖确认
6. 添加加载界面到 index.html
7. 战斗日志改用 CSS class

### 验收标准
- 每个职业只学会本职业技能
- 战斗中可点击敌人切换攻击目标
- 偷窃/吸血/复活/驱散/逃跑技能全部可用
- 有物品选择菜单可以选药水和目标
- 开新游戏前有确认弹窗
- 有资源加载进度条
