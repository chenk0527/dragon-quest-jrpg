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
            
            // 围栏装饰
            for (let x = 2; x < 38; x += 3) {
                if (map[2][x] === T.GRASS) map[2][x] = T.FENCE;
                if (map[27][x] === T.GRASS) map[27][x] = T.FENCE;
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
            
            return { map, npcs, chests, monsters, exits };
        }
    }
};

// 怪物名/色
function monsterName(t) {
    return {slime:'史莱姆',mushroom:'毒蘑菇',bat:'蝙蝠',wolf:'灰狼',treant:'树精',snake:'毒蛇',
        batSwarm:'蝙蝠群',gargoyle:'石像鬼',skeleton:'骷髅兵',skeletonKing:'💀骷髅王'}[t]||t;
}
function monsterColor(t) {
    return {slime:'#44dd44',mushroom:'#dd4444',bat:'#9944cc',wolf:'#888',treant:'#6b4226',snake:'#44cc44',
        batSwarm:'#333',gargoyle:'#777',skeleton:'#ddd',skeletonKing:'#fff'}[t]||'#fff';
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
    cave: { floor1:'#3a3a3a', floor2:'#2e2e2e', lava1:'#ff4400', lava2:'#ff6622', ore:'#44aaff' }
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
            if(typeof updateQuestProgress==='function') updateQuestProgress('collect', W.currentMap);
        }
    } else if(tile===T.MONSTER||tile===T.BOSS) {
        let mon=W.monsters.find(m=>m.x===nx&&m.y===ny);
        if(mon) {
            W.map[ny][nx]=(W.currentMap==='cave')?T.FLOOR:(W.currentMap==='forest')?T.LEAF:T.GRASS;
            W.monsters=W.monsters.filter(m2=>m2!==mon);
            W.player.x=nx; W.player.y=ny;
            if(window.WorldSystem) window.WorldSystem.fromWorldExploration=true;
            const zone = mon.isBoss ? 'demonCastle' : W.currentMap;
            setTimeout(()=>{
                if(typeof window.startBattle==='function') window.startBattle(zone);
                else if(typeof startBattle==='function') startBattle(zone);
                else showWorldDialog('⚔️ 遭遇 '+mon.name,'战斗系统加载中...');
            },100);
        }
    }
}

function changeMap(targetMapId, spawnX, spawnY) {
    W.transitioning = true;
    W.areaNameAlpha = 0;

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
            case 'smith': showWorldDialog('💬 铁匠', '想强化装备？去队伍界面选择角色和装备槽位吧！'); break;
            default: showWorldDialog('💬 '+npc.name, npc.dialog); break;
        }
    }
}

// ======== 商店 ========
function showShopMenu() {
    W.menuActive = true;
    const old = document.getElementById('worldMenu'); if(old) old.remove();
    const gold = (typeof gameState!=='undefined') ? gameState.gold : 0;
    const items = [
        { name:'🧪 小治疗药水', price:50, type:'smallPotion' },
        { name:'🧪 中治疗药水', price:150, type:'mediumPotion' },
        { name:'💊 解毒药', price:80, type:'antidote' },
        { name:'✨ 复活药水', price:500, type:'revivePotion' }
    ];
    let html = `<div id="worldMenu" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        background:linear-gradient(135deg,#1a2a4a,#2a3a5a);border:3px solid #FFD700;border-radius:10px;
        padding:20px;z-index:200;min-width:260px;font-family:'Press Start 2P',monospace;">
        <div style="color:#FFD700;font-size:12px;margin-bottom:12px;text-align:center;">🏪 商店</div>
        <div style="color:#ffd700;font-size:9px;text-align:right;margin-bottom:8px;">💰 ${gold}G</div>`;
    items.forEach(item => {
        html += `<button onclick="buyItem('${item.type}',${item.price})" style="display:block;width:100%;padding:8px;margin:4px 0;
            background:#1a1a3a;border:2px solid #4a4a8a;border-radius:4px;color:#fff;font-size:9px;
            font-family:'Press Start 2P',monospace;cursor:pointer;text-align:left;">
            ${item.name} <span style="float:right;color:#ffd700;">${item.price}G</span></button>`;
    });
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
    if(typeof showToast==='function') showToast('✅ 购买成功！','success');
    // 刷新商店金币显示
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
        padding:20px;z-index:200;min-width:260px;font-family:'Press Start 2P',monospace;">
        <div style="color:#FFD700;font-size:12px;margin-bottom:12px;text-align:center;">🏨 酒馆</div>
        <div style="color:#ccc;font-size:9px;margin-bottom:12px;line-height:1.6;">休息一晚恢复全队 HP/MP<br>费用: ${cost}G (${gameState.party.length}人×30G)</div>
        <button onclick="restAtInn(${cost})" style="display:block;width:100%;padding:8px;margin:4px 0;
            background:#1a3a1a;border:2px solid #44aa44;border-radius:4px;color:#44ff44;font-size:9px;
            font-family:'Press Start 2P',monospace;cursor:pointer;">💤 休息 (${cost}G)</button>
        <button onclick="closeNPCMenu()" style="display:block;width:100%;padding:8px;margin-top:4px;
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
    
    // HP/MP条（右上）
    if(typeof gameState!=='undefined'&&gameState.party&&gameState.party[0]) {
        const hero=gameState.party[0];
        const stats=(typeof calculateStats==='function')?calculateStats(hero):{hp:100,mp:25};
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

// ======== 导出 ========
window.WorldSystem = {
    init: initWorld,
    handleAction: action,
    toggleMenu: ()=>{ if(typeof showScene==='function') showScene('party'); },
    fromWorldExploration: false,
    reset: ()=>{ W.initialized=false; W.loopStarted=false; W.currentMap='village'; W.map=[]; W.player.x=20; W.player.y=15; W.stepCount=0; }
};
