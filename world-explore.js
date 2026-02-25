/**
 * Dragon Quest JRPG - 地图探索系统
 * Top-down 2D地图行走、明雷遇敌、NPC互动、解谜
 */

// ==================== 地图探索配置 ====================
const WORLD_CONFIG = {
    TILE_SIZE: 32,           // 地图图块大小
    VIEW_WIDTH: 15,          // 视口宽度（图块数）
    VIEW_HEIGHT: 11,         // 视口高度（图块数）
    ENCOUNTER_DISTANCE: 24,  // 遇敌检测距离（像素）
    NPC_TALK_DISTANCE: 40,   // NPC对话距离（像素）
    MONSTER_RESPAWN_TIME: 30000, // 怪物重生时间（毫秒）
    ANIMATION_FRAME_TIME: 150    // 动画帧间隔
};

// ==================== 图块类型 ====================
const TILES = {
    // 地形
    GRASS: { id: 0, solid: false, color: '#4a7c4e', name: '草地' },
    GRASS_TALL: { id: 1, solid: false, color: '#3d6b40', name: '高草' },
    DIRT: { id: 2, solid: false, color: '#8b7355', name: '泥土' },
    STONE: { id: 3, solid: false, color: '#808080', name: '石板' },
    WATER: { id: 4, solid: true, color: '#4169e1', name: '水' },
    
    // 障碍物
    WALL: { id: 10, solid: true, color: '#696969', name: '墙' },
    WALL_SECRET: { id: 11, solid: false, color: '#696969', name: '隐藏通道', hidden: true },
    TREE: { id: 12, solid: true, color: '#228b22', name: '树' },
    ROCK: { id: 13, solid: true, color: '#708090', name: '岩石' },
    BOX: { id: 14, solid: true, color: '#8b4513', name: '箱子', pushable: true },
    BOX_TARGET: { id: 15, solid: false, color: '#daa520', name: '目标点' },
    
    // 交互物
    DOOR: { id: 20, solid: true, color: '#8b4513', name: '门', locked: true },
    DOOR_OPEN: { id: 21, solid: false, color: '#654321', name: '开着的门' },
    SWITCH: { id: 22, solid: false, color: '#ff4444', name: '开关', interactive: true },
    SWITCH_ON: { id: 23, solid: false, color: '#44ff44', name: '已激活开关', interactive: true },
    CHEST: { id: 24, solid: true, color: '#daa520', name: '宝箱', interactive: true, opened: false },
    CHEST_OPEN: { id: 25, solid: false, color: '#8b7355', name: '空宝箱' },
    SIGN: { id: 26, solid: true, color: '#deb887', name: '告示牌', interactive: true },
    SAVE_POINT: { id: 27, solid: false, color: '#ff69b4', name: '存档点', interactive: true },
    
    // 传送
    STAIRS_UP: { id: 30, solid: false, color: '#d3d3d3', name: '楼梯上', teleport: true },
    STAIRS_DOWN: { id: 31, solid: false, color: '#a9a9a9', name: '楼梯下', teleport: true },
    EXIT: { id: 32, solid: false, color: '#ffd700', name: '出口', teleport: true },
    
    // 特殊
    EGG_SPOT: { id: 99, solid: false, color: '#ff1493', name: '???', hidden: true, easterEgg: true }
};

// ==================== 地图数据 ====================
const WORLD_MAPS = {
    // 新手村
    village: {
        name: '新手村',
        width: 20,
        height: 15,
        music: 'village',
        background: '#87ceeb',
        tiles: [],
        monsters: [],
        npcs: [
            { x: 10, y: 8, name: '村长', sprite: 'elder', dialog: 'village_chief' },
            { x: 5, y: 5, name: '商人', sprite: 'merchant', dialog: 'merchant', shop: true },
            { x: 15, y: 10, name: '村民', sprite: 'villager', dialog: 'villager1' }
        ],
        exits: [
            { x: 19, y: 7, target: 'forest', tx: 1, ty: 7 }
        ],
        playerStart: { x: 2, y: 7 }
    },
    
    // 迷雾森林
    forest: {
        name: '迷雾森林',
        width: 30,
        height: 20,
        music: 'field',
        background: '#2f4f2f',
        tiles: [],
        monsters: [
            { type: 'slime_green', count: 5, respawn: true },
            { type: 'slime_blue', count: 3, respawn: true },
            { type: 'wolf', count: 2, respawn: true }
        ],
        npcs: [
            { x: 5, y: 5, name: '迷路的商人', sprite: 'merchant', dialog: 'lost_merchant' }
        ],
        exits: [
            { x: 0, y: 7, target: 'village', tx: 18, ty: 7 },
            { x: 29, y: 10, target: 'cave', tx: 1, ty: 10 }
        ],
        boss: { x: 25, y: 15, type: 'forest_boss', name: '远古树精' },
        puzzles: [
            { type: 'push_box', boxes: [{x: 10, y: 10}], targets: [{x: 12, y: 10}], reward: {gold: 100} }
        ],
        secrets: [
            { x: 15, y: 5, type: 'wall', reveal: 'chest' }
        ]
    },
    
    // 阴暗洞穴
    cave: {
        name: '阴暗洞穴',
        width: 25,
        height: 18,
        music: 'dungeon',
        background: '#1a1a2a',
        tiles: [],
        monsters: [
            { type: 'bat', count: 6, respawn: true },
            { type: 'skeleton', count: 4, respawn: true },
            { type: 'ghost', count: 3, respawn: true }
        ],
        npcs: [
            { x: 3, y: 3, name: '被困的法师', sprite: 'mage', dialog: 'trapped_mage' }
        ],
        exits: [
            { x: 0, y: 10, target: 'forest', tx: 28, ty: 10 },
            { x: 24, y: 5, target: 'mine', tx: 1, ty: 5 }
        ],
        boss: { x: 20, y: 15, type: 'cave_boss', name: '洞穴巨魔' },
        puzzles: [
            { type: 'switch_door', switches: [{x: 5, y: 5}], doors: [{x: 10, y: 10}] }
        ],
        secrets: [
            { x: 12, y: 8, type: 'wall', reveal: 'egg', eggId: 'cave_secret' }
        ]
    },
    
    // 废弃矿坑
    mine: {
        name: '废弃矿坑',
        width: 28,
        height: 22,
        music: 'dungeon',
        background: '#3d2817',
        tiles: [],
        monsters: [
            { type: 'goblin', count: 5, respawn: true },
            { type: 'bat', count: 4, respawn: true }
        ],
        npcs: [
            { x: 2, y: 2, name: '矿工', sprite: 'miner', dialog: 'miner' }
        ],
        exits: [
            { x: 0, y: 5, target: 'cave', tx: 23, ty: 5 },
            { x: 27, y: 15, target: 'desert', tx: 1, ty: 15 }
        ],
        boss: { x: 25, y: 20, type: 'mine_boss', name: '哥布林王' },
        puzzles: [
            { type: 'key_door', keyLocation: {x: 5, y: 5}, doorLocation: {x: 15, y: 15} }
        ]
    },
    
    // 灼热沙漠
    desert: {
        name: '灼热沙漠',
        width: 32,
        height: 24,
        music: 'field',
        background: '#c2b280',
        tiles: [],
        monsters: [
            { type: 'scorpion', count: 6, respawn: true },
            { type: 'sand_worm', count: 3, respawn: true },
            { type: 'mummy', count: 4, respawn: true }
        ],
        npcs: [
            { x: 5, y: 5, name: '沙漠商人', sprite: 'merchant', dialog: 'desert_merchant', shop: true }
        ],
        exits: [
            { x: 0, y: 15, target: 'mine', tx: 26, ty: 15 },
            { x: 31, y: 20, target: 'volcano', tx: 1, ty: 20 }
        ],
        boss: { x: 28, y: 22, type: 'desert_boss', name: '法老王' },
        secrets: [
            { x: 20, y: 10, type: 'sand', reveal: 'chest_rare' }
        ]
    },
    
    // 熔岩地带
    volcano: {
        name: '熔岩地带',
        width: 26,
        height: 20,
        music: 'dungeon',
        background: '#4a1818',
        tiles: [],
        monsters: [
            { type: 'fire_elemental', count: 5, respawn: true },
            { type: 'lava_golem', count: 3, respawn: true },
            { type: 'hell_hound', count: 4, respawn: true }
        ],
        npcs: [],
        exits: [
            { x: 0, y: 20, target: 'desert', tx: 30, ty: 20 },
            { x: 25, y: 10, target: 'demonCastle', tx: 1, ty: 10 }
        ],
        boss: { x: 23, y: 18, type: 'volcano_boss', name: '火焰领主' },
        puzzles: [
            { type: 'push_box', boxes: [{x: 5, y: 5}, {x: 7, y: 5}], targets: [{x: 10, y: 5}, {x: 12, y: 5}] }
        ]
    },
    
    // 魔王城
    demonCastle: {
        name: '魔王城',
        width: 20,
        height: 20,
        music: 'boss',
        background: '#1a0a0a',
        tiles: [],
        monsters: [
            { type: 'demon', count: 8, respawn: false },
            { type: 'dark_knight', count: 5, respawn: false }
        ],
        npcs: [],
        exits: [
            { x: 0, y: 10, target: 'volcano', tx: 24, ty: 10 }
        ],
        boss: { x: 18, y: 18, type: 'final_boss', name: '混沌魔王' },
        puzzles: [
            { type: 'switch_door', switches: [{x: 5, y: 5}, {x: 10, y: 5}], doors: [{x: 15, y: 10}] }
        ],
        secrets: [
            { x: 3, y: 3, type: 'wall', reveal: 'secret_shop', shopType: 'legendary' },
            { x: 17, y: 17, type: 'floor', reveal: 'egg', eggId: 'final_secret' }
        ]
    }
};

// ==================== 地图生成器 ====================
const MapGenerator = {
    generate(mapId) {
        const map = WORLD_MAPS[mapId];
        if (!map) return null;
        
        // 初始化空地图
        map.tiles = Array(map.height).fill(null).map(() => Array(map.width).fill(0));
        
        // 根据地图类型生成地形
        switch(mapId) {
            case 'village':
                this.generateVillage(map);
                break;
            case 'forest':
                this.generateForest(map);
                break;
            case 'cave':
            case 'mine':
                this.generateDungeon(map);
                break;
            case 'desert':
                this.generateDesert(map);
                break;
            case 'volcano':
                this.generateVolcano(map);
                break;
            case 'demonCastle':
                this.generateCastle(map);
                break;
        }
        
        return map;
    },
    
    generateVillage(map) {
        // 村庄 - 草地+石板路
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                // 主路
                if (y === 7 || y === 8) {
                    map.tiles[y][x] = TILES.STONE.id;
                } else if (x > 3 && x < 17 && y > 3 && y < 12) {
                    // 房屋区域
                    if ((x === 5 || x === 10 || x === 15) && (y === 5 || y === 9)) {
                        map.tiles[y][x] = TILES.WALL.id; // 房子
                        map.tiles[y+1][x] = TILES.DOOR.id; // 门
                    } else {
                        map.tiles[y][x] = TILES.STONE.id;
                    }
                } else {
                    map.tiles[y][x] = TILES.GRASS.id;
                }
            }
        }
    },
    
    generateForest(map) {
        // 森林 - 草地+树木
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                // 边界树木
                if (x === 0 || x === map.width - 1 || y === 0 || y === map.height - 1) {
                    map.tiles[y][x] = TILES.TREE.id;
                } else if (Math.random() < 0.15) {
                    // 随机树木
                    map.tiles[y][x] = TILES.TREE.id;
                } else if (Math.random() < 0.3) {
                    // 高草
                    map.tiles[y][x] = TILES.GRASS_TALL.id;
                } else {
                    map.tiles[y][x] = TILES.GRASS.id;
                }
            }
        }
        
        // 清理出道路
        for (let x = 0; x < map.width; x++) {
            map.tiles[7][x] = TILES.GRASS.id;
            map.tiles[10][x] = TILES.GRASS.id;
        }
        
        // BOSS区域
        for (let x = 23; x < 28; x++) {
            for (let y = 13; y < 18; y++) {
                map.tiles[y][x] = TILES.GRASS.id;
            }
        }
    },
    
    generateDungeon(map) {
        // 地牢 - 石墙+石板
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                // 边界墙
                if (x === 0 || x === map.width - 1 || y === 0 || y === map.height - 1) {
                    map.tiles[y][x] = TILES.WALL.id;
                } else if (Math.random() < 0.1) {
                    // 随机石柱
                    map.tiles[y][x] = TILES.WALL.id;
                } else if (Math.random() < 0.05) {
                    // 宝箱
                    map.tiles[y][x] = TILES.CHEST.id;
                } else {
                    map.tiles[y][x] = TILES.STONE.id;
                }
            }
        }
        
        // 清理出通道
        for (let x = 0; x < map.width; x++) {
            map.tiles[10][x] = TILES.STONE.id;
            map.tiles[5][x] = TILES.STONE.id;
        }
        for (let y = 0; y < map.height; y++) {
            map.tiles[y][10] = TILES.STONE.id;
        }
    },
    
    generateDesert(map) {
        // 沙漠 - 沙地+岩石
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                if (Math.random() < 0.1) {
                    map.tiles[y][x] = TILES.ROCK.id;
                } else {
                    map.tiles[y][x] = TILES.DIRT.id;
                }
            }
        }
    },
    
    generateVolcano(map) {
        // 火山 - 岩石+岩浆
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                if (Math.random() < 0.15) {
                    map.tiles[y][x] = TILES.WATER.id; // 岩浆
                } else if (Math.random() < 0.1) {
                    map.tiles[y][x] = TILES.ROCK.id;
                } else {
                    map.tiles[y][x] = TILES.STONE.id;
                }
            }
        }
    },
    
    generateCastle(map) {
        // 魔王城 - 石墙+复杂结构
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                // 外墙
                if (x === 0 || x === map.width - 1 || y === 0 || y === map.height - 1) {
                    map.tiles[y][x] = TILES.WALL.id;
                } else if (x % 5 === 0 || y % 5 === 0) {
                    // 内部墙壁
                    map.tiles[y][x] = TILES.WALL.id;
                } else {
                    map.tiles[y][x] = TILES.STONE.id;
                }
            }
        }
        
        // 打开一些通道
        for (let i = 0; i < map.height; i += 5) {
            for (let j = 0; j < map.width; j += 5) {
                if (i > 0 && i < map.height - 1 && j > 0 && j < map.width - 1) {
                    map.tiles[i][j] = TILES.STONE.id;
                }
            }
        }
    }
};

// ==================== 世界探索状态 ====================
let WorldState = {
    currentMap: 'village',
    player: {
        x: 2,
        y: 7,
        direction: 'down', // up, down, left, right
        isMoving: false,
        frame: 0,
        lastMoveTime: 0
    },
    camera: { x: 0, y: 0 },
    monsters: [], // { x, y, type, hp, maxHp, direction, moveTimer, isAggro }
    npcs: [], // 当前地图的NPC实例
    puzzles: [], // 当前地图的谜题状态
    defeatedMonsters: [], // { x, y, respawnTime }
    openedChests: [], // { mapId, x, y }
    switches: [], // { mapId, x, y, activated }
    pushBoxes: [], // { mapId, x, y, originalX, originalY }
    foundEggs: [], // 找到的彩蛋ID列表
    keys: [], // 拥有的钥匙
    messages: [] // 屏幕消息队列
};

// ==================== 键盘输入处理 ====================
const InputHandler = {
    keys: {},
    
    init() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // 防止方向键滚动页面
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            
            // 确认键（对话、交互）
            if (e.key === 'Enter' || e.key === 'z' || e.key === ' ') {
                WorldSystem.handleAction();
            }
            
            // 菜单键
            if (e.key === 'Escape' || e.key === 'x') {
                WorldSystem.toggleMenu();
            }
            
            // Konami代码检测
            this.checkKonamiCode(e.key);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // 移动端虚拟摇杆
        this.initTouchControls();
    },
    
    initTouchControls() {
        const joystick = document.getElementById('virtualJoystick');
        if (!joystick) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        
        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        });
        
        joystick.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            
            // 重置所有方向
            this.keys['ArrowUp'] = false;
            this.keys['ArrowDown'] = false;
            this.keys['ArrowLeft'] = false;
            this.keys['ArrowRight'] = false;
            
            // 设置方向
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 20) this.keys['ArrowRight'] = true;
                else if (dx < -20) this.keys['ArrowLeft'] = true;
            } else {
                if (dy > 20) this.keys['ArrowDown'] = true;
                else if (dy < -20) this.keys['ArrowUp'] = true;
            }
        });
        
        joystick.addEventListener('touchend', () => {
            this.keys['ArrowUp'] = false;
            this.keys['ArrowDown'] = false;
            this.keys['ArrowLeft'] = false;
            this.keys['ArrowRight'] = false;
        });
    },
    
    // Konami代码检测
    konamiSequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    konamiIndex: 0,
    
    checkKonamiCode(key) {
        if (key === this.konamiSequence[this.konamiIndex]) {
            this.konamiIndex++;
            if (this.konamiIndex >= this.konamiSequence.length) {
                WorldSystem.activateEasterEgg('konami');
                this.konamiIndex = 0;
            }
        } else {
            this.konamiIndex = 0;
        }
    },
    
    getDirection() {
        let dx = 0;
        let dy = 0;
        
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) dy = -1;
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) dy = 1;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) dx = -1;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) dx = 1;
        
        return { dx, dy };
    }
};

// ==================== 世界探索系统 ====================
const WorldSystem = {
    canvas: null,
    ctx: null,
    animationId: null,
    lastTime: 0,
    
    init() {
        this.canvas = document.getElementById('worldCanvas');
        if (!this.canvas) {
            console.error('World canvas not found');
            return;
        }
        
        // 停止之前的游戏循环
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // 等待DOM渲染完成后设置画布大小
        setTimeout(() => {
            this.resizeCanvas();
        }, 50);
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 禁用图像平滑（保持像素风格）
        this.ctx.imageSmoothingEnabled = false;
        
        // 初始化输入
        InputHandler.init();
        
        // 加载地图
        this.loadMap(WorldState.currentMap);
        
        // 开始游戏循环
        this.lastTime = performance.now();
        this.gameLoop();
        
        console.log('[WorldSystem] Initialized');
    },
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (container) {
            const rect = container.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                this.canvas.width = rect.width;
                this.canvas.height = rect.height;
                console.log(`[WorldSystem] Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
            }
        }
    },
    
    loadMap(mapId) {
        const map = MapGenerator.generate(mapId);
        if (!map) return;
        
        WorldState.currentMap = mapId;
        
        // 设置玩家起始位置
        if (map.playerStart) {
            WorldState.player.x = map.playerStart.x;
            WorldState.player.y = map.playerStart.y;
        }
        
        // 生成怪物
        this.spawnMonsters(map);
        
        // 初始化NPC
        this.initNPCs(map);
        
        // 初始化谜题
        this.initPuzzles(map);
        
        // 播放BGM
        if (AudioSystem && map.music) {
            AudioSystem.playBGM(map.music);
        }
        
        console.log(`[WorldSystem] Loaded map: ${map.name}`);
    },
    
    spawnMonsters(map) {
        WorldState.monsters = [];
        
        if (!map.monsters) return;
        
        map.monsters.forEach(monsterGroup => {
            for (let i = 0; i < monsterGroup.count; i++) {
                let x, y;
                let attempts = 0;
                
                // 随机找空地
                do {
                    x = Math.floor(Math.random() * map.width);
                    y = Math.floor(Math.random() * map.height);
                    attempts++;
                } while ((this.isSolid(x, y) || this.isNearPlayer(x, y)) && attempts < 100);
                
                if (attempts < 100) {
                    WorldState.monsters.push({
                        x, y,
                        type: monsterGroup.type,
                        hp: 100,
                        maxHp: 100,
                        direction: 'down',
                        moveTimer: Math.random() * 2000,
                        isAggro: false,
                        respawn: monsterGroup.respawn
                    });
                }
            }
        });
    },
    
    initNPCs(map) {
        WorldState.npcs = [];
        
        if (!map.npcs) return;
        
        map.npcs.forEach(npc => {
            WorldState.npcs.push({
                ...npc,
                direction: 'down',
                talked: false
            });
        });
    },
    
    initPuzzles(map) {
        WorldState.puzzles = [];
        
        if (!map.puzzles) return;
        
        map.puzzles.forEach((puzzle, index) => {
            WorldState.puzzles.push({
                ...puzzle,
                id: index,
                solved: false
            });
        });
    },
    
    isSolid(x, y) {
        const map = WORLD_MAPS[WorldState.currentMap];
        if (!map || x < 0 || x >= map.width || y < 0 || y >= map.height) {
            return true;
        }
        
        const tileId = map.tiles[y][x];
        const tile = Object.values(TILES).find(t => t.id === tileId);
        return tile ? tile.solid : false;
    },
    
    isNearPlayer(x, y) {
        const dx = x - WorldState.player.x;
        const dy = y - WorldState.player.y;
        return Math.sqrt(dx * dx + dy * dy) < 5;
    },
    
    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    },
    
    update(deltaTime) {
        // 更新玩家
        this.updatePlayer(deltaTime);
        
        // 更新怪物
        this.updateMonsters(deltaTime);
        
        // 更新相机
        this.updateCamera();
        
        // 检查重生
        this.checkRespawn();
    },
    
    updatePlayer(deltaTime) {
        const player = WorldState.player;
        
        if (player.isMoving) {
            // 移动动画中
            return;
        }
        
        const { dx, dy } = InputHandler.getDirection();
        
        if (dx !== 0 || dy !== 0) {
            // 更新方向
            if (dx > 0) player.direction = 'right';
            else if (dx < 0) player.direction = 'left';
            else if (dy > 0) player.direction = 'down';
            else if (dy < 0) player.direction = 'up';
            
            // 检查目标位置
            const targetX = player.x + dx;
            const targetY = player.y + dy;
            
            // 检查碰撞
            if (!this.isSolid(targetX, targetY)) {
                // 检查怪物碰撞
                const monster = WorldState.monsters.find(m => m.x === targetX && m.y === targetY);
                if (monster) {
                    // 触发战斗
                    this.startBattle(monster);
                    return;
                }
                
                // 检查NPC
                const npc = WorldState.npcs.find(n => n.x === targetX && n.y === targetY);
                if (npc) {
                    // 面向NPC但不移动
                    return;
                }
                
                // 检查推箱子
                const box = WorldState.pushBoxes.find(b => b.x === targetX && b.y === targetY);
                if (box) {
                    // 尝试推动箱子
                    const boxTargetX = targetX + dx;
                    const boxTargetY = targetY + dy;
                    
                    if (!this.isSolid(boxTargetX, boxTargetY)) {
                        box.x = boxTargetX;
                        box.y = boxTargetY;
                        this.checkPuzzleSolved();
                        
                        // 播放音效
                        if (AudioSystem) AudioSystem.playSFX('push');
                    }
                    return;
                }
                
                // 移动
                player.x = targetX;
                player.y = targetY;
                player.isMoving = true;
                player.frame = (player.frame + 1) % 4;
                
                // 播放移动音效
                if (AudioSystem) AudioSystem.playSFX('step');
                
                // 移动完成后
                setTimeout(() => {
                    player.isMoving = false;
                    
                    // 检查特殊图块
                    this.checkTileEvent(targetX, targetY);
                }, 100);
            } else {
                // 撞到墙壁，播放音效
                if (AudioSystem) AudioSystem.playSFX('bump');
            }
        }
    },
    
    updateMonsters(deltaTime) {
        WorldState.monsters.forEach(monster => {
            monster.moveTimer += deltaTime;
            
            // 简单的AI：每隔一段时间移动
            if (monster.moveTimer > 2000) {
                monster.moveTimer = 0;
                
                // 检测玩家距离
                const dx = WorldState.player.x - monster.x;
                const dy = WorldState.player.y - monster.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 如果在范围内，追踪玩家
                if (distance < 6) {
                    monster.isAggro = true;
                    
                    // 向玩家移动
                    let moveX = 0, moveY = 0;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        moveX = dx > 0 ? 1 : -1;
                    } else {
                        moveY = dy > 0 ? 1 : -1;
                    }
                    
                    const targetX = monster.x + moveX;
                    const targetY = monster.y + moveY;
                    
                    // 检查是否可以移动
                    if (!this.isSolid(targetX, targetY)) {
                        const otherMonster = WorldState.monsters.find(m => m !== monster && m.x === targetX && m.y === targetY);
                        if (!otherMonster) {
                            monster.x = targetX;
                            monster.y = targetY;
                            
                            // 更新方向
                            if (moveX > 0) monster.direction = 'right';
                            else if (moveX < 0) monster.direction = 'left';
                            else if (moveY > 0) monster.direction = 'down';
                            else if (moveY < 0) monster.direction = 'up';
                        }
                    }
                    
                    // 检查是否与玩家碰撞
                    if (monster.x === WorldState.player.x && monster.y === WorldState.player.y) {
                        this.startBattle(monster);
                    }
                } else {
                    // 随机巡逻
                    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
                    const [moveX, moveY] = directions[Math.floor(Math.random() * directions.length)];
                    
                    const targetX = monster.x + moveX;
                    const targetY = monster.y + moveY;
                    
                    if (!this.isSolid(targetX, targetY)) {
                        const otherMonster = WorldState.monsters.find(m => m !== monster && m.x === targetX && m.y === targetY);
                        if (!otherMonster) {
                            monster.x = targetX;
                            monster.y = targetY;
                        }
                    }
                }
            }
        });
    },
    
    updateCamera() {
        const player = WorldState.player;
        const map = WORLD_MAPS[WorldState.currentMap];
        
        // 相机跟随玩家，保持居中
        let cameraX = player.x - Math.floor(WORLD_CONFIG.VIEW_WIDTH / 2);
        let cameraY = player.y - Math.floor(WORLD_CONFIG.VIEW_HEIGHT / 2);
        
        // 限制相机范围
        cameraX = Math.max(0, Math.min(cameraX, map.width - WORLD_CONFIG.VIEW_WIDTH));
        cameraY = Math.max(0, Math.min(cameraY, map.height - WORLD_CONFIG.VIEW_HEIGHT));
        
        WorldState.camera.x = cameraX;
        WorldState.camera.y = cameraY;
    },
    
    checkRespawn() {
        const now = Date.now();
        
        WorldState.defeatedMonsters = WorldState.defeatedMonsters.filter(dm => {
            if (now > dm.respawnTime) {
                // 重生怪物
                WorldState.monsters.push({
                    x: dm.x,
                    y: dm.y,
                    type: dm.type,
                    hp: 100,
                    maxHp: 100,
                    direction: 'down',
                    moveTimer: 0,
                    isAggro: false,
                    respawn: true
                });
                return false;
            }
            return true;
        });
    },
    
    checkTileEvent(x, y) {
        const map = WORLD_MAPS[WorldState.currentMap];
        const tileId = map.tiles[y][x];
        const tile = Object.values(TILES).find(t => t.id === tileId);
        
        if (!tile) return;
        
        // 检查出口
        if (tile.teleport) {
            const exit = map.exits.find(e => e.x === x && e.y === y);
            if (exit) {
                this.transitionToMap(exit.target, exit.tx, exit.ty);
            }
        }
        
        // 检查高草遇敌
        if (tileId === TILES.GRASS_TALL.id) {
            if (Math.random() < 0.05) {
                this.startRandomBattle();
            }
        }
    },
    
    handleAction() {
        const player = WorldState.player;
        
        // 检查面前的图块
        let checkX = player.x;
        let checkY = player.y;
        
        switch(player.direction) {
            case 'up': checkY--; break;
            case 'down': checkY++; break;
            case 'left': checkX--; break;
            case 'right': checkX++; break;
        }
        
        const map = WORLD_MAPS[WorldState.currentMap];
        
        // 检查NPC对话
        const npc = WorldState.npcs.find(n => n.x === checkX && n.y === checkY);
        if (npc) {
            this.talkToNPC(npc);
            return;
        }
        
        // 检查交互物
        const tileId = map.tiles[checkY]?.[checkX];
        const tile = Object.values(TILES).find(t => t.id === tileId);
        
        if (tile) {
            switch(tileId) {
                case TILES.CHEST.id:
                    this.openChest(checkX, checkY);
                    break;
                case TILES.SWITCH.id:
                case TILES.SWITCH_ON.id:
                    this.toggleSwitch(checkX, checkY);
                    break;
                case TILES.SIGN.id:
                    this.readSign(checkX, checkY);
                    break;
                case TILES.SAVE_POINT.id:
                    this.saveGame();
                    break;
                case TILES.DOOR.id:
                    this.tryOpenDoor(checkX, checkY);
                    break;
            }
        }
        
        // 检查隐藏通道
        if (tileId === TILES.WALL_SECRET.id) {
            this.showMessage('发现隐藏通道！');
        }
        
        // 检查彩蛋
        if (tile && tile.easterEgg) {
            this.collectEasterEgg(checkX, checkY);
        }
    },
    
    talkToNPC(npc) {
        npc.talked = true;
        
        if (npc.shop) {
            this.openShop(npc);
        } else {
            // 显示对话
            const dialog = DIALOGS[npc.dialog] || { text: '...' };
            this.showDialog(npc.name, dialog.text, npc.sprite);
        }
        
        // 播放音效
        if (AudioSystem) AudioSystem.playSFX('talk');
    },
    
    openChest(x, y) {
        const map = WORLD_MAPS[WorldState.currentMap];
        
        // 检查是否已经打开
        if (WorldState.openedChests.some(c => c.mapId === WorldState.currentMap && c.x === x && c.y === y)) {
            this.showMessage('宝箱是空的。');
            return;
        }
        
        // 标记为已打开
        WorldState.openedChests.push({ mapId: WorldState.currentMap, x, y });
        map.tiles[y][x] = TILES.CHEST_OPEN.id;
        
        // 生成奖励
        const rewards = [
            { type: 'gold', amount: Math.floor(Math.random() * 50) + 10 },
            { type: 'item', item: 'potion' },
            { type: 'equipment', rarity: Math.random() < 0.2 ? 'rare' : 'common' }
        ];
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        
        switch(reward.type) {
            case 'gold':
                gameState.gold += reward.amount;
                this.showMessage(`获得 ${reward.amount} 金币！`);
                break;
            case 'item':
                this.showMessage('获得药水！');
                break;
            case 'equipment':
                this.showMessage('获得装备！');
                break;
        }
        
        // 播放音效
        if (AudioSystem) AudioSystem.playSFX('chest');
    },
    
    toggleSwitch(x, y) {
        const map = WORLD_MAPS[WorldState.currentMap];
        const tileId = map.tiles[y][x];
        
        if (tileId === TILES.SWITCH.id) {
            map.tiles[y][x] = TILES.SWITCH_ON.id;
            this.showMessage('开关激活了！');
        } else {
            map.tiles[y][x] = TILES.SWITCH.id;
            this.showMessage('开关关闭了。');
        }
        
        // 检查连接的机关
        this.checkPuzzleSolved();
        
        // 播放音效
        if (AudioSystem) AudioSystem.playSFX('switch');
    },
    
    checkPuzzleSolved() {
        WorldState.puzzles.forEach(puzzle => {
            if (puzzle.solved) return;
            
            switch(puzzle.type) {
                case 'push_box':
                    // 检查所有箱子是否在目标点上
                    const allBoxesOnTarget = puzzle.targets.every(target => {
                        return WorldState.pushBoxes.some(box => box.x === target.x && box.y === target.y);
                    });
                    
                    if (allBoxesOnTarget) {
                        puzzle.solved = true;
                        this.showMessage('谜题解开！');
                        
                        // 给予奖励
                        if (puzzle.reward) {
                            if (puzzle.reward.gold) {
                                gameState.gold += puzzle.reward.gold;
                            }
                        }
                        
                        // 播放音效
                        if (AudioSystem) AudioSystem.playSFX('puzzle_solved');
                    }
                    break;
                    
                case 'switch_door':
                    // 检查所有开关是否激活
                    const map = WORLD_MAPS[WorldState.currentMap];
                    const allSwitchesOn = puzzle.switches.every(sw => {
                        return map.tiles[sw.y][sw.x] === TILES.SWITCH_ON.id;
                    });
                    
                    if (allSwitchesOn) {
                        puzzle.solved = true;
                        
                        // 打开所有门
                        puzzle.doors.forEach(door => {
                            map.tiles[door.y][door.x] = TILES.DOOR_OPEN.id;
                        });
                        
                        this.showMessage('门打开了！');
                        if (AudioSystem) AudioSystem.playSFX('door_open');
                    }
                    break;
            }
        });
    },
    
    startBattle(monster) {
        // 记录被击败的怪物以便重生
        if (monster.respawn) {
            WorldState.defeatedMonsters.push({
                x: monster.x,
                y: monster.y,
                type: monster.type,
                respawnTime: Date.now() + WORLD_CONFIG.MONSTER_RESPAWN_TIME
            });
        }
        
        // 从地图上移除怪物
        WorldState.monsters = WorldState.monsters.filter(m => m !== monster);
        
        // 切换到战斗场景
        if (typeof startBattle === 'function') {
            startBattle(monster.type);
        }
        
        // 播放音效
        if (AudioSystem) AudioSystem.playSFX('encounter');
    },
    
    startRandomBattle() {
        const map = WORLD_MAPS[WorldState.currentMap];
        if (!map.monsters || map.monsters.length === 0) return;
        
        const monsterGroup = map.monsters[Math.floor(Math.random() * map.monsters.length)];
        
        if (typeof startBattle === 'function') {
            startBattle(monsterGroup.type);
        }
        
        // 播放音效
        if (AudioSystem) AudioSystem.playSFX('encounter');
    },
    
    transitionToMap(mapId, x, y) {
        // 淡入淡出效果
        const overlay = document.getElementById('transitionOverlay');
        if (overlay) {
            overlay.classList.add('active');
            
            setTimeout(() => {
                this.loadMap(mapId);
                WorldState.player.x = x;
                WorldState.player.y = y;
                
                setTimeout(() => {
                    overlay.classList.remove('active');
                }, 300);
            }, 300);
        } else {
            this.loadMap(mapId);
            WorldState.player.x = x;
            WorldState.player.y = y;
        }
    },
    
    showMessage(text) {
        WorldState.messages.push({
            text,
            time: Date.now(),
            duration: 2000
        });
    },
    
    showDialog(name, text, sprite) {
        // 调用剧情对话框
        if (typeof StoryDialog !== 'undefined') {
            StoryDialog.show({
                speaker: name,
                text: text,
                avatar: sprite
            });
        } else {
            this.showMessage(`${name}: ${text}`);
        }
    },
    
    activateEasterEgg(eggId) {
        if (WorldState.foundEggs.includes(eggId)) {
            return;
        }
        
        WorldState.foundEggs.push(eggId);
        
        const eggMessages = {
            'konami': '🎮 30条命秘籍激活！获得传说装备！',
            'cave_secret': '💎 发现了洞穴的秘密！',
            'final_secret': '🏆 发现了最终秘密！解锁隐藏结局！'
        };
        
        this.showMessage(eggMessages[eggId] || '发现了彩蛋！');
        
        // 特殊奖励
        if (eggId === 'konami') {
            // 给传说装备
            const legendaryEquip = generateEquipment('weapon', 50, 'legendary');
            addItemToInventory(legendaryEquip);
        }
        
        // 播放音效
        if (AudioSystem) AudioSystem.playSFX('secret');
    },
    
    toggleMenu() {
        // 打开游戏菜单
        if (typeof showScene === 'function') {
            showScene('menu');
        }
    },
    
    render() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        const map = WORLD_MAPS[WorldState.currentMap];
        const camera = WorldState.camera;
        
        // 检查地图数据
        if (!map || !map.tiles || map.tiles.length === 0) {
            console.error('[WorldSystem] Map data not available');
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px monospace';
            ctx.fillText('地图加载失败', 50, 50);
            return;
        }
        
        // 清空画布
        ctx.fillStyle = map.background || '#000000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制地图
        for (let y = 0; y < WORLD_CONFIG.VIEW_HEIGHT; y++) {
            for (let x = 0; x < WORLD_CONFIG.VIEW_WIDTH; x++) {
                const mapX = camera.x + x;
                const mapY = camera.y + y;
                
                if (mapX >= 0 && mapX < map.width && mapY >= 0 && mapY < map.height) {
                    const tileId = map.tiles[mapY]?.[mapX];
                    if (tileId !== undefined) {
                        this.drawTile(ctx, tileId, x * WORLD_CONFIG.TILE_SIZE, y * WORLD_CONFIG.TILE_SIZE);
                    }
                }
            }
        }
        
        // 绘制NPC
        WorldState.npcs.forEach(npc => {
            if (this.isOnScreen(npc.x, npc.y)) {
                const screenX = (npc.x - camera.x) * WORLD_CONFIG.TILE_SIZE;
                const screenY = (npc.y - camera.y) * WORLD_CONFIG.TILE_SIZE;
                this.drawNPC(ctx, npc, screenX, screenY);
            }
        });
        
        // 绘制怪物
        WorldState.monsters.forEach(monster => {
            if (this.isOnScreen(monster.x, monster.y)) {
                const screenX = (monster.x - camera.x) * WORLD_CONFIG.TILE_SIZE;
                const screenY = (monster.y - camera.y) * WORLD_CONFIG.TILE_SIZE;
                this.drawMonster(ctx, monster, screenX, screenY);
            }
        });
        
        // 绘制玩家
        const playerScreenX = (WorldState.player.x - camera.x) * WORLD_CONFIG.TILE_SIZE;
        const playerScreenY = (WorldState.player.y - camera.y) * WORLD_CONFIG.TILE_SIZE;
        this.drawPlayer(ctx, playerScreenX, playerScreenY);
        
        // 绘制消息
        this.drawMessages(ctx);
        
        // 绘制小地图
        this.drawMinimap(ctx);
    },
    
    drawTile(ctx, tileId, x, y) {
        const tile = Object.values(TILES).find(t => t.id === tileId);
        if (!tile) return;
        
        ctx.fillStyle = tile.color;
        ctx.fillRect(x, y, WORLD_CONFIG.TILE_SIZE, WORLD_CONFIG.TILE_SIZE);
        
        // 绘制细节
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x, y, WORLD_CONFIG.TILE_SIZE, 2);
        ctx.fillRect(x, y, 2, WORLD_CONFIG.TILE_SIZE);
    },
    
    drawPlayer(ctx, x, y) {
        const player = WorldState.player;
        
        // 玩家精灵（简单像素画）
        ctx.fillStyle = '#4169e1'; // 蓝色衣服
        ctx.fillRect(x + 8, y + 12, 16, 12);
        
        // 头
        ctx.fillStyle = '#ffdbac'; // 肤色
        ctx.fillRect(x + 10, y + 4, 12, 10);
        
        // 头发
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x + 10, y + 2, 12, 4);
        
        // 方向指示
        ctx.fillStyle = '#000000';
        switch(player.direction) {
            case 'up':
                ctx.fillRect(x + 14, y + 6, 4, 2);
                break;
            case 'down':
                ctx.fillRect(x + 14, y + 10, 4, 2);
                break;
            case 'left':
                ctx.fillRect(x + 12, y + 8, 2, 4);
                break;
            case 'right':
                ctx.fillRect(x + 18, y + 8, 2, 4);
                break;
        }
    },
    
    drawNPC(ctx, npc, x, y) {
        // NPC精灵
        ctx.fillStyle = '#daa520'; // 金色衣服
        ctx.fillRect(x + 8, y + 12, 16, 12);
        
        // 头
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(x + 10, y + 4, 12, 10);
        
        // 名字
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(npc.name, x + 16, y - 4);
    },
    
    drawMonster(ctx, monster, x, y) {
        // 怪物精灵（根据类型）
        const colors = {
            'slime_green': '#00ff00',
            'slime_blue': '#00bfff',
            'wolf': '#808080',
            'bat': '#4b0082',
            'skeleton': '#f5f5dc',
            'goblin': '#228b22'
        };
        
        ctx.fillStyle = colors[monster.type] || '#ff0000';
        ctx.fillRect(x + 4, y + 8, 24, 20);
        
        // 眼睛
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 8, y + 12, 6, 6);
        ctx.fillRect(x + 18, y + 12, 6, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 10, y + 14, 2, 2);
        ctx.fillRect(x + 20, y + 14, 2, 2);
    },
    
    drawMessages(ctx) {
        const now = Date.now();
        WorldState.messages = WorldState.messages.filter(msg => now - msg.time < msg.duration);
        
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(10, 10, 300, 30 + WorldState.messages.length * 20);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'left';
        
        WorldState.messages.forEach((msg, index) => {
            ctx.fillText(msg.text, 20, 35 + index * 20);
        });
    },
    
    drawMinimap(ctx) {
        const map = WORLD_MAPS[WorldState.currentMap];
        const minimapSize = 80;
        const scale = minimapSize / Math.max(map.width, map.height);
        
        const mx = this.canvas.width - minimapSize - 10;
        const my = 10;
        
        // 背景
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(mx, my, minimapSize, minimapSize);
        
        // 绘制地图轮廓
        ctx.fillStyle = '#444444';
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                if (this.isSolid(x, y)) {
                    ctx.fillRect(mx + x * scale, my + y * scale, scale, scale);
                }
            }
        }
        
        // 绘制玩家位置
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(mx + WorldState.player.x * scale, my + WorldState.player.y * scale, scale * 2, scale * 2);
    },
    
    isOnScreen(x, y) {
        return x >= WorldState.camera.x && x < WorldState.camera.x + WORLD_CONFIG.VIEW_WIDTH &&
               y >= WorldState.camera.y && y < WorldState.camera.y + WORLD_CONFIG.VIEW_HEIGHT;
    }
};

// ==================== 对话数据 ====================
const DIALOGS = {
    village_chief: {
        text: '勇者啊，黑暗力量正在蔓延。请前往迷雾森林，找出威胁的源头！',
        next: null
    },
    merchant: {
        text: '欢迎！需要什么装备吗？',
        next: null
    },
    villager1: {
        text: '听说森林深处有可怕的怪物...你要小心啊！',
        next: null
    },
    lost_merchant: {
        text: '我迷路了！谢谢你经过这里。往西走可以找到洞穴入口。',
        next: null
    },
    trapped_mage: {
        text: '我被困在这里了！如果你能击败洞穴巨魔，我就加入你的队伍！',
        next: null
    },
    miner: {
        text: '这些矿坑里有哥布林出没。小心那些绿色的小家伙！',
        next: null
    },
    desert_merchant: {
        text: '沙漠里的东西可不便宜...但我有好货！',
        next: null
    }
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    // 初始化世界系统
    WorldSystem.init();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WorldSystem, WorldState, WORLD_MAPS, TILES };
}
