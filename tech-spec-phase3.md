# Phase 3: 全面修复 + 菜单改进

## 🔴 必须修复

### 1. "冒险"页面空白
showScene('world') 查找 id="sceneWorld"，但 HTML 里世界场景的 id 是 "worldScene"。
修复：把 worldScene 的 id 改为 sceneWorld，或者在 showScene 里加特殊处理。推荐统一命名：所有场景 id 都叫 scene + 首字母大写（sceneWorld）。

### 2. 菜单状态切换
进入游戏后，菜单页（sceneMenu）不应再显示"开始新游戏/继续游戏"。
改为两种状态：
- **未开始状态**（初始/无存档）：显示 "开始新游戏"
- **游戏中状态**（已进入游戏后）：显示 "保存游戏"、"选择存档"、"回到主菜单"

实现方式：添加 gameStarted 标志，showScene('menu') 时根据状态渲染不同按钮。
- "保存游戏" → 调用 saveGame() + showToast
- "选择存档" → 暂时等同于 loadGame() + 刷新
- "回到主菜单" → 回到未开始状态（显示开始/继续）

### 3. 对话框背景遮挡不完全
对话框 overlay 的 background 需要是完全不透明黑色遮罩，确保看不到后面的页面内容。

### 4. 底部导航栏在手机上不固定
确认 .nav-bar 是 position:fixed，bottom:0，有正确的 z-index。
.main-content 有足够的 padding-bottom。

## 验收标准
1. 点击"冒险"能正常显示世界地图或探索界面
2. 进入游戏后菜单显示：保存游戏 / 选择存档 / 回到主菜单
3. 对话框全屏黑色遮罩，看不到后面内容
4. 所有场景切换正常（菜单/队伍/冒险/图鉴/外观/战斗）
5. 手机端导航栏始终固定底部
