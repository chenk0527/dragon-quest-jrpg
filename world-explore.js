/**
 * Dragon Quest JRPG - 地图探索系统
 * 支持键盘和触摸控制
 */

(function() {
    'use strict';

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
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    
    // 地图数据
    let mapData = [];
    let monsters = [];
    let npcs = [];
    let chests = [];
    
    // 生成地图
    function generateMap() {
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
                } else if (x > 5 && x < 10 && y > 5 && y < 10) {
                    // 一片小树林
                    mapData[y][x] = Math.random() < 0.7 ? TILES.TREE : TILES.GRASS;
                } else if (x > 15 && x < 20 && y > 12 && y < 17) {
                    // 小池塘
                    mapData[y][x] = TILES.WATER;
                } else if (Math.random() < 0.08) {
                    mapData[y][x] = TILES.TREE;
                } else {
                    mapData[y][x] = TILES.GRASS;
                }
            }
        }
        
        // 确保玩家起始位置是草地
        mapData[player.y][player.x] = TILES.GRASS;
        mapData[player.y][player.x + 1] = TILES.GRASS;
        mapData[player.y + 1][player.x] = TILES.GRASS;
        mapData[player.y - 1][player.x] = TILES.GRASS;
        
        // 添加NPC
        npcs.push({ x: 5, y: 5, name: '村长', color: '#daa520', dialog: '欢迎来到新手村！' });
        npcs.push({ x: 18, y: 8, name: '商人', color: '#ff69b4', dialog: '需要买点什么吗？' });
        
        // 添加怪物
        for (let i = 0; i < 5; i++) {
            let mx, my;
            do {
                mx = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                my = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (mapData[my][mx] !== TILES.GRASS || (Math.abs(mx - player.x) < 3 && Math.abs(my - player.y) < 3));
            
            monsters.push({
                x: mx,
                y: my,
                type: Math.random() < 0.5 ? 'slime' : 'goblin',
                color: Math.random() < 0.5 ? '#00ff00' : '#228b22',
                moveTimer: 0
            });
            mapData[my][mx] = TILES.MONSTER;
        }
        
        // 添加宝箱
        for (let i = 0; i < 3; i++) {
            let cx, cy;
            do {
                cx = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                cy = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (mapData[cy][cx] !== TILES.GRASS);
            
            chests.push({ x: cx, y: cy, opened: false });
            mapData[cy][cx] = TILES.CHEST;
        }
    }

    // 初始化
    function init() {
        if (isInitialized) {
            console.log('[World] Already initialized');
            return true;
        }
        
        canvas = document.getElementById('worldCanvas');
        if (!canvas) {
            console.error('[World] Canvas not found!');
            return false;
        }

        ctx = canvas.getContext('2d');
        
        // 生成地图
        generateMap();
        
        // 设置画布大小
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // 键盘事件
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        
        // 触摸事件
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd, { passive: false });
        
        // 鼠标点击（用于测试）
        canvas.addEventListener('click', onClick);
        
        isInitialized = true;
        
        // 开始游戏循环
        requestAnimationFrame(gameLoop);
        
        console.log('[World] Initialized successfully');
        return true;
    }

    function resizeCanvas() {
        if (!canvas) return;
        const container = canvas.parentElement;
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            console.log('[World] Canvas size:', canvas.width, 'x', canvas.height);
        }
    }

    // 键盘控制
    function onKeyDown(e) {
        console.log('[World] Key pressed:', e.key);
        
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
            e.preventDefault();
            movePlayer(e.key);
        }
    }

    function onKeyUp(e) {
        // 可以添加连续移动的支持
    }

    function movePlayer(key) {
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
        
        // 检查边界和障碍物
        if (newX >= 0 && newX < MAP_WIDTH && newY >= 0 && newY < MAP_HEIGHT) {
            const tile = mapData[newY][newX];
            
            if (tile === TILES.GRASS) {
                player.x = newX;
                player.y = newY;
                player.dir = newDir;
                console.log('[World] Player moved to:', player.x, player.y);
            } else if (tile === TILES.CHEST) {
                // 开启宝箱
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
                // 进入战斗
                const monster = monsters.find(m => m.x === newX && m.y === newY);
                if (monster) {
                    alert('👹 遭遇 ' + (monster.type === 'slime' ? '史莱姆' : '哥布林') + '！');
                    // 移除怪物
                    monsters = monsters.filter(m => m !== monster);
                    mapData[newY][newX] = TILES.GRASS;
                }
                player.x = newX;
                player.y = newY;
                player.dir = newDir;
            } else if (tile === TILES.WALL || tile === TILES.TREE || tile === TILES.WATER) {
                // 撞墙，只改变方向
                player.dir = newDir;
                console.log('[World] Blocked!');
            }
        }
    }

    // 触摸控制
    function onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
        console.log('[World] Touch start:', touchStartX, touchStartY);
    }

    function onTouchMove(e) {
        e.preventDefault();
    }

    function onTouchEnd(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        const dt = Date.now() - touchStartTime;
        
        console.log('[World] Touch end. dx:', dx, 'dy:', dy, 'dt:', dt);
        
        // 判断滑动方向
        if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
            if (Math.abs(dx) > Math.abs(dy)) {
                // 水平滑动
                if (dx > 0) {
                    movePlayer('ArrowRight');
                } else {
                    movePlayer('ArrowLeft');
                }
            } else {
                // 垂直滑动
                if (dy > 0) {
                    movePlayer('ArrowDown');
                } else {
                    movePlayer('ArrowUp');
                }
            }
        }
    }

    // 鼠标点击移动（用于桌面测试）
    function onClick(e) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // 计算点击位置相对于玩家的方向
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const dx = clickX - centerX;
        const dy = clickY - centerY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) movePlayer('ArrowRight');
            else movePlayer('ArrowLeft');
        } else {
            if (dy > 0) movePlayer('ArrowDown');
            else movePlayer('ArrowUp');
        }
    }

    // 更新怪物
    function updateMonsters() {
        monsters.forEach(monster => {
            monster.moveTimer++;
            if (monster.moveTimer > 60) { // 每60帧移动一次
                monster.moveTimer = 0;
                
                // 简单的随机移动
                const dirs = [
                    { x: 0, y: -1 },
                    { x: 0, y: 1 },
                    { x: -1, y: 0 },
                    { x: 1, y: 0 }
                ];
                const dir = dirs[Math.floor(Math.random() * dirs.length)];
                
                const newX = monster.x + dir.x;
                const newY = monster.y + dir.y;
                
                if (newX >= 1 && newX < MAP_WIDTH - 1 && newY >= 1 && newY < MAP_HEIGHT - 1) {
                    if (mapData[newY][newX] === TILES.GRASS) {
                        // 移动怪物
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
        updateMonsters();
        render();
        requestAnimationFrame(gameLoop);
    }

    // 渲染
    function render() {
        if (!ctx) return;
        
        // 更新相机位置（跟随玩家）
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
                
                // 身体
                ctx.fillStyle = npc.color;
                ctx.fillRect(screenX + 8, screenY + 12, 16, 16);
                // 头
                ctx.fillStyle = '#ffdbac';
                ctx.fillRect(screenX + 10, screenY + 4, 12, 12);
                // 名字
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
                
                // 史莱姆身体
                ctx.fillStyle = monster.color;
                ctx.beginPath();
                ctx.ellipse(screenX + 16, screenY + 20, 12, 10, 0, 0, Math.PI * 2);
                ctx.fill();
                // 眼睛
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
        
        // 身体
        ctx.fillStyle = '#4169e1';
        ctx.fillRect(centerX + 8, centerY + 12, 16, 16);
        // 头
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(centerX + 10, centerY + 4, 12, 12);
        // 头发
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(centerX + 10, centerY + 2, 12, 4);
        // 眼睛（根据方向）
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
        
        // 绘制提示文字
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(10, canvas.height - 50, 200, 40);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('WASD/方向键移动', 20, canvas.height - 30);
        ctx.fillText('滑动屏幕也可移动', 20, canvas.height - 15);
    }

    // 暴露给全局
    window.WorldSystem = {
        init: init,
        handleAction: function() { 
            console.log('[World] Action!'); 
        },
        toggleMenu: function() { 
            if (typeof showScene === 'function') showScene('party'); 
        }
    };

})();
