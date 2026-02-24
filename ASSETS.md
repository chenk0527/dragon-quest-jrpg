# Dragon Quest JRPG - 开源素材清单

## 推荐的开源像素素材网站

### 1. OpenGameArt.org (CC0/CC-BY)
- **网址**: https://opengameart.org
- **推荐素材**:
  - `16x16 RPG Characters` by 
  - `32x32 Fantasy Characters`
  - `RPG Monster Sprites`
  - `Pixel Art Tilesets`

### 2. itch.io (免费专区)
- **网址**: https://itch.io/game-assets/free
- **推荐素材包**:
  - `Pixel Fantasy RPG Characters`
  - `16x16 RPG Icon Pack`
  - `Pixel Art Skill Icons`

### 3. Kenney Assets (CC0)
- **网址**: https://kenney.nl/assets
- **推荐**:
  - `RPG Base Pack`
  - `Fantasy Icons`
  - `Pixel Platformer Pack`

### 4. 具体推荐的素材文件

#### 角色行走图 (16x16 or 32x32)
```
📁 assets/characters/
├── hero.png (勇者 - 4方向行走动画)
├── warrior.png (战士)
├── mage.png (法师)
├── priest.png (牧师)
└── rogue.png (盗贼)
```

#### 怪物图鉴 (16x16)
```
📁 assets/monsters/
├── slime.png (史莱姆 - 绿/蓝/红)
├── dragon.png (龙)
├── goblin.png (哥布林)
├── skeleton.png (骷髅)
└── boss/
    ├── treant.png (树精)
    ├── demon.png (恶魔)
    └── dragon_king.png (龙王)
```

#### UI素材
```
📁 assets/ui/
├── button.png (按钮)
├── panel.png (面板)
├── hp_bar.png (血条)
├── mp_bar.png (蓝条)
└── icons/ (技能图标)
```

#### 地图图块 (16x16 Tileset)
```
📁 assets/tiles/
├── grass.png (草地)
├── dirt.png (泥土)
├── water.png (水)
├── dungeon.png (地牢)
└── castle.png (城堡)
```

## 如何使用这些素材

1. 下载素材文件
2. 放入 `assets/` 目录
3. 在代码中引用:
```javascript
const SPRITES = {
    hero: 'assets/characters/hero.png',
    slime: 'assets/monsters/slime.png',
    // ...
};
```

## 手机版优化建议

### 触摸交互
- 增大按钮点击区域 (最小 44x44px)
- 添加触摸反馈动画
- 支持滑动手势切换菜单

### 性能优化
- 使用 `will-change` 属性
- 图片懒加载
- 减少重绘重排

### 视觉效果
- 像素字体 (Press Start 2P)
- CRT扫描线效果 (可选)
- 屏幕震动反馈
