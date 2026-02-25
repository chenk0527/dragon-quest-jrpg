/**
 * Dragon Quest JRPG - 地图探索系统 V2
 * 更健壮的实现，带详细调试
 */

(function() {
    'use strict';

    console.log('[World] Script loaded');

    // 配置
    const TILE_SIZE = 32;
    const MAP_WIDTH = 25;
    const MAP_HEIGHT = 20;
    
    // 图块类型
    const TILES = {
        GRASS: 0,
        WALL: 1,
        TREE: 2,
        WATER: 3,
        CHEST: 4,
        NPC: 5,
        MONSTER: 6
    };

    // 游戏状态
    let canvas = null;
    let ctx = null;
    let player = { x: 12, y: 10, dir: 'down' };
    let camera = { x: 0, y: 0 };
    let isInitialized = false;
    let isRunning = false;
    let konamiCode = [];
    
    // 地图数据
    let mapData = [];
    let monsters = [];
    let npcs = [];
    let chests = [];
    
    // 生成地图
    function generateMap() {
        console.log('[World] Generating map...');
        mapData = [];
        monsters = [];
        npcs = [];
        chests = [];
        
        for (let y = 0; y < MAP_HEIGHT; y++) {
            mapData[y] = [];
            for (let x = 0; x < MAP_WIDTH; x++) {
                // 边界墙
                if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                    mapData[y][x] = TILES.WALL;
                } else {
                    mapData[y][x] = TILES.GRASS; // 先全部设为草地
                }
            }
        }
        
        // 在远离玩家的位置添加一些树
        for (let i = 0; i < 15; i++) {
            let tx, ty;
            let attempts = 0;
            do {
                tx = Math.floor(Math.random() * (MAP_WIDTH - 4)) + 2;
                ty = Math.floor(Math.random() * (MAP_HEIGHT - 4)) + 2;
                attempts++;
            } while ((Math.abs(tx - player.x) < 4 && Math.abs(ty - player.y) < 4) && attempts < 50);
            
            if (attempts < 50) {
                mapData[ty][tx] = TILES.TREE;
            }
        }
        
        // 添加小池塘（远离玩家）
        for (let y = 15; y < 18; y++) {
            for (let x = 18; x < 22; x++) {
                if (y < MAP_HEIGHT - 1 && x < MAP_WIDTH - 1) {
                    mapData[y][x] = TILES.WATER;
                }
            }
        }
        
        // 确保玩家起始位置是草地
        mapData[player.y][player.x] = TILES.GRASS;
        
        // 添加NPC
        npcs.push({ x: 5, y: 5, name: '村长', color: '#daa520', dialog: '欢迎来到新手村！' });
        npcs.push({ x: 18, y: 8, name: '商人', color: '#ff69b4', dialog: '需要买点什么吗？' });
        
        // 添加怪物
        for (let i = 0; i < 5; i++) {
            let mx, my;
            let attempts = 0;
            do {
                mx = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                my = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
                attempts++;
            } while ((mapData[my][mx] !== TILES.GRASS || (Math.abs(mx - player.x) < 3 && Math.abs(my - player.y) < 3)) && attempts < 100);
            
            if (attempts < 100) {
                monsters.push({
                    x: mx,
                    y: my,
                    type: Math.random() < 0.5 ? 'slime' : 'goblin',
                    color: Math.random() < 0.5 ? '#00ff00' : '#228b22',
                    moveTimer: 0
                });
                mapData[my][mx] = TILES.MONSTER;
            }
        }
        
        // 添加宝箱
        for (let i = 0; i < 3; i++) {
            let cx, cy;
            let attempts = 0;
            do {
                cx = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                cy = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
                attempts++;
            } while (mapData[cy][cx] !== TILES.GRASS && attempts < 100);
            
            if (attempts < 100) {
                chests.push({ x: cx, y: cy, opened: false });
                mapData[cy][cx] = TILES.CHEST;
            }
        }
        
        console.log('[World] Map generated:', MAP_WIDTH, 'x', MAP_HEIGHT);
    }

    // 初始化
    function init() {
        console.log('[World] Init called, isInitialized:', isInitialized);
        
        if (isInitialized) {
            console.log('[World] Already initialized');
            return true;
        }
        
        canvas = document.getElementById('worldCanvas');
        console.log('[World] Canvas element:', canvas);
        
        if (!canvas) {
            console.error('[World] Canvas not found!');
            return false;
        }

        ctx = canvas.getContext('2d');
        console.log('[World] Context:', ctx);
        
        // 生成地图
        generateMap();
        
        // 设置画布大小
        resizeCanvas();
        
        // 绑定事件
        bindEvents();
        
        isInitialized = true;
        isRunning = true;
        
        // 开始游戏循环
        console.log('[World] Starting game loop');
        requestAnimationFrame(gameLoop);
        
        console.log('[World] Initialized successfully');
        return true;
    }

    function resizeCanvas() {
        if (!canvas) return;
        
        const container = canvas.parentElement;
        console.log('[World] Container:', container);
        
        if (container) {
            const rect = container.getBoundingClientRect();
            console.log('[World] Container rect:', rect.width, 'x', rect.height);
            
            if (rect.width > 0 && rect.height > 0) {
                canvas.width = rect.width;
                canvas.height = rect.height;
                console.log('[World] Canvas resized to:', canvas.width, 'x', canvas.height);
            } else {
                // 如果容器还没渲染，使用窗口大小
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - 100; // 减去头部
                console.log('[World] Canvas resized to window:', canvas.width, 'x', canvas.height);
            }
        }
    }

    function bindEvents() {
        console.log('[World] Binding events...');
        
        // 键盘事件 - 使用 window 确保全局捕获
        window.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('keyup', onKeyUp, true);
        
        // 触摸事件
        if (canvas) {
            canvas.addEventListener('touchstart', onTouchStart, { passive: false });
            canvas.addEventListener('touchmove', onTouchMove, { passive: false });
            canvas.addEventListener('touchend', onTouchEnd, { passive: false });
            canvas.addEventListener('click', onClick);
        }
        
        // 虚拟按键事件
        bindVirtualButtons();
        
        // 窗口大小变化
        window.addEventListener('resize', resizeCanvas);
        
        console.log('[World] Events bound');
    }

    // 绑定虚拟按键
    function bindVirtualButtons() {
        console.log('[World] Binding virtual buttons...');
        
        // 等待 DOM 更新
        setTimeout(() => {
            // 方向键
            const dpadButtons = document.querySelectorAll('.dpad-btn');
            console.log('[World] Found D-PAD buttons:', dpadButtons.length);
            
            dpadButtons.forEach(btn => {
                console.log('[World] Binding button:', btn.dataset.key);
                
                // 触摸事件
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const key = btn.dataset.key;
                    console.log('[World] Virtual D-PAD touched:', key);
                    
                    switch(key) {
                        case 'up': movePlayer('ArrowUp'); break;
                        case 'down': movePlayer('ArrowDown'); break;
                        case 'left': movePlayer('ArrowLeft'); break;
                        case 'right': movePlayer('ArrowRight'); break;
                    }
                    btn.style.background = 'rgba(255, 255, 255, 0.6)';
                }, { passive: false });
                
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    console.log('[World] Virtual D-PAD released');
                    btn.style.background = '';
                }, { passive: false });
                
                // 鼠标事件（桌面测试）
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const key = btn.dataset.key;
                    console.log('[World] Virtual D-PAD clicked:', key);
                    
                    switch(key) {
                        case 'up': movePlayer('ArrowUp'); break;
                        case 'down': movePlayer('ArrowDown'); break;
                        case 'left': movePlayer('ArrowLeft'); break;
                        case 'right': movePlayer('ArrowRight'); break;
                    }
                    btn.style.background = 'rgba(255, 255, 255, 0.6)';
                });
                
                btn.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    btn.style.background = '';
                });
                
                btn.addEventListener('mouseleave', (e) => {
                    btn.style.background = '';
                });
            });
            
            // AB 键
            const actionButtons = document.querySelectorAll('.action-btn');
            console.log('[World] Found action buttons:', actionButtons.length);
            
            actionButtons.forEach(btn => {
                console.log('[World] Binding action button:', btn.dataset.key);
                
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const key = btn.dataset.key;
                    console.log('[World] Action button touched:', key);
                    
                    if (key === 'A') {
                        handleActionButton();
                    } else if (key === 'B') {
                        handleBButton();
                    }
                    btn.style.transform = 'scale(0.95)';
                }, { passive: false });
                
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    btn.style.transform = '';
                }, { passive: false });
                
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const key = btn.dataset.key;
                    console.log('[World] Action button clicked:', key);
                    
                    if (key === 'A') {
                        handleActionButton();
                    } else if (key === 'B') {
                        handleBButton();
                    }
                    btn.style.transform = 'scale(0.95)';
                });
                
                btn.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    btn.style.transform = '';
                });
            });
            
            console.log('[World] Virtual buttons bound successfully');
        }, 100);
    }

    // A 键功能（交互/确认）
    function handleActionButton() {
        console.log('[World] A button - Action!');
        
        // 检查玩家面前的物体
        let checkX = player.x;
        let checkY = player.y;
        
        switch(player.dir) {
            case 'up': checkY--; break;
            case 'down': checkY++; break;
            case 'left': checkX--; break;
            case 'right': checkX++; break;
        }
        
        // 检查NPC
        const npc = npcs.find(n => n.x === checkX && n.y === checkY);
        if (npc) {
            alert(`${npc.name}: ${npc.dialog}`);
            return;
        }
        
        // 检查是否可以触发彩蛋
        checkEasterEggs();
    }

    // B 键功能（菜单/取消）
    function handleBButton() {
        console.log('[World] B button - Menu!');
        if (typeof showScene === 'function') {
            showScene('party');
        }
    }

    // 检查彩蛋
    function checkEasterEggs() {
        // 检查 Konami 代码: 上上下下左右左右BA
        const konamiSequence = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'B', 'A'];
        
        // 记录按键序列
        konamiCode.push(player.dir);
        if (konamiCode.length > 10) {
            konamiCode.shift();
        }
        
        // 检查是否匹配
        if (konamiCode.length >= 10) {
            let match = true;
            for (let i = 0; i < 10; i++) {
                if (konamiCode[konamiCode.length - 10 + i] !== konamiSequence[i]) {
                    match = false;
                    break;
                }
            }
            
            if (match) {
                alert('🎮 Konami 代码激活！\n获得传说装备！');
                konamiCode = []; // 重置
                // 这里可以添加奖励
                return;
            }
        }
        
        // 特定位置彩蛋
        if (player.x === 3 && player.y === 3) {
            alert('🎉 彩蛋发现！隐藏宝箱！\n获得 100 金币！');
        }
    }

    // 键盘控制
    function onKeyDown(e) {
        console.log('[World] Key pressed:', e.key, 'Code:', e.code);
        
        const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
                          'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
        
        if (validKeys.includes(e.key)) {
            e.preventDefault();
            e.stopPropagation();
            movePlayer(e.key);
        }
    }

    function onKeyUp(e) {
        // 可以添加连续移动的支持
    }

    function movePlayer(key) {
        console.log('[World] Moving player:', key);
        
        let newX = player.x;
        let newY = player.y;
        let newDir = player.dir;

        switch(key) {
            case 'ArrowUp': case 'w': case 'W':
                newY--;
                newDir = 'up';
                break;
            case 'ArrowDown': case 's': case 'S':
                newY++;
                newDir = 'down';
                break;
            case 'ArrowLeft': case 'a': case 'A':
                newX--;
                newDir = 'left';
                break;
            case 'ArrowRight': case 'd': case 'D':
                newX++;
                newDir = 'right';
                break;
        }

        console.log('[World] New position:', newX, newY, 'Dir:', newDir);

        // 检查边界和障碍物
        if (newX >= 0 && newX < MAP_WIDTH && newY >= 0 && newY < MAP_HEIGHT) {
            const tile = mapData[newY][newX];
            console.log('[World] Tile at new position:', tile);

            if (tile === TILES.GRASS) {
                player.x = newX;
                player.y = newY;
                player.dir = newDir;
                // 记录方向用于 Konami 代码
                konamiCode.push(newDir);
                if (konamiCode.length > 10) konamiCode.shift();
                console.log('[World] Player moved to:', player.x, player.y, 'Konami:', konamiCode);
            } else if (tile === TILES.CHEST) {
                const chest = chests.find(c => c.x === newX && c.y === newY);
                if (chest && !chest.opened) {
                    chest.opened = true;
                    mapData[newY][newX] = TILES.GRASS;
                    alert('💎 获得：金币 x 50！');
                }
                player.x = newX;
                player.y = newY;
                player.dir = newDir;
            } else if (tile === TILES.MONSTER) {
                const monster = monsters.find(m => m.x === newX && m.y === newY);
                if (monster) {
                    alert('👹 遭遇 ' + (monster.type === 'slime' ? '史莱姆' : '哥布林') + '！');
                    monsters = monsters.filter(m => m !== monster);
                    mapData[newY][newX] = TILES.GRASS;
                }
                player.x = newX;
                player.y = newY;
                player.dir = newDir;
            } else if (tile === TILES.WALL || tile === TILES.TREE || tile === TILES.WATER) {
                player.dir = newDir;
                console.log('[World] Blocked by:', tile);
            }
        } else {
            console.log('[World] Out of bounds');
        }
    }

    // 触摸控制
    function onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        canvas.dataset.touchStartX = touch.clientX;
        canvas.dataset.touchStartY = touch.clientY;
        canvas.dataset.touchStartTime = Date.now();
    }

    function onTouchMove(e) {
        e.preventDefault();
    }

    function onTouchEnd(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const startX = parseFloat(canvas.dataset.touchStartX);
        const startY = parseFloat(canvas.dataset.touchStartY);
        
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        
        console.log('[World] Touch swipe:', dx, dy);

        if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
            if (Math.abs(dx) > Math.abs(dy)) {
                movePlayer(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
            } else {
                movePlayer(dy > 0 ? 'ArrowDown' : 'ArrowUp');
            }
        }
    }

    // 鼠标点击移动
    function onClick(e) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const dx = clickX - centerX;
        const dy = clickY - centerY;
        
        console.log('[World] Click at:', clickX, clickY, 'dx:', dx, 'dy:', dy);

        if (Math.abs(dx) > Math.abs(dy)) {
            movePlayer(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
        } else {
            movePlayer(dy > 0 ? 'ArrowDown' : 'ArrowUp');
        }
    }

    // 更新怪物
    function updateMonsters() {
        monsters.forEach(monster => {
            monster.moveTimer = (monster.moveTimer || 0) + 1;
            if (monster.moveTimer > 60) {
                monster.moveTimer = 0;
                
                const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
                const dir = dirs[Math.floor(Math.random() * dirs.length)];
                
                const newX = monster.x + dir.x;
                const newY = monster.y + dir.y;
                
                if (newX >= 1 && newX < MAP_WIDTH - 1 && newY >= 1 && newY < MAP_HEIGHT - 1) {
                    if (mapData[newY][newX] === TILES.GRASS) {
                        mapData[monster.y][monster.x] = TILES.GRASS;
                        monster.x = newX;
                        monster.y = newY;
                        mapData[newY][newX] = TILES.MONSTER;
                    }
                }
            }
        });
    }

    // 游戏循环
    function gameLoop() {
        if (!isRunning) return;
        
        updateMonsters();
        render();
        requestAnimationFrame(gameLoop);
    }

    // 渲染
    function render() {
        if (!ctx || !canvas) return;
        
        // 更新相机位置
        camera.x = player.x - Math.floor(canvas.width / TILE_SIZE / 2);
        camera.y = player.y - Math.floor(canvas.height / TILE_SIZE / 2);
        camera.x = Math.max(0, Math.min(camera.x, MAP_WIDTH - Math.floor(canvas.width / TILE_SIZE)));
        camera.y = Math.max(0, Math.min(camera.y, MAP_HEIGHT - Math.floor(canvas.height / TILE_SIZE)));

        // 清空画布
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 计算可视范围
        const tilesX = Math.ceil(canvas.width / TILE_SIZE) + 1;
        const tilesY = Math.ceil(canvas.height / TILE_SIZE) + 1;

        // 绘制地图
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                const mapX = camera.x + x;
                const mapY = camera.y + y;
                
                if (mapX >= 0 && mapX < MAP_WIDTH && mapY >= 0 && mapY < MAP_HEIGHT) {
                    const tile = mapData[mapY][mapX];
                    const screenX = x * TILE_SIZE;
                    const screenY = y * TILE_SIZE;
                    
                    switch(tile) {
                        case TILES.GRASS:
                            ctx.fillStyle = (mapX + mapY) % 2 === 0 ? '#4a7c4e' : '#3d6b40';
                            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                            break;
                        case TILES.WALL:
                            ctx.fillStyle = '#696969';
                            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                            ctx.strokeStyle = '#4a4a4a';
                            ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                            break;
                        case TILES.TREE:
                            ctx.fillStyle = '#2d5a30';
                            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                            ctx.fillStyle = '#228b22';
                            ctx.fillRect(screenX + 4, screenY + 4, 24, 24);
                            ctx.fillStyle = '#006400';
                            ctx.fillRect(screenX + 8, screenY + 2, 16, 8);
                            break;
                        case TILES.WATER:
                            ctx.fillStyle = '#4169e1';
                            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                            ctx.fillStyle = '#87ceeb';
                            ctx.fillRect(screenX + 4, screenY + 4, 8, 8);
                            break;
                        case TILES.CHEST:
                            ctx.fillStyle = '#4a7c4e';
                            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                            ctx.fillStyle = '#daa520';
                            ctx.fillRect(screenX + 6, screenY + 8, 20, 16);
                            ctx.fillStyle = '#ffd700';
                            ctx.fillRect(screenX + 8, screenY + 6, 16, 6);
                            break;
                        case TILES.MONSTER:
                            ctx.fillStyle = '#4a7c4e';
                            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                            break;
                    }
                }
            }
        }

        // 绘制NPC
        npcs.forEach(npc => {
            if (npc.x >= camera.x && npc.x < camera.x + tilesX &&
                npc.y >= camera.y && npc.y < camera.y + tilesY) {
                const screenX = (npc.x - camera.x) * TILE_SIZE;
                const screenY = (npc.y - camera.y) * TILE_SIZE;
                
                ctx.fillStyle = npc.color;
                ctx.fillRect(screenX + 8, screenY + 12, 16, 16);
                ctx.fillStyle = '#ffdbac';
                ctx.fillRect(screenX + 10, screenY + 4, 12, 12);
                ctx.fillStyle = '#fff';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(npc.name, screenX + 16, screenY);
            }
        });

        // 绘制怪物
        monsters.forEach(monster => {
            if (monster.x >= camera.x && monster.x < camera.x + tilesX &&
                monster.y >= camera.y && monster.y < camera.y + tilesY) {
                const screenX = (monster.x - camera.x) * TILE_SIZE;
                const screenY = (monster.y - camera.y) * TILE_SIZE;
                
                ctx.fillStyle = monster.color;
                ctx.beginPath();
                ctx.ellipse(screenX + 16, screenY + 20, 12, 10, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.fillRect(screenX + 12, screenY + 16, 4, 4);
                ctx.fillRect(screenX + 20, screenY + 16, 4, 4);
                ctx.fillStyle = '#000';
                ctx.fillRect(screenX + 13, screenY + 17, 2, 2);
                ctx.fillRect(screenX + 21, screenY + 17, 2, 2);
            }
        });

        // 绘制玩家（屏幕中央）
        const centerX = Math.floor(canvas.width / 2 / TILE_SIZE) * TILE_SIZE + (canvas.width / 2 % TILE_SIZE) - TILE_SIZE / 2;
        const centerY = Math.floor(canvas.height / 2 / TILE_SIZE) * TILE_SIZE + (canvas.height / 2 % TILE_SIZE) - TILE_SIZE / 2;
        
        ctx.fillStyle = '#4169e1';
        ctx.fillRect(centerX + 8, centerY + 12, 16, 16);
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(centerX + 10, centerY + 4, 12, 12);
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(centerX + 10, centerY + 2, 12, 4);
        ctx.fillStyle = '#000';
        switch(player.dir) {
            case 'down':
                ctx.fillRect(centerX + 12, centerY + 10, 2, 2);
                ctx.fillRect(centerX + 18, centerY + 10, 2, 2);
                break;
            case 'up':
                ctx.fillRect(centerX + 12, centerY + 6, 2, 2);
                ctx.fillRect(centerX + 18, centerY + 6, 2, 2);
                break;
            case 'left':
                ctx.fillRect(centerX + 12, centerY + 8, 2, 2);
                break;
            case 'right':
                ctx.fillRect(centerX + 20, centerY + 8, 2, 2);
                break;
        }
        
        // 绘制调试信息
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(10, 10, 200, 60);
        ctx.fillStyle = '#0f0';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Player: ${player.x}, ${player.y}`, 20, 30);
        ctx.fillText(`Camera: ${camera.x}, ${camera.y}`, 20, 45);
        ctx.fillText(`Dir: ${player.dir}`, 20, 60);
        
        // 绘制操作提示
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(10, canvas.height - 60, 200, 50);
        ctx.fillStyle = '#fff';
        ctx.fillText('WASD/方向键移动', 20, canvas.height - 40);
        ctx.fillText('点击/滑动也可移动', 20, canvas.height - 25);
    }

    // 暴露给全局
    window.WorldSystem = {
        init: init,
        handleAction: function() { console.log('[World] Action!'); },
        toggleMenu: function() { 
            console.log('[World] Toggle menu');
            if (typeof showScene === 'function') showScene('party'); 
        }
    };

    console.log('[World] Module loaded, WorldSystem:', window.WorldSystem);

})();
