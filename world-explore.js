/**
 * Dragon Quest JRPG - 世界探索系统 (重构版)
 * 最简实现，确保可靠运行
 */

// 全局变量
let W = {
    canvas: null,
    ctx: null,
    player: { x: 12, y: 10, dir: 'down' },
    camera: { x: 0, y: 0 },
    map: [],
    monsters: [],
    npcs: [],
    initialized: false,
    loopStarted: false,
    TILE: 32,
    W: 25,
    H: 20
};

// 图块类型
const T = { GRASS: 0, WALL: 1, TREE: 2, WATER: 3, CHEST: 4, MONSTER: 5 };

// 初始化
function initWorld() {
    console.log('[W] Init called');
    if (W.initialized) {
        console.log('[W] Already initialized, reinitializing...');
        W.initialized = false;
    }
    
    W.canvas = document.getElementById('worldCanvas');
    if (!W.canvas) {
        console.error('[W] Canvas not found');
        return false;
    }
    
    W.ctx = W.canvas.getContext('2d');
    if (!W.ctx) {
        console.error('[W] Could not get 2D context');
        return false;
    }
    
    // 设置画布大小
    const container = W.canvas.parentElement;
    if (container) {
        W.canvas.width = container.clientWidth || window.innerWidth;
        W.canvas.height = container.clientHeight || (window.innerHeight - 100);
    }
    
    console.log('[W] Canvas size:', W.canvas.width, 'x', W.canvas.height);
    
    // 重置玩家位置到地图中心偏上的安全位置
    W.player.x = 12;
    W.player.y = 10;
    W.player.dir = 'down';
    
    // 生成地图
    genMap();
    
    // 确保玩家位置是草地
    if (W.map[W.player.y] && W.map[W.player.y][W.player.x] !== undefined) {
        W.map[W.player.y][W.player.x] = T.GRASS;
    }
    
    // 确保玩家周围是草地（创建3x3的安全区域）
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            let nx = W.player.x + dx;
            let ny = W.player.y + dy;
            if (nx >= 0 && nx < W.W && ny >= 0 && ny < W.H) {
                W.map[ny][nx] = T.GRASS;
            }
        }
    }
    console.log('[W] Cleared 3x3 area around player');
    
    // 绑定事件
    bindKeys();
    bindTouch();
    bindButtons();
    
    W.initialized = true;
    
    // 开始游戏循环（如果还没有开始）
    if (!W.loopStarted) {
        W.loopStarted = true;
        loop();
    }
    
    console.log('[W] Initialized successfully');
    console.log('[W] Player at:', W.player.x, W.player.y);
    console.log('[W] Map size:', W.W, 'x', W.H);
    
    // 显示操作提示
    setTimeout(() => {
        if (typeof showToast === 'function') {
            showToast('🎮 使用方向键或WASD移动，点击A键调查，B键返回', 'info');
        }
    }, 500);
    
    return true;
}

// 生成地图
function genMap() {
    W.map = [];
    W.monsters = [];
    W.npcs = [];
    
    for (let y = 0; y < W.H; y++) {
        W.map[y] = [];
        for (let x = 0; x < W.W; x++) {
            // 边界
            if (x === 0 || x === W.W-1 || y === 0 || y === W.H-1) {
                W.map[y][x] = T.WALL;
            } else {
                W.map[y][x] = T.GRASS;
            }
        }
    }
    
    // 随机树 - 确保不阻挡玩家起始位置(12,10)
    for (let i = 0; i < 8; i++) {
        let x = Math.floor(Math.random() * (W.W - 4)) + 2;
        let y = Math.floor(Math.random() * (W.H - 4)) + 2;
        // 确保树木远离玩家起始位置
        let distFromPlayer = Math.abs(x - 12) + Math.abs(y - 10);
        if (distFromPlayer > 4 && W.map[y][x] === T.GRASS) {
            W.map[y][x] = T.TREE;
        }
    }
    
    // 池塘 - 确保远离玩家起始位置(12,10)
    for (let y = 15; y < 18; y++) {
        for (let x = 18; x < 22; x++) {
            if (W.map[y] && W.map[y][x] !== undefined) {
                W.map[y][x] = T.WATER;
            }
        }
    }
    
    // NPC - 确保不阻挡玩家起始位置
    W.npcs.push({ x: 5, y: 5, name: '村长', color: '#daa520' });
    W.npcs.push({ x: 20, y: 8, name: '商人', color: '#ff69b4' });
    
    // 确保NPC位置是草地
    W.npcs.forEach(npc => {
        if (W.map[npc.y] && W.map[npc.y][npc.x] !== undefined) {
            W.map[npc.y][npc.x] = T.GRASS;
        }
    });
    
    // 怪物 - 确保生成更多且位置远离玩家
    let monsterCount = 0;
    let attempts = 0;
    while (monsterCount < 6 && attempts < 50) {
        let x = Math.floor(Math.random() * (W.W - 4)) + 2;
        let y = Math.floor(Math.random() * (W.H - 4)) + 2;
        // 确保远离玩家起始位置(12,10)
        let distFromPlayer = Math.abs(x - 12) + Math.abs(y - 10);
        if (W.map[y][x] === T.GRASS && distFromPlayer > 3) {
            W.monsters.push({ x, y, type: 'slime', color: '#0f0', name: '史莱姆' });
            W.map[y][x] = T.MONSTER;
            monsterCount++;
            console.log('[W] Spawned monster at:', x, y);
        }
        attempts++;
    }
    console.log('[W] Total monsters spawned:', monsterCount);
    
    // 宝箱 - 确保不生成在玩家起始位置附近
    for (let i = 0; i < 3; i++) {
        let x = Math.floor(Math.random() * (W.W - 4)) + 2;
        let y = Math.floor(Math.random() * (W.H - 4)) + 2;
        let distFromPlayer = Math.abs(x - 12) + Math.abs(y - 10);
        if (W.map[y][x] === T.GRASS && distFromPlayer > 2) {
            W.map[y][x] = T.CHEST;
        }
    }
}

// 键盘事件
function bindKeys() {
    window.addEventListener('keydown', (e) => {
        console.log('[W] Key pressed:', e.key, 'KeyCode:', e.keyCode);
        // 防止方向键滚动页面
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
            e.preventDefault();
        }
        switch(e.key) {
            case 'ArrowUp': 
            case 'w': 
            case 'W': 
                console.log('[W] Moving UP');
                move(0, -1); 
                break;
            case 'ArrowDown': 
            case 's': 
            case 'S': 
                console.log('[W] Moving DOWN');
                move(0, 1); 
                break;
            case 'ArrowLeft': 
            case 'a': 
            case 'A': 
                console.log('[W] Moving LEFT');
                move(-1, 0); 
                break;
            case 'ArrowRight': 
            case 'd': 
            case 'D': 
                console.log('[W] Moving RIGHT');
                move(1, 0); 
                break;
        }
    });
    console.log('[W] Keyboard events bound');
}

// 触摸事件
function bindTouch() {
    let sx, sy;
    W.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
        console.log('[W] Touch start:', sx, sy);
    }, { passive: false });
    
    W.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const dx = e.changedTouches[0].clientX - sx;
        const dy = e.changedTouches[0].clientY - sy;
        console.log('[W] Touch end, delta:', dx, dy);
        
        if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
            if (Math.abs(dx) > Math.abs(dy)) {
                console.log('[W] Swipe horizontal:', dx > 0 ? 'RIGHT' : 'LEFT');
                move(dx > 0 ? 1 : -1, 0);
            } else {
                console.log('[W] Swipe vertical:', dy > 0 ? 'DOWN' : 'UP');
                move(0, dy > 0 ? 1 : -1);
            }
        }
    }, { passive: false });
    
    console.log('[W] Touch events bound');
}

// 按钮事件
function bindButtons() {
    console.log('[W] Binding buttons...');
    
    // 方向键 - 使用 onclick 并确保正确绑定
    const dirs = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
    
    const dpadBtns = document.querySelectorAll('.dpad-btn');
    console.log('[W] Found dpad buttons:', dpadBtns.length);
    
    dpadBtns.forEach(btn => {
        const key = btn.dataset.key;
        const d = dirs[key];
        
        console.log('[W] Processing button:', key, 'direction:', d);
        
        if (d) {
            // 移除旧的事件监听器（如果有）
            btn.onclick = null;
            
            // 添加新的事件处理
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[W] D-pad clicked:', key, 'direction:', d);
                move(d[0], d[1]);
            };
            
            // 同时添加触摸事件支持
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[W] D-pad touch:', key);
                move(d[0], d[1]);
            }, { passive: false });
            
            console.log('[W] Bound', key, 'button');
        } else {
            console.warn('[W] Unknown button key:', key);
        }
    });
    
    // AB键
    const aBtn = document.querySelector('.a-btn');
    const bBtn = document.querySelector('.b-btn');
    
    if (aBtn) {
        aBtn.onclick = (e) => {
            e.preventDefault();
            console.log('[W] A button clicked');
            action();
        };
        aBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            action();
        }, { passive: false });
    }
    
    if (bBtn) {
        bBtn.onclick = (e) => {
            e.preventDefault();
            console.log('[W] B button clicked');
            if (typeof showScene === 'function') showScene('party');
        };
        bBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (typeof showScene === 'function') showScene('party');
        }, { passive: false });
    }
    
    console.log('[W] All buttons bound');
}

// 移动
function move(dx, dy) {
    console.log('[W] move() called with:', dx, dy);
    
    let nx = W.player.x + dx;
    let ny = W.player.y + dy;
    
    // 方向
    if (dx > 0) W.player.dir = 'right';
    else if (dx < 0) W.player.dir = 'left';
    else if (dy > 0) W.player.dir = 'down';
    else W.player.dir = 'up';
    
    // 边界检查
    if (nx < 0 || nx >= W.W || ny < 0 || ny >= W.H) {
        console.log('[W] Out of bounds');
        return;
    }
    
    let tile = W.map[ny][nx];
    console.log('[W] Move to:', nx, ny, 'Tile:', tile, 'T.MONSTER=', T.MONSTER);
    
    if (tile === T.GRASS) {
        W.player.x = nx;
        W.player.y = ny;
        console.log('[W] Moved to grass, new pos:', W.player.x, W.player.y);
        // 强制更新相机和重绘
        updateCamera();
    } else if (tile === T.CHEST) {
        W.player.x = nx;
        W.player.y = ny;
        W.map[ny][nx] = T.GRASS;
        console.log('[W] Opened chest');
        alert('💰 获得 50 金币！');
    } else if (tile === T.MONSTER) {
        console.log('[W] Encountered monster!');
        let m = W.monsters.find(m => m.x === nx && m.y === ny);
        if (m) {
            console.log('[W] Monster found:', m.type);
            console.log('[W] startBattle function exists?', typeof startBattle === 'function');
            console.log('[W] window.startBattle exists?', typeof window.startBattle === 'function');
            
            // 移除怪物
            W.map[ny][nx] = T.GRASS;
            W.monsters = W.monsters.filter(x => x !== m);
            
            // 移动玩家到怪物位置
            W.player.x = nx;
            W.player.y = ny;
            
            // 触发战斗 - 尝试多种方式
            console.log('[W] Setting fromWorldExploration flag');
            if (window.WorldSystem) {
                window.WorldSystem.fromWorldExploration = true;
                console.log('[W] Flag set via WorldSystem');
            }
            
            // 延迟调用战斗，确保标志已设置
            setTimeout(() => {
                console.log('[W] Attempting to start battle...');
                if (typeof window.startBattle === 'function') {
                    console.log('[W] Starting battle via window.startBattle()');
                    window.startBattle('forest');
                } else if (typeof startBattle === 'function') {
                    console.log('[W] Starting battle via startBattle()');
                    startBattle('forest');
                } else {
                    console.error('[W] startBattle not found!');
                    alert('👹 遭遇 ' + m.type + '！(战斗系统未加载)');
                    // 恢复怪物，因为战斗没有开始
                    W.map[ny][nx] = T.MONSTER;
                    W.player.x = nx - dx;
                    W.player.y = ny - dy;
                }
            }, 50);
        }
    } else if (tile === T.WALL || tile === T.TREE || tile === T.WATER) {
        console.log('[W] Blocked by obstacle');
    }
}

// 动作键
function action() {
    let ax = W.player.x, ay = W.player.y;
    switch(W.player.dir) {
        case 'up': ay--; break;
        case 'down': ay++; break;
        case 'left': ax--; break;
        case 'right': ax++; break;
    }
    
    let npc = W.npcs.find(n => n.x === ax && n.y === ay);
    if (npc) {
        alert(npc.name + ': 你好，勇者！');
    }
}

// 游戏循环
function loop() {
    updateCamera();
    draw();
    requestAnimationFrame(loop);
}

// 更新相机
function updateCamera() {
    W.camera.x = W.player.x - Math.floor(W.canvas.width / W.TILE / 2);
    W.camera.y = W.player.y - Math.floor(W.canvas.height / W.TILE / 2);
    W.camera.x = Math.max(0, Math.min(W.camera.x, W.W - Math.floor(W.canvas.width / W.TILE)));
    W.camera.y = Math.max(0, Math.min(W.camera.y, W.H - Math.floor(W.canvas.height / W.TILE)));
}

// 绘制
function draw() {
    let ctx = W.ctx;
    let cw = W.canvas.width;
    let ch = W.canvas.height;
    
    // 清空
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, 0, cw, ch);
    
    let tw = Math.ceil(cw / W.TILE) + 1;
    let th = Math.ceil(ch / W.TILE) + 1;
    
    // 绘制地图
    for (let y = 0; y < th; y++) {
        for (let x = 0; x < tw; x++) {
            let mx = W.camera.x + x;
            let my = W.camera.y + y;
            if (mx < 0 || mx >= W.W || my < 0 || my >= W.H) continue;
            
            let tile = W.map[my][mx];
            let sx = x * W.TILE;
            let sy = y * W.TILE;
            
            switch(tile) {
                case T.GRASS:
                    ctx.fillStyle = (mx + my) % 2 ? '#4a7c4e' : '#3d6b40';
                    ctx.fillRect(sx, sy, W.TILE, W.TILE);
                    break;
                case T.WALL:
                    ctx.fillStyle = '#666';
                    ctx.fillRect(sx, sy, W.TILE, W.TILE);
                    break;
                case T.TREE:
                    ctx.fillStyle = '#2d5a30';
                    ctx.fillRect(sx, sy, W.TILE, W.TILE);
                    ctx.fillStyle = '#228b22';
                    ctx.fillRect(sx+4, sy+4, 24, 24);
                    break;
                case T.WATER:
                    ctx.fillStyle = '#4169e1';
                    ctx.fillRect(sx, sy, W.TILE, W.TILE);
                    break;
                case T.CHEST:
                    ctx.fillStyle = '#4a7c4e';
                    ctx.fillRect(sx, sy, W.TILE, W.TILE);
                    ctx.fillStyle = '#ffd700';
                    ctx.fillRect(sx+8, sy+8, 16, 16);
                    break;
                case T.MONSTER:
                    ctx.fillStyle = '#4a7c4e';
                    ctx.fillRect(sx, sy, W.TILE, W.TILE);
                    break;
            }
        }
    }
    
    // 绘制NPC
    W.npcs.forEach(n => {
        if (n.x >= W.camera.x && n.x < W.camera.x + tw && n.y >= W.camera.y && n.y < W.camera.y + th) {
            let sx = (n.x - W.camera.x) * W.TILE;
            let sy = (n.y - W.camera.y) * W.TILE;
            ctx.fillStyle = n.color;
            ctx.fillRect(sx+8, sy+12, 16, 16);
            ctx.fillStyle = '#ffdbac';
            ctx.fillRect(sx+10, sy+4, 12, 12);
        }
    });
    
    // 绘制怪物
    W.monsters.forEach(m => {
        if (m.x >= W.camera.x && m.x < W.camera.x + tw && m.y >= W.camera.y && m.y < W.camera.y + th) {
            let sx = (m.x - W.camera.x) * W.TILE;
            let sy = (m.y - W.camera.y) * W.TILE;
            ctx.fillStyle = m.color;
            ctx.beginPath();
            ctx.arc(sx+16, sy+20, 10, 0, Math.PI*2);
            ctx.fill();
        }
    });
    
    // 绘制玩家（屏幕中央）
    let px = Math.floor(cw / 2 / W.TILE) * W.TILE + (cw / 2 % W.TILE) - W.TILE/2;
    let py = Math.floor(ch / 2 / W.TILE) * W.TILE + (ch / 2 % W.TILE) - W.TILE/2;
    
    ctx.fillStyle = '#00f';
    ctx.fillRect(px+8, py+12, 16, 16);
    ctx.fillStyle = '#fdb';
    ctx.fillRect(px+10, py+4, 12, 12);
    
    // 调试信息
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(5, 5, 200, 50);
    ctx.fillStyle = '#0f0';
    ctx.font = '14px monospace';
    ctx.fillText('Pos: ' + W.player.x + ',' + W.player.y, 10, 25);
    ctx.fillText('Cam: ' + W.camera.x + ',' + W.camera.y, 10, 45);
}

// 暴露
window.WorldSystem = {
    init: initWorld,
    handleAction: action,
    toggleMenu: () => { if (typeof showScene === 'function') showScene('party'); },
    fromWorldExploration: false,
    reset: () => {
        W.initialized = false;
        W.player.x = 12;
        W.player.y = 10;
        W.player.dir = 'down';
        genMap();
    }
};

console.log('[W] Module loaded');
