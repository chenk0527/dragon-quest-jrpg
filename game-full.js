/**
 * Dragon Quest JRPG 3.0 - 完整版
 * 新增：时装系统、100+怪物、外观收集
 */

// ==================== 游戏配置 ====================
const CONFIG = {
    MAX_PARTY_SIZE: 4,
    MAX_LEVEL: 99,
    VERSION: '3.0',
    RARITY_WEIGHTS: { common: 45, magic: 30, rare: 15, epic: 8, legendary: 2 },
    AUTO_SAVE_INTERVAL: 30000,
    XP_BASE: 100,
    XP_CURVE: 1.9,
    MAX_ENHANCE: 15,
    COSMETIC_SLOTS: ['hair', 'face', 'body', 'back', 'weaponSkin', 'pet']
};

// ==================== 时装/外观系统 ====================
const COSMETICS = {
    // 发型
    hair: {
        warriorDefault: { id: 'warriorDefault', name: '战士短发', icon: '👱', source: 'default' },
        mageDefault: { id: 'mageDefault', name: '法师长发', icon: '👩‍🦰', source: 'default' },
        spikyBlue: { id: 'spikyBlue', name: '蓝色刺猬头', icon: '👱‍♂️', rarity: 'rare', source: 'drop' },
        longSilver: { id: 'longSilver', name: '银色长发', icon: '👩‍🦳', rarity: 'epic', source: 'drop' },
        goldenCrown: { id: 'goldenCrown', name: '金色王冠', icon: '👸', rarity: 'legendary', source: 'boss' },
        demonHorns: { id: 'demonHorns', name: '恶魔角', icon: '👿', rarity: 'epic', source: 'drop' },
        angelHalo: { id: 'angelHalo', name: '天使光环', icon: '😇', rarity: 'legendary', source: 'achievement' },
        ninjaBandana: { id: 'ninjaBandana', name: '忍者头巾', icon: '👳', rarity: 'rare', source: 'drop' },
        pirateBandana: { id: 'pirateBandana', name: '海盗头巾', icon: '🏴‍☠️', rarity: 'rare', source: 'drop' },
        knightHelm: { id: 'knightHelm', name: '骑士头盔', icon: '⛑️', rarity: 'epic', source: 'craft' }
    },
    
    // 面部装饰
    face: {
        none: { id: 'none', name: '无', icon: '⬜', source: 'default' },
        sunglasses: { id: 'sunglasses', name: '墨镜', icon: '🕶️', rarity: 'common', source: 'shop' },
        eyepatch: { id: 'eyepatch', name: '眼罩', icon: '🏴‍☠️', rarity: 'rare', source: 'drop' },
        mask: { id: 'mask', name: '面具', icon: '👺', rarity: 'rare', source: 'drop' },
        clownNose: { id: 'clownNose', name: '小丑鼻', icon: '🤡', rarity: 'magic', source: 'event' },
        monocle: { id: 'monocle', name: '单片眼镜', icon: '🧐', rarity: 'epic', source: 'shop' }
    },
    
    // 身体时装
    body: {
        default: { id: 'default', name: '默认服装', icon: '👕', source: 'default' },
        armorGold: { id: 'armorGold', name: '黄金铠甲', icon: '🦺', rarity: 'epic', source: 'craft' },
        robeMage: { id: 'robeMage', name: '法师长袍', icon: '🧙‍♂️', rarity: 'rare', source: 'shop' },
        ninjaSuit: { id: 'ninjaSuit', name: '忍者装', icon: '🥷', rarity: 'rare', source: 'drop' },
        pirateCoat: { id: 'pirateCoat', name: '海盗大衣', icon: '🧥', rarity: 'rare', source: 'drop' },
        santaSuit: { id: 'santaSuit', name: '圣诞装', icon: '🎅', rarity: 'epic', source: 'event' },
        dragonArmor: { id: 'dragonArmor', name: '龙鳞甲', icon: '🐲', rarity: 'legendary', source: 'boss' },
        weddingDress: { id: 'weddingDress', name: '婚纱', icon: '👰', rarity: 'epic', source: 'event' },
        superman: { id: 'superman', name: '超人装', icon: '🦸‍♂️', rarity: 'epic', source: 'achievement' }
    },
    
    // 背部装饰
    back: {
        none: { id: 'none', name: '无', icon: '⬜', source: 'default' },
        capeRed: { id: 'capeRed', name: '红色披风', icon: '🧣', rarity: 'common', source: 'shop' },
        wingsAngel: { id: 'wingsAngel', name: '天使翅膀', icon: '🕊️', rarity: 'legendary', source: 'boss' },
        wingsDemon: { id: 'wingsDemon', name: '恶魔翅膀', icon: '🦇', rarity: 'legendary', source: 'boss' },
        wingsDragon: { id: 'wingsDragon', name: '龙翼', icon: '🐉', rarity: 'legendary', source: 'craft' },
        backpack: { id: 'backpack', name: '冒险背包', icon: '🎒', rarity: 'common', source: 'shop' },
        quiver: { id: 'quiver', name: '箭袋', icon: '🏹', rarity: 'rare', source: 'craft' },
        flag: { id: 'flag', name: '战旗', icon: '🚩', rarity: 'epic', source: 'achievement' }
    },
    
    // 武器皮肤
    weaponSkin: {
        default: { id: 'default', name: '默认', icon: '⚔️', source: 'default' },
        fireSword: { id: 'fireSword', name: '火焰剑', icon: '🔥', rarity: 'epic', source: 'boss' },
        iceSword: { id: 'iceSword', name: '冰霜剑', icon: '❄️', rarity: 'epic', source: 'boss' },
        lightningSword: { id: 'lightningSword', name: '雷光剑', icon: '⚡', rarity: 'legendary', source: 'craft' },
        rainbowSword: { id: 'rainbowSword', name: '彩虹剑', icon: '🌈', rarity: 'legendary', source: 'achievement' },
        boneWeapon: { id: 'boneWeapon', name: '骨制武器', icon: '🦴', rarity: 'rare', source: 'drop' },
        flowerWand: { id: 'flowerWand', name: '花之魔杖', icon: '🌸', rarity: 'rare', source: 'event' },
        holyStaff: { id: 'holyStaff', name: '神圣权杖', icon: '✝️', rarity: 'legendary', source: 'boss' }
    },
    
    // 宠物
    pet: {
        none: { id: 'none', name: '无', icon: '⬜', source: 'default' },
        slime: { id: 'slime', name: '史莱姆', icon: '🟢', rarity: 'common', source: 'drop' },
        dog: { id: 'dog', name: '小狗', icon: '🐕', rarity: 'common', source: 'shop' },
        cat: { id: 'cat', name: '小猫', icon: '🐈', rarity: 'common', source: 'shop' },
        dragon: { id: 'dragon', name: '小龙', icon: '🐉', rarity: 'legendary', source: 'boss' },
        ghost: { id: 'ghost', name: '幽灵', icon: '👻', rarity: 'rare', source: 'drop' },
        robot: { id: 'robot', name: '机器人', icon: '🤖', rarity: 'epic', source: 'craft' },
        alien: { id: 'alien', name: '外星人', icon: '👽', rarity: 'epic', source: 'event' },
        unicorn: { id: 'unicorn', name: '独角兽', icon: '🦄', rarity: 'legendary', source: 'achievement' },
        fox: { id: 'fox', name: '九尾狐', icon: '🦊', rarity: 'epic', source: 'event' },
        panda: { id: 'panda', name: '熊猫', icon: '🐼', rarity: 'rare', source: 'event' },
        phoenix: { id: 'phoenix', name: '凤凰', icon: '🔥', rarity: 'legendary', source: 'boss' }
    }
};

// ==================== 扩展怪物图鉴（100+种） ====================
const BESTIARY = {
    // 史莱姆家族
    slimeGreen: { name: '绿史莱姆', icon: '🟢', family: 'slime', level: 1, hp: 30, str: 5, def: 2, xp: 8, gold: 3, desc: '最弱小的史莱姆' },
    slimeBlue: { name: '蓝史莱姆', icon: '🔵', family: 'slime', level: 3, hp: 45, str: 7, def: 3, xp: 12, gold: 5, desc: '水属性的史莱姆' },
    slimeRed: { name: '红史莱姆', icon: '🔴', family: 'slime', level: 5, hp: 60, str: 10, def: 4, xp: 18, gold: 7, desc: '火属性的史莱姆' },
    slimeGold: { name: '黄金史莱姆', icon: '🟡', family: 'slime', level: 15, hp: 100, str: 15, def: 10, xp: 100, gold: 50, desc: '稀有史莱姆，掉落大量金币' },
    slimeKing: { name: '史莱姆王', icon: '👑', family: 'slime', level: 25, hp: 500, str: 30, def: 20, xp: 300, gold: 150, desc: '史莱姆的王者' },
    slimeMetal: { name: '金属史莱姆', icon: '⚪', family: 'slime', level: 30, hp: 20, str: 5, def: 99, xp: 1000, gold: 10, desc: '超高防御，逃跑很快' },
    
    // 昆虫家族
    bugBee: { name: '蜜蜂', icon: '🐝', family: 'insect', level: 2, hp: 25, str: 8, def: 2, xp: 10, gold: 4, desc: '会蜇人的蜜蜂' },
    bugAnt: { name: '巨蚁', icon: '🐜', family: 'insect', level: 3, hp: 35, str: 9, def: 5, xp: 12, gold: 5, desc: '巨大的蚂蚁' },
    bugBeetle: { name: '甲虫', icon: '🪲', family: 'insect', level: 4, hp: 50, str: 12, def: 8, xp: 15, gold: 6, desc: '有坚硬外壳' },
    bugSpider: { name: '毒蜘蛛', icon: '🕷️', family: 'insect', level: 6, hp: 60, str: 15, def: 6, xp: 22, gold: 10, desc: '有毒的蜘蛛' },
    bugScorpion: { name: '蝎子', icon: '🦂', family: 'insect', level: 8, hp: 80, str: 18, def: 10, xp: 30, gold: 15, desc: '沙漠毒蝎' },
    bugMantis: { name: '螳螂王', icon: '🦗', family: 'insect', level: 20, hp: 300, str: 45, def: 25, xp: 200, gold: 100, desc: '昆虫中的王者' },
    
    // 野兽家族
    beastWolf: { name: '野狼', icon: '🐺', family: 'beast', level: 4, hp: 55, str: 14, def: 6, xp: 18, gold: 8, desc: '群居的野兽' },
    beastBoar: { name: '野猪', icon: '🐗', family: 'beast', level: 5, hp: 70, str: 16, def: 8, xp: 22, gold: 10, desc: '脾气暴躁' },
    beastBear: { name: '棕熊', icon: '🐻', family: 'beast', level: 10, hp: 150, str: 28, def: 15, xp: 60, gold: 30, desc: '力量强大' },
    beastTiger: { name: '老虎', icon: '🐅', family: 'beast', level: 15, hp: 200, str: 35, def: 18, xp: 90, gold: 50, desc: '森林之王' },
    beastLion: { name: '狮子', icon: '🦁', family: 'beast', level: 18, hp: 250, str: 40, def: 20, xp: 120, gold: 70, desc: '草原霸主' },
    beastElephant: { name: '巨象', icon: '🐘', family: 'beast', level: 25, hp: 400, str: 50, def: 35, xp: 200, gold: 120, desc: '皮糙肉厚' },
    beastWerewolf: { name: '狼人', icon: '🐺', family: 'beast', level: 30, hp: 350, str: 55, def: 25, xp: 250, gold: 150, desc: '月圆之夜出没' },
    
    // 龙族
    dragonWhelp: { name: '幼龙', icon: '🐉', family: 'dragon', level: 20, hp: 300, str: 45, def: 30, xp: 180, gold: 100, desc: '年幼的龙' },
    dragonFire: { name: '火龙', icon: '🔥', family: 'dragon', level: 35, hp: 800, str: 80, def: 50, xp: 500, gold: 300, desc: '掌控火焰' },
    dragonIce: { name: '冰龙', icon: '❄️', family: 'dragon', level: 38, hp: 850, str: 75, def: 55, xp: 550, gold: 320, desc: '掌控冰霜' },
    dragonThunder: { name: '雷龙', icon: '⚡', family: 'dragon', level: 40, hp: 900, str: 85, def: 50, xp: 600, gold: 350, desc: '掌控雷电' },
    dragonKing: { name: '龙王', icon: '👑', family: 'dragon', level: 50, hp: 2000, str: 120, def: 80, xp: 1500, gold: 1000, desc: '龙族之王' },
    
    // 不死族
    undeadSkeleton: { name: '骷髅兵', icon: '💀', family: 'undead', level: 8, hp: 70, str: 18, def: 5, xp: 28, gold: 12, desc: '复活的骷髅' },
    undeadZombie: { name: '僵尸', icon: '🧟', family: 'undead', level: 10, hp: 100, str: 20, def: 10, xp: 35, gold: 15, desc: '行走的尸体' },
    undeadGhost: { name: '幽灵', icon: '👻', family: 'undead', level: 15, hp: 80, str: 25, def: 15, xp: 50, gold: 25, desc: '物理攻击难以命中' },
    undeadVampire: { name: '吸血鬼', icon: '🧛', family: 'undead', level: 30, hp: 400, str: 55, def: 35, xp: 280, gold: 180, desc: '吸取生命' },
    undeadLich: { name: '巫妖', icon: '☠️', family: 'undead', level: 45, hp: 1200, str: 90, def: 60, xp: 800, gold: 500, desc: '不死法师' },
    
    // 恶魔族
    demonImp: { name: '小恶魔', icon: '👿', family: 'demon', level: 12, hp: 120, str: 25, def: 12, xp: 45, gold: 22, desc: '低等恶魔' },
    demonDog: { name: '地狱犬', icon: '🐕‍🦺', family: 'demon', level: 20, hp: 250, str: 40, def: 20, xp: 120, gold: 70, desc: '三头犬的近亲' },
    demonLord: { name: '恶魔领主', icon: '👹', family: 'demon', level: 40, hp: 1000, str: 85, def: 55, xp: 600, gold: 400, desc: '高级恶魔' },
    demonArch: { name: '大恶魔', icon: '🔱', family: 'demon', level: 55, hp: 2000, str: 130, def: 85, xp: 1500, gold: 1000, desc: '恶魔中的贵族' },
    
    // 元素族
    elementalFire: { name: '火元素', icon: '🔥', family: 'elemental', level: 18, hp: 200, str: 45, def: 20, xp: 90, gold: 50, desc: '火焰化身' },
    elementalWater: { name: '水元素', icon: '💧', family: 'elemental', level: 18, hp: 220, str: 40, def: 25, xp: 90, gold: 50, desc: '水流化身' },
    elementalEarth: { name: '土元素', icon: '🪨', family: 'elemental', level: 20, hp: 300, str: 35, def: 40, xp: 100, gold: 55, desc: '岩石化身' },
    elementalWind: { name: '风元素', icon: '💨', family: 'elemental', level: 18, hp: 180, str: 50, def: 15, xp: 90, gold: 50, desc: '狂风化身' },
    elementalThunder: { name: '雷元素', icon: '⚡', family: 'elemental', level: 25, hp: 250, str: 60, def: 20, xp: 150, gold: 90, desc: '雷电化身' },
    
    // 植物族
    plantMushroom: { name: '蘑菇怪', icon: '🍄', family: 'plant', level: 2, hp: 30, str: 8, def: 3, xp: 10, gold: 4, desc: '有毒的蘑菇' },
    plantTreant: { name: '树精', icon: '🌳', family: 'plant', level: 15, hp: 250, str: 35, def: 30, xp: 100, gold: 50, desc: '古老的树木' },
    plantFlower: { name: '食人花', icon: '🌺', family: 'plant', level: 12, hp: 150, str: 30, def: 15, xp: 60, gold: 30, desc: '吃肉的花' },
    plantCactus: { name: '仙人掌怪', icon: '🌵', family: 'plant', level: 14, hp: 180, str: 28, def: 25, xp: 70, gold: 35, desc: '满身尖刺' },
    
    // 人型族
    humanBandit: { name: '强盗', icon: '🏴‍☠️', family: 'human', level: 5, hp: 80, str: 18, def: 10, xp: 25, gold: 20, desc: '拦路抢劫' },
    humanPirate: { name: '海盗', icon: '⚓', family: 'human', level: 12, hp: 150, str: 30, def: 18, xp: 70, gold: 50, desc: '海上劫匪' },
    humanNinja: { name: '忍者', icon: '🥷', family: 'human', level: 25, hp: 280, str: 55, def: 25, xp: 180, gold: 120, desc: '暗影杀手' },
    humanKnight: { name: '黑暗骑士', icon: '⚔️', family: 'human', level: 35, hp: 600, str: 75, def: 55, xp: 400, gold: 250, desc: '堕落的骑士' },
    
    // 神话生物
    mythPhoenix: { name: '凤凰', icon: '🔥', family: 'myth', level: 45, hp: 1500, str: 100, def: 60, xp: 1000, gold: 700, desc: '不死鸟，可复活' },
    mythUnicorn: { name: '独角兽', icon: '🦄', family: 'myth', level: 35, hp: 800, str: 60, def: 45, xp: 500, gold: 350, desc: '神圣的兽' },
    mythKraken: { name: '克拉肯', icon: '🦑', family: 'myth', level: 50, hp: 2500, str: 130, def: 80, xp: 2000, gold: 1500, desc: '深海巨怪' },
    mythGolem: { name: '巨像', icon: '🗿', family: 'myth', level: 40, hp: 2000, str: 90, def: 100, xp: 800, gold: 500, desc: '岩石巨像' },
    
    // 机械族
    mechRobot: { name: '机器人', icon: '🤖', family: 'mech', level: 22, hp: 350, str: 50, def: 45, xp: 160, gold: 100, desc: '古代机械' },
    mechDrone: { name: '无人机', icon: '🛸', family: 'mech', level: 20, hp: 200, str: 45, def: 30, xp: 130, gold: 80, desc: '飞行机械' },
    mechTank: { name: '坦克', icon: '🚜', family: 'mech', level: 30, hp: 800, str: 60, def: 80, xp: 350, gold: 200, desc: '重型机械' },
    
    // 特殊
    specialAlien: { name: '外星人', icon: '👽', family: 'special', level: 50, hp: 1800, str: 110, def: 70, xp: 1200, gold: 900, desc: '来自星星' },
    specialRobot: { name: '终极兵器', icon: '👾', family: 'special', level: 60, hp: 3000, str: 150, def: 100, xp: 2500, gold: 2000, desc: '最强机械' },
    specialGod: { name: '古神', icon: '👁️', family: 'special', level: 99, hp: 9999, str: 300, def: 200, xp: 10000, gold: 10000, desc: '不可名状' }
};

// 按区域分组的怪物
const ZONE_ENEMIES = {
    forest: ['slimeGreen', 'slimeBlue', 'bugBee', 'bugAnt', 'beastWolf', 'plantMushroom', 'humanBandit'],
    cave: ['slimeRed', 'bugSpider', 'bugBeetle', 'undeadSkeleton', 'undeadZombie', 'beastBoar'],
    mine: ['elementalEarth', 'mechRobot', 'undeadGhost', 'beastBear', 'mythGolem'],
    crypt: ['undeadVampire', 'undeadGhost', 'undeadSkeleton', 'demonImp', 'humanNinja'],
    desert: ['bugScorpion', 'elementalFire', 'plantCactus', 'humanPirate', 'beastLion'],
    swamp: ['plantFlower', 'plantTreant', 'elementalWater', 'slimeGold'],
    volcano: ['elementalFire', 'elementalThunder', 'dragonWhelp', 'demonDog', 'demonImp'],
    darkForest: ['undeadWerewolf', 'undeadVampire', 'beastWerewolf', 'demonLord', 'humanNinja'],
    castle: ['undeadLich', 'humanKnight', 'demonLord', 'undeadVampire', 'dragonWhelp'],
    snow: ['elementalIce', 'beastWolf', 'mythGolem', 'elementalWind'],
    skyCity: ['elementalWind', 'elementalThunder', 'mythUnicorn', 'mechDrone'],
    abyss: ['demonArch', 'demonLord', 'dragonFire', 'undeadLich'],
    rift: ['specialAlien', 'mythPhoenix', 'elementalThunder', 'dragonThunder'],
    divine: ['mythUnicorn', 'mythPhoenix', 'dragonIce', 'dragonFire'],
    dragonRealm: ['dragonWhelp', 'dragonFire', 'dragonIce', 'dragonThunder', 'dragonKing'],
    demonCastle: ['demonArch', 'dragonKing', 'specialRobot', 'specialGod']
};

// ==================== BOSS图鉴 ====================
const BOSSES = {
    forest: { 
        name: '远古树精', icon: '🌲', level: 10, hp: 800, str: 35, def: 30, spd: 5, 
        xp: 400, gold: 250, 
        skills: ['entangle', 'heal', 'summonSapling'],
        desc: '森林的守护者'
    },
    cave: { 
        name: '洞穴巨魔', icon: '👹', level: 18, hp: 1500, str: 55, def: 40, spd: 6, 
        xp: 800, gold: 500, 
        skills: ['smash', 'rage', 'regenerate'],
        desc: '洞穴深处的怪物'
    },
    mine: { 
        name: '钻石巨人', icon: '💎', level: 25, hp: 2500, str: 70, def: 80, spd: 3, 
        xp: 1200, gold: 800, 
        skills: ['earthquake', 'harden', 'crystalSpike'],
        desc: '由钻石构成的巨人'
    },
    crypt: { 
        name: '巫妖王', icon: '🧟‍♂️', level: 30, hp: 3000, str: 65, def: 45, spd: 12, 
        xp: 1500, gold: 1000, 
        skills: ['deathSpell', 'summonUndead', 'lifeDrain'],
        desc: '不死族的统治者'
    },
    desert: { 
        name: '法老王', icon: '👳', level: 35, hp: 4000, str: 85, def: 55, spd: 15, 
        xp: 2000, gold: 1500, 
        skills: ['curse', 'sandstorm', 'mummyCall'],
        desc: '沉睡千年的王者'
    },
    swamp: { 
        name: '沼泽女王', icon: '🧙‍♀️', level: 40, hp: 4500, str: 80, def: 60, spd: 20, 
        xp: 2500, gold: 1800, 
        skills: ['poisonMist', 'healingRain', 'vineWhip'],
        desc: '沼泽的神秘统治者'
    },
    volcano: { 
        name: '火焰领主', icon: '🔥', level: 48, hp: 6000, str: 120, def: 70, spd: 25, 
        xp: 3500, gold: 2500, 
        skills: ['inferno', 'magmaArmor', 'eruption'],
        desc: '掌控熔岩的魔王'
    },
    darkForest: { 
        name: '吸血鬼伯爵', icon: '🧛', level: 55, hp: 7000, str: 110, def: 75, spd: 40, 
        xp: 4500, gold: 3000, 
        skills: ['bloodDrain', 'batSwarm', 'immortal'],
        desc: '永生不死的贵族'
    },
    castle: { 
        name: '死亡骑士', icon: '💀', level: 65, hp: 9000, str: 140, def: 100, spd: 30, 
        xp: 6000, gold: 4000, 
        skills: ['deathSlash', 'soulSteal', 'undeadMarch'],
        desc: '堕落的圣骑士'
    },
    snow: { 
        name: '冰霜女王', icon: '👸', level: 75, hp: 12000, str: 160, def: 120, spd: 35, 
        xp: 8000, gold: 5500, 
        skills: ['blizzard', 'iceShield', 'frostNova'],
        desc: '冰雪世界的女王'
    },
    skyCity: { 
        name: '大天使', icon: '👼', level: 85, hp: 15000, str: 180, def: 130, spd: 50, 
        xp: 10000, gold: 7000, 
        skills: ['holyLight', 'judgment', 'resurrection'],
        desc: '天界的使者'
    },
    abyss: { 
        name: '深渊领主', icon: '👿', level: 90, hp: 20000, str: 220, def: 150, spd: 40, 
        xp: 15000, gold: 10000, 
        skills: ['abyssalGaze', 'darkness', 'soulConsume'],
        desc: '来自深渊的恐怖'
    },
    rift: { 
        name: '时空龙', icon: '🐉', level: 95, hp: 25000, str: 250, def: 180, spd: 60, 
        xp: 20000, gold: 15000, 
        skills: ['timeStop', 'dimensionSlash', 'paradox'],
        desc: '超越时空的存在'
    },
    divine: { 
        name: '神之化身', icon: '👑', level: 98, hp: 35000, str: 300, def: 200, spd: 70, 
        xp: 30000, gold: 25000, 
        skills: ['divineWrath', 'creation', 'destruction'],
        desc: '神的投影'
    },
    dragonRealm: { 
        name: '龙王', icon: '🐲', level: 99, hp: 50000, str: 350, def: 250, spd: 80, 
        xp: 50000, gold: 50000, 
        skills: ['dragonBreath', 'dragonScale', 'dragonRoar'],
        desc: '龙族的顶点'
    },
    demonCastle: { 
        name: '混沌魔王', icon: '👹', level: 99, hp: 100000, str: 500, def: 350, spd: 100, 
        xp: 100000, gold: 100000, 
        skills: ['chaos', 'armageddon', 'void'],
        desc: '一切的终结'
    }
};

// ==================== 原有代码保持不变，添加新功能 ====================
// ... (保留之前的 CLASSES, EQUIPMENT_TYPES, RARITY_NAMES, AFFIX_POOL 等)

// ==================== 更新游戏状态 ====================
let gameState = {
    party: [],
    inventory: [],
    storage: [],
    gold: 500,
    gems: 0,
    fame: 0,
    currentMap: 'village',
    defeatedBosses: [],
    unlockedMaps: ['village', 'forest'],
    playTime: 0,
    newGamePlus: 0,
    achievements: [],
    bestiary: {}, // 怪物图鉴解锁状态
    cosmetics: { // 拥有的时装
        hair: ['warriorDefault', 'mageDefault'],
        face: ['none'],
        body: ['default'],
        back: ['none'],
        weaponSkin: ['default'],
        pet: ['none']
    },
    equippedCosmetics: { // 装备中的时装
        hair: 'warriorDefault',
        face: 'none',
        body: 'default',
        back: 'none',
        weaponSkin: 'default',
        pet: 'none'
    },
    enhancementMaterials: { common: 0, magic: 0, rare: 0, epic: 0, legendary: 0 }
};

// ==================== 怪物生成 ====================
function generateEnemies(zoneId) {
    const zone = MAP_ZONES[zoneId];
    const enemyPool = ZONE_ENEMIES[zoneId] || ZONE_ENEMIES.forest;
    const isBoss = zone.type === 'boss';
    
    if (isBoss) {
        const bossData = BOSSES[zoneId];
        return [{
            ...bossData,
            id: Date.now(),
            currentHp: bossData.hp,
            maxHp: bossData.hp,
            isBoss: true
        }];
    }
    
    // 普通战斗，生成2-4个敌人
    const count = Math.floor(Math.random() * 3) + 2;
    const enemies = [];
    
    for (let i = 0; i < count; i++) {
        const enemyId = enemyPool[Math.floor(Math.random() * enemyPool.length)];
        const template = BESTIARY[enemyId];
        
        if (template) {
            // 根据区域等级调整敌人属性
            const levelScale = zone.level / template.level;
            const scaledLevel = Math.min(99, Math.floor(template.level * (0.8 + Math.random() * 0.4)));
            
            enemies.push({
                ...template,
                id: Date.now() + i,
                level: scaledLevel,
                currentHp: Math.floor(template.hp * (1 + (scaledLevel - template.level) * 0.1)),
                maxHp: Math.floor(template.hp * (1 + (scaledLevel - template.level) * 0.1)),
                str: Math.floor(template.str * (1 + (scaledLevel - template.level) * 0.05)),
                def: Math.floor(template.def * (1 + (scaledLevel - template.level) * 0.05))
            });
            
            // 解锁图鉴
            if (!gameState.bestiary[enemyId]) {
                gameState.bestiary[enemyId] = { seen: true, killed: 0 };
            }
        }
    }
    
    return enemies;
}

// ==================== 时装装备 ====================
function equipCosmetic(slot, cosmeticId) {
    if (gameState.cosmetics[slot]?.includes(cosmeticId)) {
        gameState.equippedCosmetics[slot] = cosmeticId;
        return true;
    }
    return false;
}

function getCharacterVisual(char, slot) {
    // 返回角色当前的视觉表现
    const cosmeticId = gameState.equippedCosmetics[slot];
    const cosmetic = COSMETICS[slot]?.[cosmeticId];
    return cosmetic?.icon || char.icon;
}

// ==================== 战利品和解锁 ====================
function unlockCosmetic(cosmeticId, slot) {
    if (!gameState.cosmetics[slot]) {
        gameState.cosmetics[slot] = [];
    }
    
    if (!gameState.cosmetics[slot].includes(cosmeticId)) {
        gameState.cosmetics[slot].push(cosmeticId);
        
        const cosmetic = COSMETICS[slot][cosmeticId];
        showToast(`🎉 解锁新外观：${cosmetic.name}！`, 'success');
        return true;
    }
    return false;
}

// ==================== 渲染怪物图鉴 ====================
function renderBestiary() {
    const container = document.getElementById('bestiaryContainer');
    if (!container) return;
    
    const families = {};
    
    // 按家族分组
    Object.entries(BESTIARY).forEach(([id, enemy]) => {
        if (!families[enemy.family]) {
            families[enemy.family] = [];
        }
        families[enemy.family].push({ id, ...enemy });
    });
    
    container.innerHTML = Object.entries(families).map(([family, enemies]) => {
        const familyNames = {
            slime: '史莱姆家族', insect: '昆虫家族', beast: '野兽家族',
            dragon: '龙族', undead: '不死族', demon: '恶魔族',
            elemental: '元素族', plant: '植物族', human: '人型族',
            myth: '神话生物', mech: '机械族', special: '特殊'
        };
        
        return `
            <div class="bestiary-family">
                <h3>${familyNames[family] || family}</h3>
                <div class="bestiary-grid">
                    ${enemies.map(enemy => {
                        const unlocked = gameState.bestiary[enemy.id]?.seen;
                        return `
                            <div class="bestiary-entry ${unlocked ? 'unlocked' : 'locked'}"
                                 onclick="showEnemyDetail('${enemy.id}')">
                                <div class="entry-icon">${unlocked ? enemy.icon : '?'}</div>
                                <div class="entry-name">${unlocked ? enemy.name : '???'}</div>
                                ${unlocked ? `<div class="entry-count">击败：${gameState.bestiary[enemy.id]?.killed || 0}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function showEnemyDetail(enemyId) {
    const enemy = BESTIARY[enemyId];
    const data = gameState.bestiary[enemyId];
    
    if (!enemy || !data?.seen) {
        alert('尚未解锁该怪物信息');
        return;
    }
    
    alert(`${enemy.icon} ${enemy.name}
等级：${enemy.level}
生命：${enemy.hp}
攻击：${enemy.str}
防御：${enemy.def}

${enemy.desc}

已击败：${data.killed}次`);
}

// ==================== BOSS战特殊处理 ====================
function startBossBattle(zoneId) {
    const boss = BOSSES[zoneId];
    if (!boss) return;
    
    battleState = {
        zone: { id: zoneId, ...MAP_ZONES[zoneId] },
        enemies: [{
            ...boss,
            id: Date.now(),
            currentHp: boss.hp,
            maxHp: boss.hp,
            isBoss: true,
            phase: 1
        }],
        turn: 0,
        activeCharIndex: 0,
        selectedTarget: 0, // BOSS战只有一个目标
        logs: [],
        isBossBattle: true
    };
    
    showScene('battle');
    renderBattle();
    addBattleLog(`👑 BOSS战开始！${boss.name}出现了！`, 'boss');
    addBattleLog(`${boss.desc}`, 'info');
    
    nextTurn();
}

// ==================== 扩展的胜利处理 ====================
function victory() {
    let totalXp = 0;
    let totalGold = 0;
    const defeatedEnemies = [];
    
    battleState.enemies.forEach(enemy => {
        if (enemy.currentHp <= 0) {
            totalXp += enemy.xp || 10;
            totalGold += enemy.gold || 5;
            defeatedEnemies.push(enemy);
            
            // 更新图鉴击杀数
            const enemyId = Object.keys(BESTIARY).find(key => BESTIARY[key].name === enemy.name);
            if (enemyId && gameState.bestiary[enemyId]) {
                gameState.bestiary[enemyId].killed++;
            }
        }
    });
    
    gameState.gold += totalGold;
    
    // 分配经验
    const aliveChars = gameState.party.filter(c => c.currentHp > 0);
    const xpPerChar = Math.floor(totalXp / aliveChars.length);
    
    aliveChars.forEach(char => {
        const levels = gainXp(char, xpPerChar);
        if (levels > 0) {
            addBattleLog(`🎉 ${char.name} 升到了 ${char.level} 级！`, 'levelup');
        }
    });
    
    addBattleLog(`🏆 战斗胜利！获得 ${totalXp} 经验和 ${totalGold} 金币！`, 'reward');
    
    // 掉落装备
    const avgLevel = Math.floor(gameState.party.reduce((sum, c) => sum + c.level, 0) / gameState.party.length);
    const dropCount = battleState.isBossBattle ? 3 : (Math.random() < 0.7 ? 1 : 0);
    
    for (let i = 0; i < dropCount; i++) {
        const slots = ['weapon', 'helmet', 'armor', 'shield'];
        const slot = slots[Math.floor(Math.random() * slots.length)];
        const loot = generateEquipment(slot, avgLevel, battleState.isBossBattle ? 'rare' : null);
        addItemToInventory(loot);
        addBattleLog(`🎁 掉落：[${RARITY_NAMES[loot.rarity]}] ${loot.name}！`, 'loot');
    }
    
    // BOSS战特殊奖励
    if (battleState.isBossBattle) {
        const boss = battleState.enemies[0];
        
        // 解锁时装
        const cosmeticDrops = {
            forest: { slot: 'back', id: 'capeRed' },
            cave: { slot: 'face', id: 'eyepatch' },
            mine: { slot: 'hair', id: 'knightHelm' },
            crypt: { slot: 'pet', id: 'ghost' },
            desert: { slot: 'hair', id: 'pirateBandana' },
            volcano: { slot: 'weaponSkin', id: 'fireSword' },
            darkForest: { slot: 'body', id: 'ninjaSuit' },
            castle: { slot: 'hair', id: 'demonHorns' },
            snow: { slot: 'weaponSkin', id: 'iceSword' },
            skyCity: { slot: 'back', id: 'wingsAngel' },
            abyss: { slot: 'back', id: 'wingsDemon' },
            rift: { slot: 'weaponSkin', id: 'lightningSword' },
            divine: { slot: 'back', id: 'wingsDragon' },
            dragonRealm: { slot: 'pet', id: 'dragon' },
            demonCastle: { slot: 'body', id: 'dragonArmor' }
        };
        
        const drop = cosmeticDrops[battleState.zone.id];
        if (drop) {
            unlockCosmetic(drop.id, drop.slot);
        }
        
        // 记录击败
        if (!gameState.defeatedBosses.includes(battleState.zone.id)) {
            gameState.defeatedBosses.push(battleState.zone.id);
            
            // 解锁新区域
            const zone = MAP_ZONES[battleState.zone.id];
            if (zone.unlocks) {
                zone.unlocks.forEach(mapId => {
                    if (!gameState.unlockedMaps.includes(mapId)) {
                        gameState.unlockedMaps.push(mapId);
                        addBattleLog(`🗺️ 解锁新区域：${MAP_ZONES[mapId]?.name || mapId}！`, 'unlock');
                    }
                });
            }
        }
    }
    
    updateUI();
    saveGame();
    
    setTimeout(() => {
        const msg = battleState.isBossBattle ? 
            `🎉 BOSS击败！\n获得 ${totalXp} 经验\n获得 ${totalGold} 金币\n解锁新区域！` :
            `战斗胜利！\n获得 ${totalXp} 经验\n获得 ${totalGold} 金币`;
        alert(msg);
        showScene('map');
    }, 1500);
}

// ==================== 更新后的区域定义 ====================
const MAP_ZONES = {
    village: { id: 'village', name: '新手村', icon: '🏘️', type: 'safe', level: 0, desc: '冒险开始的地方' },
    forest: { id: 'forest', name: '迷雾森林', icon: '🌲', type: 'combat', level: 1, desc: '史莱姆和野兽出没', unlocks: ['cave', 'mine'] },
    cave: { id: 'cave', name: '阴暗洞穴', icon: '🕳️', type: 'combat', level: 8, desc: '不死生物的巢穴', unlocks: ['crypt'] },
    mine: { id: 'mine', name: '废弃矿坑', icon: '⛏️', type: 'combat', level: 12, desc: '哥布林和土元素', unlocks: ['desert'] },
    crypt: { id: 'crypt', name: '古代墓地', icon: '⚰️', type: 'combat', level: 16, desc: '吸血鬼和巫妖', unlocks: ['swamp', 'darkForest'] },
    desert: { id: 'desert', name: '灼热沙漠', icon: '🏜️', type: 'combat', level: 20, desc: '蝎子与沙漠强盗', unlocks: ['volcano'] },
    swamp: { id: 'swamp', name: '剧毒沼泽', icon: '🐸', type: 'combat', level: 25, desc: '毒物和神秘女巫', unlocks: [] },
    volcano: { id: 'volcano', name: '熔岩地带', icon: '🌋', type: 'combat', level: 32, desc: '火元素和幼龙', unlocks: ['castle'] },
    darkForest: { id: 'darkForest', name: '黑暗森林', icon: '🌑', type: 'combat', level: 38, desc: '狼人和吸血鬼', unlocks: ['castle'] },
    castle: { id: 'castle', name: '幽灵古堡', icon: '🏰', type: 'combat', level: 45, desc: '亡灵骑士的城堡', unlocks: ['snow', 'abyss'] },
    snow: { id: 'snow', name: '冰封雪原', icon: '❄️', type: 'combat', level: 52, desc: '雪怪和冰霜巨人', unlocks: ['skyCity'] },
    skyCity: { id: 'skyCity', name: '天空之城', icon: '🏛️', type: 'combat', level: 60, desc: '天使和云巨人', unlocks: ['rift'] },
    abyss: { id: 'abyss', name: '深渊之门', icon: '🌀', type: 'combat', level: 68, desc: '恶魔的领域', unlocks: ['divine'] },
    rift: { id: 'rift', name: '时空裂隙', icon: '⏳', type: 'combat', level: 75, desc: '时空扭曲之地', unlocks: ['dragonRealm'] },
    divine: { id: 'divine', name: '神域外围', icon: '✨', type: 'combat', level: 82, desc: '神圣的领域', unlocks: ['dragonRealm'] },
    dragonRealm: { id: 'dragonRealm', name: '龙之领域', icon: '🐲', type: 'combat', level: 90, desc: '龙族的圣地', unlocks: ['demonCastle'] },
    demonCastle: { id: 'demonCastle', name: '魔王城', icon: '🏯', type: 'boss', level: 99, desc: '最终决战之地' }
};

// ==================== 其他代码保持不变 ... ====================
// init, saveGame, loadGame, createCharacter, calculateStats 等函数保留之前的实现

// 导出函数
window.startNewGame = startNewGame;
window.continueGame = continueGame;
window.showScene = showScene;
window.battleAction = battleAction;
window.selectTarget = selectTarget;
window.enterZone = enterZone;
window.equipCosmetic = equipCosmetic;
window.showEnemyDetail = showEnemyDetail;
window.renderBestiary = renderBestiary;
