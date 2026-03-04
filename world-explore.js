/**
 * Dragon Quest JRPG - 世界探索系统 (v2 重构版)
 * 像素美术 + 流畅移动 + 游戏内对话
 */

// 全局变量
let W = {
    canvas: null,
    ctx: null,
    player: { x: 12, y: 10, dir: 'down', frame: 0, moving: false },
    camera: { x: 0, y: 0 },
    map: [],
    monsters: [],
    npcs: [],
    chests: [],
    decorations: [], // 地面装饰
    initialized: false,
    loopStarted: false,
    TILE: 32,
    W: 25,
    H: 20,
    time: 0, // 动画计时器
    dialogActive: false
};

// 图块类型
const T = { GRASS: 0, WALL: 1, TREE: 2, WATER: 3, CHEST: 4, MONSTER: 5, PATH: 6 };

// 调色板
const PAL = {
    grass1: '#4a7c4e', grass2: '#3d6b40', grass3: '#5a8c5a',
    tree_trunk: '#5c3a1e', tree_top: '#2d7a32', tree_top2: '#1e6624', tree_shadow: '#1a4a1a',
    water1: '#3b6cc4', water2: '#4a7cd8', water_shine: '#7eb8f0',
    wall1: '#6b6b6b', wall2: '#555', wall3: '#7a7a7a', wall_line: '#444',
    path1: '#b8a070', path2: '#a89060',
    chest_body: '#8B6914', chest_top: '#DAA520', chest_lock: '#C0C0C0',
    sky: '#1a3a1a'
};

// ======== 像素绘制函数 ========

function drawGrass(ctx, sx, sy, mx, my) {
    const s = W.TILE;
    // 基础草地（棋盘格交替色）
    ctx.fillStyle = (mx + my) % 2 ? PAL.grass1 : PAL.grass2;
    ctx.fillRect(sx, sy, s, s);
    
    // 随机草叶装饰（基于坐标的伪随机）
    const seed = (mx * 7 + my * 13) % 17;
    if (seed < 4) {
        ctx.fillStyle = PAL.grass3;
        ctx.fillRect(sx + (seed * 5) % 24 + 4, sy + 20, 2, 4);
        ctx.fillRect(sx + (seed * 7) % 20 + 6, sy + 18, 2, 6);
    }
    if (seed > 12) {
        // 小花
        const fx = sx + (seed * 3) % 20 + 6;
        const fy = sy + (seed * 5) % 16 + 8;
        ctx.fillStyle = seed > 14 ? '#ff6b6b' : '#ffdb4d';
        ctx.fillRect(fx, fy, 3, 3);
        ctx.fillStyle = '#3a5a3a';
        ctx.fillRect(fx + 1, fy + 3, 1, 3);
    }
}

function drawTree(ctx, sx, sy) {
    const s = W.TILE;
    // 草地底
    ctx.fillStyle = PAL.grass1;
    ctx.fillRect(sx, sy, s, s);
    // 树干
    ctx.fillStyle = PAL.tree_trunk;
    ctx.fillRect(sx + 13, sy + 20, 6, 12);
    // 树冠（3层）
    ctx.fillStyle = PAL.tree_top2;
    ctx.fillRect(sx + 4, sy + 2, 24, 8);
    ctx.fillStyle = PAL.tree_top;
    ctx.fillRect(sx + 6, sy + 6, 20, 10);
    ctx.fillRect(sx + 2, sy + 10, 28, 8);
    // 树冠高光
    ctx.fillStyle = '#3a9a42';
    ctx.fillRect(sx + 8, sy + 4, 4, 3);
    ctx.fillRect(sx + 16, sy + 8, 3, 2);
    // 阴影
    ctx.fillStyle = PAL.tree_shadow;
    ctx.fillRect(sx + 4, sy + 18, 6, 4);
}

function drawWater(ctx, sx, sy, mx, my, time) {
    const s = W.TILE;
    // 基础水面
    ctx.fillStyle = PAL.water1;
    ctx.fillRect(sx, sy, s, s);
    // 波纹动画
    const wave = Math.sin(time * 0.03 + mx * 0.5 + my * 0.3);
    ctx.fillStyle = PAL.water2;
    const wy = sy + 8 + Math.round(wave * 3);
    ctx.fillRect(sx, wy, s, 4);
    ctx.fillRect(sx + 4, wy + 8, s - 8, 3);
    // 水面反光
    ctx.fillStyle = PAL.water_shine;
    const shineX = sx + 6 + Math.round(Math.sin(time * 0.02 + mx) * 4);
    ctx.fillRect(shineX, sy + 4, 6, 2);
    ctx.fillRect(shineX + 12, sy + 16, 4, 2);
}

function drawWall(ctx, sx, sy, mx, my) {
    const s = W.TILE;
    // 砖块底色
    ctx.fillStyle = PAL.wall1;
    ctx.fillRect(sx, sy, s, s);
    // 砖缝
    ctx.fillStyle = PAL.wall_line;
    ctx.fillRect(sx, sy + 7, s, 1);
    ctx.fillRect(sx, sy + 15, s, 1);
    ctx.fillRect(sx, sy + 23, s, 1);
    // 错开的竖缝
    const offset = (my % 2) * 8;
    ctx.fillRect(sx + offset + 8, sy, 1, 8);
    ctx.fillRect(sx + offset + 20, sy + 8, 1, 8);
    ctx.fillRect(sx + offset + 8, sy + 16, 1, 8);
    // 高光
    ctx.fillStyle = PAL.wall3;
    ctx.fillRect(sx + 2, sy + 2, 4, 3);
    ctx.fillRect(sx + 14, sy + 10, 4, 3);
}

function drawPath(ctx, sx, sy, mx, my) {
    const s = W.TILE;
    ctx.fillStyle = (mx + my) % 2 ? PAL.path1 : PAL.path2;
    ctx.fillRect(sx, sy, s, s);
    // 小石子
    const seed = (mx * 11 + my * 7) % 13;
    if (seed < 3) {
        ctx.fillStyle = '#9a8a6a';
        ctx.fillRect(sx + seed * 6 + 4, sy + 12, 3, 2);
    }
}

function drawChest(ctx, sx, sy, opened) {
    const s = W.TILE;
    // 草地底
    ctx.fillStyle = PAL.grass1;
    ctx.fillRect(sx, sy, s, s);
    if (opened) return;
    // 箱体
    ctx.fillStyle = PAL.chest_body;
    ctx.fillRect(sx + 6, sy + 14, 20, 14);
    // 箱盖
    ctx.fillStyle = PAL.chest_top;
    ctx.fillRect(sx + 4, sy + 8, 24, 8);
    ctx.fillRect(sx + 6, sy + 6, 20, 4);
    // 锁
    ctx.fillStyle = PAL.chest_lock;
    ctx.fillRect(sx + 14, sy + 16, 4, 4);
    // 高光
    ctx.fillStyle = '#f0d060';
    ctx.fillRect(sx + 8, sy + 8, 3, 2);
}

function drawMonster(ctx, sx, sy, monster, time) {
    const s = W.TILE;
    // 草地底
    ctx.fillStyle = PAL.grass1;
    ctx.fillRect(sx, sy, s, s);
    // 史莱姆身体（弹跳动画）
    const bounce = Math.abs(Math.sin(time * 0.05 + (monster?.x || 0))) * 3;
    const by = sy + 10 - bounce;
    // 身体
    ctx.fillStyle = '#44dd44';
    ctx.fillRect(sx + 8, by + 8, 16, 12);
    ctx.fillRect(sx + 6, by + 12, 20, 8);
    ctx.fillRect(sx + 10, by + 4, 12, 6);
    // 高光
    ctx.fillStyle = '#88ff88';
    ctx.fillRect(sx + 10, by + 6, 4, 3);
    // 眼睛
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx + 11, by + 10, 4, 4);
    ctx.fillRect(sx + 19, by + 10, 4, 4);
    ctx.fillStyle = '#222';
    ctx.fillRect(sx + 12, by + 11, 2, 2);
    ctx.fillRect(sx + 20, by + 11, 2, 2);
    // 嘴
    ctx.fillStyle = '#228822';
    ctx.fillRect(sx + 14, by + 16, 4, 2);
}

function drawNPC(ctx, sx, sy, npc) {
    const s = W.TILE;
    // 草地底
    ctx.fillStyle = PAL.grass1;
    ctx.fillRect(sx, sy, s, s);
    // 身体
    ctx.fillStyle = npc.color || '#4488cc';
    ctx.fillRect(sx + 10, sy + 16, 12, 10);
    // 头
    ctx.fillStyle = '#ffdbac';
    ctx.fillRect(sx + 11, sy + 6, 10, 10);
    // 头发
    ctx.fillStyle = npc.hairColor || '#553322';
    ctx.fillRect(sx + 10, sy + 4, 12, 5);
    ctx.fillRect(sx + 10, sy + 6, 2, 4);
    ctx.fillRect(sx + 20, sy + 6, 2, 4);
    // 眼睛
    ctx.fillStyle = '#222';
    ctx.fillRect(sx + 13, sy + 10, 2, 2);
    ctx.fillRect(sx + 17, sy + 10, 2, 2);
    // 脚
    ctx.fillStyle = '#553322';
    ctx.fillRect(sx + 10, sy + 26, 4, 3);
    ctx.fillRect(sx + 18, sy + 26, 4, 3);
    // 名字标签
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(sx, sy - 2, s, 10);
    ctx.fillStyle = '#FFD700';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, sx + s/2, sy + 6);
    ctx.textAlign = 'left';
}

function drawPlayer(ctx, sx, sy, dir, frame, time) {
    // 身体颜色
    const bodyColor = '#3366cc';
    const hairColor = '#cc8833';
    const skinColor = '#ffdbac';
    const bootColor = '#553322';
    
    // 呼吸动画
    const breathe = Math.sin(time * 0.04) * 1;
    const by = sy + breathe;
    
    // 根据方向绘制
    switch(dir) {
        case 'down':
            // 头发
            ctx.fillStyle = hairColor;
            ctx.fillRect(sx + 10, by + 2, 12, 6);
            // 头
            ctx.fillStyle = skinColor;
            ctx.fillRect(sx + 11, by + 5, 10, 10);
            // 眼睛
            ctx.fillStyle = '#222';
            ctx.fillRect(sx + 13, by + 9, 2, 2);
            ctx.fillRect(sx + 17, by + 9, 2, 2);
            // 嘴
            ctx.fillStyle = '#cc7755';
            ctx.fillRect(sx + 15, by + 13, 2, 1);
            // 身体
            ctx.fillStyle = bodyColor;
            ctx.fillRect(sx + 10, by + 15, 12, 10);
            // 腰带
            ctx.fillStyle = '#aa7722';
            ctx.fillRect(sx + 10, by + 19, 12, 2);
            // 手臂
            ctx.fillStyle = bodyColor;
            ctx.fillRect(sx + 7, by + 16, 4, 8);
            ctx.fillRect(sx + 21, by + 16, 4, 8);
            // 脚
            ctx.fillStyle = bootColor;
            ctx.fillRect(sx + 10, by + 25, 5, 4);
            ctx.fillRect(sx + 17, by + 25, 5, 4);
            break;
        case 'up':
            // 头发（背面）
            ctx.fillStyle = hairColor;
            ctx.fillRect(sx + 10, by + 2, 12, 10);
            // 身体
            ctx.fillStyle = bodyColor;
            ctx.fillRect(sx + 10, by + 15, 12, 10);
            ctx.fillStyle = '#aa7722';
            ctx.fillRect(sx + 10, by + 19, 12, 2);
            ctx.fillStyle = bodyColor;
            ctx.fillRect(sx + 7, by + 16, 4, 8);
            ctx.fillRect(sx + 21, by + 16, 4, 8);
            ctx.fillStyle = bootColor;
            ctx.fillRect(sx + 10, by + 25, 5, 4);
            ctx.fillRect(sx + 17, by + 25, 5, 4);
            break;
        case 'left':
            // 头发
            ctx.fillStyle = hairColor;
            ctx.fillRect(sx + 10, by + 2, 10, 6);
            // 头
            ctx.fillStyle = skinColor;
            ctx.fillRect(sx + 11, by + 5, 9, 10);
            // 眼睛
            ctx.fillStyle = '#222';
            ctx.fillRect(sx + 12, by + 9, 2, 2);
            // 身体
            ctx.fillStyle = bodyColor;
            ctx.fillRect(sx + 11, by + 15, 10, 10);
            ctx.fillStyle = '#aa7722';
            ctx.fillRect(sx + 11, by + 19, 10, 2);
            ctx.fillStyle = bodyColor;
            ctx.fillRect(sx + 8, by + 16, 4, 8);
            ctx.fillStyle = bootColor;
            ctx.fillRect(sx + 11, by + 25, 5, 4);
            ctx.fillRect(sx + 17, by + 25, 4, 4);
            break;
        case 'right':
            ctx.fillStyle = hairColor;
            ctx.fillRect(sx + 12, by + 2, 10, 6);
            ctx.fillStyle = skinColor;
            ctx.fillRect(sx + 12, by + 5, 9, 10);
            ctx.fillStyle = '#222';
            ctx.fillRect(sx + 18, by + 9, 2, 2);
            ctx.fillStyle = bodyColor;
            ctx.fillRect(sx + 11, by + 15, 10, 10);
            ctx.fillStyle = '#aa7722';
            ctx.fillRect(sx + 11, by + 19, 10, 2);
            ctx.fillStyle = bodyColor;
            ctx.fillRect(sx + 20, by + 16, 4, 8);
            ctx.fillStyle = bootColor;
            ctx.fillRect(sx + 10, by + 25, 4, 4);
            ctx.fillRect(sx + 16, by + 25, 5, 4);
            break;
    }
    
    // 剑（下方/右方可见）
    if (dir === 'down' || dir === 'right') {
        ctx.fillStyle = '#aaa';
        ctx.fillRect(sx + 24, by + 12, 2, 10);
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(sx + 22, by + 22, 6, 2);
    }
}

// ======== 初始化 ========

function initWorld() {
    if (W.initialized) {
        W.initialized = false;
    }
    
    W.canvas = document.getElementById('worldCanvas');
    if (!W.canvas) return false;
    
    W.ctx = W.canvas.getContext('2d');
    if (!W.ctx) return false;
    
    // 设置画布大小
    const container = W.canvas.parentElement;
    if (container) {
        W.canvas.width = container.clientWidth || window.innerWidth;
        W.canvas.height = container.clientHeight || (window.innerHeight - 100);
    }
    
    // 重置状态
    W.player.x = 12;
    W.player.y = 10;
    W.player.dir = 'down';
    W.player.frame = 0;
    W.time = 0;
    W.dialogActive = false;
    
    // 生成地图
    genMap();
    
    // 确保玩家周围安全
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            let nx = W.player.x + dx;
            let ny = W.player.y + dy;
            if (nx >= 0 && nx < W.W && ny >= 0 && ny < W.H) {
                W.map[ny][nx] = T.GRASS;
            }
        }
    }
    
    // 绑定事件
    bindKeys();
    bindTouch();
    bindButtons();
    
    W.initialized = true;
    
    if (!W.loopStarted) {
        W.loopStarted = true;
        loop();
    }
    
    // 入场提示
    setTimeout(() => {
        showWorldDialog('📍 新手村', '欢迎来到新手村！使用方向键移动，靠近NPC按A键对话。');
    }, 300);
    
    return true;
}

// ======== 地图生成 ========

function genMap() {
    W.map = [];
    W.monsters = [];
    W.npcs = [];
    W.chests = [];
    W.decorations = [];
    
    for (let y = 0; y < W.H; y++) {
        W.map[y] = [];
        for (let x = 0; x < W.W; x++) {
            if (x === 0 || x === W.W-1 || y === 0 || y === W.H-1) {
                W.map[y][x] = T.WALL;
            } else {
                W.map[y][x] = T.GRASS;
            }
        }
    }
    
    // 村庄路径
    for (let x = 3; x < W.W - 3; x++) {
        W.map[10][x] = T.PATH;
    }
    for (let y = 3; y < W.H - 3; y++) {
        W.map[y][12] = T.PATH;
    }
    
    // 树木（不挡路径和玩家）
    const treePositions = [
        [3,3],[4,4],[5,2],[20,3],[21,4],[22,5],
        [3,16],[4,17],[5,15],[20,16],[21,15],[22,17],
        [8,5],[18,6],[7,14],[17,15]
    ];
    treePositions.forEach(([x,y]) => {
        if (W.map[y] && W.map[y][x] === T.GRASS) {
            let dist = Math.abs(x - 12) + Math.abs(y - 10);
            if (dist > 3) W.map[y][x] = T.TREE;
        }
    });
    
    // 池塘
    for (let y = 14; y < 17; y++) {
        for (let x = 17; x < 21; x++) {
            if (W.map[y] && W.map[y][x] === T.GRASS) {
                W.map[y][x] = T.WATER;
            }
        }
    }
    
    // NPC
    W.npcs.push({ x: 10, y: 8, name: '村长', color: '#8B0000', hairColor: '#aaa', 
        dialog: '欢迎，年轻的勇者！村外的森林里有怪物出没，请你帮忙清除它们吧！' });
    W.npcs.push({ x: 14, y: 12, name: '商人', color: '#4a148c', hairColor: '#553322',
        dialog: '想买点东西吗？可惜我的商店还没建好...不过你可以去森林里打怪找宝箱！' });
    W.npcs.push({ x: 8, y: 10, name: '少女', color: '#e91e63', hairColor: '#ffcc00',
        dialog: '听说东边的森林里藏着很多宝箱呢！不过要小心怪物哦~' });
    
    W.npcs.forEach(npc => {
        if (W.map[npc.y] && W.map[npc.y][npc.x] !== undefined) {
            W.map[npc.y][npc.x] = T.GRASS;
        }
    });
    
    // 怪物
    const monsterSpots = [[4,7],[6,13],[18,4],[20,8],[16,17],[3,12]];
    monsterSpots.forEach(([x,y]) => {
        if (W.map[y] && W.map[y][x] === T.GRASS) {
            let dist = Math.abs(x - 12) + Math.abs(y - 10);
            if (dist > 3) {
                W.monsters.push({ x, y, type: 'slime', color: '#44dd44', name: '史莱姆' });
                W.map[y][x] = T.MONSTER;
            }
        }
    });
    
    // 宝箱
    const chestSpots = [[6,4],[19,7],[15,16]];
    chestSpots.forEach(([x,y]) => {
        if (W.map[y] && W.map[y][x] === T.GRASS) {
            W.chests.push({ x, y, opened: false, gold: 30 + Math.floor(Math.random() * 50) });
            W.map[y][x] = T.CHEST;
        }
    });
}

// ======== 输入绑定 ========

function bindKeys() {
    window.addEventListener('keydown', (e) => {
        if (W.dialogActive) return;
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
            e.preventDefault();
        }
        switch(e.key) {
            case 'ArrowUp': case 'w': case 'W': move(0, -1); break;
            case 'ArrowDown': case 's': case 'S': move(0, 1); break;
            case 'ArrowLeft': case 'a': case 'A': move(-1, 0); break;
            case 'ArrowRight': case 'd': case 'D': move(1, 0); break;
            case ' ': case 'Enter': action(); break;
        }
    });
}

function bindTouch() {
    let sx, sy;
    W.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
    }, { passive: false });
    
    W.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (W.dialogActive) return;
        const dx = e.changedTouches[0].clientX - sx;
        const dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
            if (Math.abs(dx) > Math.abs(dy)) {
                move(dx > 0 ? 1 : -1, 0);
            } else {
                move(0, dy > 0 ? 1 : -1);
            }
        }
    }, { passive: false });
}

function bindButtons() {
    const dirs = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
    
    document.querySelectorAll('.dpad-btn').forEach(btn => {
        const key = btn.dataset.key;
        const d = dirs[key];
        if (d) {
            btn.onclick = (e) => {
                e.preventDefault();
                if (!W.dialogActive) move(d[0], d[1]);
            };
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!W.dialogActive) move(d[0], d[1]);
            }, { passive: false });
        }
    });
    
    const aBtn = document.querySelector('.a-btn');
    const bBtn = document.querySelector('.b-btn');
    
    if (aBtn) {
        aBtn.onclick = (e) => { e.preventDefault(); action(); };
        aBtn.addEventListener('touchstart', (e) => { e.preventDefault(); action(); }, { passive: false });
    }
    if (bBtn) {
        bBtn.onclick = (e) => { e.preventDefault(); if (typeof showScene === 'function') showScene('party'); };
        bBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (typeof showScene === 'function') showScene('party'); }, { passive: false });
    }
}

// ======== 移动 ========

function move(dx, dy) {
    if (W.dialogActive) return;
    
    let nx = W.player.x + dx;
    let ny = W.player.y + dy;
    
    // 更新方向
    if (dx > 0) W.player.dir = 'right';
    else if (dx < 0) W.player.dir = 'left';
    else if (dy > 0) W.player.dir = 'down';
    else W.player.dir = 'up';
    
    W.player.frame++;
    
    // 边界
    if (nx < 0 || nx >= W.W || ny < 0 || ny >= W.H) return;
    
    let tile = W.map[ny][nx];
    
    if (tile === T.GRASS || tile === T.PATH) {
        W.player.x = nx;
        W.player.y = ny;
    } else if (tile === T.CHEST) {
        W.player.x = nx;
        W.player.y = ny;
        W.map[ny][nx] = T.GRASS;
        let chest = W.chests.find(c => c.x === nx && c.y === ny);
        if (chest) {
            chest.opened = true;
            let gold = chest.gold;
            if (typeof gameState !== 'undefined') gameState.gold += gold;
            showWorldDialog('💰 发现宝箱！', '获得了 ' + gold + ' 金币！');
        }
    } else if (tile === T.MONSTER) {
        let m = W.monsters.find(m => m.x === nx && m.y === ny);
        if (m) {
            W.map[ny][nx] = T.GRASS;
            W.monsters = W.monsters.filter(x => x !== m);
            W.player.x = nx;
            W.player.y = ny;
            
            if (window.WorldSystem) window.WorldSystem.fromWorldExploration = true;
            
            setTimeout(() => {
                if (typeof window.startBattle === 'function') {
                    window.startBattle('forest');
                } else if (typeof startBattle === 'function') {
                    startBattle('forest');
                } else {
                    showWorldDialog('👹 遭遇 ' + m.name + '！', '（战斗系统加载中...）');
                }
            }, 50);
        }
    }
    // WALL, TREE, WATER: 不移动
}

// ======== 动作键 ========

function action() {
    if (W.dialogActive) {
        closeWorldDialog();
        return;
    }
    
    let ax = W.player.x, ay = W.player.y;
    switch(W.player.dir) {
        case 'up': ay--; break;
        case 'down': ay++; break;
        case 'left': ax--; break;
        case 'right': ax++; break;
    }
    
    let npc = W.npcs.find(n => n.x === ax && n.y === ay);
    if (npc) {
        showWorldDialog('💬 ' + npc.name, npc.dialog);
    }
}

// ======== 游戏内对话框 ========

function showWorldDialog(title, text) {
    W.dialogActive = true;
    // 移除旧对话框
    const old = document.getElementById('worldDialog');
    if (old) old.remove();
    
    const html = `
        <div id="worldDialog" style="
            position:absolute; bottom:80px; left:10px; right:10px;
            background:linear-gradient(135deg, #1a2a4a 0%, #2a3a5a 100%);
            border:3px solid #FFD700; border-radius:8px;
            padding:15px; z-index:100;
            font-family:'Press Start 2P',monospace;
            animation:dialogSlideUp 0.2s ease-out;
        ">
            <div style="color:#FFD700; font-size:11px; margin-bottom:8px;">${title}</div>
            <div style="color:#fff; font-size:10px; line-height:1.6;">${text}</div>
            <div style="color:#888; font-size:8px; text-align:center; margin-top:10px;">点击A键或屏幕继续 ▼</div>
        </div>
    `;
    
    const container = W.canvas.parentElement;
    if (container) {
        container.style.position = 'relative';
        container.insertAdjacentHTML('beforeend', html);
        document.getElementById('worldDialog').addEventListener('click', closeWorldDialog);
    }
}

function closeWorldDialog() {
    W.dialogActive = false;
    const d = document.getElementById('worldDialog');
    if (d) d.remove();
}

// ======== 游戏循环 ========

function loop() {
    W.time++;
    updateCamera();
    draw();
    requestAnimationFrame(loop);
}

function updateCamera() {
    const tilesX = Math.floor(W.canvas.width / W.TILE);
    const tilesY = Math.floor(W.canvas.height / W.TILE);
    W.camera.x = W.player.x - Math.floor(tilesX / 2);
    W.camera.y = W.player.y - Math.floor(tilesY / 2);
    W.camera.x = Math.max(0, Math.min(W.camera.x, W.W - tilesX));
    W.camera.y = Math.max(0, Math.min(W.camera.y, W.H - tilesY));
}

// ======== 绘制 ========

function draw() {
    let ctx = W.ctx;
    if (!ctx) return;
    let cw = W.canvas.width;
    let ch = W.canvas.height;
    
    ctx.fillStyle = PAL.sky;
    ctx.fillRect(0, 0, cw, ch);
    
    let tw = Math.ceil(cw / W.TILE) + 1;
    let th = Math.ceil(ch / W.TILE) + 1;
    
    // 绘制地图图块
    for (let y = 0; y < th; y++) {
        for (let x = 0; x < tw; x++) {
            let mx = W.camera.x + x;
            let my = W.camera.y + y;
            if (mx < 0 || mx >= W.W || my < 0 || my >= W.H) continue;
            
            let tile = W.map[my][mx];
            let sx = x * W.TILE;
            let sy = y * W.TILE;
            
            switch(tile) {
                case T.GRASS: drawGrass(ctx, sx, sy, mx, my); break;
                case T.WALL: drawWall(ctx, sx, sy, mx, my); break;
                case T.TREE: drawTree(ctx, sx, sy); break;
                case T.WATER: drawWater(ctx, sx, sy, mx, my, W.time); break;
                case T.PATH: drawPath(ctx, sx, sy, mx, my); break;
                case T.CHEST:
                    let chest = W.chests.find(c => c.x === mx && c.y === my);
                    drawChest(ctx, sx, sy, chest?.opened);
                    break;
                case T.MONSTER:
                    let mon = W.monsters.find(m => m.x === mx && m.y === my);
                    drawMonster(ctx, sx, sy, mon, W.time);
                    break;
                default:
                    drawGrass(ctx, sx, sy, mx, my);
            }
        }
    }
    
    // 绘制NPC
    W.npcs.forEach(n => {
        let sx = (n.x - W.camera.x) * W.TILE;
        let sy = (n.y - W.camera.y) * W.TILE;
        if (sx >= -W.TILE && sx < cw + W.TILE && sy >= -W.TILE && sy < ch + W.TILE) {
            drawNPC(ctx, sx, sy, n);
        }
    });
    
    // 绘制玩家（相对相机位置）
    let px = (W.player.x - W.camera.x) * W.TILE;
    let py = (W.player.y - W.camera.y) * W.TILE;
    drawPlayer(ctx, px, py, W.player.dir, W.player.frame, W.time);
}

// ======== 导出 ========

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
