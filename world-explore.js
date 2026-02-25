/**
 * Dragon Quest JRPG - 简化的地图探索系统
 * 最简实现，确保稳定运行
 */

(function() {
    'use strict';

    // 配置
    const TILE_SIZE = 32;
    const MAP_WIDTH = 20;
    const MAP_HEIGHT = 15;

    // 游戏状态
    let canvas = null;
    let ctx = null;
    let player = { x: 10, y: 7, dir: 'down' };
    let camera = { x: 0, y: 0 };
    let keys = {};
    let isInitialized = false;

    // 地图数据 (0=草地, 1=墙, 2=树)
    const mapData = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        mapData[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                mapData[y][x] = 1; // 边界墙
            } else if (Math.random() < 0.1) {
                mapData[y][x] = 2; // 随机树
            } else {
                mapData[y][x] = 0; // 草地
            }
        }
    }

    // 初始化
    function init() {
        if (isInitialized) return;
        
        canvas = document.getElementById('worldCanvas');
        if (!canvas) {
            console.error('Canvas not found!');
            return false;
        }

        ctx = canvas.getContext('2d');
        
        // 设置画布大小
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // 键盘事件
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        
        isInitialized = true;
        
        // 开始游戏循环
        requestAnimationFrame(gameLoop);
        
        console.log('[World] Initialized successfully');
        return true;
    }

    function resizeCanvas() {
        const container = canvas.parentElement;
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
    }

    function onKeyDown(e) {
        keys[e.key] = true;
        
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        
        // 移动
        let moved = false;
        switch(e.key) {
            case 'ArrowUp': case 'w': case 'W':
                if (player.y > 0 && !isBlocked(player.x, player.y - 1)) {
                    player.y--;
                    player.dir = 'up';
                    moved = true;
                }
                break;
            case 'ArrowDown': case 's': case 'S':
                if (player.y < MAP_HEIGHT - 1 && !isBlocked(player.x, player.y + 1)) {
                    player.y++;
                    player.dir = 'down';
                    moved = true;
                }
                break;
            case 'ArrowLeft': case 'a': case 'A':
                if (player.x > 0 && !isBlocked(player.x - 1, player.y)) {
                    player.x--;
                    player.dir = 'left';
                    moved = true;
                }
                break;
            case 'ArrowRight': case 'd': case 'D':
                if (player.x < MAP_WIDTH - 1 && !isBlocked(player.x + 1, player.y)) {
                    player.x++;
                    player.dir = 'right';
                    moved = true;
                }
                break;
        }
    }

    function onKeyUp(e) {
        keys[e.key] = false;
    }

    function isBlocked(x, y) {
        if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return true;
        return mapData[y][x] === 1 || mapData[y][x] === 2;
    }

    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }

    function update() {
        // 更新相机位置（跟随玩家）
        camera.x = player.x - Math.floor(canvas.width / TILE_SIZE / 2);
        camera.y = player.y - Math.floor(canvas.height / TILE_SIZE / 2);
        
        // 限制相机范围
        camera.x = Math.max(0, Math.min(camera.x, MAP_WIDTH - Math.floor(canvas.width / TILE_SIZE)));
        camera.y = Math.max(0, Math.min(camera.y, MAP_HEIGHT - Math.floor(canvas.height / TILE_SIZE)));
    }

    function render() {
        if (!ctx) return;
        
        // 清空背景
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
                    
                    if (tile === 0) {
                        // 草地
                        ctx.fillStyle = (mapX + mapY) % 2 === 0 ? '#4a7c4e' : '#3d6b40';
                        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                    } else if (tile === 1) {
                        // 墙
                        ctx.fillStyle = '#696969';
                        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                        ctx.strokeStyle = '#4a4a4a';
                        ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                    } else if (tile === 2) {
                        // 树
                        ctx.fillStyle = '#4a7c4e';
                        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                        ctx.fillStyle = '#228b22';
                        ctx.fillRect(screenX + 4, screenY + 4, 24, 24);
                    }
                }
            }
        }
        
        // 绘制玩家（屏幕中央）
        const centerX = Math.floor(canvas.width / 2 / TILE_SIZE) * TILE_SIZE;
        const centerY = Math.floor(canvas.height / 2 / TILE_SIZE) * TILE_SIZE;
        
        // 身体
        ctx.fillStyle = '#4169e1';
        ctx.fillRect(centerX + 8, centerY + 12, 16, 12);
        
        // 头
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(centerX + 10, centerY + 4, 12, 10);
        
        // 头发
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(centerX + 10, centerY + 2, 12, 4);
        
        // 眼睛（根据方向）
        ctx.fillStyle = '#000';
        if (player.dir === 'down') {
            ctx.fillRect(centerX + 12, centerY + 10, 2, 2);
            ctx.fillRect(centerX + 18, centerY + 10, 2, 2);
        } else if (player.dir === 'up') {
            ctx.fillRect(centerX + 12, centerY + 6, 2, 2);
            ctx.fillRect(centerX + 18, centerY + 6, 2, 2);
        } else if (player.dir === 'left') {
            ctx.fillRect(centerX + 12, centerY + 8, 2, 2);
        } else if (player.dir === 'right') {
            ctx.fillRect(centerX + 18, centerY + 8, 2, 2);
        }
    }

    // 暴露给全局
    window.WorldSystem = {
        init: init,
        handleAction: function() { console.log('Action!'); },
        toggleMenu: function() { 
            if (typeof showScene === 'function') showScene('party'); 
        }
    };

})();
