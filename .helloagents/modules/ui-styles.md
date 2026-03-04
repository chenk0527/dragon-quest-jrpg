# ui-styles 模块

## 文件: styles.css (2000+行) + index.html (191行)

## CSS 变量
```css
--dq-bg: #0a0e1a          /* 主背景 */
--dq-bg-dark: #060a14     /* 深色背景 */
--dq-blue: #4a90e2         /* 主色蓝 */
--dq-blue-light: #6ab0ff   /* 浅蓝 */
--dq-gold: #ffd700         /* 金色 */
--dq-red: #ff4444          /* 红色 */
--dq-green: #44ff44        /* 绿色 */
--dq-gray: #8899aa         /* 灰色 */
--dq-white: #e8e8e8        /* 白色 */
```

## 场景DOM结构 (index.html)
```
#app (max-width: 480px)
├── .header-bar          — 顶栏（标题+金币）
├── .main-content        — 主内容区（可滚动，padding-bottom:70px）
│   ├── #sceneMenu       — 主菜单
│   ├── #sceneParty      — 队伍
│   ├── #sceneWorld      — 冒险（Canvas+控制器）
│   ├── #sceneMap        — 地图
│   ├── #sceneBattle     — 战斗
│   ├── #sceneBestiary   — 图鉴
│   └── #sceneCosmetics  — 外观
└── #navBar (.nav-bar)   — 底部导航（position:fixed, z-index:100）
```

## 导航栏
- position: fixed; bottom: 0; max-width: 480px
- 5个按钮: 菜单/队伍/冒险/图鉴/外观
- 战斗时隐藏(display:none)，冒险时隐藏

## 响应式
- max-width: 480px 容器
- mobile-first 设计
- safe-area-inset 支持 (iPhone刘海)
- -webkit-overflow-scrolling: touch
