/**
 * Dragon Quest JRPG - Pixel Art Edition
 * 像素画风格版本 - 模仿原版DQ
 */

// ==================== 游戏配置 ====================
const CONFIG = {
    MAX_PARTY_SIZE: 4,
    MAX_LEVEL: 99,
    VERSION: '4.0-pixel',
    RARITY_WEIGHTS: { common: 45, magic: 30, rare: 15, epic: 8, legendary: 2 },
    AUTO_SAVE_INTERVAL: 30000,
    XP_BASE: 100,
    XP_CURVE: 1.9,
    MAX_ENHANCE: 15,
    COSMETIC_SLOTS: ['hair', 'face', 'body', 'back', 'weaponSkin', 'pet'],
    ASSETS_VERSION: '4.0.0'
};

// ==================== 8-bit像素调色板 ====================
const PALETTE = {
    skin: ['#ffdbac', '#f1c27d', '#e0ac69'],
    hair: ['#8b4513', '#ffd700', '#c0c0c0', '#ff0000', '#000000'],
    armor: ['#c0c0c0', '#ffd700', '#8b0000', '#4169e1'],
    slime: ['#00ff00', '#00bfff', '#ff4444', '#ffd700', '#c0c0c0'],
    dragon: ['#ff4500', '#ffd700', '#228b22', '#4169e1'],
    dark: ['#2f2f2f', '#1a1a1a', '#0f0f0f'],
    highlight: '#ffffff',
    shadow: '#000000'
};

// ==================== 像素画风格SVG精灵生成器 ====================
const PixelSprites = {
    // 角色背面 (战斗时显示)
    characterBack(classId) {
        const colors = {
            warrior: { body: '#4169e1', hair: '#8b4513', armor: '#c0c0c0' },
            mage: { body: '#9932cc', hair: '#c0c0c0', armor: '#dda0dd' },
            archer: { body: '#228b22', hair: '#8b4513', armor: '#daa520' },
            priest: { body: '#ffd700', hair: '#8b4513', armor: '#ffffff' },
            rogue: { body: '#2f2f2f', hair: '#000000', armor: '#4a4a4a' }
        };
        const c = colors[classId] || colors.warrior;
        
        return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
            <!-- 腿部 -->
            <rect x="12" y="24" width="3" height="6" fill="#000080"/>
            <rect x="17" y="24" width="3" height="6" fill="#000080"/>
            <!-- 身体 -->
            <rect x="10" y="14" width="12" height="12" fill="${c.body}"/>
            <rect x="10" y="14" width="12" height="3" fill="${c.armor}"/>
            <!-- 手臂 -->
            <rect x="6" y="15" width="4" height="8" fill="#ffdbac"/>
            <rect x="22" y="15" width="4" height="8" fill="#ffdbac"/>
            <!-- 头部 -->
            <rect x="11" y="6" width="10" height="10" fill="#ffdbac"/>
            <!-- 头发 -->
            <rect x="11" y="4" width="10" height="4" fill="${c.hair}"/>
            <rect x="9" y="6" width="2" height="6" fill="${c.hair}"/>
            <rect x="21" y="6" width="2" height="6" fill="${c.hair}"/>
        </svg>`;
    },

    // 史莱姆家族
    slime(variant = 'green') {
        const colors = {
            green: '#00ff00', blue: '#00bfff', red: '#ff4444',
            gold: '#ffd700', metal: '#c0c0c0'
        };
        const c = colors[variant] || colors.green;
        const darkC = this.darken(c);
        
        return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
            <!-- 身体阴影 -->
            <ellipse cx="24" cy="42" rx="16" ry="4" fill="#000000" opacity="0.3"/>
            <!-- 身体主体 -->
            <ellipse cx="24" cy="30" rx="20" ry="16" fill="${c}"/>
            <!-- 身体高光 -->
            <ellipse cx="20" cy="26" rx="6" ry="4" fill="#ffffff" opacity="0.4"/>
            <!-- 眼睛 -->
            <rect x="14" y="24" width="4" height="6" fill="#000000"/>
            <rect x="15" y="25" width="1" height="2" fill="#ffffff"/>
            <rect x="30" y="24" width="4" height="6" fill="#000000"/>
            <rect x="31" y="25" width="1" height="2" fill="#ffffff"/>
            <!-- 嘴巴 -->
            <rect x="20" y="32" width="8" height="2" fill="#000000"/>
            <!-- 金属史莱姆细节 -->
            ${variant === 'metal' ? '<rect x="16" y="18" width="16" height="2" fill="#ffffff" opacity="0.6"/>' : ''}
        </svg>`;
    },

    // 龙
    dragon(variant = 'fire') {
        const colors = {
            fire: { body: '#ff4500', belly: '#ffd700', wing: '#8b0000' },
            ice: { body: '#87ceeb', belly: '#e0ffff', wing: '#4169e1' },
            thunder: { body: '#ffd700', belly: '#ffff00', wing: '#daa520' }
        };
        const c = colors[variant] || colors.fire;
        
        return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
            <!-- 翅膀 -->
            <path d="M8 20 L24 8 L28 24 Z" fill="${c.wing}"/>
            <path d="M56 20 L40 8 L36 24 Z" fill="${c.wing}"/>
            <!-- 身体 -->
            <ellipse cx="32" cy="40" rx="20" ry="16" fill="${c.body}"/>
            <ellipse cx="32" cy="42" rx="14" ry="10" fill="${c.belly}"/>
            <!-- 头部 -->
            <rect x="24" y="16" width="16" height="16" rx="4" fill="${c.body}"/>
            <!-- 角 -->
            <rect x="22" y="12" width="4" height="8" fill="#8b4513"/>
            <rect x="38" y="12" width="4" height="8" fill="#8b4513"/>
            <!-- 眼睛 -->
            <rect x="26" y="22" width="4" height="4" fill="#ffff00"/>
            <rect x="34" y="22" width="4" height="4" fill="#ffff00"/>
            <rect x="27" y="23" width="2" height="2" fill="#ff0000"/>
            <rect x="35" y="23" width="2" height="2" fill="#ff0000"/>
            <!-- 鼻孔 -->
            <rect x="28" y="28" width="2" height="2" fill="#000000"/>
            <rect x="34" y="28" width="2" height="2" fill="#000000"/>
            <!-- 腿部 -->
            <rect x="20" y="52" width="6" height="8" fill="${c.body}"/>
            <rect x="38" y="52" width="6" height="8" fill="${c.body}"/>
        </svg>`;
    },

    // 骷髅兵
    skeleton() {
        return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
            <!-- 身体 -->
            <rect x="16" y="20" width="16" height="16" fill="#f0f0f0"/>
            <!-- 肋骨 -->
            <rect x="18" y="22" width="12" height="2" fill="#d0d0d0"/>
            <rect x="18" y="26" width="12" height="2" fill="#d0d0d0"/>
            <rect x="18" y="30" width="12" height="2" fill="#d0d0d0"/>
            <!-- 手臂 -->
            <rect x="8" y="22" width="8" height="3" fill="#f0f0f0"/>
            <rect x="32" y="22" width="8" height="3" fill="#f0f0f0"/>
            <!-- 腿部 -->
            <rect x="18" y="36" width="4" height="10" fill="#f0f0f0"/>
            <rect x="26" y="36" width="4" height="10" fill="#f0f0f0"/>
            <!-- 头部 (骷髅) -->
            <rect x="14" y="6" width="20" height="18" fill="#f0f0f0"/>
            <!-- 眼睛 -->
            <rect x="18" y="12" width="4" height="4" fill="#000000"/>
            <rect x="26" y="12" width="4" height="4" fill="#000000"/>
            <!-- 鼻子 -->
            <rect x="22" y="18" width="4" height="2" fill="#000000"/>
            <!-- 牙齿 -->
            <rect x="18" y="22" width="2" height="2" fill="#000000"/>
            <rect x="22" y="22" width="2" height="2" fill="#000000"/>
            <rect x="26" y="22" width="2" height="2" fill="#000000"/>
            <!-- 武器 -->
            <rect x="4" y="18" width="4" height="20" fill="#8b4513"/>
            <rect x="2" y="24" width="8" height="2" fill="#c0c0c0"/>
        </svg>`;
    },

    // 野狼
    wolf() {
        return `<svg viewBox="0 0 56 48" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
            <!-- 尾巴 -->
            <rect x="4" y="20" width="12" height="4" fill="#8b4513"/>
            <rect x="2" y="16" width="6" height="4" fill="#8b4513"/>
            <!-- 身体 -->
            <ellipse cx="32" cy="28" rx="16" ry="10" fill="#a0522d"/>
            <ellipse cx="32" cy="30" rx="10" ry="6" fill="#d2691e"/>
            <!-- 腿部 -->
            <rect x="20" y="34" width="4" height="10" fill="#8b4513"/>
            <rect x="26" y="34" width="4" height="10" fill="#8b4513"/>
            <rect x="34" y="34" width="4" height="10" fill="#8b4513"/>
            <rect x="40" y="34" width="4" height="10" fill="#8b4513"/>
            <!-- 头部 -->
            <rect x="40" y="12" width="16" height="14" fill="#a0522d"/>
            <!-- 耳朵 -->
            <rect x="42" y="6" width="4" height="8" fill="#8b4513"/>
            <rect x="50" y="6" width="4" height="8" fill="#8b4513"/>
            <!-- 眼睛 -->
            <rect x="46" y="16" width="4" height="4" fill="#ffff00"/>
            <rect x="47" y="17" width="2" height="2" fill="#000000"/>
            <!-- 鼻子 -->
            <rect x="54" y="18" width="2" height="3" fill="#000000"/>
            <!-- 嘴巴 -->
            <rect x="48" y="22" width="4" height="2" fill="#ffffff"/>
        </svg>`;
    },

    // BOSS: 远古树精
    bossForest() {
        return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
            <!-- 树根 -->
            <rect x="16" y="48" width="6" height="12" fill="#8b4513"/>
            <rect x="28" y="48" width="8" height="12" fill="#8b4513"/>
            <rect x="42" y="48" width="6" height="12" fill="#8b4513"/>
            <!-- 树干 -->
            <rect x="20" y="24" width="24" height="28" fill="#a0522d"/>
            <rect x="22" y="26" width="20" height="24" fill="#cd853f"/>
            <!-- 眼睛 -->
            <rect x="24" y="32" width="6" height="6" fill="#ff0000"/>
            <rect x="34" y="32" width="6" height="6" fill="#ff0000"/>
            <rect x="25" y="33" width="2" height="2" fill="#ffff00"/>
            <rect x="35" y="33" width="2" height="2" fill="#ffff00"/>
            <!-- 嘴巴 -->
            <rect x="28" y="42" width="8" height="4" fill="#4a0000"/>
            <!-- 树枝/手臂 -->
            <rect x="8" y="28" width="12" height="4" fill="#8b4513"/>
            <rect x="44" y="28" width="12" height="4" fill="#8b4513"/>
            <!-- 树叶 -->
            <rect x="4" y="20" width="16" height="12" fill="#228b22"/>
            <rect x="44" y="20" width="16" height="12" fill="#228b22"/>
            <rect x="20" y="8" width="24" height="16" fill="#32cd32"/>
            <rect x="24" y="4" width="6" height="6" fill="#228b22"/>
            <rect x="34" y="4" width="6" height="6" fill="#228b22"/>
        </svg>`;
    },

    // BOSS: 洞穴巨魔
    bossCave() {
        return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
            <!-- 身体 -->
            <ellipse cx="32" cy="40" rx="20" ry="18" fill="#696969"/>
            <ellipse cx="32" cy="42" rx="14" ry="10" fill="#808080"/>
            <!-- 腿部 -->
            <rect x="18" y="52" width="8" height="10" fill="#556b2f"/>
            <rect x="38" y="52" width="8" height="10" fill="#556b2f"/>
            <!-- 手臂 -->
            <rect x="8" y="32" width="12" height="16" fill="#696969"/>
            <rect x="44" y="32" width="12" height="16" fill="#696969"/>
            <!-- 头部 -->
            <rect x="22" y="12" width="20" height="18" fill="#808080"/>
            <!-- 角 -->
            <rect x="20" y="4" width="4" height="10" fill="#4a4a4a"/>
            <rect x="40" y="4" width="4" height="10" fill="#4a4a4a"/>
            <!-- 眼睛 -->
            <rect x="24" y="18" width="6" height="4" fill="#ffff00"/>
            <rect x="34" y="18" width="6" height="4" fill="#ffff00"/>
            <rect x="26" y="19" width="2" height="2" fill="#ff0000"/>
            <rect x="36" y="19" width="2" height="2" fill="#ff0000"/>
            <!-- 獠牙 -->
            <rect x="24" y="28" width="3" height="6" fill="#fffff0"/>
            <rect x="37" y="28" width="3" height="6" fill="#fffff0"/>
            <!-- 武器 (大棒) -->
            <rect x="52" y="20" width="6" height="30" fill="#8b4513"/>
            <rect x="50" y="16" width="10" height="8" fill="#a0522d"/>
        </svg>`;
    },

    // BOSS: 法老王
    bossDesert() {
        return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
            <!-- 身体 (木乃伊) -->
            <rect x="20" y="28" width="24" height="24" fill="#d2b48c"/>
            <!-- 绷带纹理 -->
            <rect x="22" y="30" width="20" height="2" fill="#c0a070"/>
            <rect x="22" y="34" width="20" height="2" fill="#c0a070"/>
            <rect x="22" y="38" width="20" height="2" fill="#c0a070"/>
            <rect x="22" y="42" width="20" height="2" fill="#c0a070"/>
            <rect x="22" y="46" width="20" height="2" fill="#c0a070"/>
            <!-- 金色项圈 -->
            <rect x="22" y="28" width="20" height="4" fill="#ffd700"/>
            <!-- 头部 (金色面具) -->
            <rect x="24" y="10" width="16" height="20" fill="#ffd700"/>
            <!-- 条纹头饰 -->
            <rect x="20" y="6" width="24" height="6" fill="#4169e1"/>
            <rect x="22" y="8" width="4" height="2" fill="#ffd700"/>
            <rect x="30" y="8" width="4" height="2" fill="#ffd700"/>
            <rect x="38" y="8" width="4" height="2" fill="#ffd700"/>
            <!-- 眼睛 -->
            <rect x="26" y="18" width="4" height="4" fill="#000000"/>
            <rect x="34" y="18" width="4" height="4" fill="#000000"/>
            <rect x="27" y="19" width="1" height="1" fill="#ffffff"/>
            <rect x="35" y="19" width="1" height="1" fill="#ffffff"/>
            <!-- 权杖 -->
            <rect x="46" y="16" width="4" height="44" fill="#daa520"/>
            <rect x="44" y="12" width="8" height="8" fill="#ffd700"/>
        </svg>`;
    },

    // BOSS: 火焰领主
    bossVolcano() {
        return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
            <!-- 火焰光环 -->
            <ellipse cx="32" cy="56" rx="24" ry="6" fill="#ff4500" opacity="0.5"/>
            <!-- 身体 (熔岩) -->
            <ellipse cx="32" cy="36" rx="18" ry="22" fill="#8b0000"/>
            <ellipse cx="32" cy="38" rx="12" ry="14" fill="#ff4500"/>
            <ellipse cx="32" cy="40" rx="8" ry="10" fill="#ff8c00"/>
            <!-- 手臂 -->
            <rect x="8" y="28" width="16" height="12" fill="#8b0000"/>
            <rect x="40" y="28" width="16" height="12" fill="#8b0000"/>
            <!-- 头部 -->
            <rect x="24" y="12" width="16" height="16" fill="#8b0000"/>
            <rect x="26" y="14" width="12" height="10" fill="#ff4500"/>
            <!-- 火焰眼睛 -->
            <rect x="26" y="18" width="4" height="4" fill="#ffff00"/>
            <rect x="34" y="18" width="4" height="4" fill="#ffff00"/>
            <!-- 角 (火焰) -->
            <rect x="20" y="8" width="4" height="8" fill="#ff8c00"/>
            <rect x="18" y="4" width="3" height="6" fill="#ffff00"/>
            <rect x="40" y="8" width="4" height="8" fill="#ff8c00"/>
            <rect x="43" y="4" width="3" height="6" fill="#ffff00"/>
            <!-- 身体裂缝熔岩 -->
            <rect x="28" y="32" width="2" height="8" fill="#ffff00"/>
            <rect x="34" y="40" width="2" height="6" fill="#ff8c00"/>
        </svg>`;
    },

    // BOSS: 混沌魔王
    bossFinal() {
        return `<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">
            <!-- 黑暗光环 -->
            <ellipse cx="36" cy="64" rx="28" ry="6" fill="#4a0080" opacity="0.6"/>
            <!-- 翅膀 -->
            <path d="M12 24 L32 12 L36 32 Z" fill="#2a0030"/>
            <path d="M60 24 L40 12 L36 32 Z" fill="#2a0030"/>
            <!-- 身体 -->
            <ellipse cx="36" cy="42" rx="20" ry="22" fill="#4a0080"/>
            <ellipse cx="36" cy="44" rx="14" ry="14" fill="#6a0090"/>
            <ellipse cx="36" cy="46" rx="8" ry="8" fill="#8a00a0"/>
            <!-- 腿部 -->
            <rect x="22" y="58" width="10" height="12" fill="#2a0030"/>
            <rect x="40" y="58" width="10" height="12" fill="#2a0030"/>
            <!-- 头部 -->
            <rect x="28" y="14" width="16" height="18" fill="#4a0080"/>
            <!-- 角 -->
            <rect x="24" y="4" width="4" height="12" fill="#2a0030"/>
            <rect x="22" y="2" width="3" height="6" fill="#ffff00"/>
            <rect x="44" y="4" width="4" height="12" fill="#2a0030"/>
            <rect x="47" y="2" width="3" height="6" fill="#ffff00"/>
            <!-- 眼睛 (发光) -->
            <rect x="30" y="20" width="4" height="4" fill="#ff0000"/>
            <rect x="38" y="20" width="4" height="4" fill="#ff0000"/>
            <rect x="31" y="21" width="2" height="2" fill="#ffff00"/>
            <rect x="39" y="21" width="2" height="2" fill="#ffff00"/>
            <!-- 胸口核心 -->
            <rect x="32" y="38" width="8" height="8" fill="#ff0000"/>
            <rect x="34" y="40" width="4" height="4" fill="#ffff00"/>
            <!-- 武器 (混沌之剑) -->
            <rect x="52" y="16" width="6" height="48" fill="#4a0080"/>
            <rect x="50" y="12" width="10" height="8" fill="#8a00a0"/>
            <rect x="53" y="14" width="4" height="4" fill="#ffff00"/>
        </svg>`;
    },

    // 辅助函数: 颜色变暗
    darken(color) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 64);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 64);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 64);
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    },

    // 获取怪物SVG
    getMonster(enemyName, enemyId) {
        // 史莱姆家族
        if (enemyName.includes('绿史莱姆')) return this.slime('green');
        if (enemyName.includes('蓝史莱姆')) return this.slime('blue');
        if (enemyName.includes('红史莱姆')) return this.slime('red');
        if (enemyName.includes('黄金史莱姆')) return this.slime('gold');
        if (enemyName.includes('金属史莱姆')) return this.slime('metal');
        
        // 龙族
        if (enemyName.includes('幼龙') || enemyName.includes('火龙')) return this.dragon('fire');
        if (enemyName.includes('冰龙')) return this.dragon('ice');
        if (enemyName.includes('雷龙')) return this.dragon('thunder');
        
        // 野兽
        if (enemyName.includes('狼')) return this.wolf();
        
        // 不死族
        if (enemyName.includes('骷髅') || enemyName.includes('骨龙')) return this.skeleton();
        
        // BOSS
        if (enemyName.includes('远古树精')) return this.bossForest();
        if (enemyName.includes('洞穴巨魔')) return this.bossCave();
        if (enemyName.includes('法老王')) return this.bossDesert();
        if (enemyName.includes('火焰领主')) return this.bossVolcano();
        if (enemyName.includes('混沌魔王') || enemyName.includes('魔王')) return this.bossFinal();
        
        // 默认: 史莱姆
        return this.slime('green');
    }
};

// ==================== 职业定义 ====================
const CLASSES = {
    warrior: { id: 'warrior', name: '战士', icon: '⚔️', baseHp: 120, baseStr: 15, baseDef: 12, baseSpd: 8, baseInt: 5, growth: { hp: 12, str: 3, def: 2, spd: 1, int: 0.5 } },
    mage: { id: 'mage', name: '法师', icon: '🔮', baseHp: 80, baseStr: 5, baseDef: 6, baseSpd: 10, baseInt: 18, growth: { hp: 6, str: 0.5, def: 1, spd: 2, int: 3 } },
    archer: { id: 'archer', name: '弓箭手', icon: '🏹', baseHp: 100, baseStr: 12, baseDef: 8, baseSpd: 15, baseInt: 8, growth: { hp: 9, str: 2, def: 1.5, spd: 3, int: 1 } },
    priest: { id: 'priest', name: '牧师', icon: '✝️', baseHp: 90, baseStr: 8, baseDef: 10, baseSpd: 7, baseInt: 15, growth: { hp: 8, str: 1, def: 2, spd: 1, int: 2.5 } },
    rogue: { id: 'rogue', name: '盗贼', icon: '🗡️', baseHp: 95, baseStr: 14, baseDef: 7, baseSpd: 18, baseInt: 6, growth: { hp: 8, str: 2.5, def: 1, spd: 3.5, int: 0.5 } }
};

// ==================== 扩展怪物图鉴 ====================
const BESTIARY = {
    slimeGreen: { name: '绿史莱姆', icon: '🟢', family: 'slime', level: 1, hp: 30, str: 5, def: 2, xp: 8, gold: 3, desc: '最弱小的史莱姆' },
    slimeBlue: { name: '蓝史莱姆', icon: '🔵', family: 'slime', level: 3, hp: 45, str: 7, def: 3, xp: 12, gold: 5, desc: '水属性的史莱姆' },
    slimeRed: { name: '红史莱姆', icon: '🔴', family: 'slime', level: 5, hp: 60, str: 10, def: 4, xp: 18, gold: 7, desc: '火属性的史莱姆' },
    slimeGold: { name: '黄金史莱姆', icon: '🟡', family: 'slime', level: 15, hp: 100, str: 15, def: 10, xp: 100, gold: 50, desc: '稀有史莱姆，掉落大量金币' },
    slimeKing: { name: '史莱姆王', icon: '👑', family: 'slime', level: 25, hp: 500, str: 30, def: 20, xp: 300, gold: 150, desc: '史莱姆的王者' },
    slimeMetal: { name: '金属史莱姆', icon: '⚪', family: 'slime', level: 30, hp: 20, str: 5, def: 99, xp: 1000, gold: 10, desc: '超高防御，逃跑很快' },
    undeadSkeleton: { name: '骷髅兵', icon: '💀', family: 'undead', level: 8, hp: 70, str: 18, def: 5, xp: 28, gold: 12, desc: '复活的骷髅' },
    beastWolf: { name: '野狼', icon: '🐺', family: 'beast', level: 4, hp: 55, str: 14, def: 6, xp: 18, gold: 8, desc: '群居的野兽' },
    beastWerewolf: { name: '狼人', icon: '🐺', family: 'beast', level: 30, hp: 350, str: 55, def: 25, xp: 250, gold: 150, desc: '月圆之夜出没' },
    dragonWhelp: { name: '幼龙', icon: '🐉', family: 'dragon', level: 20, hp: 300, str: 45, def: 30, xp: 180, gold: 100, desc: '年幼的龙' },
    dragonFire: { name: '火龙', icon: '🔥', family: 'dragon', level: 35, hp: 800, str: 80, def: 50, xp: 500, gold: 300, desc: '掌控火焰' },
    dragonIce: { name: '冰龙', icon: '❄️', family: 'dragon', level: 38, hp: 850, str: 75, def: 55, xp: 550, gold: 320, desc: '掌控冰霜' },
    dragonThunder: { name: '雷龙', icon: '⚡', family: 'dragon', level: 40, hp: 900, str: 85, def: 50, xp: 600, gold: 350, desc: '掌控雷电' }
};

// ==================== BOSS图鉴 ====================
const BOSSES = {
    forest: { name: '远古树精', icon: '🌲', level: 10, hp: 800, str: 35, def: 30, spd: 5, xp: 400, gold: 250, skills: ['entangle', 'heal'], desc: '森林的守护者' },
    cave: { name: '洞穴巨魔', icon: '👹', level: 18, hp: 1500, str: 55, def: 40, spd: 6, xp: 800, gold: 500, skills: ['smash', 'rage'], desc: '洞穴深处的怪物' },
    desert: { name: '法老王', icon: '👳', level: 35, hp: 4000, str: 85, def: 55, spd: 15, xp: 2000, gold: 1500, skills: ['curse', 'sandstorm'], desc: '沉睡千年的王者' },
    volcano: { name: '火焰领主', icon: '🔥', level: 48, hp: 6000, str: 120, def: 70, spd: 25, xp: 3500, gold: 2500, skills: ['inferno', 'magmaArmor'], desc: '掌控熔岩的魔王' },
    demonCastle: { name: '混沌魔王', icon: '👹', level: 99, hp: 100000, str: 500, def: 350, spd: 100, xp: 100000, gold: 100000, skills: ['chaos', 'armageddon'], desc: '一切的终结' }
};

// ==================== 地图区域 ====================
const MAP_ZONES = {
    village: { id: 'village', name: '新手村', icon: '🏘️', type: 'safe', level: 0, desc: '冒险开始的地方' },
    forest: { id: 'forest', name: '迷雾森林', icon: '🌲', type: 'combat', level: 1, desc: '史莱姆和野兽出没', unlocks: ['cave'] },
    cave: { id: 'cave', name: '阴暗洞穴', icon: '🕳️', type: 'combat', level: 8, desc: '不死生物的巢穴', unlocks: ['desert'] },
    desert: { id: 'desert', name: '灼热沙漠', icon: '🏜️', type: 'combat', level: 20, desc: '蝎子与沙漠强盗', unlocks: ['volcano'] },
    volcano: { id: 'volcano', name: '熔岩地带', icon: '🌋', type: 'combat', level: 32, desc: '火元素和幼龙', unlocks: ['demonCastle'] },
    demonCastle: { id: 'demonCastle', name: '魔王城', icon: '🏯', type: 'boss', level: 99, desc: '最终决战之地' }
};

// ==================== 按区域分组的怪物 ====================
const ZONE_ENEMIES = {
    forest: ['slimeGreen', 'slimeBlue', 'beastWolf'],
    cave: ['slimeRed', 'undeadSkeleton', 'beastWolf'],
    desert: ['slimeGold', 'beastWerewolf', 'dragonWhelp'],
    volcano: ['dragonFire', 'dragonIce', 'dragonThunder'],
    demonCastle: ['dragonThunder', 'slimeMetal', 'dragonFire']
};

// ==================== 技能系统 ====================
const SKILL_SYSTEM = {
    warrior: [
        { id: 'slash', name: '斩击', icon: '⚔️', mp: 0, type: 'attack', power: 1.2, desc: '基本的斩击', level: 1 },
        { id: 'heavyStrike', name: '重击', icon: '🔨', mp: 5, type: 'attack', power: 1.8, desc: '强力的打击', level: 3 },
        { id: 'whirlwind', name: '旋风斩', icon: '🌪️', mp: 15, type: 'aoe', power: 1.5, desc: '攻击全体敌人', level: 8 }
    ],
    mage: [
        { id: 'fireball', name: '火球术', icon: '🔥', mp: 8, type: 'magic', power: 1.8, element: 'fire', desc: '火属性魔法', level: 1 },
        { id: 'iceShard', name: '冰锥术', icon: '❄️', mp: 8, type: 'magic', power: 1.6, element: 'ice', desc: '冰属性魔法', level: 1 },
        { id: 'heal', name: '治疗术', icon: '💚', mp: 10, type: 'heal', power: 1.5, desc: '恢复单体生命', level: 3 }
    ],
    archer: [
        { id: 'aimedShot', name: '瞄准射击', icon: '🎯', mp: 5, type: 'attack', power: 1.6, desc: '精准的单体攻击', level: 1 },
        { id: 'doubleShot', name: '双重射击', icon: '🏹', mp: 8, type: 'attack', power: 1.2, hits: 2, desc: '连续两次攻击', level: 3 }
    ],
    priest: [
        { id: 'cure', name: '治愈', icon: '💚', mp: 8, type: 'heal', power: 1.3, desc: '基础治疗', level: 1 },
        { id: 'groupHeal', name: '群体治疗', icon: '💗', mp: 25, type: 'partyHeal', power: 1.0, desc: '恢复全队生命', level: 8 }
    ],
    rogue: [
        { id: 'stab', name: '突刺', icon: '🗡️', mp: 5, type: 'attack', power: 1.4, desc: '快速攻击', level: 1 },
        { id: 'backstab', name: '背刺', icon: '🔪', mp: 10, type: 'attack', power: 2.0, critBonus: 0.2, desc: '高伤害背刺', level: 3 }
    ]
};

// ==================== 角色解锁配置 ====================
const CHARACTER_UNLOCKS = {
    forest: { classId: 'mage', name: '法师', desc: '森林的智者加入了你的队伍！' },
    cave: { classId: 'archer', name: '弓箭手', desc: '洞穴中的猎人加入了你的队伍！' },
    desert: { classId: 'priest', name: '牧师', desc: '沙漠的圣者加入了你的队伍！' },
    volcano: { classId: 'rogue', name: '盗贼', desc: '火山中的刺客加入了你的队伍！' }
};

// ==================== 游戏状态 ====================
let gameState = {
    party: [],
    inventory: [],
    gold: 500,
    currentMap: 'village',
    defeatedBosses: [],
    unlockedMaps: ['village', 'forest'],
    unlockedCharacters: ['warrior'],
    bestiary: {},
    equippedCosmetics: {}
};

// 战斗状态
let battleState = null;

// ==================== 核心函数 ====================

// 开始新游戏
function startNewGame() {
    // 初始化音频系统
    initAudio();
    AudioControl.loadSettings();
    updateAudioUI();
    
    gameState = {
        party: [],
        inventory: [],
        gold: 500,
        currentMap: 'village',
        defeatedBosses: [],
        unlockedMaps: ['village', 'forest'],
        unlockedCharacters: ['warrior'],
        bestiary: {},
        equippedCosmetics: {}
    };

    createCharacter('勇者', 'warrior');
    saveGame();
    
    // 播放标题音乐并显示开场剧情
    BGM.play('title');
    StoryDialog.show('opening', () => {
        BGM.play('village');
        showScene('party');
        showToast('🎮 新游戏开始！', 'success');
    });
}

// 继续游戏
function continueGame() {
    // 初始化音频系统
    initAudio();
    AudioControl.loadSettings();
    updateAudioUI();
    
    if (loadGame()) {
        BGM.play('village');
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
        currentHp: classData.baseHp,
        maxHp: classData.baseHp,
        currentMp: classData.baseInt * 5,
        maxMp: classData.baseInt * 5,
        equipment: {},
        learnedSkills: []
    };

    gameState.party.push(char);
    return char;
}

// 计算角色属性
function calculateStats(char) {
    const classData = CLASSES[char.classId];
    if (!classData) return { hp: 100, mp: 50, str: 10, def: 10, spd: 10, int: 10 };

    const level = char.level;
    return {
        hp: Math.floor(classData.baseHp + (level - 1) * classData.growth.hp),
        mp: Math.floor(classData.baseInt * 5 + (level - 1) * classData.growth.int * 3),
        str: Math.floor(classData.baseStr + (level - 1) * classData.growth.str),
        def: Math.floor(classData.baseDef + (level - 1) * classData.growth.def),
        spd: Math.floor(classData.baseSpd + (level - 1) * classData.growth.spd),
        int: Math.floor(classData.baseInt + (level - 1) * classData.growth.int)
    };
}

// ==================== 渲染函数 ====================

// 渲染队伍界面
function renderParty() {
    const container = document.getElementById('partyContainer');
    if (!container) return;

    container.innerHTML = gameState.party.map(char => {
        const stats = calculateStats(char);
        const hpPercent = (char.currentHp / stats.hp) * 100;
        const mpPercent = (char.currentMp / stats.mp) * 100;
        
        return `
            <div class="character-card">
                <div class="character-header">
                    <div class="character-avatar">
                        ${PixelSprites.characterBack(char.classId)}
                    </div>
                    <div class="character-info">
                        <h3>${char.name}</h3>
                        <div class="character-class">${char.className} Lv.${char.level}</div>
                        <div class="character-level">HP: ${char.currentHp}/${stats.hp} MP: ${char.currentMp}/${stats.mp}</div>
                    </div>
                </div>
                <div class="bar-container">
                    <div class="bar-label"><span>HP</span><span>${char.currentHp}/${stats.hp}</span></div>
                    <div class="bar"><div class="bar-fill hp-bar" style="width: ${hpPercent}%"></div></div>
                </div>
                <div class="bar-container">
                    <div class="bar-label"><span>MP</span><span>${char.currentMp}/${stats.mp}</span></div>
                    <div class="bar"><div class="bar-fill mp-bar" style="width: ${mpPercent}%"></div></div>
                </div>
                <div class="character-stats">
                    <div class="stat"><span>STR</span><span>${stats.str}</span></div>
                    <div class="stat"><span>DEF</span><span>${stats.def}</span></div>
                    <div class="stat"><span>SPD</span><span>${stats.spd}</span></div>
                    <div class="stat"><span>INT</span><span>${stats.int}</span></div>
                </div>
            </div>
        `;
    }).join('');

    updateHeaderStats();
}

// 渲染地图
function renderMap() {
    const container = document.getElementById('mapContainer');
    if (!container) return;

    container.innerHTML = Object.values(MAP_ZONES).map(zone => {
        const isLocked = !gameState.unlockedMaps.includes(zone.id);
        const isCurrent = gameState.currentMap === zone.id;
        const isCleared = gameState.defeatedBosses.includes(zone.id);

        return `
            <div class="map-node ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''} ${isCleared ? 'cleared' : ''}"
                 onclick="${isLocked ? '' : `enterZone('${zone.id}')`}">
                <div class="map-icon">${zone.icon}</div>
                <div class="map-name">${zone.name}</div>
                <div class="map-level">Lv.${zone.level}</div>
            </div>
        `;
    }).join('');
}

// 渲染战斗界面 - DQ风格布局
function renderBattle() {
    if (!battleState) return;

    // 渲染勇者队伍 (左侧, 背面朝向敌人)
    const partyContainer = document.getElementById('battleParty');
    if (partyContainer) {
        partyContainer.innerHTML = gameState.party.map((char, index) => {
            const stats = calculateStats(char);
            const isActive = battleState.activeCharIndex === index && char.currentHp > 0;
            const hpPercent = (char.currentHp / stats.hp) * 100;
            
            return `
                <div class="party-member ${isActive ? 'active' : ''} ${char.currentHp <= 0 ? 'dead' : ''}" 
                     data-char-id="${char.id}">
                    <div class="member-sprite">${PixelSprites.characterBack(char.classId)}</div>
                    <div class="member-info">
                        <div class="member-name">${char.name}</div>
                        <div class="member-hp-bar"><div class="hp-fill" style="width: ${hpPercent}%"></div></div>
                        <div class="member-mp">MP:${char.currentMp}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 渲染敌人 (右侧, 正面朝向玩家)
    const enemiesContainer = document.getElementById('battleEnemies');
    if (enemiesContainer) {
        const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);
        enemiesContainer.innerHTML = battleState.enemies.map((enemy, index) => {
            const isDead = enemy.currentHp <= 0;
            const isTargeted = aliveEnemies.length > 0 && 
                aliveEnemies[battleState.selectedTarget % aliveEnemies.length].id === enemy.id;
            const hpPercent = (enemy.currentHp / enemy.maxHp) * 100;
            
            return `
                <div class="enemy-unit ${isTargeted ? 'targeted' : ''} ${isDead ? 'dead' : ''}" 
                     data-enemy-index="${index}"
                     onclick="selectTarget(${index})">
                    <div class="enemy-sprite">${PixelSprites.getMonster(enemy.name)}</div>
                    <div class="enemy-name">${enemy.name}</div>
                    <div class="enemy-hp-bar"><div class="hp-fill" style="width: ${hpPercent}%"></div></div>
                    <div class="enemy-hp-text">${enemy.currentHp}/${enemy.maxHp}</div>
                </div>
            `;
        }).join('');
    }
}

// 渲染战斗日志
function renderBattleLog() {
    const logContainer = document.getElementById('battleLog');
    if (!logContainer || !battleState) return;

    const typeColors = {
        normal: '#f0f0f0',
        damage: '#ff6b6b',
        heal: '#51cf66',
        loot: '#ffd43b',
        boss: '#ff6b6b'
    };

    logContainer.innerHTML = battleState.logs.slice(-6).map(log =>
        `<div style="color: ${typeColors[log.type] || '#f0f0f0'}; margin: 4px 0;">${log.message}</div>`
    ).join('');

    logContainer.scrollTop = logContainer.scrollHeight;
}

// 更新头部统计
function updateHeaderStats() {
    const goldEl = document.getElementById('headerGold');
    if (goldEl) goldEl.textContent = gameState.gold;
}

// ==================== 战斗系统 ====================

// 开始战斗
function startBattle(zoneId) {
    const zone = MAP_ZONES[zoneId];
    if (!zone) return;
    
    // 显示区域剧情（如果是第一次进入）
    if (!gameState.bestiary || Object.keys(gameState.bestiary).length === 0) {
        if (zoneId === 'forest' && STORIES.forest) {
            StoryDialog.show('forest', () => {
                startBattleActual(zoneId);
            });
            return;
        }
    }
    
    startBattleActual(zoneId);
}

function startBattleActual(zoneId) {
    const zone = MAP_ZONES[zoneId];
    
    battleState = {
        zone: zone,
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
    
    // 播放战斗BGM
    BGM.play('battle');
    
    nextTurn();
}

// 开始BOSS战
function startBossBattle(zoneId) {
    const boss = BOSSES[zoneId];
    if (!boss) return;

    // 检查是否有剧情
    const bossStoryMap = {
        forest: 'forestBoss',
        cave: 'caveBoss',
        desert: 'desertBoss',
        volcano: 'volcanoBoss',
        demonCastle: 'finalBoss'
    };
    
    const storyId = bossStoryMap[zoneId];
    if (storyId && STORIES[storyId]) {
        StoryDialog.show(storyId, () => {
            startBossBattleActual(zoneId);
        });
        return;
    }
    
    startBossBattleActual(zoneId);
}

function startBossBattleActual(zoneId) {
    const boss = BOSSES[zoneId];
    
    battleState = {
        zone: MAP_ZONES[zoneId],
        enemies: [{
            ...boss,
            id: Date.now(),
            currentHp: boss.hp,
            maxHp: boss.hp,
            isBoss: true
        }],
        turn: 0,
        activeCharIndex: 0,
        selectedTarget: 0,
        logs: [],
        isBossBattle: true
    };

    showScene('battle');
    renderBattle();
    addBattleLog(`👑 BOSS战开始！${boss.name}出现了！`, 'boss');
    
    // 播放BOSS战BGM
    BGM.play('boss');
    
    nextTurn();
}

// 生成敌人
function generateEnemies(zoneId) {
    const enemyPool = ZONE_ENEMIES[zoneId] || ZONE_ENEMIES.forest;
    const count = Math.floor(Math.random() * 3) + 2;
    const enemies = [];

    for (let i = 0; i < count; i++) {
        const enemyId = enemyPool[Math.floor(Math.random() * enemyPool.length)];
        const template = BESTIARY[enemyId];
        if (template) {
            enemies.push({
                ...template,
                id: Date.now() + i,
                currentHp: template.hp,
                maxHp: template.hp
            });
        }
    }
    return enemies;
}

// 下一回合
function nextTurn() {
    if (!battleState) return;

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

    while (battleState.activeCharIndex < gameState.party.length) {
        const char = gameState.party[battleState.activeCharIndex];
        if (char.currentHp > 0) {
            addBattleLog(`▶ ${char.name} 的回合`, 'normal');
            renderBattle();
            return;
        }
        battleState.activeCharIndex++;
    }

    enemyTurn();
}

// 敌人回合
function enemyTurn() {
    if (!battleState) return;

    battleState.enemies.forEach((enemy, idx) => {
        if (enemy.currentHp > 0) {
            const aliveChars = gameState.party.filter(c => c.currentHp > 0);
            if (aliveChars.length === 0) return;

            const target = aliveChars[Math.floor(Math.random() * aliveChars.length)];
            const stats = calculateStats(target);
            const damage = Math.max(1, enemy.str - stats.def / 2);
            
            target.currentHp = Math.max(0, target.currentHp - damage);
            
            // 受伤动画
            const targetEl = document.querySelector(`[data-char-id="${target.id}"]`);
            if (targetEl) {
                targetEl.classList.add('shake-effect', 'damage-effect');
                setTimeout(() => targetEl.classList.remove('shake-effect', 'damage-effect'), 400);
            }
            
            // 屏幕震动效果
            document.querySelector('.battle-arena')?.classList.add('shake-effect');
            setTimeout(() => document.querySelector('.battle-arena')?.classList.remove('shake-effect'), 400);

            addBattleLog(`${enemy.icon} ${enemy.name} 攻击 ${target.name} 造成 ${Math.floor(damage)} 伤害！`, 'damage');
            
            // 播放受伤音效
            SoundEffects.playDamage();
        }
    });

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
            showSkillTree(char.id);
            break;
        case 'item':
            showToast('背包功能开发中...', 'info');
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
    const isCritical = Math.random() < 0.15;
    const critMultiplier = isCritical ? 1.5 : 1;
    const damage = Math.max(1, stats.str * (0.9 + Math.random() * 0.2) * critMultiplier - target.def / 2);
    const finalDamage = Math.floor(damage);

    target.currentHp = Math.max(0, target.currentHp - finalDamage);

    // 攻击动画
    const attackerEl = document.querySelector(`[data-char-id="${char.id}"]`);
    const targetEl = document.querySelector(`[data-enemy-index="${battleState.enemies.indexOf(target)}"]`);

    if (attackerEl) {
        attackerEl.style.transform = 'translateX(20px)';
        setTimeout(() => attackerEl.style.transform = '', 200);
    }

    setTimeout(() => {
        if (targetEl) {
            // 闪烁效果
            targetEl.classList.add('flash-effect');
            setTimeout(() => targetEl.classList.remove('flash-effect'), 300);
            
            // 震动效果
            targetEl.classList.add('shake-effect');
            setTimeout(() => targetEl.classList.remove('shake-effect'), 400);
            
            // 攻击闪光效果
            const flash = document.createElement('div');
            flash.className = 'attack-flash';
            flash.style.left = '50%';
            flash.style.top = '50%';
            flash.style.transform = 'translate(-50%, -50%)';
            targetEl.appendChild(flash);
            setTimeout(() => flash.remove(), 300);
        }
    }, 200);

    const critText = isCritical ? ' 💥暴击!' : '';
    addBattleLog(`${char.icon} ${char.name} 攻击 ${target.name} 造成 ${finalDamage} 伤害！${critText}`, isCritical ? 'damage' : 'normal');
    
    // 播放音效
    if (isCritical) {
        SoundEffects.playCritical();
    } else {
        SoundEffects.playAttack();
    }

    if (target.currentHp <= 0) {
        addBattleLog(`${target.name} 被击败了！`, 'normal');
    }

    endTurn();
}

// 结束回合
function endTurn() {
    battleState.activeCharIndex++;
    setTimeout(() => nextTurn(), 500);
}

// 选择目标
function selectTarget(index) {
    if (!battleState) return;
    battleState.selectedTarget = index;
    renderBattle();
}

// 尝试逃跑
function attemptFlee() {
    if (battleState.isBossBattle) {
        addBattleLog('无法从BOSS战中逃跑！', 'normal');
        return;
    }
    
    if (Math.random() < 0.6) {
        addBattleLog('🏃 成功逃跑！', 'normal');
        setTimeout(() => {
            battleState = null;
            showScene('map');
        }, 1000);
    } else {
        addBattleLog('逃跑失败！', 'normal');
        endTurn();
    }
}

// 胜利
function victory() {
    let totalXp = 0;
    let totalGold = 0;

    battleState.enemies.forEach(enemy => {
        totalXp += enemy.xp;
        totalGold += enemy.gold;
    });

    gameState.gold += totalGold;
    
    gameState.party.forEach(char => {
        if (char.currentHp > 0) {
            char.xp += Math.floor(totalXp / gameState.party.length);
            checkLevelUp(char);
        }
    });

    addBattleLog(`🎉 战斗胜利！获得 ${totalXp} XP, ${totalGold} G`, 'normal');
    saveGame();

    // 播放胜利音效和BGM
    SoundEffects.playVictory();
    BGM.play('victory', false);

    if (battleState.isBossBattle) {
        const zoneId = battleState.zone.id;
        gameState.defeatedBosses.push(zoneId);
        
        // 检查是否有胜利剧情
        const victoryStoryMap = {
            forest: 'forestVictory',
            cave: 'caveVictory',
            desert: 'desertVictory',
            volcano: 'volcanoVictory'
        };
        
        const victoryStoryId = victoryStoryMap[zoneId];
        if (victoryStoryId && STORIES[victoryStoryId]) {
            setTimeout(() => {
                StoryDialog.show(victoryStoryId, () => {
                    unlockCharacter(zoneId);
                    const zone = MAP_ZONES[zoneId];
                    if (zone && zone.unlocks) {
                        zone.unlocks.forEach(mapId => {
                            if (!gameState.unlockedMaps.includes(mapId)) {
                                gameState.unlockedMaps.push(mapId);
                            }
                        });
                    }
                    
                    // 魔王城通关
                    if (zoneId === 'demonCastle') {
                        StoryDialog.show('ending', () => {
                            battleState = null;
                            showScene('menu');
                        });
                        return;
                    }
                    
                    battleState = null;
                    showScene('map');
                    BGM.play('village');
                });
            }, 1000);
            return;
        }
        
        unlockCharacter(zoneId);
        
        const zone = MAP_ZONES[zoneId];
        if (zone && zone.unlocks) {
            zone.unlocks.forEach(mapId => {
                if (!gameState.unlockedMaps.includes(mapId)) {
                    gameState.unlockedMaps.push(mapId);
                }
            });
        }
        
        // 魔王城通关
        if (zoneId === 'demonCastle') {
            setTimeout(() => {
                StoryDialog.show('ending', () => {
                    battleState = null;
                    showScene('menu');
                });
            }, 1000);
            return;
        }
    }

    setTimeout(() => {
        battleState = null;
        showScene('map');
        BGM.play('village');
    }, 2000);
}

// 失败
function defeat() {
    addBattleLog('💀 队伍全灭了...', 'damage');
    
    // 播放游戏结束音效和BGM
    SoundEffects.playGameOver();
    BGM.play('gameover', false);
    
    // 屏幕震动效果
    document.querySelector('.battle-arena')?.classList.add('shake-effect');
    setTimeout(() => {
        document.querySelector('.battle-arena')?.classList.remove('shake-effect');
    }, 600);

    setTimeout(() => {
        gameState.party.forEach(char => {
            char.currentHp = Math.floor(calculateStats(char).hp * 0.5);
            char.currentMp = calculateStats(char).mp;
        });
        battleState = null;
        showScene('party');
        showToast('队伍被击败了，但在附近恢复了...', 'error');
        BGM.play('village');
    }, 2000);
}

// 检查升级
function checkLevelUp(char) {
    while (char.xp >= char.xpToNext) {
        char.xp -= char.xpToNext;
        char.level++;
        char.xpToNext = Math.floor(100 * Math.pow(1.5, char.level - 1));
        
        const stats = calculateStats(char);
        char.maxHp = stats.hp;
        char.currentHp = char.maxHp;
        char.maxMp = stats.mp;
        char.currentMp = char.maxMp;
        
        addBattleLog(`🆙 ${char.name} 升到 ${char.level} 级！`, 'normal');
        
        // 播放升级音效
        SoundEffects.playLevelUp();
    }
}

// 解锁角色
function unlockCharacter(bossId) {
    const unlock = CHARACTER_UNLOCKS[bossId];
    if (!unlock) return false;

    if (gameState.party.some(c => c.classId === unlock.classId)) return false;
    if (gameState.party.length >= CONFIG.MAX_PARTY_SIZE) {
        showToast(`⚠️ 队伍已满！${unlock.name}无法加入。`, 'error');
        return false;
    }

    createCharacter(unlock.name, unlock.classId);
    gameState.unlockedCharacters.push(unlock.classId);
    showToast(`🎉 ${unlock.desc}`, 'success');
    return true;
}

// 添加战斗日志
function addBattleLog(message, type = 'normal') {
    if (!battleState) return;
    battleState.logs.push({ message, type, time: Date.now() });
    if (battleState.logs.length > 50) battleState.logs.shift();
    renderBattleLog();
}

// ==================== 技能树 ====================

function showSkillTree(charId) {
    const char = gameState.party.find(c => c.id === charId);
    if (!char) return;

    const skills = SKILL_SYSTEM[char.classId] || [];
    const overlay = document.createElement('div');
    overlay.id = 'skillTreeOverlay';
    overlay.className = 'skill-tree-overlay';
    overlay.innerHTML = `
        <div class="skill-tree-panel">
            <h2>📚 ${char.name} 的技能</h2>
            <div style="text-align:center;color:#87ceeb;margin-bottom:15px;font-size:9px;">
                MP: ${char.currentMp}/${calculateStats(char).mp}
            </div>
            <div class="skills-grid">
                ${skills.map(skill => {
                    const canUse = char.currentMp >= skill.mp;
                    return `
                        <div class="skill-item ${canUse ? 'available' : 'locked'}"
                             onclick="${canUse ? `executeSkill(${charId}, '${skill.id}')` : ''}">
                            <div class="skill-icon">${skill.icon}</div>
                            <div class="skill-name">${skill.name}</div>
                            <div class="skill-level">Lv.${skill.level}</div>
                            <div class="skill-mp">${skill.mp} MP</div>
                            <div class="skill-desc">${skill.desc}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="text-align:center;margin-top:15px;">
                <button class="btn btn-secondary" onclick="closeSkillTree()">关闭</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
}

function closeSkillTree() {
    const overlay = document.getElementById('skillTreeOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

function executeSkill(charId, skillId) {
    const char = gameState.party.find(c => c.id === charId);
    if (!char || !battleState) return;

    const skills = SKILL_SYSTEM[char.classId] || [];
    const skill = skills.find(s => s.id === skillId);
    if (!skill || char.currentMp < skill.mp) return;

    char.currentMp -= skill.mp;
    closeSkillTree();

    const stats = calculateStats(char);
    const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);

    if (skill.type === 'attack' || skill.type === 'magic') {
        const target = aliveEnemies[battleState.selectedTarget % aliveEnemies.length];
        let damage = 0;
        
        if (skill.type === 'magic') {
            damage = Math.max(1, stats.int * (skill.power || 1.5) - target.def / 2);
        } else {
            damage = Math.max(1, stats.str * (skill.power || 1.5) - target.def / 2);
        }
        
        damage = Math.floor(damage);
        target.currentHp = Math.max(0, target.currentHp - damage);

        // 魔法光效动画
        const targetEl = document.querySelector(`[data-enemy-index="${battleState.enemies.indexOf(target)}"]`);
        if (targetEl) {
            targetEl.classList.add('magic-effect');
            setTimeout(() => targetEl.classList.remove('magic-effect'), 800);
        }

        addBattleLog(`${skill.icon} ${char.name} 使用 ${skill.name} 造成 ${damage} 伤害！`, 'damage');
        
        // 播放攻击音效
        SoundEffects.playAttack();
        
        if (target.currentHp <= 0) {
            addBattleLog(`${target.name} 被击败了！`, 'normal');
        }
    } else if (skill.type === 'heal') {
        const healAmount = Math.floor(stats.int * (skill.power || 1.5));
        char.currentHp = Math.min(calculateStats(char).hp, char.currentHp + healAmount);
        addBattleLog(`${skill.icon} ${char.name} 恢复 ${healAmount} HP！`, 'heal');
        
        // 播放治疗音效
        SoundEffects.playHeal();
    }

    renderBattle();
    endTurn();
}

// ==================== 场景切换 ====================

function showScene(sceneName) {
    // 播放菜单音效
    SoundEffects.playMenuMove();
    
    document.querySelectorAll('.scene').forEach(scene => scene.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const sceneMap = {
        'menu': 'sceneMenu',
        'party': 'sceneParty',
        'map': 'sceneMap',
        'bestiary': 'sceneBestiary',
        'cosmetics': 'sceneCosmetics',
        'battle': 'sceneBattle',
        'world': 'worldScene'
    };

    const targetScene = document.getElementById(sceneMap[sceneName]);
    if (targetScene) targetScene.classList.add('active');

    if (sceneName !== 'menu' && sceneName !== 'battle' && sceneName !== 'world') {
        const navBtns = document.querySelectorAll('.nav-btn');
        const navIndex = ['party', 'map', 'bestiary', 'cosmetics'].indexOf(sceneName);
        if (navIndex >= 0 && navBtns[navIndex + 1]) {
            navBtns[navIndex + 1].classList.add('active');
        }
    }

    if (sceneName === 'party') renderParty();
    if (sceneName === 'map') renderMap();
    if (sceneName === 'world') {
        // 初始化世界探索系统
        setTimeout(() => {
            if (typeof WorldSystem !== 'undefined' && WorldSystem.init) {
                WorldSystem.init();
            }
        }, 100);
    }
    
    // 切换BGM
    if (sceneName === 'battle') {
        // 战斗BGM已经在startBattle中处理
    } else if (sceneName === 'menu') {
        BGM.play('title');
    } else if (sceneName === 'world') {
        BGM.play('village');
    } else {
        BGM.play('village');
    }
}

// ==================== 地图功能 ====================

function enterZone(zoneId) {
    const zone = MAP_ZONES[zoneId];
    if (!zone) return;

    if (!gameState.unlockedMaps.includes(zoneId)) {
        showToast('🔒 该区域尚未解锁！', 'error');
        SoundEffects.playError();
        return;
    }

    gameState.currentMap = zoneId;

    if (zone.type === 'boss') {
        if (gameState.defeatedBosses.includes(zoneId)) {
            showToast('✅ 你已经击败了这个BOSS！', 'info');
            return;
        }
        
        // 魔王城特殊处理
        if (zoneId === 'demonCastle' && STORIES.demonCastle) {
            StoryDialog.show('demonCastle', () => {
                startBossBattle(zoneId);
            });
            return;
        }
        
        startBossBattle(zoneId);
    } else if (zone.type === 'combat') {
        // 检查是否有区域剧情
        const areaStories = {
            cave: 'cave',
            mine: 'mine',
            desert: 'desert',
            volcano: 'volcano'
        };
        
        const storyId = areaStories[zoneId];
        if (storyId && STORIES[storyId]) {
            StoryDialog.show(storyId, () => {
                startBattle(zoneId);
            });
            return;
        }
        
        startBattle(zoneId);
    } else {
        showToast('🏘️ 这里是安全区', 'info');
    }
}

// ==================== 存档系统 ====================

function saveGame() {
    localStorage.setItem('dq_jrpg_save', JSON.stringify(gameState));
}

function loadGame() {
    const save = localStorage.getItem('dq_jrpg_save');
    if (save) {
        gameState = JSON.parse(save);
        return true;
    }
    return false;
}

// ==================== Toast提示 ====================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ==================== 初始化 ====================

function init() {
    // 初始化音频设置
    AudioControl.loadSettings();
    
    // 检查是否有存档
    if (localStorage.getItem('dq_jrpg_save')) {
        document.getElementById('continueBtn').style.display = 'block';
    }
    updateHeaderStats();
    updateAudioUI();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// ==================== 音量控制 ====================

function toggleMute() {
    const isMuted = AudioControl.toggleMute();
    updateAudioUI();
    showToast(isMuted ? '🔇 声音已关闭' : '🔊 声音已开启', 'info');
}

function setVolume(value) {
    AudioControl.setVolume(value);
    updateAudioUI();
}

function updateAudioUI() {
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    
    if (muteBtn) {
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
    }
    
    if (volumeSlider) {
        volumeSlider.value = volume * 100;
    }
}
