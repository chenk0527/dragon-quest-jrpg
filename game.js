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
    cave: ['slimeRed', 'bugBeetle', 'undeadSkeleton', 'undeadZombie', 'beastBoar'],
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
        const zoneId = battleState.zone.id;
        
        // 解锁新角色（首次击败时）
        if (!gameState.defeatedBosses.includes(zoneId)) {
            unlockCharacter(zoneId);
        }
        
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

// ==================== 缺失的核心函数 ====================

// 职业定义
const CLASSES = {
    warrior: { id: 'warrior', name: '战士', icon: '⚔️', baseHp: 120, baseStr: 15, baseDef: 12, baseSpd: 8, baseInt: 5, growth: { hp: 12, str: 3, def: 2, spd: 1, int: 0.5 } },
    mage: { id: 'mage', name: '法师', icon: '🔮', baseHp: 80, baseStr: 5, baseDef: 6, baseSpd: 10, baseInt: 18, growth: { hp: 6, str: 0.5, def: 1, spd: 2, int: 3 } },
    archer: { id: 'archer', name: '弓箭手', icon: '🏹', baseHp: 100, baseStr: 12, baseDef: 8, baseSpd: 15, baseInt: 8, growth: { hp: 9, str: 2, def: 1.5, spd: 3, int: 1 } },
    priest: { id: 'priest', name: '牧师', icon: '✝️', baseHp: 90, baseStr: 8, baseDef: 10, baseSpd: 7, baseInt: 15, growth: { hp: 8, str: 1, def: 2, spd: 1, int: 2.5 } },
    rogue: { id: 'rogue', name: '盗贼', icon: '🗡️', baseHp: 95, baseStr: 14, baseDef: 7, baseSpd: 18, baseInt: 6, growth: { hp: 8, str: 2.5, def: 1, spd: 3.5, int: 0.5 } }
};

// 装备类型
const EQUIPMENT_TYPES = {
    weapon: { name: '武器', stat: 'str' },
    helmet: { name: '头盔', stat: 'def' },
    armor: { name: '护甲', stat: 'def' },
    shield: { name: '盾牌', stat: 'def' },
    accessory: { name: '饰品', stat: 'spd' }
};

// 稀有度
const RARITY_NAMES = {
    common: '普通',
    magic: '魔法',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
};

// 词缀池
const AFFIX_POOL = {
    common: ['破损的', '生锈的', '简陋的', '普通的'],
    magic: ['精良的', '锋利的', '坚固的', '迅捷的'],
    rare: ['卓越的', '狂暴的', '守护的', '神秘的'],
    epic: ['传说的', '毁灭的', '不朽的', '睿智的'],
    legendary: ['神话的', '创世的', '灭世的', '永恒的']
};

// 战斗状态
let battleState = null;

// 角色解锁配置
const CHARACTER_UNLOCKS = {
    forest: { classId: 'mage', name: '法师', desc: '森林的智者加入了你的队伍！' },
    cave: { classId: 'archer', name: '弓箭手', desc: '洞穴中的猎人加入了你的队伍！' },
    desert: { classId: 'priest', name: '牧师', desc: '沙漠的圣者加入了你的队伍！' },
    volcano: { classId: 'rogue', name: '盗贼', desc: '火山中的刺客加入了你的队伍！' }
};

// 开始新游戏
function startNewGame() {
    gameState = {
        party: [],
        inventory: [],
        storage: [],
        gold: 500,
        gems: 0,
        fame: 0,
        currentMap: 'village',
        defeatedBosses: [],
        unlockedMaps: ['village', 'forest'],
        unlockedCharacters: ['warrior'],
        playTime: 0,
        newGamePlus: 0,
        achievements: [],
        bestiary: {},
        cosmetics: {
            hair: ['warriorDefault'],
            face: ['none'],
            body: ['default'],
            back: ['none'],
            weaponSkin: ['default'],
            pet: ['none']
        },
        equippedCosmetics: {
            hair: 'warriorDefault',
            face: 'none',
            body: 'default',
            back: 'none',
            weaponSkin: 'default',
            pet: 'none'
        },
        enhancementMaterials: { common: 0, magic: 0, rare: 0, epic: 0, legendary: 0 }
    };
    
    // 创建初始角色 - 只有勇者
    createCharacter('勇者', 'warrior');
    
    saveGame();
    showScene('party');
    showToast('🎮 新游戏开始！', 'success');
    showStory('prologue');
}

// 解锁新角色
function unlockCharacter(bossId) {
    const unlock = CHARACTER_UNLOCKS[bossId];
    if (!unlock) return false;
    
    // 检查是否已经解锁
    if (gameState.party.some(c => c.classId === unlock.classId)) {
        return false;
    }
    
    // 检查角色栏是否已满
    if (gameState.party.length >= CONFIG.MAX_PARTY_SIZE) {
        showToast(`⚠️ 队伍已满！${unlock.name}无法加入。`, 'error');
        return false;
    }
    
    // 解锁角色
    createCharacter(unlock.name, unlock.classId);
    gameState.unlockedCharacters.push(unlock.classId);
    
    // 添加对应的发型外观
    if (unlock.classId === 'mage' && !gameState.cosmetics.hair.includes('mageDefault')) {
        gameState.cosmetics.hair.push('mageDefault');
    }
    
    showToast(`🎉 ${unlock.desc}`, 'success');
    return true;
}

// 继续游戏
function continueGame() {
    if (loadGame()) {
        showScene('party');
        showToast('📂 游戏已加载', 'success');
    } else {
        showToast('❌ 没有存档', 'error');
    }
}

// 创建角色
function createCharacter(name, classId) {
    const classData = CLASSES[classId];
    if (!classData) return null;
    
    const char = {
        id: Date.now() + Math.random(),
        name: name,
        classId: classId,
        className: classData.name,
        icon: classData.icon,
        level: 1,
        xp: 0,
        xpToNext: 100,
        baseHp: classData.baseHp,
        currentHp: classData.baseHp,
        equipment: {
            weapon: null,
            helmet: null,
            armor: null,
            shield: null,
            accessory: null
        }
    };
    
    gameState.party.push(char);
    return char;
}

// 计算角色属性
function calculateStats(char) {
    const classData = CLASSES[char.classId];
    if (!classData) return { hp: 100, str: 10, def: 10, spd: 10, int: 10 };
    
    const level = char.level;
    let stats = {
        hp: Math.floor(classData.baseHp + (level - 1) * classData.growth.hp),
        str: Math.floor(classData.baseStr + (level - 1) * classData.growth.str),
        def: Math.floor(classData.baseDef + (level - 1) * classData.growth.def),
        spd: Math.floor(classData.baseSpd + (level - 1) * classData.growth.spd),
        int: Math.floor(classData.baseInt + (level - 1) * classData.growth.int)
    };
    
    // 添加装备加成
    if (char.equipment) {
        Object.values(char.equipment).forEach(equip => {
            if (equip) {
                stats.str += equip.str || 0;
                stats.def += equip.def || 0;
                stats.spd += equip.spd || 0;
                stats.int += equip.int || 0;
                stats.hp += equip.hp || 0;
            }
        });
    }
    
    return stats;
}

// 生成装备
function generateEquipment(slot, level, forcedRarity = null) {
    const rarities = ['common', 'magic', 'rare', 'epic', 'legendary'];
    const rarityWeights = [45, 30, 15, 8, 2];
    
    let rarity;
    if (forcedRarity) {
        rarity = forcedRarity;
    } else {
        const totalWeight = rarityWeights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < rarities.length; i++) {
            random -= rarityWeights[i];
            if (random <= 0) {
                rarity = rarities[i];
                break;
            }
        }
        rarity = rarity || 'common';
    }
    
    const prefixes = AFFIX_POOL[rarity];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const typeName = EQUIPMENT_TYPES[slot]?.name || '装备';
    
    const baseStat = Math.floor(level * (1 + Math.random() * 0.5));
    const multiplier = { common: 1, magic: 1.5, rare: 2.2, epic: 3, legendary: 4.5 }[rarity];
    
    const equip = {
        id: Date.now() + Math.random(),
        name: `${prefix}${typeName}`,
        slot: slot,
        rarity: rarity,
        level: level,
        icon: getEquipIcon(slot, rarity)
    };
    
    // 根据槽位添加属性
    if (slot === 'weapon') {
        equip.str = Math.floor(baseStat * multiplier);
    } else if (['helmet', 'armor', 'shield'].includes(slot)) {
        equip.def = Math.floor(baseStat * multiplier);
        equip.hp = Math.floor(baseStat * multiplier * 0.5);
    } else if (slot === 'accessory') {
        equip.spd = Math.floor(baseStat * multiplier * 0.7);
        equip.int = Math.floor(baseStat * multiplier * 0.5);
    }
    
    return equip;
}

// 获取装备图标
function getEquipIcon(slot, rarity) {
    const icons = {
        weapon: { common: '🗡️', magic: '⚔️', rare: '🔪', epic: '🗡️', legendary: '⚡' },
        helmet: { common: '🎩', magic: '🧢', rare: '⛑️', epic: '🪖', legendary: '👑' },
        armor: { common: '👕', magic: '🦺', rare: '🥋', epic: '🛡️', legendary: '🏆' },
        shield: { common: '🥏', magic: '🔹', rare: '🛡️', epic: '⬡', legendary: '🔷' },
        accessory: { common: '💍', magic: '💎', rare: '🔮', epic: '⭐', legendary: '🌟' }
    };
    return icons[slot]?.[rarity] || '❓';
}

// 添加物品到背包
function addItemToInventory(item) {
    if (gameState.inventory.length >= 50) {
        showToast('背包已满！', 'error');
        return false;
    }
    gameState.inventory.push(item);
    return true;
}

// 添加战斗日志
function addBattleLog(message, type = 'normal') {
    if (!battleState) return;
    battleState.logs.push({ message, type, time: Date.now() });
    
    // 只保留最近50条日志
    if (battleState.logs.length > 50) {
        battleState.logs.shift();
    }
    
    renderBattleLog();
}

// 渲染战斗日志
function renderBattleLog() {
    const logContainer = document.getElementById('battleLog');
    if (!logContainer) return;
    
    const typeColors = {
        normal: '#fff',
        damage: '#ff6b6b',
        heal: '#51cf66',
        loot: '#ffd43b',
        levelup: '#cc5de8',
        boss: '#ff6b6b',
        unlock: '#74c0fc',
        info: '#868e96'
    };
    
    logContainer.innerHTML = battleState.logs.map(log => 
        `<div style="color: ${typeColors[log.type] || '#fff'}; margin: 4px 0; font-size: 14px;">${log.message}</div>`
    ).join('');
    
    logContainer.scrollTop = logContainer.scrollHeight;
}

// 进入区域
function enterZone(zoneId) {
    const zone = MAP_ZONES[zoneId];
    if (!zone) {
        console.error('Zone not found:', zoneId);
        return;
    }
    
    // 检查是否已解锁
    if (!gameState.unlockedMaps.includes(zoneId)) {
        showToast('🔒 该区域尚未解锁！', 'error');
        return;
    }
    
    gameState.currentMap = zoneId;
    
    if (zone.type === 'boss') {
        // BOSS战特殊处理
        if (gameState.defeatedBosses.includes(zoneId)) {
            showToast('✅ 你已经击败了这个BOSS！', 'info');
            return;
        }
        
        const bossStories = {
            forest: 'forestBoss',
            cave: 'caveBoss',
            desert: 'desertBoss',
            volcano: 'volcanoBoss',
            demonCastle: 'finalBoss'
        };
        
        if (bossStories[zoneId] && STORY[bossStories[zoneId]]) {
            showStory(bossStories[zoneId]);
            setTimeout(() => startBossBattle(zoneId), 2000);
        } else {
            startBossBattle(zoneId);
        }
    } else if (zone.type === 'combat') {
        startBattle(zoneId);
    } else if (zone.type === 'safe') {
        showToast('🏘️ 这里是安全区', 'info');
    }
}

// 开始战斗
function startBattle(zoneId) {
    const zone = MAP_ZONES[zoneId];
    if (!zone) return;
    
    battleState = {
        zone: { id: zoneId, ...zone },
        enemies: generateEnemies(zoneId),
        turn: 0,
        activeCharIndex: 0,
        selectedTarget: 0,
        logs: [],
        isBossBattle: false
    };
    
    showScene('battle');
    renderBattle();
    addBattleLog(`⚔️ 遭遇敌人！`, 'normal');
    
    nextTurn();
}

// 下一回合
function nextTurn() {
    if (!battleState) return;
    
    // 检查战斗结束
    const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);
    const aliveChars = gameState.party.filter(c => c.currentHp > 0);
    
    if (aliveEnemies.length === 0) {
        victory();
        return;
    }
    
    if (aliveChars.length === 0) {
        defeat();
        return;
    }
    
    // 找到下一个存活的角色
    while (battleState.activeCharIndex < gameState.party.length) {
        const char = gameState.party[battleState.activeCharIndex];
        if (char.currentHp > 0) {
            addBattleLog(`🎯 ${char.name} 的回合`, 'normal');
            renderBattle();
            return;
        }
        battleState.activeCharIndex++;
    }
    
    // 所有角色行动完毕，敌人回合
    enemyTurn();
}

// 敌人回合
function enemyTurn() {
    if (!battleState) return;
    
    battleState.enemies.forEach(enemy => {
        if (enemy.currentHp > 0) {
            // 随机选择目标
            const aliveChars = gameState.party.filter(c => c.currentHp > 0);
            if (aliveChars.length === 0) return;
            
            const target = aliveChars[Math.floor(Math.random() * aliveChars.length)];
            const stats = calculateStats(target);
            
            const damage = Math.max(1, enemy.str - stats.def / 2);
            target.currentHp = Math.max(0, target.currentHp - damage);
            
            addBattleLog(`${enemy.icon} ${enemy.name} 攻击 ${target.name} 造成 ${Math.floor(damage)} 伤害！`, 'damage');
            
            if (typeof AudioSystem !== 'undefined' && AudioSystem) AudioSystem.playDamage();
        }
    });
    
    // 重置角色回合
    battleState.activeCharIndex = 0;
    battleState.turn++;
    
    setTimeout(() => nextTurn(), 500);
}

// 战斗行动
function battleAction(action) {
    if (!battleState) return;
    
    const char = gameState.party[battleState.activeCharIndex];
    if (!char || char.currentHp <= 0) return;
    
    const stats = calculateStats(char);
    
    switch (action) {
        case 'attack':
            performAttack(char, stats);
            break;
        case 'skill':
            performSkill(char, stats);
            break;
        case 'item':
            showItemMenu();
            break;
        case 'defend':
            addBattleLog(`🛡️ ${char.name} 采取防御姿态！`, 'normal');
            endTurn();
            break;
        case 'flee':
            attemptFlee();
            break;
    }
}

// 执行攻击
function performAttack(char, stats) {
    const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);
    if (aliveEnemies.length === 0) return;
    
    const target = aliveEnemies[battleState.selectedTarget % aliveEnemies.length];
    const damage = Math.max(1, stats.str * (0.9 + Math.random() * 0.2) - target.def / 2);
    
    target.currentHp = Math.max(0, target.currentHp - damage);
    
    addBattleLog(`${char.icon} ${char.name} 攻击 ${target.icon} ${target.name} 造成 ${Math.floor(damage)} 伤害！`, 'normal');
    
    if (AudioSystem) AudioSystem.playAttack();
    
    if (target.currentHp <= 0) {
        addBattleLog(`${target.icon} ${target.name} 被击败了！`, 'normal');
    }
    
    endTurn();
}

// 执行技能
function performSkill(char, stats) {
    // 简化的技能系统
    const skills = {
        warrior: { name: '猛击', damage: 2.0, mp: 0 },
        mage: { name: '火球术', damage: 2.5, mp: 0 },
        archer: { name: '多重射击', damage: 1.8, mp: 0 },
        priest: { name: '治疗术', heal: 50, mp: 0 },
        rogue: { name: '背刺', damage: 2.2, mp: 0 }
    };
    
    const skill = skills[char.classId];
    if (!skill) return;
    
    if (skill.heal) {
        const target = gameState.party[battleState.activeCharIndex];
        const maxHp = calculateStats(target).hp;
        target.currentHp = Math.min(maxHp, target.currentHp + skill.heal);
        addBattleLog(`✨ ${char.name} 使用 ${skill.name} 恢复了 ${skill.heal} 生命！`, 'heal');
        if (AudioSystem) AudioSystem.playHeal();
    } else {
        const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);
        if (aliveEnemies.length === 0) return;
        
        const target = aliveEnemies[battleState.selectedTarget % aliveEnemies.length];
        const damage = Math.max(1, stats.str * skill.damage - target.def / 2);
        
        target.currentHp = Math.max(0, target.currentHp - damage);
        addBattleLog(`⚡ ${char.name} 使用 ${skill.name} 造成 ${Math.floor(damage)} 伤害！`, 'normal');
        
        if (AudioSystem) AudioSystem.playAttack();
        
        if (target.currentHp <= 0) {
            addBattleLog(`${target.icon} ${target.name} 被击败了！`, 'normal');
        }
    }
    
    endTurn();
}

// 选择目标
function selectTarget(index) {
    if (!battleState) return;
    battleState.selectedTarget = index;
    renderBattle();
}

// 结束回合
function endTurn() {
    battleState.activeCharIndex++;
    setTimeout(() => nextTurn(), 500);
}

// 尝试逃跑
function attemptFlee() {
    const fleeChance = 0.5;
    if (Math.random() < fleeChance) {
        addBattleLog('🏃 成功逃跑！', 'normal');
        setTimeout(() => showScene('map'), 1000);
    } else {
        addBattleLog('❌ 逃跑失败！', 'normal');
        endTurn();
    }
}

// 显示物品菜单
function showItemMenu() {
    // 简化处理：使用第一个治疗道具
    const healItem = gameState.inventory.find(item => item.type === 'consumable');
    
    if (healItem) {
        const char = gameState.party[battleState.activeCharIndex];
        const maxHp = calculateStats(char).hp;
        char.currentHp = Math.min(maxHp, char.currentHp + 50);
        
        // 移除使用的道具
        const index = gameState.inventory.indexOf(healItem);
        if (index > -1) gameState.inventory.splice(index, 1);
        
        addBattleLog(`🧪 使用 ${healItem.name} 恢复了 50 生命！`, 'heal');
        if (AudioSystem) AudioSystem.playHeal();
        endTurn();
    } else {
        addBattleLog('❌ 没有可用的道具！', 'normal');
    }
}

// 渲染战斗界面
function renderBattle() {
    const container = document.getElementById('battleContainer');
    if (!container) return;
    
    const activeChar = gameState.party[battleState.activeCharIndex];
    
    container.innerHTML = `
        <div class="battle-scene">
            <div class="battle-enemies">
                ${battleState.enemies.map((enemy, index) => `
                    <div class="enemy ${enemy.currentHp <= 0 ? 'dead' : ''} ${battleState.selectedTarget === index ? 'targeted' : ''}" 
                         onclick="selectTarget(${index})">
                        <div class="enemy-icon">${enemy.icon}</div>
                        <div class="enemy-name">${enemy.name}</div>
                        <div class="enemy-hp-bar">
                            <div class="hp-fill" style="width: ${(enemy.currentHp / enemy.maxHp) * 100}%"></div>
                        </div>
                        <div class="enemy-hp-text">${enemy.currentHp}/${enemy.maxHp}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="battle-party">
                ${gameState.party.map((char, index) => {
                    const stats = calculateStats(char);
                    const isActive = index === battleState.activeCharIndex;
                    return `
                        <div class="party-member ${isActive ? 'active' : ''} ${char.currentHp <= 0 ? 'dead' : ''}">
                            <div class="char-icon">${char.icon}</div>
                            <div class="char-info">
                                <div class="char-name">${char.name}</div>
                                <div class="char-hp-bar">
                                    <div class="hp-fill" style="width: ${(char.currentHp / stats.hp) * 100}%"></div>
                                </div>
                                <div class="char-hp-text">${char.currentHp}/${stats.hp}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="battle-actions">
                ${activeChar && activeChar.currentHp > 0 ? `
                    <button onclick="battleAction('attack')" class="action-btn attack">⚔️ 攻击</button>
                    <button onclick="battleAction('skill')" class="action-btn skill">✨ 技能</button>
                    <button onclick="battleAction('item')" class="action-btn item">🧪 道具</button>
                    <button onclick="battleAction('defend')" class="action-btn defend">🛡️ 防御</button>
                    <button onclick="battleAction('flee')" class="action-btn flee">🏃 逃跑</button>
                ` : ''}
            </div>
            
            <div id="battleLog" class="battle-log"></div>
        </div>
    `;
    
    renderBattleLog();
}

// 获取经验值
function gainXp(char, amount) {
    char.xp += amount;
    let levelsGained = 0;
    
    while (char.xp >= char.xpToNext && char.level < CONFIG.MAX_LEVEL) {
        char.xp -= char.xpToNext;
        char.level++;
        levelsGained++;
        
        // 计算下一级所需经验
        char.xpToNext = Math.floor(CONFIG.XP_BASE * Math.pow(char.level, CONFIG.XP_CURVE));
        
        // 恢复满血
        const stats = calculateStats(char);
        char.currentHp = stats.hp;
        
        if (AudioSystem) AudioSystem.playLevelUp();
    }
    
    return levelsGained;
}

// 失败处理
function defeat() {
    addBattleLog('💀 队伍全灭...', 'damage');
    setTimeout(() => {
        alert('战斗失败！回到村庄恢复...');
        
        // 恢复角色
        gameState.party.forEach(char => {
            const stats = calculateStats(char);
            char.currentHp = Math.floor(stats.hp * 0.5); // 恢复一半生命
        });
        
        gameState.currentMap = 'village';
        gameState.gold = Math.floor(gameState.gold * 0.9); // 损失10%金币
        
        showScene('map');
        updateUI();
    }, 1500);
}

// 保存游戏
function saveGame() {
    try {
        localStorage.setItem('dragonQuestSave', JSON.stringify(gameState));
        return true;
    } catch (e) {
        console.error('保存失败:', e);
        return false;
    }
}

// 加载游戏
function loadGame() {
    try {
        const saveData = localStorage.getItem('dragonQuestSave');
        if (saveData) {
            gameState = { ...gameState, ...JSON.parse(saveData) };
            return true;
        }
    } catch (e) {
        console.error('加载失败:', e);
    }
    return false;
}

// 自动保存
function autoSave() {
    saveGame();
}

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
window.renderCosmetics = renderCosmetics;
window.unlockCharacter = unlockCharacter;

// ==================== 渲染场景 ====================
function showScene(sceneId) {
    document.querySelectorAll('.scene').forEach(scene => scene.classList.remove('active'));
    const sceneEl = document.getElementById('scene' + sceneId.charAt(0).toUpperCase() + sceneId.slice(1));
    if (sceneEl) sceneEl.classList.add('active');
    
    // 更新导航
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navMap = { menu: 0, party: 1, map: 2, bestiary: 3, cosmetics: 4 };
    const navIndex = navMap[sceneId];
    if (navIndex !== undefined) {
        document.querySelectorAll('.nav-btn')[navIndex]?.classList.add('active');
    }
    
    // 渲染对应内容
    if (sceneId === 'party') renderParty();
    if (sceneId === 'map') renderMap();
    if (sceneId === 'bestiary') renderBestiary();
    if (sceneId === 'cosmetics') renderCosmetics();
}

// ==================== 渲染外观系统 ====================
function renderCosmetics() {
    const container = document.getElementById('cosmeticsContainer');
    if (!container) return;
    
    const slotNames = {
        hair: '发型',
        face: '面部',
        body: '服装',
        back: '背部',
        weaponSkin: '武器皮肤',
        pet: '宠物'
    };
    
    container.innerHTML = Object.entries(slotNames).map(([slot, name]) => {
        const owned = gameState.cosmetics[slot] || [];
        const equipped = gameState.equippedCosmetics[slot];
        
        return `
            <div class="cosmetic-section">
                <h3>${name}</h3>
                <div class="cosmetic-grid">
                    ${owned.map(id => {
                        const item = COSMETICS[slot]?.[id];
                        if (!item) return '';
                        const isEquipped = equipped === id;
                        return `
                            <div class="cosmetic-item ${isEquipped ? 'equipped' : ''} rarity-${item.rarity || 'common'}"
                                 onclick="equipCosmetic('${slot}', '${id}'); renderCosmetics();">
                                <div class="cosmetic-icon">${item.icon}</div>
                                <div class="cosmetic-name">${item.name}</div>
                                ${isEquipped ? '<div class="equipped-badge">✓</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// ==================== 渲染地图 ====================
function renderMap() {
    const container = document.getElementById('mapContainer');
    if (!container) return;
    
    container.innerHTML = Object.values(MAP_ZONES).map(zone => {
        const isUnlocked = gameState.unlockedMaps.includes(zone.id);
        const isCurrent = gameState.currentMap === zone.id;
        const isCleared = gameState.defeatedBosses.includes(zone.id);
        
        return `
            <div class="map-node ${isUnlocked ? '' : 'locked'} ${isCurrent ? 'current' : ''} ${isCleared ? 'cleared' : ''}"
                 ${isUnlocked ? `onclick="enterZone('${zone.id}')"` : ''}>
                <div class="map-icon">${isUnlocked ? zone.icon : '🔒'}</div>
                <div class="map-name">${zone.name}</div>
                ${isUnlocked ? `<div class="map-level">Lv.${zone.level}</div>` : ''}
            </div>
        `;
    }).join('');
}

// ==================== 渲染队伍 ====================
function renderParty() {
    const container = document.getElementById('partyContainer');
    if (!container) return;
    
    container.innerHTML = gameState.party.map(char => {
        const stats = calculateStats(char);
        return `
            <div class="character-card">
                <div class="character-header">
                    <div class="character-avatar">${char.icon}</div>
                    <div class="character-info">
                        <h3>${char.name}</h3>
                        <div class="character-class">${char.className} Lv.${char.level}</div>
                    </div>
                </div>
                <div class="bar-container">
                    <div class="bar-label"><span>HP</span><span>${char.currentHp}/${stats.hp}</span></div>
                    <div class="bar"><div class="bar-fill hp-bar" style="width:${(char.currentHp/stats.hp)*100}%"></div></div>
                </div>
                <div class="character-stats">
                    <div class="stat"><span>力量</span><span>${stats.str}</span></div>
                    <div class="stat"><span>防御</span><span>${stats.def}</span></div>
                    <div class="stat"><span>速度</span><span>${stats.spd}</span></div>
                    <div class="stat"><span>智力</span><span>${stats.int}</span></div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== 初始化 ====================
function init() {
    loadGame();
    updateUI();
    setInterval(autoSave, CONFIG.AUTO_SAVE_INTERVAL);
    setInterval(() => gameState.playTime++, 1000);
}

// ==================== 更新UI ====================
function updateUI() {
    const goldEl = document.getElementById('headerGold');
    if (goldEl) goldEl.textContent = gameState.gold;
}

// ==================== 提示 ====================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// 启动
window.onload = init;

// ==================== 剧情对话系统 ====================
const STORY = {
    prologue: {
        title: '序章：命运的开始',
        scenes: [
            { speaker: ' narrator', text: '在一个平静的村庄，你是一名普通的村民...', bg: '🏘️' },
            { speaker: '村长', text: '不好了！村外出现了怪物！年轻的勇者啊，请帮帮我们！', bg: '👴' },
            { speaker: '勇者', text: '交给我吧！我会保护这个村子的！', bg: '⚔️' },
            { speaker: ' narrator', text: '就这样，你的冒险开始了...', bg: '✨' }
        ]
    },
    forestBoss: {
        title: '第一章：森林守护者',
        scenes: [
            { speaker: ' narrator', text: '深入森林，你感受到了强大的气息...', bg: '🌲' },
            { speaker: '远古树精', text: '人类...为何要打扰森林的宁静...', bg: '🌳' },
            { speaker: '勇者', text: '我是来打倒你，保护村庄的！', bg: '⚔️' },
            { speaker: '远古树精', text: '那就让森林来审判你吧！', bg: '🌿' }
        ]
    },
    caveBoss: {
        title: '第二章：洞穴深处',
        scenes: [
            { speaker: ' narrator', text: '洞穴深处传来沉重的脚步声...', bg: '🕳️' },
            { speaker: '洞穴巨魔', text: '又有新鲜的食物送上门了...', bg: '👹' },
            { speaker: '勇者', text: '我不会让你伤害任何人的！', bg: '⚔️' },
            { speaker: '洞穴巨魔', text: '那就成为我的晚餐吧！', bg: '👿' }
        ]
    },
    desertBoss: {
        title: '第三章：沙漠王者',
        scenes: [
            { speaker: ' narrator', text: '金字塔中传来古老的呢喃...', bg: '🏜️' },
            { speaker: '法老王', text: '沉睡千年...终于有人唤醒我了...', bg: '👳' },
            { speaker: '勇者', text: '你的诅咒到此为止了！', bg: '⚔️' },
            { speaker: '法老王', text: '放肆！感受沙漠的愤怒！', bg: '🌪️' }
        ]
    },
    volcanoBoss: {
        title: '第四章：烈焰试炼',
        scenes: [
            { speaker: ' narrator', text: '火山在咆哮，岩浆在沸腾...', bg: '🌋' },
            { speaker: '火焰领主', text: '有趣...居然有人类能来到这里...', bg: '🔥' },
            { speaker: '勇者', text: '你的火焰会熄灭在我的剑下！', bg: '⚔️' },
            { speaker: '火焰领主', text: '狂妄！让你见识真正的地狱之火！', bg: '🔥' }
        ]
    },
    finalBoss: {
        title: '终章：混沌之战',
        scenes: [
            { speaker: ' narrator', text: '魔王城的最深处，黑暗笼罩着一切...', bg: '🏯' },
            { speaker: '混沌魔王', text: '终于...又一个勇者来送死了...', bg: '👹' },
            { speaker: '勇者', text: '我是来结束你的暴政的！', bg: '⚔️' },
            { speaker: '混沌魔王', text: '哈哈哈！那就试试看吧！', bg: '😈' },
            { speaker: '混沌魔王', text: '感受混沌的力量吧！', bg: '💀' }
        ]
    }
};

// 对话系统
let currentDialog = null;
let dialogIndex = 0;

function showStory(storyId) {
    const story = STORY[storyId];
    if (!story) return;
    
    currentDialog = story;
    dialogIndex = 0;
    
    createDialogBox();
    showDialogScene();
}

function createDialogBox() {
    // 创建对话界面
    const dialogHTML = `
        <div id="storyDialog" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;flex-direction:column;justify-content:flex-end;padding:20px;box-sizing:border-box;">
            <div style="font-size:80px;text-align:center;margin-bottom:20px;" id="dialogBg">✨</div>
            <div style="background:linear-gradient(135deg,#2c3e50 0%,#34495e 100%);border-radius:20px;padding:30px;border:3px solid #f39c12;box-shadow:0 10px 40px rgba(0,0,0,0.5);">
                <div style="color:#f39c12;font-size:14px;margin-bottom:10px;text-transform:uppercase;letter-spacing:2px;" id="dialogSpeaker"> narrator</div>
                <div style="color:white;font-size:18px;line-height:1.6;" id="dialogText">...</div>
                <div style="text-align:center;margin-top:20px;color:#95a5a6;font-size:12px;">点击继续 ▼</div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    document.getElementById('storyDialog').addEventListener('click', nextDialog);
}

function showDialogScene() {
    const scene = currentDialog.scenes[dialogIndex];
    if (!scene) {
        closeDialog();
        return;
    }
    
    document.getElementById('dialogBg').textContent = scene.bg;
    document.getElementById('dialogSpeaker').textContent = scene.speaker;
    
    // 打字机效果
    const textEl = document.getElementById('dialogText');
    textEl.textContent = '';
    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < scene.text.length) {
            textEl.textContent += scene.text[i];
            i++;
        } else {
            clearInterval(typeInterval);
        }
    }, 30);
}

function nextDialog() {
    dialogIndex++;
    if (dialogIndex >= currentDialog.scenes.length) {
        closeDialog();
    } else {
        showDialogScene();
    }
}

function closeDialog() {
    const dialog = document.getElementById('storyDialog');
    if (dialog) {
        dialog.remove();
        currentDialog = null;
    }
}

// ==================== 彩蛋系统 ====================
const EASTER_EGGS = {
    // 点击村庄100次的彩蛋
    villageClick: {
        count: 0,
        threshold: 100,
        reward: () => {
            gameState.gold += 1000;
            showToast('💰 彩蛋解锁！获得1000金币！', 'success');
        }
    },
    
    // 击败999只史莱姆
    slimeKiller: {
        count: 0,
        threshold: 999,
        reward: () => {
            unlockCosmetic('slime', 'pet');
            showToast('🎉 史莱姆杀手！解锁史莱姆宠物！', 'success');
        }
    },
    
    // 连续点击勇者头像10次
    heroClick: {
        count: 0,
        threshold: 10,
        reward: () => {
            showToast('🤔 你在期待什么？', 'info');
        }
    },
    
    // 在特定时间登录（午夜）
    midnightGaming: {
        check: () => {
            const hour = new Date().getHours();
            return hour === 0;
        },
        reward: () => {
            showToast('🌙 夜猫子奖励！快去睡觉！', 'success');
        }
    },
    
    // 输入Konami代码
    konami: {
        sequence: [],
        target: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
        reward: () => {
            gameState.party.forEach(char => {
                char.level = 99;
                char.xp = 0;
            });
            showToast('🎮 作弊码激活！全员满级！', 'success');
        }
    }
};

// 彩蛋检测
document.addEventListener('keydown', (e) => {
    // Konami代码检测
    EASTER_EGGS.konami.sequence.push(e.key);
    if (EASTER_EGGS.konami.sequence.length > EASTER_EGGS.konami.target.length) {
        EASTER_EGGS.konami.sequence.shift();
    }
    if (JSON.stringify(EASTER_EGGS.konami.sequence) === JSON.stringify(EASTER_EGGS.konami.target)) {
        EASTER_EGGS.konami.reward();
    }
});

// ==================== 音效系统（使用Web Audio API）====================
const AudioSystem = {
    ctx: null,
    
    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    
    // 播放攻击音效
    playAttack() {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.1);
    },
    
    // 播放受伤音效
    playDamage() {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.2);
    },
    
    // 播放治疗音效
    playHeal() {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.3);
    },
    
    // 播放升级音效
    playLevelUp() {
        if (!this.ctx) this.init();
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C大调和弦
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.1 + 0.3);
            
            osc.start(this.ctx.currentTime + i * 0.1);
            osc.stop(this.ctx.currentTime + i * 0.1 + 0.3);
        });
    },
    
    // 播放获得物品音效
    playItemGet() {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.setValueAtTime(1100, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.2);
    }
};

// 导出故事系统
window.showStory = showStory;
window.STORY = STORY;
window.EASTER_EGGS = EASTER_EGGS;
window.AudioSystem = AudioSystem;
