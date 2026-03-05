/**
 * Dragon Quest JRPG - 世界探索系统 v3
 * 多区域地图 + 城镇NPC + 随机遭遇 + HUD
 */

// ======== 全局状态 ========
let W = {
    canvas: null, ctx: null,
    player: { x: 20, y: 15, dir: 'down', frame: 0 },
    camera: { x: 0, y: 0 },
    map: [], npcs: [], monsters: [], chests: [], exits: [],
    currentMap: 'village',
    initialized: false, loopStarted: false,
    TILE: 32, mapW: 40, mapH: 30,
    time: 0, dialogActive: false, menuActive: false,
    stepCount: 0, // 随机遭遇计步
    areaNameAlpha: 0, areaNameTimer: 0, // 区域名显示
    transitioning: false
};

// ======== 图块类型 ========
const T = { GRASS:0, WALL:1, TREE:2, WATER:3, CHEST:4, MONSTER:5, PATH:6, EXIT:7, FLOOR:8, LAVA:9, ORE:10, FENCE:11, LEAF:12, BOSS:13 };

// ======== 区域定义 ========
const MAPS = {
    village: {
        name: '🏘️ 新手村', level: '安全区', safe: true,
        width: 40, height: 30, bgColor: '#1a2a1a',
        generate() {
            const map = makeGrid(40, 30, T.GRASS);
            const npcs = [], chests = [], monsters = [], exits = [];
            
            // 围墙
            borderWall(map, 40, 30);
            
            // 石板主路（十字形）
            for (let x = 5; x < 35; x++) map[15][x] = T.PATH;
            for (let y = 5; y < 25; y++) map[y][20] = T.PATH;
            // 村中心广场
            for (let y = 13; y < 18; y++)
                for (let x = 18; x < 23; x++) map[y][x] = T.PATH;
            
            // 建筑1: 商店（左上）
            makeBuilding(map, 6, 4, 8, 6);
            // 建筑2: 酒馆（右上）
            makeBuilding(map, 26, 4, 8, 6);
            // 建筑3: 铁匠（左下）
            makeBuilding(map, 6, 20, 8, 6);
            // 建筑4: 村长家（右下）
            makeBuilding(map, 26, 20, 8, 6);
            
            // 围栏装饰（避开出口通道 x=17-23）
            for (let x = 2; x < 38; x += 3) {
                if (map[2][x] === T.GRASS) map[2][x] = T.FENCE;
                if (x < 17 || x > 23) {
                    if (map[27][x] === T.GRASS) map[27][x] = T.FENCE;
                }
            }
            
            // 水池（中心偏右）
            for (let y = 13; y < 16; y++)
                for (let x = 30; x < 34; x++) map[y][x] = T.WATER;
            
            // 树木装饰
            [[3,3],[37,3],[3,27],[37,27],[15,7],[25,12],[15,22],[35,15]].forEach(([x,y]) => {
                if (map[y][x] === T.GRASS) map[y][x] = T.TREE;
            });
            
            // NPC
            npcs.push({ x:10, y:6, name:'商人', color:'#4a148c', hairColor:'#553322', type:'shop',
                dialog:'欢迎光临！需要买点什么？' });
            npcs.push({ x:30, y:6, name:'酒馆老板', color:'#b71c1c', hairColor:'#daa520', type:'inn',
                dialog:'欢迎来到酒馆！需要休息一下吗？' });
            npcs.push({ x:10, y:22, name:'铁匠', color:'#333', hairColor:'#222', type:'smith',
                dialog:'想强化装备？交给我！' });
            npcs.push({ x:30, y:22, name:'村长', color:'#8B0000', hairColor:'#aaa', type:'talk',
                dialog:'勇者啊，南边的草原上出现了怪物，村民们都很害怕。请帮帮我们！向南走出村子就能到达草原。' });
            npcs.push({ x:20, y:10, name:'少女', color:'#e91e63', hairColor:'#ffcc00', type:'talk',
                dialog:'听说东边的森林里藏着传说中的宝剑呢！不过要先穿过草原才行...加油哦！' });
            npcs.push({ x:20, y:15, name:'冒险者公会', color:'#1565C0', hairColor:'#ffd700', type:'recruit',
                dialog:'想找人一起冒险？看看有谁愿意加入你吧！' });
            
            // 南出口 → 草原
            for (let x = 18; x < 23; x++) {
                map[29][x] = T.EXIT;
                exits.push({ x, y:29, target:'plains', spawnX:20, spawnY:1 });
            }
            
            return { map, npcs, chests, monsters, exits };
        }
    },
    
    plains: {
        name: '🌾 风吹草原', level: 'Lv.1-5', safe: false,
        width: 40, height: 30, bgColor: '#1a3a1a',
        encounterRate: 10,
        generate() {
            const map = makeGrid(40, 30, T.GRASS);
            const npcs = [], chests = [], monsters = [], exits = [];
            
            borderWall(map, 40, 30);
            
            // 小路
            for (let x = 2; x < 38; x++) map[15][x] = T.PATH;
            for (let y = 2; y < 28; y++) map[y][20] = T.PATH;
            
            // 小河（蜿蜒）
            for (let y = 5; y < 25; y++) {
                const x = 30 + Math.round(Math.sin(y * 0.5) * 2);
                if (x >= 0 && x < 40) { map[y][x] = T.WATER; map[y][x+1] = T.WATER; }
            }
            
            // 散落树木
            const treePosP = [[5,5],[8,8],[12,4],[35,10],[36,20],[3,22],[15,25],[25,7],[33,25],[7,18],[28,3]];
            treePosP.forEach(([x,y]) => { if(map[y][x]===T.GRASS) map[y][x]=T.TREE; });
            
            // 怪物
            const monP = [[8,5,'slime'],[15,8,'mushroom'],[25,5,'bat'],[10,20,'slime'],[30,18,'mushroom'],[22,25,'bat'],[5,12,'slime'],[35,8,'bat']];
            monP.forEach(([x,y,type]) => {
                if(map[y][x]===T.GRASS) {
                    map[y][x] = T.MONSTER;
                    monsters.push({ x,y,type,name:monsterName(type),color:monsterColor(type) });
                }
            });
            
            // 宝箱
            [[3,3,40],[36,5,60],[18,25,50],[35,25,80],[6,26,45]].forEach(([x,y,gold]) => {
                if(map[y][x]===T.GRASS) { map[y][x]=T.CHEST; chests.push({x,y,opened:false,gold}); }
            });
            
            // 北出口 → 村庄
            for (let x=18;x<23;x++) { map[0][x]=T.EXIT; exits.push({x,y:0,target:'village',spawnX:20,spawnY:28}); }
            // 东出口 → 森林
            for (let y=13;y<18;y++) { map[y][39]=T.EXIT; exits.push({x:39,y,target:'forest',spawnX:1,spawnY:15}); }
            
            // 旅行者NPC
            npcs.push({ x:20, y:12, name:'旅行者', color:'#2e7d32', hairColor:'#8d6e63', type:'talk',
                dialog:'这片草原看起来平静，但到处都有怪物潜伏。小心史莱姆和蘑菇怪！往东走可以到达迷雾森林。' });
            
            return { map, npcs, chests, monsters, exits };
        }
    },
    
    forest: {
        name: '🌲 迷雾森林', level: 'Lv.5-10', safe: false,
        width: 40, height: 30, bgColor: '#0a2a0a',
        encounterRate: 8,
        generate() {
            const map = makeGrid(40, 30, T.LEAF);
            const npcs = [], chests = [], monsters = [], exits = [];
            
            borderWall(map, 40, 30);
            
            // 密集树木（随机分布约30%面积）
            for (let y=1;y<29;y++) for(let x=1;x<39;x++) {
                if (Math.random() < 0.25 && map[y][x]===T.LEAF) map[y][x]=T.TREE;
            }
            
            // 清出路径
            for (let x=1;x<39;x++) { map[15][x]=T.LEAF; if(map[14][x]===T.TREE) map[14][x]=T.LEAF; if(map[16][x]===T.TREE) map[16][x]=T.LEAF; }
            for (let y=1;y<29;y++) { map[y][20]=T.LEAF; if(map[y][19]===T.TREE) map[y][19]=T.LEAF; if(map[y][21]===T.TREE) map[y][21]=T.LEAF; }
            
            // 蘑菇装饰（用GRASS替代表示空地+蘑菇）
            for (let i=0;i<15;i++) {
                const x=Math.floor(Math.random()*38)+1, y=Math.floor(Math.random()*28)+1;
                if(map[y][x]===T.LEAF) map[y][x]=T.GRASS;
            }
            
            // 怪物
            const monF = [[5,5,'wolf'],[15,8,'treant'],[30,5,'snake'],[8,22,'wolf'],[25,20,'treant'],[35,15,'snake'],[12,12,'wolf'],[28,25,'treant']];
            monF.forEach(([x,y,type]) => {
                if(map[y][x]!==T.WALL&&map[y][x]!==T.TREE) {
                    map[y][x]=T.MONSTER;
                    monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});
                }
            });
            
            // 宝箱
            [[3,3,80],[37,27,120],[10,25,100],[35,5,90]].forEach(([x,y,gold]) => {
                if(map[y][x]!==T.WALL&&map[y][x]!==T.TREE) { map[y][x]=T.CHEST; chests.push({x,y,opened:false,gold}); }
            });
            
            // 西出口 → 草原
            for(let y=13;y<18;y++) { map[y][0]=T.EXIT; exits.push({x:0,y,target:'plains',spawnX:38,spawnY:15}); }
            // 南出口 → 洞穴
            for(let x=18;x<23;x++) { map[29][x]=T.EXIT; exits.push({x,y:29,target:'cave',spawnX:20,spawnY:1}); }
            
            npcs.push({ x:20, y:10, name:'猎人', color:'#5d4037', hairColor:'#3e2723', type:'talk',
                dialog:'这片森林里有凶猛的狼和树精，还有剧毒的蛇。南边的洞穴更危险，听说里面有骷髅王...' });
            
            return { map, npcs, chests, monsters, exits };
        }
    },
    
    cave: {
        name: '💀 暗影洞穴', level: 'Lv.10-15', safe: false,
        width: 40, height: 30, bgColor: '#0a0a0a',
        encounterRate: 6,
        generate() {
            const map = makeGrid(40, 30, T.FLOOR);
            const npcs = [], chests = [], monsters = [], exits = [];
            
            borderWall(map, 40, 30);
            
            // 岩壁（随机）
            for(let y=1;y<29;y++) for(let x=1;x<39;x++) {
                if(Math.random()<0.15) map[y][x]=T.WALL;
            }
            
            // 主路
            for(let x=1;x<39;x++) { map[15][x]=T.FLOOR; map[14][x]=T.FLOOR; map[16][x]=T.FLOOR; }
            for(let y=1;y<29;y++) { map[y][20]=T.FLOOR; map[y][19]=T.FLOOR; map[y][21]=T.FLOOR; }
            
            // 熔岩池
            for(let y=22;y<26;y++) for(let x=5;x<10;x++) map[y][x]=T.LAVA;
            for(let y=5;y<9;y++) for(let x=30;x<35;x++) map[y][x]=T.LAVA;
            
            // 发光矿石
            [[3,3],[37,3],[3,27],[37,27],[15,8],[25,22],[10,15],[30,15]].forEach(([x,y]) => {
                if(map[y][x]===T.FLOOR) map[y][x]=T.ORE;
            });
            
            // 怪物
            const monC = [[8,5,'batSwarm'],[25,5,'gargoyle'],[10,25,'skeleton'],[30,25,'batSwarm'],[15,20,'gargoyle'],[35,12,'skeleton'],[5,15,'batSwarm']];
            monC.forEach(([x,y,type]) => {
                if(map[y][x]===T.FLOOR) {
                    map[y][x]=T.MONSTER;
                    monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});
                }
            });
            
            // BOSS: 骷髅王（地图最深处）
            map[27][20]=T.BOSS;
            monsters.push({x:20,y:27,type:'skeletonKing',name:'💀骷髅王',color:'#fff',isBoss:true});
            
            // 宝箱
            [[5,3,150],[35,27,200],[20,5,180]].forEach(([x,y,gold]) => {
                if(map[y][x]===T.FLOOR) { map[y][x]=T.CHEST; chests.push({x,y,opened:false,gold}); }
            });
            
            // 北出口 → 森林
            for(let x=18;x<23;x++) { map[0][x]=T.EXIT; exits.push({x,y:0,target:'forest',spawnX:20,spawnY:28}); }
            // 东出口 → 废弃矿坑
            for(let y=13;y<18;y++) { map[y][39]=T.EXIT; exits.push({x:39,y,target:'mine',spawnX:1,spawnY:15}); }
            
            return { map, npcs, chests, monsters, exits };
        }
    },

    // ======== 废弃矿坑 Lv.15-25 ========
    mine: {
        name: '⛏️ 废弃矿坑', level: 'Lv.15-25', safe: false,
        width: 50, height: 40, bgColor: '#0d0d0d',
        encounterRate: 5,
        generate() {
            const map = makeGrid(50, 40, T.FLOOR);
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 50, 40);
            // 矿道网格
            for(let y=2;y<38;y++) for(let x=2;x<48;x++) {
                if(Math.random()<0.2) map[y][x]=T.WALL;
            }
            // 主通道
            for(let x=1;x<49;x++) { map[20][x]=T.FLOOR; map[19][x]=T.FLOOR; map[21][x]=T.FLOOR; }
            for(let y=1;y<39;y++) { map[y][25]=T.FLOOR; map[y][24]=T.FLOOR; map[y][26]=T.FLOOR; }
            // 矿石散布
            for(let i=0;i<25;i++) { const x=2+Math.floor(Math.random()*46),y=2+Math.floor(Math.random()*36); if(map[y][x]===T.WALL) map[y][x]=T.ORE; }
            // 熔岩池
            for(let y=30;y<35;y++) for(let x=35;x<42;x++) map[y][x]=T.LAVA;
            for(let y=5;y<10;y++) for(let x=5;x<12;x++) map[y][x]=T.LAVA;
            // 怪物
            [[10,8,'gargoyle'],[20,5,'skeleton'],[35,10,'batSwarm'],[8,30,'gargoyle'],[40,20,'skeleton'],[15,35,'batSwarm'],[30,30,'gargoyle'],[45,15,'skeleton']].forEach(([x,y,type])=>{
                if(map[y][x]===T.FLOOR){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[37][25]=T.BOSS; monsters.push({x:25,y:37,type:'diamondGiant',name:'💎钻石巨人',color:'#00ffff',isBoss:true});
            // 宝箱
            [[3,3,200],[47,3,250],[3,37,300],[47,37,350],[25,10,280]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.FLOOR){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            // NPC
            npcs.push({x:25,y:18,name:'矮人矿工',color:'#8B4513',hairColor:'#DEB887',type:'talk',
                dialog:'这矿坑已经废弃很久了...深处有钻石巨人在守护着宝藏。往南走可以到古老遗迹。'});
            // 西出口 → 洞穴
            for(let y=13;y<18;y++){map[y][0]=T.EXIT;exits.push({x:0,y,target:'cave',spawnX:38,spawnY:15});}
            // 南出口 → 古老遗迹
            for(let x=23;x<28;x++){map[39][x]=T.EXIT;exits.push({x,y:39,target:'crypt',spawnX:25,spawnY:1});}
            // 东出口 → 沙漠
            for(let y=18;y<23;y++){map[y][49]=T.EXIT;exits.push({x:49,y,target:'desert',spawnX:1,spawnY:15});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 古老遗迹 Lv.25-35 ========
    crypt: {
        name: '🏛️ 古老遗迹', level: 'Lv.25-35', safe: false,
        width: 50, height: 40, bgColor: '#0a0a15',
        encounterRate: 5,
        generate() {
            const map = makeGrid(50, 40, T.FLOOR);
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 50, 40);
            // 柱廊式房间结构
            for(let ry=0;ry<4;ry++) for(let rx=0;rx<5;rx++) {
                const bx=rx*10+2,by=ry*10+2;
                if(Math.random()<0.4) {
                    for(let y=by;y<by+8&&y<39;y++) for(let x=bx;x<bx+8&&x<49;x++) {
                        if(y===by||y===by+7||x===bx||x===bx+7) map[y][x]=T.WALL;
                    }
                    // 门
                    map[by+4][bx]=T.FLOOR; map[by+4][bx+7]=T.FLOOR;
                    map[by][bx+4]=T.FLOOR; map[by+7][bx+4]=T.FLOOR;
                }
            }
            // 石板路
            for(let x=1;x<49;x++) map[20][x]=T.PATH;
            for(let y=1;y<39;y++) map[y][25]=T.PATH;
            // 发光矿石装饰
            for(let i=0;i<20;i++){const x=2+Math.floor(Math.random()*46),y=2+Math.floor(Math.random()*36);if(map[y][x]===T.FLOOR) map[y][x]=T.ORE;}
            // 怪物
            [[8,8,'skeleton'],[20,5,'gargoyle'],[40,8,'skeleton'],[8,30,'batSwarm'],[35,25,'gargoyle'],[25,35,'skeleton'],[42,35,'batSwarm'],[15,20,'gargoyle']].forEach(([x,y,type])=>{
                if(map[y][x]===T.FLOOR||map[y][x]===T.PATH){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[37][25]=T.BOSS; monsters.push({x:25,y:37,type:'lichKing',name:'🧟巫妖王',color:'#9966ff',isBoss:true});
            // 宝箱
            [[5,5,350],[45,5,400],[5,35,380],[45,35,450],[25,20,500]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.FLOOR){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:25,y:10,name:'考古学家',color:'#CD853F',hairColor:'#fff',type:'talk',
                dialog:'这些遗迹已有千年历史...深处封印着巫妖王。当心不死族的诅咒！'});
            // 北出口 → 矿坑
            for(let x=23;x<28;x++){map[0][x]=T.EXIT;exits.push({x,y:0,target:'mine',spawnX:25,spawnY:38});}
            // 东出口 → 沼泽
            for(let y=18;y<23;y++){map[y][49]=T.EXIT;exits.push({x:49,y,target:'swamp',spawnX:1,spawnY:15});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 灼热沙漠 Lv.30-40 ========
    desert: {
        name: '🏜️ 灼热沙漠', level: 'Lv.30-40', safe: false,
        width: 60, height: 40, bgColor: '#2a1a0a',
        encounterRate: 6,
        generate() {
            const map = makeGrid(60, 40, T.GRASS); // 沙地用GRASS表示
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 60, 40);
            // 绿洲（水池）
            for(let y=15;y<20;y++) for(let x=28;x<35;x++) map[y][x]=T.WATER;
            // 仙人掌（用TREE）
            for(let i=0;i<20;i++){const x=2+Math.floor(Math.random()*56),y=2+Math.floor(Math.random()*36);if(map[y][x]===T.GRASS) map[y][x]=T.TREE;}
            // 岩石
            for(let i=0;i<15;i++){const x=2+Math.floor(Math.random()*56),y=2+Math.floor(Math.random()*36);if(map[y][x]===T.GRASS) map[y][x]=T.WALL;}
            // 路
            for(let x=1;x<59;x++) map[20][x]=T.PATH;
            for(let y=1;y<39;y++) map[y][30]=T.PATH;
            // 流沙（用LAVA表示）
            for(let y=30;y<34;y++) for(let x=10;x<18;x++) map[y][x]=T.LAVA;
            for(let y=5;y<9;y++) for(let x=45;x<52;x++) map[y][x]=T.LAVA;
            // 怪物
            [[10,8,'skeleton'],[25,5,'gargoyle'],[45,10,'batSwarm'],[15,30,'skeleton'],[50,25,'gargoyle'],[35,35,'batSwarm'],[8,20,'skeleton'],[55,15,'gargoyle']].forEach(([x,y,type])=>{
                if(map[y][x]===T.GRASS||map[y][x]===T.PATH){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[37][30]=T.BOSS; monsters.push({x:30,y:37,type:'pharaoh',name:'👳法老王',color:'#FFD700',isBoss:true});
            // 宝箱
            [[5,5,400],[55,5,450],[5,35,420],[55,35,500],[30,10,480]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.GRASS){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:30,y:17,name:'沙漠商人',color:'#DAA520',hairColor:'#000',type:'shop',
                dialog:'沙漠中的绿洲，需要补给吗？'});
            npcs.push({x:32,y:17,name:'冒险家',color:'#CD853F',hairColor:'#8B4513',type:'talk',
                dialog:'往南走小心流沙！法老王的金字塔就在沙漠深处。西边通向废弃矿坑，东边是剧毒沼泽。'});
            // 西出口 → 矿坑
            for(let y=18;y<23;y++){map[y][0]=T.EXIT;exits.push({x:0,y,target:'mine',spawnX:48,spawnY:20});}
            // 东出口 → 沼泽
            for(let y=18;y<23;y++){map[y][59]=T.EXIT;exits.push({x:59,y,target:'swamp',spawnX:1,spawnY:15});}
            // 南出口 → 熔岩地带
            for(let x=28;x<33;x++){map[39][x]=T.EXIT;exits.push({x,y:39,target:'volcano',spawnX:25,spawnY:1});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 剧毒沼泽 Lv.35-45 ========
    swamp: {
        name: '☠️ 剧毒沼泽', level: 'Lv.35-45', safe: false,
        width: 50, height: 40, bgColor: '#0a1a0a',
        encounterRate: 4,
        generate() {
            const map = makeGrid(50, 40, T.GRASS);
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 50, 40);
            // 毒水(WATER)大面积
            for(let y=2;y<38;y++) for(let x=2;x<48;x++) { if(Math.random()<0.3) map[y][x]=T.WATER; }
            // 树木
            for(let i=0;i<30;i++){const x=2+Math.floor(Math.random()*46),y=2+Math.floor(Math.random()*36);if(map[y][x]===T.GRASS) map[y][x]=T.TREE;}
            // 安全路径
            for(let x=1;x<49;x++){map[20][x]=T.PATH;map[19][x]=T.PATH;}
            for(let y=1;y<39;y++){map[y][25]=T.PATH;map[y][24]=T.PATH;}
            // 怪物
            [[10,8,'batSwarm'],[20,5,'gargoyle'],[40,10,'skeleton'],[8,30,'gargoyle'],[35,30,'batSwarm'],[25,35,'skeleton'],[42,20,'gargoyle'],[15,15,'skeleton']].forEach(([x,y,type])=>{
                if(map[y][x]===T.GRASS||map[y][x]===T.PATH){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[37][25]=T.BOSS; monsters.push({x:25,y:37,type:'swampQueen',name:'🧙沼泽女王',color:'#00cc66',isBoss:true});
            // 宝箱
            [[5,5,450],[45,5,500],[5,35,480],[45,35,550],[25,10,520]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.GRASS||map[y][x]===T.PATH){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:25,y:18,name:'药师',color:'#2E8B57',hairColor:'#006400',type:'shop',
                dialog:'这沼泽虽然危险，但有很多珍贵药材。需要补给吗？'});
            // 西出口 → 遗迹
            for(let y=18;y<23;y++){map[y][0]=T.EXIT;exits.push({x:0,y,target:'crypt',spawnX:48,spawnY:20});}
            // 西北出口 → 沙漠
            for(let y=3;y<8;y++){map[y][0]=T.EXIT;exits.push({x:0,y,target:'desert',spawnX:58,spawnY:20});}
            // 南出口 → 黑暗森林
            for(let x=23;x<28;x++){map[39][x]=T.EXIT;exits.push({x,y:39,target:'darkForest',spawnX:25,spawnY:1});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 熔岩地带 Lv.40-50 ========
    volcano: {
        name: '🌋 熔岩地带', level: 'Lv.40-50', safe: false,
        width: 50, height: 40, bgColor: '#1a0500',
        encounterRate: 4,
        generate() {
            const map = makeGrid(50, 40, T.FLOOR);
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 50, 40);
            // 大面积熔岩
            for(let y=2;y<38;y++) for(let x=2;x<48;x++) { if(Math.random()<0.25) map[y][x]=T.LAVA; }
            // 岩石路径
            for(let x=1;x<49;x++){map[20][x]=T.FLOOR;map[19][x]=T.FLOOR;map[21][x]=T.FLOOR;}
            for(let y=1;y<39;y++){map[y][25]=T.FLOOR;map[y][24]=T.FLOOR;map[y][26]=T.FLOOR;}
            // 矿石
            for(let i=0;i<15;i++){const x=2+Math.floor(Math.random()*46),y=2+Math.floor(Math.random()*36);if(map[y][x]===T.FLOOR) map[y][x]=T.ORE;}
            // 怪物
            [[10,8,'gargoyle'],[20,5,'skeleton'],[40,10,'batSwarm'],[8,30,'gargoyle'],[35,30,'skeleton'],[25,35,'batSwarm'],[42,15,'gargoyle'],[15,25,'skeleton']].forEach(([x,y,type])=>{
                if(map[y][x]===T.FLOOR){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[37][25]=T.BOSS; monsters.push({x:25,y:37,type:'flameLord',name:'🔥火焰领主',color:'#ff4400',isBoss:true});
            // 宝箱
            [[5,5,600],[45,5,650],[5,35,620],[45,35,700],[25,10,680]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.FLOOR){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:25,y:18,name:'火焰精灵',color:'#ff4400',hairColor:'#ffaa00',type:'talk',
                dialog:'只有最强的勇者才能穿越熔岩地带！火焰领主就在火山口等着你。'});
            // 北出口 → 沙漠
            for(let x=23;x<28;x++){map[0][x]=T.EXIT;exits.push({x,y:0,target:'desert',spawnX:30,spawnY:38});}
            // 东出口 → 黑暗森林
            for(let y=18;y<23;y++){map[y][49]=T.EXIT;exits.push({x:49,y,target:'darkForest',spawnX:1,spawnY:20});}
            // 南出口 → 幽灵古堡
            for(let x=23;x<28;x++){map[39][x]=T.EXIT;exits.push({x,y:39,target:'castle',spawnX:25,spawnY:1});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 黑暗森林 Lv.45-55 ========
    darkForest: {
        name: '🌑 黑暗森林', level: 'Lv.45-55', safe: false,
        width: 50, height: 40, bgColor: '#050510',
        encounterRate: 3,
        generate() {
            const map = makeGrid(50, 40, T.LEAF);
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 50, 40);
            // 密集黑暗树木
            for(let y=2;y<38;y++) for(let x=2;x<48;x++) { if(Math.random()<0.35) map[y][x]=T.TREE; }
            // 路径
            for(let x=1;x<49;x++){map[20][x]=T.LEAF;if(map[19][x]===T.TREE) map[19][x]=T.LEAF;if(map[21][x]===T.TREE) map[21][x]=T.LEAF;}
            for(let y=1;y<39;y++){map[y][25]=T.LEAF;if(map[y][24]===T.TREE) map[y][24]=T.LEAF;if(map[y][26]===T.TREE) map[y][26]=T.LEAF;}
            // 怪物
            [[10,8,'gargoyle'],[20,5,'skeleton'],[40,10,'batSwarm'],[8,30,'gargoyle'],[35,30,'skeleton'],[25,35,'batSwarm'],[42,15,'gargoyle'],[15,25,'skeleton'],[30,12,'gargoyle']].forEach(([x,y,type])=>{
                if(map[y][x]!==T.WALL&&map[y][x]!==T.TREE){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[37][25]=T.BOSS; monsters.push({x:25,y:37,type:'vampireCount',name:'🧛吸血鬼伯爵',color:'#880000',isBoss:true});
            // 宝箱
            [[5,5,700],[45,5,750],[5,35,720],[45,35,800],[25,10,780]].forEach(([x,y,gold])=>{
                if(map[y][x]!==T.WALL&&map[y][x]!==T.TREE){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:25,y:18,name:'暗精灵',color:'#4B0082',hairColor:'#C0C0C0',type:'talk',
                dialog:'这片森林被诅咒笼罩...吸血鬼伯爵的城堡就在深处。小心狼人和暗影！'});
            // 北出口 → 沼泽
            for(let x=23;x<28;x++){map[0][x]=T.EXIT;exits.push({x,y:0,target:'swamp',spawnX:25,spawnY:38});}
            // 西出口 → 熔岩
            for(let y=18;y<23;y++){map[y][0]=T.EXIT;exits.push({x:0,y,target:'volcano',spawnX:48,spawnY:20});}
            // 南出口 → 幽灵古堡
            for(let x=23;x<28;x++){map[39][x]=T.EXIT;exits.push({x,y:39,target:'castle',spawnX:25,spawnY:1});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 幽灵古堡 Lv.55-65 ========
    castle: {
        name: '🏰 幽灵古堡', level: 'Lv.55-65', safe: false,
        width: 50, height: 50, bgColor: '#0a0a0a',
        encounterRate: 3,
        generate() {
            const map = makeGrid(50, 50, T.FLOOR);
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 50, 50);
            // 城堡内部房间结构
            for(let ry=0;ry<5;ry++) for(let rx=0;rx<5;rx++) {
                const bx=rx*10+1,by=ry*10+1;
                makeBuilding(map,bx,by,9,9);
            }
            // 走廊连通
            for(let x=1;x<49;x++){map[5][x]=T.FLOOR;map[15][x]=T.FLOOR;map[25][x]=T.FLOOR;map[35][x]=T.FLOOR;map[45][x]=T.FLOOR;}
            for(let y=1;y<49;y++){map[y][5]=T.FLOOR;map[y][15]=T.FLOOR;map[y][25]=T.FLOOR;map[y][35]=T.FLOOR;map[y][45]=T.FLOOR;}
            // 红地毯
            for(let y=1;y<49;y++) map[y][25]=T.PATH;
            for(let x=1;x<49;x++) map[25][x]=T.PATH;
            // 怪物
            [[8,8,'skeleton'],[20,8,'gargoyle'],[40,8,'skeleton'],[8,30,'gargoyle'],[35,35,'skeleton'],[20,40,'batSwarm'],[40,40,'gargoyle'],[8,18,'skeleton'],[40,18,'batSwarm']].forEach(([x,y,type])=>{
                if(map[y][x]===T.FLOOR||map[y][x]===T.PATH){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[47][25]=T.BOSS; monsters.push({x:25,y:47,type:'deathKnight',name:'💀死亡骑士',color:'#4B0082',isBoss:true});
            // 宝箱
            [[3,3,900],[47,3,950],[3,47,920],[47,47,1000],[25,25,1100]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.FLOOR){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:25,y:23,name:'幽灵管家',color:'#708090',hairColor:'#C0C0C0',type:'talk',
                dialog:'这座城堡曾是辉煌的王宫...如今只剩亡灵。死亡骑士在王座厅等待挑战者。'});
            // 北出口 → 熔岩
            for(let x=23;x<28;x++){map[0][x]=T.EXIT;exits.push({x,y:0,target:'volcano',spawnX:25,spawnY:38});}
            // 北东出口 → 黑暗森林
            for(let x=40;x<45;x++){map[0][x]=T.EXIT;exits.push({x,y:0,target:'darkForest',spawnX:25,spawnY:38});}
            // 东出口 → 冰封雪原
            for(let y=23;y<28;y++){map[y][49]=T.EXIT;exits.push({x:49,y,target:'snow',spawnX:1,spawnY:20});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 冰封雪原 Lv.65-75 ========
    snow: {
        name: '❄️ 冰封雪原', level: 'Lv.65-75', safe: false,
        width: 60, height: 50, bgColor: '#101828',
        encounterRate: 4,
        generate() {
            const map = makeGrid(60, 50, T.GRASS); // 白雪用GRASS
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 60, 50);
            // 冰面（WATER）
            for(let y=15;y<25;y++) for(let x=25;x<40;x++) map[y][x]=T.WATER;
            // 松树
            for(let i=0;i<40;i++){const x=2+Math.floor(Math.random()*56),y=2+Math.floor(Math.random()*46);if(map[y][x]===T.GRASS) map[y][x]=T.TREE;}
            // 岩石
            for(let i=0;i<15;i++){const x=2+Math.floor(Math.random()*56),y=2+Math.floor(Math.random()*46);if(map[y][x]===T.GRASS) map[y][x]=T.WALL;}
            // 路
            for(let x=1;x<59;x++) map[25][x]=T.PATH;
            for(let y=1;y<49;y++) map[y][30]=T.PATH;
            // 怪物
            [[10,8,'gargoyle'],[25,5,'skeleton'],[50,10,'batSwarm'],[8,35,'gargoyle'],[45,35,'skeleton'],[30,42,'batSwarm'],[15,20,'gargoyle'],[50,25,'skeleton'],[35,8,'batSwarm']].forEach(([x,y,type])=>{
                if(map[y][x]===T.GRASS||map[y][x]===T.PATH){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[47][30]=T.BOSS; monsters.push({x:30,y:47,type:'iceQueen',name:'👸冰霜女王',color:'#87CEEB',isBoss:true});
            // 宝箱
            [[5,5,1200],[55,5,1300],[5,45,1250],[55,45,1400],[30,20,1350]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.GRASS){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:30,y:23,name:'雪地猎人',color:'#4682B4',hairColor:'#E0E0E0',type:'talk',
                dialog:'冰霜女王住在雪原尽头的冰宫...她的暴风雪能冻住一切。往南是天空之城的入口。'});
            npcs.push({x:32,y:23,name:'旅馆老板娘',color:'#B22222',hairColor:'#FFD700',type:'inn',
                dialog:'在这寒冷的雪原，需要暖和一下吗？'});
            // 西出口 → 古堡
            for(let y=23;y<28;y++){map[y][0]=T.EXIT;exits.push({x:0,y,target:'castle',spawnX:48,spawnY:25});}
            // 南出口 → 天空之城
            for(let x=28;x<33;x++){map[49][x]=T.EXIT;exits.push({x,y:49,target:'skyCity',spawnX:25,spawnY:1});}
            // 东出口 → 深渊之门
            for(let y=23;y<28;y++){map[y][59]=T.EXIT;exits.push({x:59,y,target:'abyss',spawnX:1,spawnY:20});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 天空之城 Lv.75-85 ========
    skyCity: {
        name: '☁️ 天空之城', level: 'Lv.75-85', safe: false,
        width: 50, height: 50, bgColor: '#0a1530',
        encounterRate: 4,
        generate() {
            const map = makeGrid(50, 50, T.PATH); // 云端石板路
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 50, 50);
            // 天空（WATER表示虚空/云层）
            for(let y=2;y<48;y++) for(let x=2;x<48;x++) { if(Math.random()<0.2) map[y][x]=T.WATER; }
            // 浮空平台（FLOOR）
            for(let i=0;i<8;i++){
                const px=5+Math.floor(Math.random()*38),py=5+Math.floor(Math.random()*38);
                for(let y=py;y<py+6&&y<48;y++) for(let x=px;x<px+8&&x<48;x++) map[y][x]=T.FLOOR;
            }
            // 主通道
            for(let x=1;x<49;x++){map[25][x]=T.PATH;map[24][x]=T.PATH;}
            for(let y=1;y<49;y++){map[y][25]=T.PATH;map[y][24]=T.PATH;}
            // 发光矿石（星辰碎片）
            for(let i=0;i<20;i++){const x=2+Math.floor(Math.random()*46),y=2+Math.floor(Math.random()*46);if(map[y][x]===T.PATH||map[y][x]===T.FLOOR) map[y][x]=T.ORE;}
            // 怪物
            [[10,10,'gargoyle'],[20,8,'skeleton'],[40,10,'batSwarm'],[8,35,'gargoyle'],[35,40,'skeleton'],[25,42,'batSwarm'],[42,25,'gargoyle'],[15,20,'skeleton']].forEach(([x,y,type])=>{
                if(map[y][x]===T.PATH||map[y][x]===T.FLOOR){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[47][25]=T.BOSS; monsters.push({x:25,y:47,type:'archAngel',name:'👼大天使',color:'#FFD700',isBoss:true});
            // 宝箱
            [[5,5,1500],[45,5,1600],[5,45,1550],[45,45,1700],[25,25,1800]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.PATH||map[y][x]===T.FLOOR){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:25,y:22,name:'天界守卫',color:'#FFD700',hairColor:'#fff',type:'talk',
                dialog:'欢迎来到天空之城。这里是凡界与神界的交界。大天使守护着通往更高层的大门。'});
            // 北出口 → 冰封雪原
            for(let x=23;x<28;x++){map[0][x]=T.EXIT;exits.push({x,y:0,target:'snow',spawnX:30,spawnY:48});}
            // 南出口 → 时空裂隙
            for(let x=23;x<28;x++){map[49][x]=T.EXIT;exits.push({x,y:49,target:'rift',spawnX:20,spawnY:1});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 深渊之门 Lv.80-90 ========
    abyss: {
        name: '👿 深渊之门', level: 'Lv.80-90', safe: false,
        width: 50, height: 50, bgColor: '#050005',
        encounterRate: 3,
        generate() {
            const map = makeGrid(50, 50, T.FLOOR);
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 50, 50);
            // 深渊裂缝（LAVA）
            for(let y=2;y<48;y++) for(let x=2;x<48;x++) { if(Math.random()<0.15) map[y][x]=T.LAVA; }
            // 通道
            for(let x=1;x<49;x++){map[25][x]=T.FLOOR;map[24][x]=T.FLOOR;map[26][x]=T.FLOOR;}
            for(let y=1;y<49;y++){map[y][25]=T.FLOOR;map[y][24]=T.FLOOR;map[y][26]=T.FLOOR;}
            // 暗矿
            for(let i=0;i<10;i++){const x=2+Math.floor(Math.random()*46),y=2+Math.floor(Math.random()*46);if(map[y][x]===T.FLOOR) map[y][x]=T.ORE;}
            // 怪物（大量）
            [[10,10,'gargoyle'],[20,8,'skeleton'],[40,10,'batSwarm'],[8,35,'gargoyle'],[35,40,'skeleton'],[25,42,'batSwarm'],[42,25,'gargoyle'],[15,20,'skeleton'],[30,15,'gargoyle'],[10,40,'skeleton']].forEach(([x,y,type])=>{
                if(map[y][x]===T.FLOOR){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[47][25]=T.BOSS; monsters.push({x:25,y:47,type:'abyssLord',name:'👿深渊领主',color:'#8B0000',isBoss:true});
            // 宝箱
            [[5,5,2000],[45,5,2200],[5,45,2100],[45,45,2500],[25,25,2800]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.FLOOR){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:25,y:22,name:'堕天使',color:'#4B0082',hairColor:'#8B0000',type:'talk',
                dialog:'你来到了深渊的入口...回头还来得及。深渊领主的力量不是凡人能抵抗的。'});
            // 西出口 → 冰封雪原
            for(let y=23;y<28;y++){map[y][0]=T.EXIT;exits.push({x:0,y,target:'snow',spawnX:58,spawnY:25});}
            // 南出口 → 时空裂隙
            for(let x=23;x<28;x++){map[49][x]=T.EXIT;exits.push({x,y:49,target:'rift',spawnX:20,spawnY:1});}
            // 东出口 → 神域外围
            for(let y=23;y<28;y++){map[y][49]=T.EXIT;exits.push({x:49,y,target:'divine',spawnX:1,spawnY:20});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 时空裂隙 Lv.85-95 ========
    rift: {
        name: '🌀 时空裂隙', level: 'Lv.85-95', safe: false,
        width: 40, height: 40, bgColor: '#0a000a',
        encounterRate: 3,
        generate() {
            const map = makeGrid(40, 40, T.FLOOR);
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 40, 40);
            // 扭曲空间（随机瓷砖）
            for(let y=2;y<38;y++) for(let x=2;x<38;x++) {
                const r=Math.random();
                if(r<0.1) map[y][x]=T.LAVA;
                else if(r<0.15) map[y][x]=T.WATER;
                else if(r<0.2) map[y][x]=T.ORE;
            }
            // 主路
            for(let x=1;x<39;x++){map[20][x]=T.PATH;map[19][x]=T.PATH;}
            for(let y=1;y<39;y++){map[y][20]=T.PATH;map[y][19]=T.PATH;}
            // 怪物
            [[8,8,'gargoyle'],[20,5,'skeleton'],[32,10,'batSwarm'],[8,30,'gargoyle'],[30,30,'skeleton'],[20,35,'batSwarm'],[32,20,'gargoyle'],[10,15,'skeleton']].forEach(([x,y,type])=>{
                if(map[y][x]===T.FLOOR||map[y][x]===T.PATH){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[37][20]=T.BOSS; monsters.push({x:20,y:37,type:'timeDragon',name:'🐉时空龙',color:'#9400D3',isBoss:true});
            // 宝箱
            [[3,3,3000],[37,3,3200],[3,37,3100],[37,37,3500],[20,10,3800]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.FLOOR||map[y][x]===T.PATH){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:20,y:18,name:'时空旅人',color:'#9400D3',hairColor:'#E0E0E0',type:'talk',
                dialog:'时空在这里扭曲...过去与未来交错。时空龙掌控着维度的平衡。'});
            // 北出口 → 天空之城
            for(let x=18;x<23;x++){map[0][x]=T.EXIT;exits.push({x,y:0,target:'skyCity',spawnX:25,spawnY:48});}
            // 北东出口 → 深渊
            for(let x=30;x<35;x++){map[0][x]=T.EXIT;exits.push({x,y:0,target:'abyss',spawnX:25,spawnY:48});}
            // 南出口 → 神域外围
            for(let x=18;x<23;x++){map[39][x]=T.EXIT;exits.push({x,y:39,target:'divine',spawnX:20,spawnY:1});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 神域外围 Lv.90-98 ========
    divine: {
        name: '✨ 神域外围', level: 'Lv.90-98', safe: false,
        width: 50, height: 50, bgColor: '#0a0a20',
        encounterRate: 3,
        generate() {
            const map = makeGrid(50, 50, T.PATH); // 神殿石板
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 50, 50);
            // 神殿柱子
            for(let y=5;y<45;y+=5) for(let x=5;x<45;x+=5) { map[y][x]=T.WALL; }
            // 水池
            for(let y=20;y<30;y++) for(let x=20;x<30;x++) map[y][x]=T.WATER;
            // 通道保留
            for(let x=1;x<49;x++) map[25][x]=T.PATH;
            for(let y=1;y<49;y++) map[y][25]=T.PATH;
            // 矿石（神圣水晶）
            for(let i=0;i<25;i++){const x=2+Math.floor(Math.random()*46),y=2+Math.floor(Math.random()*46);if(map[y][x]===T.PATH) map[y][x]=T.ORE;}
            // 怪物
            [[10,10,'gargoyle'],[20,8,'skeleton'],[40,10,'batSwarm'],[8,40,'gargoyle'],[40,40,'skeleton'],[15,30,'batSwarm'],[35,15,'gargoyle'],[25,42,'skeleton']].forEach(([x,y,type])=>{
                if(map[y][x]===T.PATH){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[47][25]=T.BOSS; monsters.push({x:25,y:47,type:'divineAvatar',name:'👑神之化身',color:'#FFD700',isBoss:true});
            // 宝箱
            [[5,5,5000],[45,5,5500],[5,45,5200],[45,45,6000],[25,15,5800]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.PATH){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:25,y:23,name:'神官',color:'#FFD700',hairColor:'#fff',type:'shop',
                dialog:'这是神域的入口。勇者，你需要准备充分才能面对神之化身。需要补给吗？'});
            // 西出口 → 深渊
            for(let y=23;y<28;y++){map[y][0]=T.EXIT;exits.push({x:0,y,target:'abyss',spawnX:48,spawnY:25});}
            // 北出口 → 时空裂隙
            for(let x=23;x<28;x++){map[0][x]=T.EXIT;exits.push({x,y:0,target:'rift',spawnX:20,spawnY:38});}
            // 南出口 → 龙之巢穴
            for(let x=23;x<28;x++){map[49][x]=T.EXIT;exits.push({x,y:49,target:'dragonRealm',spawnX:25,spawnY:1});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 龙之巢穴 Lv.95-99 ========
    dragonRealm: {
        name: '🐲 龙之巢穴', level: 'Lv.95-99', safe: false,
        width: 50, height: 50, bgColor: '#1a0000',
        encounterRate: 2,
        generate() {
            const map = makeGrid(50, 50, T.FLOOR);
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 50, 50);
            // 龙骨和熔岩
            for(let y=2;y<48;y++) for(let x=2;x<48;x++) {
                const r=Math.random();
                if(r<0.15) map[y][x]=T.LAVA;
                else if(r<0.2) map[y][x]=T.WALL;
            }
            // 通道
            for(let x=1;x<49;x++){map[25][x]=T.FLOOR;map[24][x]=T.FLOOR;map[26][x]=T.FLOOR;}
            for(let y=1;y<49;y++){map[y][25]=T.FLOOR;map[y][24]=T.FLOOR;map[y][26]=T.FLOOR;}
            // 宝矿
            for(let i=0;i<20;i++){const x=2+Math.floor(Math.random()*46),y=2+Math.floor(Math.random()*46);if(map[y][x]===T.FLOOR) map[y][x]=T.ORE;}
            // 怪物
            [[10,10,'gargoyle'],[20,8,'skeleton'],[40,10,'batSwarm'],[8,40,'gargoyle'],[40,40,'skeleton'],[15,30,'batSwarm'],[35,15,'gargoyle'],[25,42,'skeleton'],[30,20,'gargoyle'],[12,25,'skeleton']].forEach(([x,y,type])=>{
                if(map[y][x]===T.FLOOR){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // BOSS
            map[47][25]=T.BOSS; monsters.push({x:25,y:47,type:'dragonKing',name:'🐲龙王',color:'#FF4500',isBoss:true});
            // 宝箱
            [[5,5,8000],[45,5,8500],[5,45,8200],[45,45,9000],[25,25,10000]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.FLOOR){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:25,y:23,name:'古龙使者',color:'#FF4500',hairColor:'#FFD700',type:'talk',
                dialog:'你终于来了...龙王在巢穴最深处等待着最强的勇者。击败龙王后，前方就是魔王城！'});
            // 北出口 → 神域
            for(let x=23;x<28;x++){map[0][x]=T.EXIT;exits.push({x,y:0,target:'divine',spawnX:25,spawnY:48});}
            // 南出口 → 魔王城
            for(let x=23;x<28;x++){map[49][x]=T.EXIT;exits.push({x,y:49,target:'demonCastle',spawnX:25,spawnY:1});}
            return {map,npcs,chests,monsters,exits};
        }
    },

    // ======== 魔王城 Lv.99 最终区域 ========
    demonCastle: {
        name: '👹 魔王城', level: 'Lv.99 终极', safe: false,
        width: 60, height: 60, bgColor: '#000000',
        encounterRate: 2,
        generate() {
            const map = makeGrid(60, 60, T.FLOOR);
            const npcs = [], chests = [], monsters = [], exits = [];
            borderWall(map, 60, 60);
            // 宏大的城堡结构
            for(let ry=0;ry<6;ry++) for(let rx=0;rx<6;rx++) {
                const bx=rx*10+1,by=ry*10+1;
                if(Math.random()<0.5) makeBuilding(map,bx,by,9,9);
            }
            // 走廊
            for(let x=1;x<59;x++){map[10][x]=T.PATH;map[20][x]=T.PATH;map[30][x]=T.PATH;map[40][x]=T.PATH;map[50][x]=T.PATH;}
            for(let y=1;y<59;y++){map[y][10]=T.PATH;map[y][20]=T.PATH;map[y][30]=T.PATH;map[y][40]=T.PATH;map[y][50]=T.PATH;}
            // 血色地毯（通向王座）
            for(let y=1;y<59;y++){map[y][30]=T.PATH;map[y][29]=T.PATH;map[y][31]=T.PATH;}
            // 暗黑熔岩装饰
            for(let y=2;y<58;y++) for(let x=2;x<58;x++) { if(map[y][x]===T.FLOOR&&Math.random()<0.08) map[y][x]=T.LAVA; }
            // 怪物（超多）
            [[10,10,'gargoyle'],[20,8,'skeleton'],[40,10,'batSwarm'],[8,40,'gargoyle'],[50,40,'skeleton'],[20,50,'batSwarm'],[45,25,'gargoyle'],[15,30,'skeleton'],[35,15,'gargoyle'],[50,50,'skeleton'],[10,50,'batSwarm'],[40,55,'gargoyle']].forEach(([x,y,type])=>{
                if(map[y][x]===T.FLOOR||map[y][x]===T.PATH){map[y][x]=T.MONSTER;monsters.push({x,y,type,name:monsterName(type),color:monsterColor(type)});}
            });
            // 最终BOSS
            map[57][30]=T.BOSS; monsters.push({x:30,y:57,type:'demonEmperor',name:'👹混沌魔王',color:'#8B0000',isBoss:true});
            // 宝箱
            [[3,3,15000],[57,3,16000],[3,57,15500],[57,57,18000],[30,30,20000],[15,15,12000],[45,45,14000]].forEach(([x,y,gold])=>{
                if(map[y][x]===T.FLOOR||map[y][x]===T.PATH){map[y][x]=T.CHEST;chests.push({x,y,opened:false,gold});}
            });
            npcs.push({x:30,y:28,name:'叛变的魔族将军',color:'#8B0000',hairColor:'#FFD700',type:'shop',
                dialog:'我背叛了魔王...勇者，这是你最后的补给机会。混沌魔王就在王座厅！'});
            // 北出口 → 龙之巢穴
            for(let x=28;x<33;x++){map[0][x]=T.EXIT;exits.push({x,y:0,target:'dragonRealm',spawnX:25,spawnY:48});}
            return {map,npcs,chests,monsters,exits};
        }
    }
};

// 怪物名/色
function monsterName(t) {
    return {slime:'史莱姆',mushroom:'毒蘑菇',bat:'蝙蝠',wolf:'灰狼',treant:'树精',snake:'毒蛇',
        batSwarm:'蝙蝠群',gargoyle:'石像鬼',skeleton:'骷髅兵',skeletonKing:'💀骷髅王',
        diamondGiant:'💎钻石巨人',lichKing:'🧟巫妖王',pharaoh:'👳法老王',swampQueen:'🧙沼泽女王',
        flameLord:'🔥火焰领主',vampireCount:'🧛吸血鬼伯爵',deathKnight:'💀死亡骑士',
        iceQueen:'👸冰霜女王',archAngel:'👼大天使',abyssLord:'👿深渊领主',
        timeDragon:'🐉时空龙',divineAvatar:'👑神之化身',dragonKing:'🐲龙王',
        demonEmperor:'👹混沌魔王'}[t]||t;
}
function monsterColor(t) {
    return {slime:'#44dd44',mushroom:'#dd4444',bat:'#9944cc',wolf:'#888',treant:'#6b4226',snake:'#44cc44',
        batSwarm:'#333',gargoyle:'#777',skeleton:'#ddd',skeletonKing:'#fff',
        diamondGiant:'#00ffff',lichKing:'#9966ff',pharaoh:'#FFD700',swampQueen:'#00cc66',
        flameLord:'#ff4400',vampireCount:'#880000',deathKnight:'#4B0082',
        iceQueen:'#87CEEB',archAngel:'#FFD700',abyssLord:'#8B0000',
        timeDragon:'#9400D3',divineAvatar:'#FFD700',dragonKing:'#FF4500',
        demonEmperor:'#8B0000'}[t]||'#fff';
}

// ======== 地图工具函数 ========
function makeGrid(w, h, fill) { return Array.from({length:h}, ()=>Array(w).fill(fill)); }
function borderWall(map, w, h) {
    for(let x=0;x<w;x++) { map[0][x]=T.WALL; map[h-1][x]=T.WALL; }
    for(let y=0;y<h;y++) { map[y][0]=T.WALL; map[y][w-1]=T.WALL; }
}
function makeBuilding(map, bx, by, bw, bh) {
    for(let y=by;y<by+bh;y++) for(let x=bx;x<bx+bw;x++) {
        if(y===by||y===by+bh-1||x===bx||x===bx+bw-1) map[y][x]=T.WALL;
        else map[y][x]=T.FLOOR;
    }
    // 门
    map[by+bh-1][bx+Math.floor(bw/2)] = T.FLOOR;
}

// ======== 调色板(按区域) ========
const PALETTES = {
    village: { grass1:'#4a7c4e', grass2:'#3d6b40', path1:'#c4a060', path2:'#b09050', floor1:'#8B7355', floor2:'#7a6245' },
    plains: { grass1:'#5a9c5e', grass2:'#4d8b50', path1:'#d4b070', path2:'#c0a060', flower:['#ff6b6b','#ffdb4d','#ff9ff3','#fff'] },
    forest: { leaf1:'#2a5a2e', leaf2:'#1e4a22', grass1:'#3a6a3e', grass2:'#2e5a32' },
    cave: { floor1:'#3a3a3a', floor2:'#2e2e2e', lava1:'#ff4400', lava2:'#ff6622', ore:'#44aaff' },
    mine: { floor1:'#2a2a2a', floor2:'#222', lava1:'#ff4400', lava2:'#ff6622', ore:'#00ccff' },
    crypt: { floor1:'#2a2a3a', floor2:'#1e1e2e', path1:'#6a6a8a', path2:'#5a5a7a', ore:'#9966ff' },
    desert: { grass1:'#d4a040', grass2:'#c49030', path1:'#e0c070', path2:'#d0b060', lava1:'#c49030', lava2:'#b48020' },
    swamp: { grass1:'#3a5a2a', grass2:'#2e4a1e', path1:'#6a7a5a', path2:'#5a6a4a' },
    volcano: { floor1:'#3a2020', floor2:'#2e1818', lava1:'#ff2200', lava2:'#ff4400', ore:'#ff8800' },
    darkForest: { leaf1:'#1a2a1e', leaf2:'#0e1e12', grass1:'#2a3a2e', grass2:'#1e2e22' },
    castle: { floor1:'#3a3a4a', floor2:'#2e2e3e', path1:'#8B0000', path2:'#6B0000' },
    snow: { grass1:'#c8d8e8', grass2:'#b8c8d8', path1:'#a0b0c0', path2:'#90a0b0' },
    skyCity: { path1:'#b0c4de', path2:'#a0b4ce', floor1:'#c0d4ee', floor2:'#b0c4de', ore:'#FFD700' },
    abyss: { floor1:'#1a0a1a', floor2:'#0e040e', lava1:'#880044', lava2:'#aa0066', ore:'#ff00ff' },
    rift: { floor1:'#2a1a3a', floor2:'#1e0e2e', path1:'#6a4a8a', path2:'#5a3a7a', lava1:'#9900ff', lava2:'#bb22ff', ore:'#00ffff' },
    divine: { path1:'#e0d0a0', path2:'#d0c090', ore:'#FFD700' },
    dragonRealm: { floor1:'#3a1a1a', floor2:'#2e0e0e', lava1:'#ff3300', lava2:'#ff5500', ore:'#ff4400' },
    demonCastle: { floor1:'#1a0a0a', floor2:'#0e0404', path1:'#660000', path2:'#440000', lava1:'#aa0000', lava2:'#cc2200' }
};

// ======== 像素绘制 ========
function drawTile(ctx, tile, sx, sy, mx, my, mapId) {
    const s = W.TILE;
    const pal = PALETTES[mapId] || PALETTES.village;
    
    switch(tile) {
        case T.GRASS:
            ctx.fillStyle = (mx+my)%2 ? (pal.grass1||'#4a7c4e') : (pal.grass2||'#3d6b40');
            ctx.fillRect(sx,sy,s,s);
            // 花草装饰
            const seed = (mx*7+my*13)%17;
            if(seed<3) { ctx.fillStyle='#5a8c5a'; ctx.fillRect(sx+(seed*5)%20+6,sy+20,2,5); }
            if(seed>14 && pal.flower) {
                ctx.fillStyle=pal.flower[seed%pal.flower.length];
                ctx.fillRect(sx+(seed*3)%22+6,sy+(seed*5)%14+8,3,3);
            }
            break;
        case T.LEAF: // 森林落叶地面
            ctx.fillStyle=(mx+my)%2?(pal.leaf1||'#2a5a2e'):(pal.leaf2||'#1e4a22');
            ctx.fillRect(sx,sy,s,s);
            if((mx*11+my*7)%9<2) { ctx.fillStyle='#8B6914'; ctx.fillRect(sx+8+((mx*3)%12),sy+12,4,3); }
            break;
        case T.PATH:
            ctx.fillStyle=(mx+my)%2?(pal.path1||'#c4a060'):(pal.path2||'#b09050');
            ctx.fillRect(sx,sy,s,s);
            if((mx*11+my*7)%13<2) { ctx.fillStyle='#9a8a6a'; ctx.fillRect(sx+((mx*3)%20)+4,sy+12,3,2); }
            break;
        case T.FLOOR:
            ctx.fillStyle=(mx+my)%2?(pal.floor1||'#3a3a3a'):(pal.floor2||'#2e2e2e');
            ctx.fillRect(sx,sy,s,s);
            break;
        case T.WALL:
            ctx.fillStyle='#5a5a5a'; ctx.fillRect(sx,sy,s,s);
            ctx.fillStyle='#444'; ctx.fillRect(sx,sy+7,s,1); ctx.fillRect(sx,sy+15,s,1); ctx.fillRect(sx,sy+23,s,1);
            ctx.fillStyle='#3a3a3a'; ctx.fillRect(sx+((my%2)*10)+6,sy,1,8); ctx.fillRect(sx+((my%2)*10)+18,sy+8,1,8);
            ctx.fillStyle='#6a6a6a'; ctx.fillRect(sx+2,sy+2,4,3);
            break;
        case T.TREE:
            drawTile(ctx,mapId==='forest'?T.LEAF:T.GRASS,sx,sy,mx,my,mapId);
            ctx.fillStyle='#5c3a1e'; ctx.fillRect(sx+13,sy+20,6,12);
            ctx.fillStyle=mapId==='forest'?'#1a5a1e':'#2d7a32';
            ctx.fillRect(sx+4,sy+2,24,8); ctx.fillRect(sx+2,sy+8,28,10);
            ctx.fillStyle=mapId==='forest'?'#2a7a2e':'#3a9a42';
            ctx.fillRect(sx+8,sy+4,6,4);
            break;
        case T.WATER:
            ctx.fillStyle='#3b6cc4'; ctx.fillRect(sx,sy,s,s);
            const wave=Math.sin(W.time*0.03+mx*0.5+my*0.3);
            ctx.fillStyle='#4a7cd8'; ctx.fillRect(sx,sy+8+Math.round(wave*3),s,4);
            ctx.fillStyle='#7eb8f0'; ctx.fillRect(sx+6+Math.round(Math.sin(W.time*0.02+mx)*4),sy+4,6,2);
            break;
        case T.LAVA:
            ctx.fillStyle=(pal.lava1||'#ff4400'); ctx.fillRect(sx,sy,s,s);
            const lwave=Math.sin(W.time*0.04+mx+my*0.7);
            ctx.fillStyle=(pal.lava2||'#ff6622'); ctx.fillRect(sx,sy+6+Math.round(lwave*3),s,5);
            ctx.fillStyle='#ffaa00'; ctx.fillRect(sx+10+Math.round(lwave*4),sy+3,4,3);
            break;
        case T.ORE:
            drawTile(ctx,T.FLOOR,sx,sy,mx,my,mapId);
            ctx.fillStyle=(pal.ore||'#44aaff');
            const glow=0.5+Math.sin(W.time*0.05+mx+my)*0.5;
            ctx.globalAlpha=glow; ctx.fillRect(sx+10,sy+10,12,12); ctx.fillRect(sx+12,sy+8,8,16);
            ctx.globalAlpha=1; ctx.fillStyle='#88ddff'; ctx.fillRect(sx+14,sy+12,4,4);
            break;
        case T.FENCE:
            drawTile(ctx,T.GRASS,sx,sy,mx,my,mapId);
            ctx.fillStyle='#8B6914'; ctx.fillRect(sx+2,sy+10,28,4); ctx.fillRect(sx+2,sy+20,28,4);
            ctx.fillRect(sx+4,sy+6,4,20); ctx.fillRect(sx+24,sy+6,4,20);
            break;
        case T.EXIT:
            drawTile(ctx,T.PATH,sx,sy,mx,my,mapId);
            const ea=0.3+Math.sin(W.time*0.06)*0.3;
            ctx.fillStyle=`rgba(255,215,0,${ea})`; ctx.fillRect(sx,sy,s,s);
            ctx.fillStyle='#FFD700'; ctx.font='16px serif';
            ctx.textAlign='center'; ctx.fillText('▼',sx+s/2,sy+s/2+6); ctx.textAlign='left';
            break;
        case T.CHEST:
            drawTile(ctx,mapId==='cave'?T.FLOOR:T.GRASS,sx,sy,mx,my,mapId);
            const ch=W.chests.find(c=>c.x===mx&&c.y===my);
            if(ch&&ch.opened) break;
            ctx.fillStyle='#8B6914'; ctx.fillRect(sx+6,sy+14,20,14);
            ctx.fillStyle='#DAA520'; ctx.fillRect(sx+4,sy+8,24,8); ctx.fillRect(sx+6,sy+6,20,4);
            ctx.fillStyle='#C0C0C0'; ctx.fillRect(sx+14,sy+16,4,4);
            ctx.fillStyle='#f0d060'; ctx.fillRect(sx+8,sy+8,3,2);
            break;
        case T.MONSTER: case T.BOSS:
            drawTile(ctx,mapId==='cave'?T.FLOOR:mapId==='forest'?T.LEAF:T.GRASS,sx,sy,mx,my,mapId);
            const mon=W.monsters.find(m=>m.x===mx&&m.y===my);
            if(mon) drawMonsterSprite(ctx,sx,sy,mon);
            break;
        default:
            ctx.fillStyle = pal.floor1 || '#3a3a3a';
            ctx.fillRect(sx, sy, s, s);
            break;
    }
}

function drawMonsterSprite(ctx, sx, sy, mon) {
    const bounce=Math.abs(Math.sin(W.time*0.05+(mon.x||0)))*3;
    const by=sy+8-bounce;
    switch(mon.type) {
        case 'slime':
            ctx.fillStyle='#44dd44'; ctx.fillRect(sx+8,by+10,16,12); ctx.fillRect(sx+6,by+14,20,6); ctx.fillRect(sx+10,by+6,12,6);
            ctx.fillStyle='#88ff88'; ctx.fillRect(sx+10,by+8,4,3);
            ctx.fillStyle='#fff'; ctx.fillRect(sx+11,by+12,4,3); ctx.fillRect(sx+19,by+12,4,3);
            ctx.fillStyle='#222'; ctx.fillRect(sx+12,by+13,2,2); ctx.fillRect(sx+20,by+13,2,2);
            break;
        case 'mushroom':
            ctx.fillStyle='#8B6914'; ctx.fillRect(sx+14,by+18,4,8);
            ctx.fillStyle='#dd3333'; ctx.fillRect(sx+8,by+8,16,12); ctx.fillRect(sx+10,by+4,12,6);
            ctx.fillStyle='#fff'; ctx.fillRect(sx+10,by+8,3,3); ctx.fillRect(sx+18,by+10,3,3); ctx.fillRect(sx+14,by+6,2,2);
            ctx.fillStyle='#222'; ctx.fillRect(sx+12,by+16,2,2); ctx.fillRect(sx+18,by+16,2,2);
            break;
        case 'bat':
            ctx.fillStyle='#7744aa';
            ctx.fillRect(sx+14,by+12,4,6);
            const wingF=Math.sin(W.time*0.1+mon.x)*4;
            ctx.fillRect(sx+4+wingF,by+10,10,4); ctx.fillRect(sx+18-wingF,by+10,10,4);
            ctx.fillStyle='#ff4444'; ctx.fillRect(sx+14,by+14,2,2); ctx.fillRect(sx+18,by+14,2,2);
            break;
        case 'wolf':
            ctx.fillStyle='#888'; ctx.fillRect(sx+6,by+14,20,10); ctx.fillRect(sx+4,by+12,8,6);
            ctx.fillStyle='#666'; ctx.fillRect(sx+4,by+12,6,4);
            ctx.fillStyle='#fff'; ctx.fillRect(sx+5,by+13,2,2);
            ctx.fillStyle='#ff4444'; ctx.fillRect(sx+4,by+17,3,1);
            ctx.fillStyle='#888'; ctx.fillRect(sx+22,by+10,4,4);
            break;
        case 'treant':
            ctx.fillStyle='#5c3a1e'; ctx.fillRect(sx+12,by+14,8,12);
            ctx.fillStyle='#3a7a3e'; ctx.fillRect(sx+6,by+4,20,14); ctx.fillRect(sx+8,by+2,16,6);
            ctx.fillStyle='#ff4444'; ctx.fillRect(sx+12,by+10,3,3); ctx.fillRect(sx+18,by+10,3,3);
            break;
        case 'snake':
            ctx.fillStyle='#44aa44';
            for(let i=0;i<5;i++) { const sx2=sx+8+i*4+Math.sin(W.time*0.08+i)*2; ctx.fillRect(sx2,by+16+Math.sin(i*0.8)*3,4,4); }
            ctx.fillStyle='#ff4444'; ctx.fillRect(sx+8,by+14,2,2);
            ctx.fillStyle='#227722'; ctx.fillRect(sx+6,by+12,8,6);
            break;
        case 'batSwarm':
            for(let i=0;i<3;i++) {
                const ox=i*8-8, oy=Math.sin(W.time*0.1+i*2)*4;
                ctx.fillStyle='#333'; ctx.fillRect(sx+14+ox,by+12+oy,4,4);
                ctx.fillRect(sx+10+ox+Math.sin(W.time*0.12+i)*3,by+10+oy,4,2);
                ctx.fillRect(sx+18+ox-Math.sin(W.time*0.12+i)*3,by+10+oy,4,2);
            }
            break;
        case 'gargoyle':
            ctx.fillStyle='#666'; ctx.fillRect(sx+10,by+10,12,14); ctx.fillRect(sx+12,by+6,8,6);
            ctx.fillStyle='#888'; ctx.fillRect(sx+6,by+12,6,8); ctx.fillRect(sx+20,by+12,6,8);
            ctx.fillStyle='#ff4444'; ctx.fillRect(sx+13,by+8,3,3); ctx.fillRect(sx+18,by+8,3,3);
            break;
        case 'skeleton':
            ctx.fillStyle='#ddd'; ctx.fillRect(sx+12,by+6,8,8); ctx.fillRect(sx+10,by+14,12,10);
            ctx.fillStyle='#222'; ctx.fillRect(sx+13,by+8,2,3); ctx.fillRect(sx+17,by+8,2,3); ctx.fillRect(sx+14,by+12,4,1);
            ctx.fillStyle='#aaa'; ctx.fillRect(sx+8,by+16,4,8); ctx.fillRect(sx+20,by+16,4,8);
            break;
        case 'skeletonKing':
            ctx.fillStyle='#eee'; ctx.fillRect(sx+10,by+4,12,10); ctx.fillRect(sx+8,by+14,16,12);
            ctx.fillStyle='#FFD700'; ctx.fillRect(sx+9,by+1,14,5); ctx.fillRect(sx+11,by-1,3,3); ctx.fillRect(sx+18,by-1,3,3); ctx.fillRect(sx+15,by-2,2,3);
            ctx.fillStyle='#ff0000'; ctx.fillRect(sx+12,by+7,3,3); ctx.fillRect(sx+18,by+7,3,3);
            ctx.fillStyle='#888'; ctx.fillRect(sx+4,by+16,6,10); ctx.fillRect(sx+22,by+14,4,14);
            break;
        // ===== 新区域BOSS精灵 =====
        case 'diamondGiant':
            ctx.fillStyle='#00ffff'; ctx.fillRect(sx+8,by+4,16,20);
            ctx.fillStyle='#88ffff'; ctx.fillRect(sx+10,by+6,4,4); ctx.fillRect(sx+18,by+6,4,4);
            ctx.fillStyle='#00cccc'; ctx.fillRect(sx+4,by+10,6,12); ctx.fillRect(sx+22,by+10,6,12);
            ctx.fillStyle='#fff'; ctx.fillRect(sx+12,by+8,2,2); ctx.fillRect(sx+18,by+8,2,2);
            ctx.fillStyle='#004444'; ctx.fillRect(sx+14,by+14,4,2);
            break;
        case 'lichKing':
            ctx.fillStyle='#9966ff'; ctx.fillRect(sx+10,by+6,12,14);
            ctx.fillStyle='#6633cc'; ctx.fillRect(sx+8,by+2,16,6);
            ctx.fillStyle='#ff00ff'; ctx.fillRect(sx+12,by+8,3,3); ctx.fillRect(sx+17,by+8,3,3);
            ctx.fillStyle='#330066'; ctx.fillRect(sx+6,by+12,4,10); ctx.fillRect(sx+22,by+12,4,10);
            // 法杖
            ctx.fillStyle='#FFD700'; ctx.fillRect(sx+24,by+4,2,16); ctx.fillRect(sx+22,by+2,6,4);
            break;
        case 'pharaoh':
            ctx.fillStyle='#FFD700'; ctx.fillRect(sx+10,by+2,12,6); // 头冠
            ctx.fillStyle='#DAA520'; ctx.fillRect(sx+8,by+0,16,4);
            ctx.fillStyle='#DEB887'; ctx.fillRect(sx+11,by+6,10,10); // 脸
            ctx.fillStyle='#000'; ctx.fillRect(sx+13,by+8,2,2); ctx.fillRect(sx+17,by+8,2,2);
            ctx.fillStyle='#FFD700'; ctx.fillRect(sx+10,by+16,12,10); // 身体
            break;
        case 'swampQueen':
            ctx.fillStyle='#00cc66'; ctx.fillRect(sx+10,by+8,12,14);
            ctx.fillStyle='#228B22'; ctx.fillRect(sx+8,by+4,16,6);
            ctx.fillStyle='#7CFC00'; ctx.fillRect(sx+6,by+10,4,8); ctx.fillRect(sx+22,by+10,4,8);
            ctx.fillStyle='#ff00ff'; ctx.fillRect(sx+12,by+10,3,2); ctx.fillRect(sx+17,by+10,3,2);
            // 藤蔓
            ctx.fillStyle='#006400'; for(let i=0;i<3;i++) ctx.fillRect(sx+4+i*10,by+20+Math.sin(W.time*0.05+i)*2,2,6);
            break;
        case 'flameLord':
            ctx.fillStyle='#ff4400'; ctx.fillRect(sx+10,by+8,12,14);
            ctx.fillStyle='#ff8800'; ctx.fillRect(sx+8,by+4,16,8);
            ctx.fillStyle='#ffcc00'; ctx.fillRect(sx+12,by+2,8,4);
            ctx.fillStyle='#fff'; ctx.fillRect(sx+12,by+10,3,3); ctx.fillRect(sx+17,by+10,3,3);
            // 火焰光环
            const fa=Math.sin(W.time*0.08)*2;
            ctx.fillStyle='rgba(255,100,0,0.5)'; ctx.fillRect(sx+4+fa,by+2,4,6); ctx.fillRect(sx+24-fa,by+2,4,6);
            break;
        case 'vampireCount':
            ctx.fillStyle='#880000'; ctx.fillRect(sx+10,by+6,12,14);
            ctx.fillStyle='#1a0a0a'; ctx.fillRect(sx+6,by+8,20,12); // 斗篷
            ctx.fillStyle='#fff'; ctx.fillRect(sx+11,by+4,10,8); // 脸
            ctx.fillStyle='#ff0000'; ctx.fillRect(sx+13,by+8,2,2); ctx.fillRect(sx+17,by+8,2,2);
            ctx.fillStyle='#fff'; ctx.fillRect(sx+14,by+12,1,2); ctx.fillRect(sx+17,by+12,1,2); // 獠牙
            break;
        case 'deathKnight':
            ctx.fillStyle='#4B0082'; ctx.fillRect(sx+10,by+8,12,14);
            ctx.fillStyle='#2a0040'; ctx.fillRect(sx+8,by+4,16,8);
            ctx.fillStyle='#ff0000'; ctx.fillRect(sx+12,by+7,3,2); ctx.fillRect(sx+17,by+7,3,2);
            ctx.fillStyle='#666'; ctx.fillRect(sx+22,by+6,4,14); // 剑
            ctx.fillStyle='#333'; ctx.fillRect(sx+20,by+18,8,2); // 剑柄
            break;
        case 'iceQueen':
            ctx.fillStyle='#87CEEB'; ctx.fillRect(sx+10,by+8,12,14);
            ctx.fillStyle='#E0FFFF'; ctx.fillRect(sx+11,by+4,10,8); // 脸
            ctx.fillStyle='#B0E0E6'; ctx.fillRect(sx+8,by+0,16,6); // 冰冠
            ctx.fillStyle='#4169E1'; ctx.fillRect(sx+13,by+8,2,2); ctx.fillRect(sx+17,by+8,2,2);
            ctx.fillStyle='#00BFFF'; ctx.fillRect(sx+6,by+10,4,10); ctx.fillRect(sx+22,by+10,4,10);
            break;
        case 'archAngel':
            ctx.fillStyle='#FFD700'; ctx.fillRect(sx+10,by+8,12,14);
            ctx.fillStyle='#fff'; ctx.fillRect(sx+11,by+4,10,8);
            ctx.fillStyle='#FFD700'; ctx.fillRect(sx+10,by+1,12,4); // 光环
            ctx.fillStyle='#4169E1'; ctx.fillRect(sx+13,by+8,2,2); ctx.fillRect(sx+17,by+8,2,2);
            // 翅膀
            ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.fillRect(sx+2,by+6,8,12); ctx.fillRect(sx+22,by+6,8,12);
            break;
        case 'abyssLord':
            ctx.fillStyle='#8B0000'; ctx.fillRect(sx+8,by+6,16,16);
            ctx.fillStyle='#4B0000'; ctx.fillRect(sx+6,by+2,20,8);
            ctx.fillStyle='#ff0000'; ctx.fillRect(sx+12,by+6,3,3); ctx.fillRect(sx+17,by+6,3,3);
            ctx.fillStyle='#440000'; ctx.fillRect(sx+4,by+8,4,12); ctx.fillRect(sx+24,by+8,4,12);
            // 暗黑光环
            ctx.fillStyle='rgba(128,0,0,0.3)'; ctx.fillRect(sx+2,by,28,24);
            break;
        case 'timeDragon':
            ctx.fillStyle='#9400D3'; ctx.fillRect(sx+8,by+4,16,18);
            ctx.fillStyle='#7B00B0'; ctx.fillRect(sx+6,by+2,8,6); // 头
            ctx.fillStyle='#ff00ff'; ctx.fillRect(sx+8,by+4,2,2); ctx.fillRect(sx+12,by+4,2,2);
            ctx.fillStyle='#6A00A0'; ctx.fillRect(sx+4,by+8,4,10); ctx.fillRect(sx+24,by+8,4,10); // 翅膀
            ctx.fillStyle='#9400D3'; ctx.fillRect(sx+14,by+20,4,6); // 尾巴
            break;
        case 'divineAvatar':
            ctx.fillStyle='#FFD700'; ctx.fillRect(sx+8,by+6,16,16);
            ctx.fillStyle='#fff'; ctx.fillRect(sx+10,by+2,12,8);
            ctx.fillStyle='#FFD700'; ctx.fillRect(sx+8,by-1,16,4); // 光环
            const glow2=0.5+Math.sin(W.time*0.06)*0.3;
            ctx.globalAlpha=glow2; ctx.fillStyle='#FFD700'; ctx.fillRect(sx+2,by,28,24);
            ctx.globalAlpha=1;
            ctx.fillStyle='#4169E1'; ctx.fillRect(sx+12,by+6,3,3); ctx.fillRect(sx+17,by+6,3,3);
            break;
        case 'dragonKing':
            ctx.fillStyle='#FF4500'; ctx.fillRect(sx+6,by+4,20,18);
            ctx.fillStyle='#CC3700'; ctx.fillRect(sx+4,by+2,10,6);
            ctx.fillStyle='#FFD700'; ctx.fillRect(sx+6,by+4,2,2); ctx.fillRect(sx+12,by+4,2,2);
            ctx.fillStyle='#8B0000'; ctx.fillRect(sx+2,by+6,4,14); ctx.fillRect(sx+26,by+6,4,14);
            ctx.fillStyle='#FF4500'; ctx.fillRect(sx+12,by+20,8,6);
            // 火焰呼吸
            const fb=Math.sin(W.time*0.1)*2;
            ctx.fillStyle='rgba(255,100,0,0.6)'; ctx.fillRect(sx+4+fb,by+8,3,2);
            break;
        case 'demonEmperor':
            ctx.fillStyle='#8B0000'; ctx.fillRect(sx+6,by+4,20,20);
            ctx.fillStyle='#4B0000'; ctx.fillRect(sx+4,by+0,24,8);
            ctx.fillStyle='#ff0000'; ctx.fillRect(sx+10,by+4,4,4); ctx.fillRect(sx+18,by+4,4,4);
            ctx.fillStyle='#660000'; ctx.fillRect(sx+2,by+6,4,14); ctx.fillRect(sx+26,by+6,4,14);
            // 恶魔之角
            ctx.fillStyle='#FFD700'; ctx.fillRect(sx+6,by-2,3,5); ctx.fillRect(sx+23,by-2,3,5);
            // 暗黑光环
            const da=0.3+Math.sin(W.time*0.04)*0.2;
            ctx.globalAlpha=da; ctx.fillStyle='#ff0000'; ctx.fillRect(sx,by-4,32,32);
            ctx.globalAlpha=1;
            break;
        default:
            ctx.fillStyle=mon.color||'#44dd44';
            ctx.beginPath(); ctx.arc(sx+16,sy+20,10,0,Math.PI*2); ctx.fill();
    }
}

function drawNPC(ctx, sx, sy, npc) {
    ctx.fillStyle=npc.color||'#4488cc'; ctx.fillRect(sx+10,sy+16,12,10);
    ctx.fillStyle='#ffdbac'; ctx.fillRect(sx+11,sy+6,10,10);
    ctx.fillStyle=npc.hairColor||'#553322'; ctx.fillRect(sx+10,sy+4,12,5); ctx.fillRect(sx+10,sy+6,2,4); ctx.fillRect(sx+20,sy+6,2,4);
    ctx.fillStyle='#222'; ctx.fillRect(sx+13,sy+10,2,2); ctx.fillRect(sx+17,sy+10,2,2);
    ctx.fillStyle='#553322'; ctx.fillRect(sx+10,sy+26,4,3); ctx.fillRect(sx+18,sy+26,4,3);
    // 名字
    ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(sx-4,sy-4,W.TILE+8,12);
    ctx.fillStyle='#FFD700'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText(npc.name,sx+W.TILE/2,sy+5); ctx.textAlign='left';
    // 任务标记
    if(typeof getNpcQuestStatus==='function') {
        const qs = getNpcQuestStatus(npc.name, W.currentMap);
        if(qs==='complete') {
            const bob=Math.sin(W.time*0.08)*3;
            ctx.fillStyle='#FFD700'; ctx.font='bold 14px monospace'; ctx.textAlign='center';
            ctx.fillText('?',sx+W.TILE/2,sy-6+bob); ctx.textAlign='left';
        } else if(qs==='available') {
            const bob=Math.sin(W.time*0.08)*3;
            ctx.fillStyle='#FFD700'; ctx.font='bold 14px monospace'; ctx.textAlign='center';
            ctx.fillText('!',sx+W.TILE/2,sy-6+bob); ctx.textAlign='left';
        }
    }
}

function drawPlayer(ctx, sx, sy) {
    const dir=W.player.dir, t=W.time;
    const breath=Math.sin(t*0.04)*1, by=sy+breath;
    const bodyC='#3366cc',hairC='#cc8833',skinC='#ffdbac',bootC='#553322',beltC='#aa7722';
    
    if(dir==='down'||dir==='up') {
        ctx.fillStyle=hairC; ctx.fillRect(sx+10,by+2,12,6);
        if(dir==='down') {
            ctx.fillStyle=skinC; ctx.fillRect(sx+11,by+5,10,10);
            ctx.fillStyle='#222'; ctx.fillRect(sx+13,by+9,2,2); ctx.fillRect(sx+17,by+9,2,2);
            ctx.fillStyle='#cc7755'; ctx.fillRect(sx+15,by+13,2,1);
        }
        ctx.fillStyle=bodyC; ctx.fillRect(sx+10,by+15,12,10); ctx.fillRect(sx+7,by+16,4,8); ctx.fillRect(sx+21,by+16,4,8);
        ctx.fillStyle=beltC; ctx.fillRect(sx+10,by+19,12,2);
        ctx.fillStyle=bootC; ctx.fillRect(sx+10,by+25,5,4); ctx.fillRect(sx+17,by+25,5,4);
    } else {
        const flip=dir==='right';
        const ox=flip?2:0;
        ctx.fillStyle=hairC; ctx.fillRect(sx+10+ox,by+2,10,6);
        ctx.fillStyle=skinC; ctx.fillRect(sx+11+ox,by+5,9,10);
        ctx.fillStyle='#222'; ctx.fillRect(sx+(flip?18:12),by+9,2,2);
        ctx.fillStyle=bodyC; ctx.fillRect(sx+11,by+15,10,10); ctx.fillRect(sx+(flip?20:8),by+16,4,8);
        ctx.fillStyle=beltC; ctx.fillRect(sx+11,by+19,10,2);
        ctx.fillStyle=bootC; ctx.fillRect(sx+11,by+25,4,4); ctx.fillRect(sx+17,by+25,4,4);
    }
    // 剑
    if(dir==='down'||dir==='right') {
        ctx.fillStyle='#aaa'; ctx.fillRect(sx+24,by+12,2,10);
        ctx.fillStyle='#DAA520'; ctx.fillRect(sx+22,by+22,6,2);
    }
}

// ======== 初始化 ========
function initWorld(targetMap) {
    W.canvas = document.getElementById('worldCanvas');
    if (!W.canvas) return false;
    W.ctx = W.canvas.getContext('2d');
    if (!W.ctx) return false;

    const container = W.canvas.parentElement;
    if (container) {
        W.canvas.width = container.clientWidth || window.innerWidth;
        W.canvas.height = container.clientHeight || (window.innerHeight - 100);
    }

    // 仅在切换区域或首次加载时生成地图，战斗返回时保留状态
    const needNewMap = targetMap ? (targetMap !== W.currentMap) : !W.map || W.map.length === 0;
    if (targetMap) W.currentMap = targetMap;
    if (needNewMap) {
        loadMap(W.currentMap);
    }

    W.dialogActive = false;
    W.menuActive = false;

    if (!W.initialized) {
        bindKeys();
        bindTouch();
        bindButtons();
    }
    W.initialized = true;

    if (!W.loopStarted) { W.loopStarted = true; loop(); }

    // 显示区域名称
    showAreaName();

    return true;
}

function loadMap(mapId) {
    const mapDef = MAPS[mapId];
    if (!mapDef) return;
    W.currentMap = mapId;
    W.mapW = mapDef.width;
    W.mapH = mapDef.height;
    const data = mapDef.generate();
    W.map = data.map;
    W.npcs = data.npcs;
    W.monsters = data.monsters;
    W.chests = data.chests;
    W.exits = data.exits;
    // 更新 gameState
    if (typeof gameState !== 'undefined') gameState.currentMap = mapId;
}

function showAreaName() {
    const mapDef = MAPS[W.currentMap];
    W.areaNameAlpha = 1.0;
    W.areaNameTimer = 120; // 帧数
}

// ======== 输入 ========
function bindKeys() {
    window.addEventListener('keydown', (e) => {
        if (W.menuActive) return;
        if (W.dialogActive) { if(e.key===' '||e.key==='Enter') closeWorldDialog(); return; }
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
        switch(e.key) {
            case 'ArrowUp':case 'w':case 'W': move(0,-1); break;
            case 'ArrowDown':case 's':case 'S': move(0,1); break;
            case 'ArrowLeft':case 'a':case 'A': move(-1,0); break;
            case 'ArrowRight':case 'd':case 'D': move(1,0); break;
            case ' ':case 'Enter': action(); break;
        }
    });
}

function bindTouch() {
    let sx,sy;
    W.canvas.addEventListener('touchstart',(e)=>{if(e.cancelable)e.preventDefault();sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:false});
    W.canvas.addEventListener('touchend',(e)=>{
        if(e.cancelable)e.preventDefault();
        if(W.dialogActive||W.menuActive) return;
        const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
        if(Math.abs(dx)>30||Math.abs(dy)>30) {
            if(Math.abs(dx)>Math.abs(dy)) move(dx>0?1:-1,0); else move(0,dy>0?1:-1);
        }
    },{passive:false});
}

function bindButtons() {
    const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
    document.querySelectorAll('.dpad-btn').forEach(btn=>{
        const d=dirs[btn.dataset.key];
        if(d) {
            btn.onclick=(e)=>{e.preventDefault();if(!W.dialogActive&&!W.menuActive)move(d[0],d[1]);};
            btn.addEventListener('touchstart',(e)=>{if(e.cancelable)e.preventDefault();if(!W.dialogActive&&!W.menuActive)move(d[0],d[1]);},{passive:false});
        }
    });
    const aBtn=document.querySelector('.a-btn'),bBtn=document.querySelector('.b-btn');
    if(aBtn) {
        aBtn.onclick=(e)=>{e.preventDefault();action();};
        aBtn.addEventListener('touchstart',(e)=>{if(e.cancelable)e.preventDefault();action();},{passive:false});
    }
    if(bBtn) {
        bBtn.onclick=(e)=>{e.preventDefault();if(typeof showScene==='function')showScene('party');};
        bBtn.addEventListener('touchstart',(e)=>{if(e.cancelable)e.preventDefault();if(typeof showScene==='function')showScene('party');},{passive:false});
    }
}

// ======== 移动 ========
function move(dx, dy) {
    if(W.dialogActive||W.menuActive||W.transitioning) return;
    
    if(dx>0)W.player.dir='right'; else if(dx<0)W.player.dir='left';
    else if(dy>0)W.player.dir='down'; else W.player.dir='up';
    W.player.frame++;
    
    let nx=W.player.x+dx, ny=W.player.y+dy;
    if(nx<0||nx>=W.mapW||ny<0||ny>=W.mapH) return;
    
    let tile=W.map[ny][nx];
    
    if(tile===T.GRASS||tile===T.PATH||tile===T.FLOOR||tile===T.LEAF) {
        W.player.x=nx; W.player.y=ny;
        // 步数统计
        if(typeof checkAchievement==='function') checkAchievement('steps', 1);
        // 随机遭遇
        const mapDef=MAPS[W.currentMap];
        if(mapDef&&!mapDef.safe) {
            W.stepCount++;
            if(W.stepCount>=mapDef.encounterRate) {
                W.stepCount=0;
                if(Math.random()<0.5) triggerRandomBattle();
            }
        }
    } else if(tile===T.EXIT) {
        const exit=W.exits.find(e=>e.x===nx&&e.y===ny);
        if(exit) changeMap(exit.target, exit.spawnX, exit.spawnY);
    } else if(tile===T.CHEST) {
        W.player.x=nx; W.player.y=ny;
        W.map[ny][nx]=(W.currentMap==='cave')?T.FLOOR:T.GRASS;
        let ch=W.chests.find(c=>c.x===nx&&c.y===ny);
        if(ch) { ch.opened=true; if(typeof gameState!=='undefined') gameState.gold+=ch.gold;
            showWorldDialog('💰 发现宝箱！','获得了 '+ch.gold+' 金币！');
            if(typeof SoundEffects!=='undefined' && SoundEffects.playConfirm) SoundEffects.playConfirm();
            if(typeof updateQuestProgress==='function') updateQuestProgress('collect', W.currentMap);
        }
    } else if(tile===T.MONSTER||tile===T.BOSS) {
        let mon=W.monsters.find(m=>m.x===nx&&m.y===ny);
        if(mon) {
            W.map[ny][nx]=(W.currentMap==='cave')?T.FLOOR:(W.currentMap==='forest')?T.LEAF:T.GRASS;
            W.monsters=W.monsters.filter(m2=>m2!==mon);
            W.player.x=nx; W.player.y=ny;
            if(window.WorldSystem) window.WorldSystem.fromWorldExploration=true;
            const zone = W.currentMap;
            const battleFn = mon.isBoss ? (window.startBossBattle || window.startBattle) : window.startBattle;
            setTimeout(()=>{
                if(typeof battleFn==='function') battleFn(zone);
                else if(typeof startBattle==='function') startBattle(zone);
                else showWorldDialog('⚔️ 遭遇 '+mon.name,'战斗系统加载中...');
            },100);
        }
    }
}

function changeMap(targetMapId, spawnX, spawnY) {
    W.transitioning = true;
    W.areaNameAlpha = 0;

    // 区域切换音效
    if(typeof SoundEffects!=='undefined' && SoundEffects.playConfirm) SoundEffects.playConfirm();
    // 短暂黑屏过渡
    setTimeout(() => {
        loadMap(targetMapId);
        W.player.x = spawnX;
        W.player.y = spawnY;
        W.stepCount = 0;
        showAreaName();
        W.transitioning = false;
        // 更新任务探索进度
        if(typeof updateQuestProgress==='function') {
            updateQuestProgress('explore', targetMapId);
        }
    }, 200);
}

function triggerRandomBattle() {
    if(window.WorldSystem) window.WorldSystem.fromWorldExploration=true;
    if(typeof showToast==='function') showToast('⚔️ 遭遇敌人！','warning');
    setTimeout(()=>{
        if(typeof window.startBattle==='function') window.startBattle(W.currentMap);
        else if(typeof startBattle==='function') startBattle(W.currentMap);
    },300);
}

// ======== 动作键 ========
function action() {
    if(W.dialogActive) { closeWorldDialog(); return; }
    if(W.menuActive) { closeNPCMenu(); return; }
    
    let ax=W.player.x,ay=W.player.y;
    switch(W.player.dir) { case'up':ay--;break; case'down':ay++;break; case'left':ax--;break; case'right':ax++;break; }
    
    let npc=W.npcs.find(n=>n.x===ax&&n.y===ay);
    if(npc) {
        // 先检查任务交互
        if(typeof getQuestsByNpc==='function') {
            const { available, completable } = getQuestsByNpc(npc.name, W.currentMap);
            // 优先提交已完成任务
            if(completable.length>0) {
                const q=completable[0];
                showQuestDialog(q.dialog_end, ()=>{
                    if(typeof completeQuest==='function') completeQuest(q.id);
                });
                return;
            }
            // 其次接取新任务
            if(available.length>0) {
                const q=available[0];
                showQuestDialog(q.dialog_start, ()=>{
                    if(typeof acceptQuest==='function') acceptQuest(q.id);
                });
                return;
            }
        }
        switch(npc.type) {
            case 'shop': showShopMenu(); break;
            case 'inn': showInnMenu(npc); break;
            case 'smith': showSmithMenu(); break;
            case 'recruit':
                if (typeof showRecruitMenu === 'function') showRecruitMenu();
                else showWorldDialog('💬 ' + npc.name, npc.dialog);
                break;
            default:
                // Use enhanced NPC dialogs from Phase 9 if available
                if (typeof NPC_DIALOGS !== 'undefined' && NPC_DIALOGS[W.currentMap] && NPC_DIALOGS[W.currentMap][npc.name]) {
                    const dialogs = NPC_DIALOGS[W.currentMap][npc.name];
                    const randomDialog = dialogs[Math.floor(Math.random() * dialogs.length)];
                    showWorldDialog('💬 ' + npc.name, randomDialog);
                } else {
                    showWorldDialog('💬 '+npc.name, npc.dialog);
                }
                break;
        }
    }
}

// ======== 商店 ========
function showShopMenu() {
    W.menuActive = true;
    const old = document.getElementById('worldMenu'); if(old) old.remove();
    const gold = (typeof gameState!=='undefined') ? gameState.gold : 0;
    const region = W.currentMap || 'village';

    const consumables = [
        { name:'🧪 小治疗药水', price:30, type:'smallPotion' },
        { name:'🧪 中治疗药水', price:100, type:'mediumPotion' },
        { name:'💊 以太(MP)', price:80, type:'ether' },
        { name:'✨ 万灵药', price:1000, type:'elixir' }
    ];

    const equipments = (typeof SHOP_EQUIPMENT !== 'undefined' && SHOP_EQUIPMENT[region]) ? SHOP_EQUIPMENT[region] : [];

    let html = `<div id="worldMenu" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        background:linear-gradient(135deg,#1a2a4a,#2a3a5a);border:3px solid #FFD700;border-radius:10px;
        padding:20px;z-index:200;min-width:280px;max-width:calc(100vw - 40px);max-height:80vh;overflow-y:auto;font-family:'Press Start 2P',monospace;">
        <div style="color:#FFD700;font-size:12px;margin-bottom:12px;text-align:center;">🏪 商店</div>
        <div style="color:#ffd700;font-size:9px;text-align:right;margin-bottom:8px;">💰 ${gold}G</div>
        <div style="color:#88ccff;font-size:8px;margin-bottom:6px;">📦 消耗品</div>`;

    consumables.forEach(item => {
        html += `<button onclick="buyItem('${item.type}',${item.price})" style="display:block;width:100%;padding:8px;margin:3px 0;
            background:#1a1a3a;border:2px solid #4a4a8a;border-radius:4px;color:#fff;font-size:9px;
            font-family:'Press Start 2P',monospace;cursor:pointer;text-align:left;">
            ${item.name} <span style="float:right;color:#ffd700;">${item.price}G</span></button>`;
    });

    if (equipments.length > 0) {
        html += `<div style="color:#ff88ff;font-size:8px;margin:10px 0 6px 0;">⚔️ 装备</div>`;
        equipments.forEach((eq, idx) => {
            const rarityColors = { common: '#aaa', magic: '#00ff00', rare: '#0088ff', epic: '#aa00ff', legendary: '#ffaa00' };
            const color = rarityColors[eq.rarity] || '#aaa';
            const icon = (typeof getEquipIcon === 'function') ? getEquipIcon(eq.slot, eq.rarity) : '⚔️';
            html += `<button onclick="buyEquipment('${region}',${idx})" style="display:block;width:100%;padding:8px;margin:3px 0;
                background:#1a1a3a;border:2px solid ${color};border-radius:4px;color:${color};font-size:9px;
                font-family:'Press Start 2P',monospace;cursor:pointer;text-align:left;">
                ${icon} ${eq.name} <span style="float:right;color:#ffd700;">${eq.price}G</span></button>`;
        });
    }

    html += `<button onclick="closeNPCMenu()" style="display:block;width:100%;padding:8px;margin-top:8px;
        background:#4a1a1a;border:2px solid #aa4444;border-radius:4px;color:#ff8888;font-size:9px;
        font-family:'Press Start 2P',monospace;cursor:pointer;">关闭</button></div>`;

    const container = W.canvas.parentElement;
    if(container) { container.style.position='relative'; container.insertAdjacentHTML('beforeend',html); }
}

window.buyItem = function(type, price) {
    if(typeof gameState==='undefined') return;
    if(gameState.gold < price) { if(typeof showToast==='function') showToast('💰 金币不足！','error'); return; }
    gameState.gold -= price;
    if(typeof createConsumable==='function') gameState.inventory.push(createConsumable(type));
    if(typeof SoundEffects!=='undefined' && SoundEffects.playConfirm) SoundEffects.playConfirm();
    if(typeof showToast==='function') showToast('✅ 购买成功！','success');
    // 刷新商店金币显示
    closeNPCMenu(); showShopMenu();
};

window.buyEquipment = function(region, idx) {
    if (typeof gameState === 'undefined' || typeof SHOP_EQUIPMENT === 'undefined') return;
    const items = SHOP_EQUIPMENT[region];
    if (!items || !items[idx]) return;
    const item = items[idx];
    if (gameState.gold < item.price) {
        if (typeof showToast === 'function') showToast('💰 金币不足！', 'error');
        return;
    }
    gameState.gold -= item.price;
    const equip = (typeof generateEquipment === 'function') ? generateEquipment(item.slot, item.level, item.rarity) : null;
    if (equip) {
        equip.name = item.name;
        if (typeof addItemToInventory === 'function') {
            addItemToInventory(equip);
        } else {
            gameState.inventory.push(equip);
        }
    }
    if (typeof SoundEffects !== 'undefined' && SoundEffects.playConfirm) SoundEffects.playConfirm();
    if (typeof showToast === 'function') showToast(`✅ 购买了 ${item.name}！`, 'success');
    closeNPCMenu(); showShopMenu();
};

// ======== 酒馆 ========
function showInnMenu(npc) {
    if(typeof gameState==='undefined') return;
    const cost = gameState.party.length * 30;
    W.menuActive = true;
    const old = document.getElementById('worldMenu'); if(old) old.remove();
    let html = `<div id="worldMenu" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        background:linear-gradient(135deg,#1a2a4a,#2a3a5a);border:3px solid #FFD700;border-radius:10px;
        padding:20px;z-index:200;min-width:260px;max-width:calc(100vw - 40px);font-family:'Press Start 2P',monospace;">
        <div style="color:#FFD700;font-size:12px;margin-bottom:12px;text-align:center;">🏨 酒馆</div>
        <div style="color:#ccc;font-size:9px;margin-bottom:12px;line-height:1.6;">休息一晚恢复全队 HP/MP<br>费用: ${cost}G (${gameState.party.length}人×30G)</div>
        <button onclick="restAtInn(${cost})" style="display:block;width:100%;padding:8px;margin:4px 0;min-height:44px;
            background:#1a3a1a;border:2px solid #44aa44;border-radius:4px;color:#44ff44;font-size:9px;
            font-family:'Press Start 2P',monospace;cursor:pointer;">💤 休息 (${cost}G)</button>
        <button onclick="closeNPCMenu()" style="display:block;width:100%;padding:8px;margin-top:4px;min-height:44px;
            background:#4a1a1a;border:2px solid #aa4444;border-radius:4px;color:#ff8888;font-size:9px;
            font-family:'Press Start 2P',monospace;cursor:pointer;">离开</button></div>`;
    const container = W.canvas.parentElement;
    if(container) { container.style.position='relative'; container.insertAdjacentHTML('beforeend',html); }
}

window.restAtInn = function(cost) {
    if(typeof gameState==='undefined') return;
    if(gameState.gold < cost) { if(typeof showToast==='function') showToast('💰 金币不足！','error'); return; }
    gameState.gold -= cost;
    gameState.party.forEach(c => {
        const stats = (typeof calculateStats==='function') ? calculateStats(c) : { hp:100 };
        c.currentHp = stats.hp;
        if(c.currentMp !== undefined) c.currentMp = stats.mp || 25;
    });
    closeNPCMenu();
    showWorldDialog('💤 休息完毕','全队 HP/MP 已完全恢复！');
    if(typeof showToast==='function') showToast('💤 全队恢复完毕！','success');
};

function closeNPCMenu() {
    W.menuActive = false;
    const menu = document.getElementById('worldMenu');
    if(menu) menu.remove();
}
window.closeNPCMenu = closeNPCMenu;

// ======== 对话框 ========
function showWorldDialog(title, text) {
    W.dialogActive = true;
    const old = document.getElementById('worldDialog'); if(old) old.remove();
    const html = `<div id="worldDialog" style="position:absolute;bottom:80px;left:10px;right:10px;
        background:linear-gradient(135deg,#1a2a4a,#2a3a5a);border:3px solid #FFD700;border-radius:8px;
        padding:15px;z-index:100;font-family:'Press Start 2P',monospace;animation:dialogSlideUp 0.2s ease-out;">
        <div style="color:#FFD700;font-size:11px;margin-bottom:8px;">${title}</div>
        <div style="color:#fff;font-size:10px;line-height:1.6;">${text}</div>
        <div style="color:#888;font-size:8px;text-align:center;margin-top:10px;">点击继续 ▼</div></div>`;
    const container = W.canvas.parentElement;
    if(container) { container.style.position='relative'; container.insertAdjacentHTML('beforeend',html);
        document.getElementById('worldDialog').addEventListener('click',closeWorldDialog); }
}

function closeWorldDialog() {
    W.dialogActive = false;
    const d = document.getElementById('worldDialog'); if(d) d.remove();
}

// ======== 游戏循环 ========
function loop() {
    W.time++;
    if(W.areaNameTimer>0) {
        W.areaNameTimer--;
        if(W.areaNameTimer>90) W.areaNameAlpha=Math.min(1,(120-W.areaNameTimer)/30);
        else if(W.areaNameTimer<30) W.areaNameAlpha=W.areaNameTimer/30;
        else W.areaNameAlpha=1;
    }
    updateCamera();
    draw();
    requestAnimationFrame(loop);
}

function updateCamera() {
    const tilesX=Math.floor(W.canvas.width/W.TILE), tilesY=Math.floor(W.canvas.height/W.TILE);
    W.camera.x=W.player.x-Math.floor(tilesX/2);
    W.camera.y=W.player.y-Math.floor(tilesY/2);
    W.camera.x=Math.max(0,Math.min(W.camera.x,W.mapW-tilesX));
    W.camera.y=Math.max(0,Math.min(W.camera.y,W.mapH-tilesY));
}

// ======== 绘制 ========
function draw() {
    const ctx=W.ctx; if(!ctx) return;
    const cw=W.canvas.width, ch=W.canvas.height;
    const mapDef=MAPS[W.currentMap];
    
    ctx.fillStyle=mapDef?mapDef.bgColor:'#1a3a1a';
    ctx.fillRect(0,0,cw,ch);
    
    // 过渡黑屏
    if(W.transitioning) { ctx.fillStyle='#000'; ctx.fillRect(0,0,cw,ch); return; }
    
    const tw=Math.ceil(cw/W.TILE)+1, th=Math.ceil(ch/W.TILE)+1;
    
    // 地图图块
    for(let y=0;y<th;y++) for(let x=0;x<tw;x++) {
        const mx=W.camera.x+x, my=W.camera.y+y;
        if(mx<0||mx>=W.mapW||my<0||my>=W.mapH) continue;
        drawTile(ctx, W.map[my][mx], x*W.TILE, y*W.TILE, mx, my, W.currentMap);
    }
    
    // NPC
    W.npcs.forEach(n=>{
        const sx=(n.x-W.camera.x)*W.TILE, sy=(n.y-W.camera.y)*W.TILE;
        if(sx>=-W.TILE&&sx<cw+W.TILE&&sy>=-W.TILE&&sy<ch+W.TILE) drawNPC(ctx,sx,sy,n);
    });
    
    // 玩家
    drawPlayer(ctx, (W.player.x-W.camera.x)*W.TILE, (W.player.y-W.camera.y)*W.TILE);
    
    // HUD
    drawHUD(ctx, cw, ch, mapDef);
}

function drawHUD(ctx, cw, ch, mapDef) {
    if(!mapDef) return;
    
    // 区域名称（左上）
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(8,8,180,36);
    ctx.fillStyle='#FFD700'; ctx.font='bold 13px monospace';
    ctx.fillText(mapDef.name,16,24);
    ctx.fillStyle='#aaa'; ctx.font='10px monospace';
    ctx.fillText(mapDef.level,16,38);
    
    // HP/MP条（右上） - 缓存stats每30帧更新一次
    if(typeof gameState!=='undefined'&&gameState.party&&gameState.party[0]) {
        const hero=gameState.party[0];
        if(!W._statsCache||W.time%30===0) W._statsCache=(typeof calculateStats==='function')?calculateStats(hero):{hp:100,mp:25};
        const stats=W._statsCache;
        const hpPct=hero.currentHp/stats.hp, mpPct=(hero.currentMp||0)/(stats.mp||1);
        const bx=cw-130, by=8, bw=120, bh=12;
        
        ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(bx-4,by-4,bw+8,40);
        // HP
        ctx.fillStyle='#333'; ctx.fillRect(bx,by,bw,bh);
        ctx.fillStyle=hpPct>0.3?'#44cc44':'#cc4444'; ctx.fillRect(bx,by,bw*Math.max(0,hpPct),bh);
        ctx.fillStyle='#fff'; ctx.font='8px monospace';
        ctx.fillText('HP '+hero.currentHp+'/'+stats.hp,bx+4,by+9);
        // MP
        ctx.fillStyle='#333'; ctx.fillRect(bx,by+16,bw,bh);
        ctx.fillStyle='#4488ff'; ctx.fillRect(bx,by+16,bw*Math.max(0,mpPct),bh);
        ctx.fillText('MP '+(hero.currentMp||0)+'/'+(stats.mp||0),bx+4,by+25);
    }
    
    // 金币
    if(typeof gameState!=='undefined') {
        ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(cw-100,52,92,20);
        ctx.fillStyle='#FFD700'; ctx.font='10px monospace';
        ctx.fillText('💰 '+gameState.gold+'G',cw-94,66);
    }

    // Minimap (bottom-right)
    const mmSize = 80;
    const mmX = cw - mmSize - 10;
    const mmY = ch - mmSize - 10;
    const mmScale = mmSize / Math.max(W.mapW, W.mapH);

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.strokeRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);

    // Draw map tiles
    for (let y = 0; y < W.mapH; y++) {
        for (let x = 0; x < W.mapW; x++) {
            const tile = W.map[y][x];
            const px = mmX + Math.floor(x * mmScale);
            const py = mmY + Math.floor(y * mmScale);
            const pw = Math.max(1, Math.ceil(mmScale));
            const ph = Math.max(1, Math.ceil(mmScale));

            switch(tile) {
                case T.WALL: ctx.fillStyle = '#555'; break;
                case T.WATER: ctx.fillStyle = '#3b6cc4'; break;
                case T.LAVA: ctx.fillStyle = '#ff4400'; break;
                case T.PATH: ctx.fillStyle = '#c4a060'; break;
                case T.FLOOR: ctx.fillStyle = '#3a3a3a'; break;
                case T.EXIT: ctx.fillStyle = '#FFD700'; break;
                case T.TREE: ctx.fillStyle = '#1a5a1e'; break;
                case T.CHEST:
                    const ch2 = W.chests.find(c => c.x === x && c.y === y);
                    ctx.fillStyle = (ch2 && !ch2.opened) ? '#DAA520' : '#3a6a3e';
                    break;
                case T.MONSTER: case T.BOSS: ctx.fillStyle = '#ff4444'; break;
                case T.FENCE: ctx.fillStyle = '#8B6914'; break;
                default: ctx.fillStyle = W.currentMap === 'cave' ? '#2a2a2a' : '#3a6a3e'; break;
            }
            ctx.fillRect(px, py, pw, ph);
        }
    }

    // Draw NPCs
    W.npcs.forEach(n => {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(mmX + Math.floor(n.x * mmScale), mmY + Math.floor(n.y * mmScale), Math.max(2, Math.ceil(mmScale)), Math.max(2, Math.ceil(mmScale)));
    });

    // Draw player (blinking)
    if (Math.floor(W.time / 10) % 2 === 0) {
        ctx.fillStyle = '#ff0';
        const playerMmX = mmX + Math.floor(W.player.x * mmScale);
        const playerMmY = mmY + Math.floor(W.player.y * mmScale);
        ctx.fillRect(playerMmX - 1, playerMmY - 1, Math.max(3, Math.ceil(mmScale) + 1), Math.max(3, Math.ceil(mmScale) + 1));
    }

    // 区域名称大字动画
    if(W.areaNameTimer>0&&mapDef) {
        ctx.globalAlpha=W.areaNameAlpha;
        ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,ch/2-30,cw,60);
        ctx.fillStyle='#FFD700'; ctx.font='bold 20px monospace'; ctx.textAlign='center';
        ctx.fillText(mapDef.name,cw/2,ch/2+2);
        ctx.fillStyle='#fff'; ctx.font='12px monospace';
        ctx.fillText(mapDef.level,cw/2,ch/2+20);
        ctx.textAlign='left';
        ctx.globalAlpha=1;
    }
}

// ======== 任务对话 ========
function showQuestDialog(dialogText, onComplete) {
    W.dialogActive = true;
    const old = document.getElementById('worldDialog'); if(old) old.remove();
    // 解析 "NPC名: 对话内容" 格式
    let title='📜 任务', text=dialogText;
    const colonIdx = dialogText.indexOf(': ');
    if(colonIdx>0) {
        title='📜 '+dialogText.substring(0,colonIdx);
        text=dialogText.substring(colonIdx+2);
    }
    const html = `<div id="worldDialog" style="position:absolute;bottom:80px;left:10px;right:10px;
        background:linear-gradient(135deg,#2a1a4a,#3a2a5a);border:3px solid #FFD700;border-radius:8px;
        padding:15px;z-index:100;font-family:'Press Start 2P',monospace;animation:dialogSlideUp 0.2s ease-out;">
        <div style="color:#FFD700;font-size:11px;margin-bottom:8px;">${title}</div>
        <div style="color:#fff;font-size:10px;line-height:1.6;">${text}</div>
        <div style="color:#888;font-size:8px;text-align:center;margin-top:10px;">点击继续 ▼</div></div>`;
    const container = W.canvas.parentElement;
    if(container) {
        container.style.position='relative';
        container.insertAdjacentHTML('beforeend',html);
        document.getElementById('worldDialog').addEventListener('click', ()=>{
            W.dialogActive = false;
            const d = document.getElementById('worldDialog'); if(d) d.remove();
            if(onComplete) onComplete();
        });
    }
}

// ======== 铁匠菜单（强化+洗练） ========
function showSmithMenu() {
    W.menuActive = true;
    const old = document.getElementById('worldMenu'); if(old) old.remove();
    const gold = (typeof gameState!=='undefined') ? gameState.gold : 0;
    const hero = (typeof gameState!=='undefined' && gameState.party) ? gameState.party[0] : null;
    
    let equipList = '';
    if (hero && hero.equipment) {
        const slotNames = {weapon:'武器',helmet:'头盔',armor:'铠甲',shield:'盾牌',accessory:'饰品'};
        Object.entries(hero.equipment).forEach(([slot, equip]) => {
            if (equip) {
                const cost = Math.floor((equip.level || 1) * 50 * ({common:1,magic:2,rare:3,epic:5,legendary:10}[equip.rarity]||1));
                equipList += `<button onclick="reforgeEquip('${slot}',${cost})" style="display:block;width:100%;padding:6px;margin:3px 0;
                    background:#1a1a3a;border:2px solid #8B6914;border-radius:4px;color:#fff;font-size:8px;
                    font-family:'Press Start 2P',monospace;cursor:pointer;text-align:left;">
                    🔨 洗练 ${slotNames[slot]}: ${equip.name} <span style="float:right;color:#ffd700;">${cost}G</span></button>`;
            }
        });
    }
    
    // 套装信息
    let setInfo = '';
    if (hero && typeof getSetBonuses === 'function') {
        const { activeSets } = getSetBonuses(hero);
        if (activeSets.length > 0) {
            setInfo = '<div style="color:#ff88ff;font-size:8px;margin:8px 0 4px;">🛡️ 激活的套装:</div>';
            activeSets.forEach(s => {
                setInfo += `<div style="color:#ccc;font-size:7px;margin:2px 0;padding:4px;background:#1a1a2a;border-radius:3px;">${s.name} (${s.count}/${s.max}) - ${s.desc}</div>`;
            });
        }
    }
    
    let html = `<div id="worldMenu" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        background:linear-gradient(135deg,#1a2a4a,#2a3a5a);border:3px solid #8B6914;border-radius:10px;
        padding:20px;z-index:200;min-width:300px;max-width:calc(100vw - 40px);max-height:80vh;overflow-y:auto;font-family:'Press Start 2P',monospace;">
        <div style="color:#8B6914;font-size:12px;margin-bottom:12px;text-align:center;">🔨 铁匠铺</div>
        <div style="color:#ffd700;font-size:9px;text-align:right;margin-bottom:8px;">💰 ${gold}G</div>
        <div style="color:#88ccff;font-size:8px;margin-bottom:6px;">🔄 词条洗练（重随属性值）</div>
        ${equipList || '<div style="color:#888;font-size:8px;">没有可洗练的装备</div>'}
        ${setInfo}
        <div style="color:#888;font-size:7px;margin:8px 0 4px;">💡 洗练会随机重新生成装备属性和名称</div>
        <button onclick="closeNPCMenu();if(typeof showCraftingUI==='function')showCraftingUI();" style="display:block;width:100%;padding:8px;margin-top:8px;min-height:44px;
            background:#2a1a3a;border:2px solid #9b59b6;border-radius:4px;color:#bb88ff;font-size:9px;
            font-family:'Press Start 2P',monospace;cursor:pointer;">🔨 合成工坊</button>
        <button onclick="closeNPCMenu()" style="display:block;width:100%;padding:8px;margin-top:8px;min-height:44px;
            background:#4a1a1a;border:2px solid #aa4444;border-radius:4px;color:#ff8888;font-size:9px;
            font-family:'Press Start 2P',monospace;cursor:pointer;">关闭</button></div>`;
    const container = W.canvas.parentElement;
    if(container) { container.style.position='relative'; container.insertAdjacentHTML('beforeend',html); }
}

window.reforgeEquip = function(slot, cost) {
    if (typeof gameState === 'undefined') return;
    if (gameState.gold < cost) { if(typeof showToast==='function') showToast('💰 金币不足！','error'); return; }
    const hero = gameState.party[0];
    if (!hero || !hero.equipment[slot]) return;
    
    const oldEquip = hero.equipment[slot];
    gameState.gold -= cost;
    
    // 重新生成同品质同槽位装备
    if (typeof generateEquipment === 'function') {
        const newEquip = generateEquipment(slot, oldEquip.level, oldEquip.rarity);
        newEquip.enhanceLevel = oldEquip.enhanceLevel || 0; // 保留强化等级
        hero.equipment[slot] = newEquip;
        if(typeof SoundEffects!=='undefined' && SoundEffects.playConfirm) SoundEffects.playConfirm();
        if(typeof showToast==='function') showToast(`🔨 洗练成功！${oldEquip.name} → ${newEquip.name}`, 'success');
    }
    closeNPCMenu();
    showSmithMenu();
};

// ======== 导出 ========
window.WorldSystem = {
    init: initWorld,
    handleAction: action,
    toggleMenu: ()=>{ if(typeof showScene==='function') showScene('party'); },
    fromWorldExploration: false,
    reset: ()=>{ W.initialized=false; W.loopStarted=false; W.currentMap='village'; W.map=[]; W.player.x=20; W.player.y=15; W.stepCount=0; }
};
