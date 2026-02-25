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
    TILE: 32,
    W: 25,
    H: 20
};

// 图块类型
const T = { GRASS: 0, WALL: 1, TREE: 2, WATER: 3, CHEST: 4, MONSTER: 5 };

// 初始化
function initWorld() {
    console.log('[W] Init called');
    if (W.initialized) return true;
    
    W.canvas = document.getElementById('worldCanvas');
    if (!W.canvas) {
        console.error('[W] Canvas not found');
        return false;
    }
    
    W.ctx = W.canvas.getContext('2d');
    
    // 设置画布大小
    const container = W.canvas.parentElement;
    if (container) {
        W.canvas.width = container.clientWidth || window.innerWidth;
        W.canvas.height = container.clientHeight || (window.innerHeight - 100);
    }
    
    // 生成地图
    genMap();
    
    // 绑定事件
    bindKeys();
    bindTouch();
    bindButtons();
    
    W.initialized = true;
    loop();
    console.log('[W] Initialized');
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
    
    // 随机树
    for (let i = 0; i < 10; i++) {
        let x = Math.floor(Math.random() * (W.W - 4)) + 2;
        let y = Math.floor(Math.random() * (W.H - 4)) + 2;
        if (Math.abs(x - W.player.x) > 3 || Math.abs(y - W.player.y) > 3) {
            W.map[y][x] = T.TREE;
        }
    }
    
    // 池塘
    for (let y = 15; y < 18; y++) {
        for (let x = 18; x < 22; x++) {
            W.map[y][x] = T.WATER;
        }
    }
    
    // NPC
    W.npcs.push({ x: 5, y: 5, name: '村长', color: '#daa520' });
    W.npcs.push({ x: 20, y: 8, name: '商人', color: '#ff69b4' });
    
    // 怪物
    for (let i = 0; i < 4; i++) {
        let x = Math.floor(Math.random() * (W.W - 4)) + 2;
        let y = Math.floor(Math.random() * (W.H - 4)) + 2;
        if (W.map[y][x] === T.GRASS && Math.abs(x - W.player.x) + Math.abs(y - W.player.y) > 4) {
            W.monsters.push({ x, y, type: 'slime', color: '#0f0' });
            W.map[y][x] = T.MONSTER;
        }
    }
    
    // 宝箱
    for (let i = 0; i < 3; i++) {
        let x = Math.floor(Math.random() * (W.W - 4)) + 2;
        let y = Math.floor(Math.random() * (W.H - 4)) + 2;
        if (W.map[y][x] === T.GRASS) {
            W.map[y][x] = T.CHEST;
        }
    }
}

// 键盘事件
function bindKeys() {
    window.addEventListener('keydown', (e) => {
        console.log('[W] Key:', e.key);
        switch(e.key) {
            case 'ArrowUp': case 'w': case 'W': move(0, -1); break;
            case 'ArrowDown': case 's': case 'S': move(0, 1); break;
            case 'ArrowLeft': case 'a': case 'A': move(-1, 0); break;
            case 'ArrowRight': case 'd': case 'D': move(1, 0); break;
        }
    });
}

// 触摸事件
function bindTouch() {
    let sx, sy;
    W.canvas.addEventListener('touchstart', (e) => {
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
    });
    W.canvas.addEventListener('touchend', (e) => {
        let dx = e.changedTouches[0].clientX - sx;
        let dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
            if (Math.abs(dx) > Math.abs(dy)) {
                move(dx > 0 ? 1 : -1, 0);
            } else {
                move(0, dy > 0 ? 1 : -1);
            }
        }
    });
}

// 按钮事件
function bindButtons() {
    // 方向键
    const dirs = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
    document.querySelectorAll('.dpad-btn').forEach(btn => {
        btn.onclick = () => {
            const d = dirs[btn.dataset.key];
            if (d) move(d[0], d[1]);
        };
    });
    
    // AB键
    document.querySelector('.a-btn').onclick = () => action();
    document.querySelector('.b-btn').onclick = () => {
        if (typeof showScene === 'function') showScene('party');
    };
}

// 移动
function move(dx, dy) {
    let nx = W.player.x + dx;
    let ny = W.player.y + dy;
    
    // 方向
    if (dx > 0) W.player.dir = 'right';
    else if (dx < 0) W.player.dir = 'left';
    else if (dy > 0) W.player.dir = 'down';
    else W.player.dir = 'up';
    
    // 边界检查
    if (nx < 0 || nx >= W.W || ny < 0 || ny >= W.H) return;
    
    let tile = W.map[ny][nx];
    console.log('[W] Move to:', nx, ny, 'Tile:', tile);
    
    if (tile === T.GRASS) {
        W.player.x = nx;
        W.player.y = ny;
    } else if (tile === T.CHEST) {
        W.player.x = nx;
        W.player.y = ny;
        W.map[ny][nx] = T.GRASS;
        alert('💰 获得 50 金币！');
    } else if (tile === T.MONSTER) {
        let m = W.monsters.find(m => m.x === nx && m.y === ny);
        if (m) {
            if (typeof startBattle === 'function') {
                W.map[ny][nx] = T.GRASS;
                W.monsters = W.monsters.filter(x => x !== m);
                setTimeout(() => startBattle('forest'), 100);
            } else {
                alert('👹 遭遇 ' + m.type + '！');
                W.map[ny][nx] = T.GRASS;
                W.monsters = W.monsters.filter(x => x !== m);
            }
        }
        W.player.x = nx;
        W.player.y = ny;
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
    fromWorldExploration: true
};

console.log('[W] Module loaded');
