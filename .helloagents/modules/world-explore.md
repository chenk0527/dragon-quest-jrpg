# world-explore 模块

## 文件: world-explore.js (~760行)

## 概述
Canvas 2D 像素风世界探索系统。玩家在 tile-based 地图上移动，与NPC对话、打怪、开宝箱。

## 核心对象
```javascript
W = {
    canvas, ctx,           // Canvas 元素和 2D 上下文
    player: { x, y, dir, frame, moving },  // 玩家状态
    camera: { x, y },     // 相机偏移
    map: [],              // 2D 数组 [y][x] = TileType
    monsters: [],         // 怪物列表 { x, y, type, color, name }
    npcs: [],            // NPC列表 { x, y, name, color, hairColor, dialog }
    chests: [],          // 宝箱列表 { x, y, opened, gold }
    TILE: 32,            // 图块大小(px)
    W: 25, H: 20,        // 地图尺寸(格)
    time: 0,             // 动画计时器
    dialogActive: false   // 对话框激活中（阻止移动）
}
```

## 图块类型
T = { GRASS:0, WALL:1, TREE:2, WATER:3, CHEST:4, MONSTER:5, PATH:6 }

## 像素绘制函数
每种图块有独立的绘制函数，包含细节装饰和动画：
- `drawGrass(ctx, sx, sy, mx, my)` — 棋盘格+随机草叶/小花
- `drawTree(ctx, sx, sy)` — 三层树冠+树干+阴影
- `drawWater(ctx, sx, sy, mx, my, time)` — 波纹动画+反光
- `drawWall(ctx, sx, sy, mx, my)` — 砖块纹理
- `drawChest(ctx, sx, sy, opened)` — 像素宝箱
- `drawMonster(ctx, sx, sy, monster, time)` — 史莱姆弹跳动画
- `drawNPC(ctx, sx, sy, npc)` — 像素小人+名字标签
- `drawPlayer(ctx, sx, sy, dir, frame, time)` — 4方向角色+剑+呼吸动画

## 关键函数
- `initWorld()` — 初始化（Canvas尺寸/地图生成/事件绑定/游戏循环）
- `genMap()` — 生成地图（路径/树/水/NPC/怪物/宝箱）
- `move(dx, dy)` — 移动（碰撞检测/宝箱/怪物触发战斗）
- `action()` — A键动作（NPC对话/关闭对话框）
- `loop()` — requestAnimationFrame 游戏循环
- `updateCamera()` — 相机跟随玩家
- `draw()` — 主渲染函数
- `showWorldDialog(title, text)` — 游戏内对话框
- `closeWorldDialog()` — 关闭对话框

## 导出接口
```javascript
window.WorldSystem = {
    init: initWorld,
    handleAction: action,
    toggleMenu: () => showScene('party'),
    fromWorldExploration: false,  // 战斗返回标志
    reset: () => { ... }
}
```

## 与 game.js 的交互
- 进入冒险: `showScene('world')` → `WorldSystem.init()`
- 触发战斗: `WorldSystem.fromWorldExploration = true` → `startBattle('forest')`
- 战斗返回: `returnFromBattle()` 检查 `fromWorldExploration` → `showScene('world')`
