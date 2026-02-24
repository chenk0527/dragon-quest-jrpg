/**
 * Dragon Quest JRPG - 核心游戏系统
 * DQ11S风格的多职业回合制JRPG
 */

// ==================== 游戏配置 ====================
const CONFIG = {
    MAX_PARTY_SIZE: 4,
    MAX_LEVEL: 99,
    RARITY_WEIGHTS: {
        common: 60,    // 白色
        magic: 25,     // 绿色
        rare: 10,      // 蓝色
        epic: 4,       // 紫色
        legendary: 1   // 橙色
    },
    AUTO_SAVE_INTERVAL: 30000, // 30秒自动存档
    XP_CURVE: 1.5 // 升级经验曲线
};

// ==================== 职业定义 ====================
const CLASSES = {
    warrior: {
        id: 'warrior',
        name: '战士',
        icon: '⚔️',
        description: '高攻高防的物理输出',
        baseStats: { hp: 120, mp: 30, str: 15, def: 12, spd: 8, int: 5 },
        growth: { hp: 12, mp: 3, str: 3, def: 2.5, spd: 1.5, int: 1 },
        skills: ['powerAttack', 'defendAll', 'berserk']
    },
    mage: {
        id: 'mage',
        name: '法师',
        icon: '🔮',
        description: '强大的魔法伤害',
        baseStats: { hp: 80, mp: 80, str: 5, def: 5, spd: 10, int: 18 },
        growth: { hp: 6, mp: 8, str: 1, def: 1, spd: 2, int: 4 },
        skills: ['fireball', 'blizzard', 'thunder', 'meteor']
    },
    priest: {
        id: 'priest',
        name: '牧师',
        icon: '✨',
        description: '治疗与辅助',
        baseStats: { hp: 90, mp: 70, str: 6, def: 8, spd: 9, int: 14 },
        growth: { hp: 8, mp: 7, str: 1.5, def: 1.5, spd: 1.5, int: 3 },
        skills: ['heal', 'groupHeal', 'resurrection', 'bless']
    },
    rogue: {
        id: 'rogue',
        name: '盗贼',
        icon: '🗡️',
        description: '高速高暴击',
        baseStats: { hp: 100, mp: 40, str: 12, def: 6, spd: 15, int: 7 },
        growth: { hp: 9, mp: 4, str: 2.5, def: 1, spd: 3.5, int: 1.5 },
        skills: ['steal', 'backstab', 'poison', 'shadowStrike']
    }
};

// ==================== 装备定义 ====================
const EQUIPMENT_TYPES = {
    weapon: { name: '武器', icon: '⚔️', stat: 'str' },
    helmet: { name: '头盔', icon: '🪖', stat: 'def' },
    armor: { name: '铠甲', icon: '🛡️', stat: 'def' },
    shield: { name: '盾牌', icon: '⛨', stat: 'def' },
    accessory1: { name: '饰品1', icon: '💍', stat: 'spd' },
    accessory2: { name: '饰品2', icon: '📿', stat: 'int' }
};

const RARITY_COLORS = {
    common: '#95a5a6',
    magic: '#2ecc71',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#f39c12'
};

const RARITY_NAMES = {
    common: '普通',
    magic: '魔法',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
};

// 装备基础数据
const EQUIPMENT_BASE = {
    weapon: [
        { name: '短剑', minLevel: 1, baseValue: 5 },
        { name: '长剑', minLevel: 5, baseValue: 12 },
        { name: '精钢剑', minLevel: 10, baseValue: 20 },
        { name: '魔法剑', minLevel: 15, baseValue: 30 },
        { name: '龙鳞剑', minLevel: 25, baseValue: 50 },
        { name: '圣剑', minLevel: 40, baseValue: 80 }
    ],
    helmet: [
        { name: '皮帽', minLevel: 1, baseValue: 3 },
        { name: '铁盔', minLevel: 5, baseValue: 8 },
        { name: '钢盔', minLevel: 12, baseValue: 15 },
        { name: '魔法帽', minLevel: 18, baseValue: 22 },
        { name: '龙鳞盔', minLevel: 28, baseValue: 35 }
    ],
    armor: [
        { name: '布衣', minLevel: 1, baseValue: 4 },
        { name: '皮甲', minLevel: 5, baseValue: 10 },
        { name: '锁子甲', minLevel: 10, baseValue: 18 },
        { name: '板甲', minLevel: 20, baseValue: 30 },
        { name: '龙鳞甲', minLevel: 30, baseValue: 50 }
    ],
    shield: [
        { name: '木盾', minLevel: 1, baseValue: 3 },
        { name: '铁盾', minLevel: 8, baseValue: 10 },
        { name: '钢盾', minLevel: 15, baseValue: 18 },
        { name: '塔盾', minLevel: 25, baseValue: 28 }
    ],
    accessory: [
        { name: '铜戒指', minLevel: 1, baseValue: 2 },
        { name: '银戒指', minLevel: 10, baseValue: 8 },
        { name: '金戒指', minLevel: 20, baseValue: 15 },
        { name: '宝石戒指', minLevel: 35, baseValue: 25 }
    ]
};

// 随机词条池
const AFFIX_POOL = {
    common: [
        { stat: 'hp', min: 5, max: 15 },
        { stat: 'mp', min: 3, max: 8 },
        { stat: 'str', min: 1, max: 3 },
        { stat: 'def', min: 1, max: 3 }
    ],
    magic: [
        { stat: 'hp', min: 15, max: 30 },
        { stat: 'mp', min: 8, max: 15 },
        { stat: 'str', min: 3, max: 6 },
        { stat: 'def', min: 3, max: 6 },
        { stat: 'spd', min: 2, max: 5 },
        { stat: 'int', min: 2, max: 5 },
        { stat: 'critRate', min: 2, max: 5, suffix: '%' }
    ],
    rare: [
        { stat: 'hp', min: 30, max: 60 },
        { stat: 'mp', min: 15, max: 30 },
        { stat: 'str', min: 6, max: 12 },
        { stat: 'def', min: 6, max: 12 },
        { stat: 'spd', min: 5, max: 10 },
        { stat: 'int', min: 5, max: 10 },
        { stat: 'critRate', min: 5, max: 10, suffix: '%' },
        { stat: 'critDamage', min: 10, max: 25, suffix: '%' },
        { stat: 'lifeSteal', min: 2, max: 5, suffix: '%' }
    ],
    epic: [
        { stat: 'hp', min: 60, max: 120 },
        { stat: 'mp', min: 30, max: 60 },
        { stat: 'str', min: 12, max: 25 },
        { stat: 'def', min: 12, max: 25 },
        { stat: 'spd', min: 10, max: 20 },
        { stat: 'int', min: 10, max: 20 },
        { stat: 'critRate', min: 10, max: 20, suffix: '%' },
        { stat: 'critDamage', min: 25, max: 50, suffix: '%' },
        { stat: 'lifeSteal', min: 5, max: 10, suffix: '%' },
        { stat: 'elementDamage', min: 5, max: 15, suffix: '%' }
    ],
    legendary: [
        { stat: 'hp', min: 120, max: 250 },
        { stat: 'mp', min: 60, max: 120 },
        { stat: 'str', min: 25, max: 50 },
        { stat: 'def', min: 25, max: 50 },
        { stat: 'spd', min: 20, max: 40 },
        { stat: 'int', min: 20, max: 40 },
        { stat: 'critRate', min: 20, max: 35, suffix: '%' },
        { stat: 'critDamage', min: 50, max: 100, suffix: '%' },
        { stat: 'lifeSteal', min: 10, max: 20, suffix: '%' },
        { stat: 'elementDamage', min: 15, max: 30, suffix: '%' },
        { stat: 'allStats', min: 10, max: 25 }
    ]
};

// ==================== 敌人定义 ====================
const ENEMIES = {
    // 森林区域
    forest: [
        { name: '史莱姆', icon: '🟢', level: 1, hp: 30, str: 5, def: 2, spd: 3, xp: 10, gold: 5 },
        { name: '蘑菇怪', icon: '🍄', level: 2, hp: 40, str: 7, def: 3, spd: 4, xp: 15, gold: 8 },
        { name: '野狼', icon: '🐺', level: 3, hp: 50, str: 10, def: 4, spd: 8, xp: 20, gold: 12 },
        { name: '树精', icon: '🌳', level: 5, hp: 80, str: 12, def: 10, spd: 3, xp: 35, gold: 20 }
    ],
    // 洞穴区域
    cave: [
        { name: '蝙蝠', icon: '🦇', level: 6, hp: 60, str: 12, def: 5, spd: 10, xp: 40, gold: 25 },
        { name: '哥布林', icon: '👺', level: 7, hp: 80, str: 15, def: 8, spd: 7, xp: 50, gold: 30 },
        { name: '骷髅兵', icon: '💀', level: 8, hp: 70, str: 18, def: 6, spd: 6, xp: 55, gold: 35 },
        { name: '巨蜘蛛', icon: '🕷️', level: 10, hp: 120, str: 20, def: 10, spd: 12, xp: 80, gold: 50 }
    ],
    // 沙漠区域
    desert: [
        { name: '蝎子', icon: '🦂', level: 12, hp: 100, str: 22, def: 15, spd: 10, xp: 90, gold: 55 },
        { name: '沙漠盗匪', icon: '🥷', level: 14, hp: 130, str: 25, def: 12, spd: 14, xp: 110, gold: 70 },
        { name: '木乃伊', icon: '👻', level: 15, hp: 150, str: 20, def: 20, spd: 4, xp: 120, gold: 75 },
        { name: '沙虫', icon: '🐛', level: 18, hp: 200, str: 30, def: 18, spd: 8, xp: 160, gold: 100 }
    ],
    // 雪原区域
    snow: [
        { name: '雪狼', icon: '🐕', level: 20, hp: 180, str: 32, def: 15, spd: 18, xp: 180, gold: 110 },
        { name: '雪怪', icon: '❄️', level: 22, hp: 250, str: 35, def: 25, spd: 5, xp: 220, gold: 130 },
        { name: '冰元素', icon: '🧊', level: 25, hp: 200, str: 38, def: 20, spd: 12, xp: 250, gold: 150 },
        { name: '冰霜巨人', icon: '👹', level: 28, hp: 350, str: 42, def: 30, spd: 4, xp: 350, gold: 200 }
    ],
    // 龙巢区域
    dragon: [
        { name: '小龙', icon: '🐉', level: 30, hp: 300, str: 45, def: 25, spd: 15, xp: 400, gold: 250 },
        { name: '龙人守卫', icon: '🦖', level: 35, hp: 450, str: 50, def: 35, spd: 10, xp: 550, gold: 350 },
        { name: '双足飞龙', icon: '🐲', level: 40, hp: 600, str: 60, def: 40, spd: 20, xp: 800, gold: 500 }
    ]
};

// BOSS定义
const BOSSES = {
    forest: { name: '远古树精', icon: '🌲', level: 8, hp: 500, str: 25, def: 20, spd: 5, xp: 300, gold: 200 },
    cave: { name: '洞穴巨魔', icon: '👹', level: 15, hp: 800, str: 40, def: 30, spd: 6, xp: 600, gold: 400 },
    desert: { name: '法老王', icon: '🧟', level: 22, hp: 1200, str: 55, def: 40, spd: 10, xp: 1000, gold: 700 },
    snow: { name: '冰霜女王', icon: '👸', level: 32, hp: 2000, str: 70, def: 50, spd: 15, xp: 1800, gold: 1200 },
    dragon: { name: '混沌巨龙', icon: '🐲', level: 50, hp: 10000, str: 150, def: 100, spd: 25, xp: 10000, gold: 10000 }
};

// ==================== 地图定义 ====================
const MAP_NODES = [
    { id: 'village', name: '新手村', icon: '🏘️', type: 'safe', level: 0, unlocked: true },
    { id: 'forest', name: '迷雾森林', icon: '🌲', type: 'combat', level: 1, unlocked: true },
    { id: 'cave', name: '阴暗洞穴', icon: '🕳️', type: 'combat', level: 5, unlocked: false },
    { id: 'desert', name: '灼热沙漠', icon: '🏜️', type: 'combat', level: 10, unlocked: false },
    { id: 'snow', name: '冰封雪原', icon: '❄️', type: 'combat', level: 18, unlocked: false },
    { id: 'dragon', name: '龙之巢穴', icon: '🐲', type: 'boss', level: 30, unlocked: false }
];

// ==================== 游戏状态 ====================
let gameState = {
    party: [],
    inventory: [],
    gold: 100,
    fame: 0,
    currentMap: 'village',
    defeatedBosses: [],
    playTime: 0
};

let battleState = null;

// ==================== 初始化 ====================
function init() {
    loadGame();
    updateUI();
    setInterval(autoSave, CONFIG.AUTO_SAVE_INTERVAL);
    setInterval(updatePlayTime, 1000);
}

// ==================== 角色系统 ====================
function createCharacter(name, classId) {
    const classData = CLASSES[classId];
    const character = {
        id: Date.now() + Math.random(),
        name: name,
        class: classId,
        className: classData.name,
        icon: classData.icon,
        level: 1,
        xp: 0,
        xpToNext: 100,
        // 基础属性
        baseStats: { ...classData.baseStats },
        // 装备
        equipment: {
            weapon: null,
            helmet: null,
            armor: null,
            shield: null,
            accessory1: null,
            accessory2: null
        },
        // 当前状态
        currentHp: classData.baseStats.hp,
        currentMp: classData.baseStats.mp,
        // Buff状态
        buffs: []
    };
    
    return character;
}

function calculateStats(character) {
    const classData = CLASSES[character.class];
    const stats = { ...character.baseStats };
    
    // 等级加成
    const levelBonus = character.level - 1;
    stats.hp += Math.floor(classData.growth.hp * levelBonus);
    stats.mp += Math.floor(classData.growth.mp * levelBonus);
    stats.str += Math.floor(classData.growth.str * levelBonus);
    stats.def += Math.floor(classData.growth.def * levelBonus);
    stats.spd += Math.floor(classData.growth.spd * levelBonus);
    stats.int += Math.floor(classData.growth.int * levelBonus);
    
    // 装备加成
    Object.values(character.equipment).forEach(item => {
        if (item) {
            Object.entries(item.stats).forEach(([stat, value]) => {
                if (stat !== 'critRate' && stat !== 'critDamage' && stat !== 'lifeSteal' && stat !== 'elementDamage') {
                    stats[stat] = (stats[stat] || 0) + value;
                } else {
                    stats[stat] = (stats[stat] || 0) + value;
                }
            });
        }
    });
    
    return stats;
}

function levelUp(character) {
    character.level++;
    character.xp -= character.xpToNext;
    character.xpToNext = Math.floor(100 * Math.pow(CONFIG.XP_CURVE, character.level - 1));
    
    const classData = CLASSES[character.class];
    character.baseStats.hp += Math.floor(classData.growth.hp);
    character.baseStats.mp += Math.floor(classData.growth.mp);
    character.currentHp = character.baseStats.hp;
    character.currentMp = character.baseStats.mp;
    
    return character.level;
}

function gainXp(character, amount) {
    character.xp += amount;
    let levelsGained = 0;
    
    while (character.xp >= character.xpToNext && character.level < CONFIG.MAX_LEVEL) {
        levelUp(character);
        levelsGained++;
    }
    
    return levelsGained;
}

// ==================== 装备生成系统 ====================
function generateEquipment(slot, playerLevel) {
    // 确定品质
    const rarity = rollRarity();
    
    // 获取基础装备
    let baseEquip;
    if (slot === 'accessory1' || slot === 'accessory2') {
        const available = EQUIPMENT_BASE.accessory.filter(e => e.minLevel <= playerLevel);
        baseEquip = available[Math.floor(Math.random() * available.length)] || EQUIPMENT_BASE.accessory[0];
    } else {
        const available = EQUIPMENT_BASE[slot].filter(e => e.minLevel <= playerLevel);
        baseEquip = available[Math.floor(Math.random() * available.length)] || EQUIPMENT_BASE[slot][0];
    }
    
    // 创建装备
    const equipment = {
        id: Date.now() + Math.random(),
        name: `${RARITY_NAMES[rarity]}${baseEquip.name}`,
        slot: slot,
        type: slot === 'accessory1' || slot === 'accessory2' ? 'accessory' : slot,
        rarity: rarity,
        level: playerLevel,
        stats: {},
        affixes: []
    };
    
    // 基础属性（根据品质加成）
    const rarityMultiplier = { common: 1, magic: 1.3, rare: 1.7, epic: 2.3, legendary: 3 };
    const multiplier = rarityMultiplier[rarity];
    
    if (EQUIPMENT_TYPES[slot]) {
        const mainStat = EQUIPMENT_TYPES[slot].stat;
        equipment.stats[mainStat] = Math.floor(baseEquip.baseValue * multiplier);
    }
    
    // 随机词条
    const numAffixes = { common: 0, magic: 1, rare: 2, epic: 3, legendary: 4 };
    const affixCount = numAffixes[rarity];
    
    for (let i = 0; i < affixCount; i++) {
        const affix = rollAffix(rarity);
        if (affix) {
            const value = Math.floor(Math.random() * (affix.max - affix.min + 1)) + affix.min;
            equipment.stats[affix.stat] = (equipment.stats[affix.stat] || 0) + value;
            equipment.affixes.push({
                stat: affix.stat,
                value: value,
                suffix: affix.suffix || ''
            });
        }
    }
    
    return equipment;
}

function rollRarity() {
    const roll = Math.random() * 100;
    let cumulative = 0;
    
    for (const [rarity, weight] of Object.entries(CONFIG.RARITY_WEIGHTS)) {
        cumulative += weight;
        if (roll < cumulative) return rarity;
    }
    
    return 'common';
}

function rollAffix(rarity) {
    const pool = AFFIX_POOL[rarity];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

// ==================== 存档系统 ====================
function saveGame() {
    const saveData = {
        ...gameState,
        saveTime: Date.now()
    };
    localStorage.setItem('dragonQuestJRPG', JSON.stringify(saveData));
    console.log('游戏已保存');
}

function loadGame() {
    const saveData = localStorage.getItem('dragonQuestJRPG');
    if (saveData) {
        try {
            const parsed = JSON.parse(saveData);
            gameState = { ...gameState, ...parsed };
            document.getElementById('continueBtn').style.display = 'block';
        } catch (e) {
            console.error('存档加载失败:', e);
        }
    }
}

function autoSave() {
    if (gameState.party.length > 0) {
        saveGame();
    }
}

function updatePlayTime() {
    gameState.playTime++;
}

// ==================== 场景切换 ====================
function showScene(sceneId) {
    document.querySelectorAll('.scene').forEach(scene => {
        scene.classList.remove('active');
    });
    document.getElementById(sceneId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 更新导航栏激活状态
    if (sceneId === 'sceneMenu') {
        document.querySelectorAll('.nav-btn')[0]?.classList.add('active');
    } else if (sceneId === 'sceneParty') {
        document.querySelectorAll('.nav-btn')[1]?.classList.add('active');
        renderParty();
    } else if (sceneId === 'sceneMap') {
        document.querySelectorAll('.nav-btn')[2]?.classList.add('active');
        renderMap();
    } else if (sceneId === 'sceneBattle') {
        document.querySelectorAll('.nav-btn')[3]?.classList.add('active');
    }
}

// ==================== UI更新 ====================
function updateUI() {
    document.getElementById('headerGold').textContent = gameState.gold;
    document.getElementById('headerFame').textContent = gameState.fame;
}

// ==================== 初始化游戏 ====================
function startNewGame() {
    gameState = {
        party: [],
        inventory: [],
        gold: 500,
        fame: 0,
        currentMap: 'village',
        defeatedBosses: [],
        playTime: 0
    };
    
    // 创建初始队伍
    gameState.party.push(createCharacter('勇者', 'warrior'));
    gameState.party.push(createCharacter('法师', 'mage'));
    gameState.party.push(createCharacter('牧师', 'priest'));
    gameState.party.push(createCharacter('盗贼', 'rogue'));
    
    // 给初始装备
    gameState.party.forEach(char => {
        char.equipment.weapon = generateEquipment('weapon', 1);
        char.equipment.armor = generateEquipment('armor', 1);
    });
    
    // 给一些初始药水
    gameState.inventory.push({ type: 'consumable', name: '生命药水', icon: '🧪', effect: 'heal', value: 50, count: 5 });
    gameState.inventory.push({ type: 'consumable', name: '魔法药水', icon: '💧', effect: 'restore', value: 30, count: 3 });
    
    document.getElementById('navBar').style.display = 'flex';
    document.getElementById('continueBtn').style.display = 'block';
    
    saveGame();
    updateUI();
    showScene('sceneParty');
}

function continueGame() {
    document.getElementById('navBar').style.display = 'flex';
    updateUI();
    showScene('sceneParty');
}

// ==================== 渲染队伍界面 ====================
function renderParty() {
    const container = document.getElementById('partyContainer');
    container.innerHTML = '';
    
    gameState.party.forEach((char, index) => {
        const stats = calculateStats(char);
        const card = document.createElement('div');
        card.className = 'character-card';
        
        card.innerHTML = `
            <div class="character-header">
                <div class="character-avatar">${char.icon}</div>
                <div class="character-info">
                    <h3>${char.name}</h3>
                    <div class="character-class">${char.className} Lv.${char.level}</div>
                    <div class="character-level">EXP: ${char.xp}/${char.xpToNext}</div>
                </div>
            </div>
            
            <div class="bar-container">
                <div class="bar-label">
                    <span>HP</span>
                    <span>${char.currentHp}/${stats.hp}</span>
                </div>
                <div class="bar">
                    <div class="bar-fill hp-bar" style="width: ${(char.currentHp/stats.hp)*100}%"></div>
                </div>
            </div>
            
            <div class="bar-container">
                <div class="bar-label">
                    <span>MP</span>
                    <span>${char.currentMp}/${stats.mp}</span>
                </div>
                <div class="bar">
                    <div class="bar-fill mp-bar" style="width: ${(char.currentMp/stats.mp)*100}%"></div>
                </div>
            </div>
            
            <div class="character-stats">
                <div class="stat-row"><span class="stat-label">力量</span><span class="stat-value">${stats.str}</span></div>
                <div class="stat-row"><span class="stat-label">防御</span><span class="stat-value">${stats.def}</span></div>
                <div class="stat-row"><span class="stat-label">速度</span><span class="stat-value">${stats.spd}</span></div>
                <div class="stat-row"><span class="stat-label">智力</span><span class="stat-value">${stats.int}</span></div>
            </div>
            
            <div class="equipment-section">
                <div class="equipment-title">装备</div>
                <div class="equipment-slots">
                    ${renderEquipmentSlots(char)}
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function renderEquipmentSlots(char) {
    const slots = [
        { key: 'weapon', icon: '⚔️' },
        { key: 'helmet', icon: '🪖' },
        { key: 'armor', icon: '🛡️' },
        { key: 'shield', icon: '⛨' },
        { key: 'accessory1', icon: '💍' },
        { key: 'accessory2', icon: '📿' }
    ];
    
    return slots.map(slot => {
        const item = char.equipment[slot.key];
        const rarityClass = item ? `rarity-${item.rarity}` : '';
        const name = item ? item.name : EQUIPMENT_TYPES[slot.key]?.name || slot.key;
        
        return `
            <div class="equipment-slot ${!item ? 'empty' : ''} ${rarityClass}" onclick="showEquipmentModal('${char.id}', '${slot.key}')">
                <span class="slot-icon">${item ? getEquipmentIcon(item.type) : slot.icon}</span>
                <span class="slot-name">${name}</span>
            </div>
        `;
    }).join('');
}

function getEquipmentIcon(type) {
    const icons = {
        weapon: '⚔️',
        helmet: '🪖',
        armor: '🛡️',
        shield: '⛨',
        accessory: '💍'
    };
    return icons[type] || '📦';
}

// ==================== 渲染地图 ====================
function renderMap() {
    const container = document.getElementById('mapContainer');
    container.innerHTML = '';
    
    MAP_NODES.forEach(node => {
        const isCurrent = node.id === gameState.currentMap;
        const isLocked = !node.unlocked && !gameState.defeatedBosses.includes(node.id);
        
        const nodeEl = document.createElement('div');
        nodeEl.className = `map-node ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`;
        
        if (!isLocked) {
            nodeEl.onclick = () => enterMap(node);
        }
        
        nodeEl.innerHTML = `
            <div class="map-icon">${isLocked ? '🔒' : node.icon}</div>
            <div class="map-name">${node.name}</div>
            ${!isLocked ? `<div style="font-size:10px;color:#95a5a6;">Lv.${node.level}+</div>
            ` : ''}
        `;
        
        container.appendChild(nodeEl);
    });
}

function enterMap(node) {
    if (node.type === 'safe') {
        // 回到村庄，恢复HP/MP
        gameState.party.forEach(char => {
            const stats = calculateStats(char);
            char.currentHp = stats.hp;
            char.currentMp = stats.mp;
        });
        gameState.currentMap = node.id;
        renderParty();
        showScene('sceneParty');
        addLog('🏘️ 回到村庄，队伍已完全恢复！');
    } else {
        // 进入战斗
        gameState.currentMap = node.id;
        startBattle(node);
    }
}

// ==================== 战斗系统 ====================
function startBattle(mapNode) {
    battleState = {
        enemies: generateEnemies(mapNode),
        turn: 0,
        activeCharacterIndex: 0,
        selectedTarget: null,
        log: []
    };
    
    renderBattle();
    showScene('sceneBattle');
    addBattleLog(`⚔️ 战斗开始！遭遇了敌人！`, 'system');
    
    // 开始第一回合
    nextTurn();
}

function generateEnemies(mapNode) {
    const enemies = [];
    const enemyPool = ENEMIES[mapNode.id] || ENEMIES.forest;
    
    // 根据地图决定敌人数量
    const count = mapNode.type === 'boss' ? 1 : Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < count; i++) {
        const template = enemyPool[Math.floor(Math.random() * enemyPool.length)];
        enemies.push({
            ...template,
            id: Date.now() + i,
            currentHp: template.hp,
            maxHp: template.hp
        });
    }
    
    return enemies;
}

function renderBattle() {
    // 渲染敌人
    const enemiesContainer = document.getElementById('battleEnemies');
    enemiesContainer.innerHTML = battleState.enemies.map((enemy, index) => `
        <div class="enemy-unit ${battleState.selectedTarget === index ? 'targeted' : ''}" 
             onclick="selectTarget(${index})"
             style="${enemy.currentHp <= 0 ? 'opacity:0.3;pointer-events:none;' : ''}">
            <div class="enemy-sprite">${enemy.icon}</div>
            <div style="font-size:12px;font-weight:bold;">${enemy.name}</div>
            <div class="enemy-hp-bar">
                <div class="bar-fill hp-bar" style="width:${(enemy.currentHp/enemy.maxHp)*100}%"></div>
            </div>
            <div style="font-size:10px;">${enemy.currentHp}/${enemy.maxHp}</div>
        </div>
    `).join('');
    
    // 渲染队伍
    const partyContainer = document.getElementById('battleParty');
    partyContainer.innerHTML = gameState.party.map((char, index) => {
        const stats = calculateStats(char);
        const isActive = index === battleState.activeCharacterIndex && char.currentHp > 0;
        return `
            <div class="party-member ${isActive ? 'active' : ''} ${char.currentHp <= 0 ? 'dead' : ''}">
                <div class="member-sprite">${char.currentHp <= 0 ? '💀' : char.icon}</div>
                <div class="member-name">${char.name}</div>
                <div class="member-hp">${char.currentHp}/${stats.hp}</div>
                <div style="font-size:10px;color:#3498db;">${char.currentMp}/${stats.mp}</div>
            </div>
        `;
    }).join('');
}

function selectTarget(index) {
    if (battleState.enemies[index].currentHp > 0) {
        battleState.selectedTarget = index;
        renderBattle();
    }
}

function nextTurn() {
    // 检查战斗是否结束
    if (checkBattleEnd()) return;
    
    // 找到下一个存活的角色
    while (battleState.activeCharacterIndex < gameState.party.length) {
        const char = gameState.party[battleState.activeCharacterIndex];
        if (char.currentHp > 0) {
            renderBattle();
            enableBattleButtons(true);
            return;
        }
        battleState.activeCharacterIndex++;
    }
    
    // 如果所有角色都行动过了，进入敌人回合
    enemyTurn();
}

function enemyTurn() {
    enableBattleButtons(false);
    
    battleState.enemies.forEach((enemy, index) => {
        if (enemy.currentHp > 0) {
            setTimeout(() => {
                enemyAttack(enemy, index);
            }, index * 1000);
        }
    });
    
    // 敌人回合结束后，重置角色回合
    setTimeout(() => {
        battleState.activeCharacterIndex = 0;
        battleState.turn++;
        nextTurn();
    }, battleState.enemies.length * 1000 + 500);
}

function enemyAttack(enemy, enemyIndex) {
    // 选择目标（优先攻击存活的角色）
    const aliveChars = gameState.party.map((c, i) => ({ char: c, index: i })).filter(c => c.char.currentHp > 0);
    if (aliveChars.length === 0) return;
    
    const target = aliveChars[Math.floor(Math.random() * aliveChars.length)];
    const targetChar = target.char;
    const targetStats = calculateStats(targetChar);
    
    // 计算伤害
    const damage = Math.max(1, enemy.str - targetStats.def + Math.floor(Math.random() * 5) - 2);
    targetChar.currentHp = Math.max(0, targetChar.currentHp - damage);
    
    addBattleLog(`🐲 ${enemy.name} 攻击 ${targetChar.name}，造成 ${damage} 点伤害！`, 'damage');
    showDamageNumber(document.querySelectorAll('.party-member')[target.index], damage);
    
    renderBattle();
}

function battleAction(action) {
    const char = gameState.party[battleState.activeCharacterIndex];
    if (!char || char.currentHp <= 0) return;
    
    const stats = calculateStats(char);
    
    switch(action) {
        case 'attack':
            if (battleState.selectedTarget === null) {
                addBattleLog('请先选择攻击目标！', 'system');
                return;
            }
            performAttack(char, stats);
            break;
        case 'skill':
            showSkillMenu(char);
            return;
        case 'item':
            showItemMenu();
            return;
        case 'defend':
            addBattleLog(`${char.name} 进入防御姿态！`, 'buff');
            endCharacterTurn();
            break;
    }
}

function performAttack(char, stats) {
    const target = battleState.enemies[battleState.selectedTarget];
    if (!target || target.currentHp <= 0) {
        addBattleLog('目标已死亡，请选择其他目标！', 'system');
        return;
    }
    
    enableBattleButtons(false);
    
    // 计算伤害
    const isCrit = Math.random() < (stats.critRate || 0) / 100 || Math.random() < 0.1;
    let damage = Math.max(1, stats.str - target.def + Math.floor(Math.random() * 6) - 3);
    
    if (isCrit) {
        damage = Math.floor(damage * ((stats.critDamage || 150) / 100));
        addBattleLog(`⚔️ ${char.name} 暴击！对 ${target.name} 造成 ${damage} 点伤害！`, 'crit');
    } else {
        addBattleLog(`⚔️ ${char.name} 攻击 ${target.name}，造成 ${damage} 点伤害！`, 'damage');
    }
    
    target.currentHp = Math.max(0, target.currentHp - damage);
    showDamageNumber(document.querySelectorAll('.enemy-unit')[battleState.selectedTarget], damage);
    
    // 生命偷取
    if (stats.lifeSteal) {
        const heal = Math.floor(damage * stats.lifeSteal / 100);
        char.currentHp = Math.min(stats.hp, char.currentHp + heal);
        addBattleLog(`💖 ${char.name} 吸取了 ${heal} 点生命！`, 'heal');
    }
    
    renderBattle();
    
    setTimeout(() => {
        endCharacterTurn();
    }, 500);
}

function endCharacterTurn() {
    battleState.activeCharacterIndex++;
    battleState.selectedTarget = null;
    nextTurn();
}

function checkBattleEnd() {
    // 检查敌人是否全灭
    const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);
    if (aliveEnemies.length === 0) {
        victory();
        return true;
    }
    
    // 检查队伍是否全灭
    const aliveChars = gameState.party.filter(c => c.currentHp > 0);
    if (aliveChars.length === 0) {
        defeat();
        return true;
    }
    
    return false;
}

function victory() {
    enableBattleButtons(false);
    
    // 计算奖励
    let totalXp = 0;
    let totalGold = 0;
    
    battleState.enemies.forEach(enemy => {
        totalXp += enemy.xp;
        totalGold += enemy.gold;
    });
    
    gameState.gold += totalGold;
    
    // 分配经验
    const aliveChars = gameState.party.filter(c => c.currentHp > 0);
    const xpPerChar = Math.floor(totalXp / aliveChars.length);
    
    aliveChars.forEach(char => {
        const levels = gainXp(char, xpPerChar);
        if (levels > 0) {
            addBattleLog(`🎉 ${char.name} 升到了 ${char.level} 级！`, 'buff');
        }
    });
    
    addBattleLog(`🏆 战斗胜利！获得 ${totalXp} 经验和 ${totalGold} 金币！`, 'loot');
    
    // 掉落装备
    if (Math.random() < 0.5) {
        const rarity = rollRarity();
        const slots = ['weapon', 'helmet', 'armor', 'shield', 'accessory1'];
        const slot = slots[Math.floor(Math.random() * slots.length)];
        const avgLevel = Math.floor(gameState.party.reduce((sum, c) => sum + c.level, 0) / gameState.party.length);
        const loot = generateEquipment(slot, avgLevel);
        gameState.inventory.push(loot);
        addBattleLog(`🎁 获得了 [${RARITY_NAMES[rarity]}] ${loot.name}！`, 'loot');
    }
    
    updateUI();
    saveGame();
    
    setTimeout(() => {
        alert(`战斗胜利！\n获得 ${totalXp} 经验\n获得 ${totalGold} 金币`);
        showScene('sceneMap');
    }, 1500);
}

function defeat() {
    addBattleLog('💀 队伍全灭了...', 'damage');
    
    setTimeout(() => {
        alert('战斗失败...\n回到村庄恢复后再来吧！');
        // 回到村庄
        gameState.currentMap = 'village';
        gameState.party.forEach(char => {
            const stats = calculateStats(char);
            char.currentHp = 1; // 保留1点HP
            char.currentMp = Math.floor(stats.mp / 2);
        });
        showScene('sceneMap');
    }, 1500);
}

function enableBattleButtons(enable) {
    document.querySelectorAll('.battle-btn').forEach(btn => {
        btn.disabled = !enable;
    });
}

function addBattleLog(message, type = 'normal') {
    const logContainer = document.getElementById('battleLog');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = message;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function showDamageNumber(element, damage, isHeal = false) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const number = document.createElement('div');
    number.className = 'damage-number';
    number.textContent = isHeal ? `+${damage}` : `-${damage}`;
    number.style.color = isHeal ? '#2ecc71' : '#e74c3c';
    number.style.left = rect.left + rect.width / 2 + 'px';
    number.style.top = rect.top + 'px';
    document.body.appendChild(number);
    setTimeout(() => number.remove(), 1000);
}

// ==================== 弹窗系统 ====================
function showEquipmentModal(charId, slot) {
    // 简化版，实际应该显示装备详情和更换界面
    const char = gameState.party.find(c => c.id === charId);
    const item = char.equipment[slot];
    
    if (item) {
        let statsHtml = Object.entries(item.stats).map(([stat, value]) => {
            const statNames = { str: '力量', def: '防御', spd: '速度', int: '智力', hp: '生命', mp: '魔法' };
            return `<div>${statNames[stat] || stat}: +${value}</div>`;
        }).join('');
        
        document.getElementById('modalTitle').textContent = item.name;
        document.getElementById('modalTitle').className = `modal-title rarity-${item.rarity}`;
        document.getElementById('modalContent').innerHTML = `
            <div style="text-align:center;margin-bottom:20px;font-size:60px;">${getEquipmentIcon(item.type)}</div>
            <div style="margin-bottom:15px;"><strong>品质:</strong> <span class="rarity-${item.rarity}">${RARITY_NAMES[item.rarity]}</span></div>
            <div style="margin-bottom:15px;"><strong>等级:</strong> ${item.level}</div>
            <div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:10px;">
                <strong>属性:</strong>
                ${statsHtml}
            </div>
        `;
        document.getElementById('modalOverlay').classList.add('active');
    }
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function showSkillMenu(char) {
    // 简化版
    addBattleLog(`${char.name} 使用技能功能开发中...`, 'system');
}

function showItemMenu() {
    // 简化版
    addBattleLog(`物品功能开发中...`, 'system');
}

// ==================== 启动游戏 ====================
window.onload = init;
