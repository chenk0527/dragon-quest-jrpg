/**
 * Dragon Quest JRPG 4.0 - Overhaul Edition
 * Enhanced with better graphics, animations, and features
 */

// ==================== 游戏配置 ====================
const CONFIG = {
    MAX_PARTY_SIZE: 4,
    MAX_LEVEL: 99,
    VERSION: '4.0',
    RARITY_WEIGHTS: { common: 45, magic: 30, rare: 15, epic: 8, legendary: 2 },
    AUTO_SAVE_INTERVAL: 30000,
    XP_BASE: 100,
    XP_CURVE: 1.9,
    MAX_ENHANCE: 15,
    COSMETIC_SLOTS: ['hair', 'face', 'body', 'back', 'weaponSkin', 'pet'],
    ASSETS_VERSION: '4.0.0'
};

// 显示技能树界面
function showSkillTree(charId) {
    const char = gameState.party.find(c => c.id === charId);
    if (!char) return;

    const skills = SKILL_SYSTEM[char.classId] || [];
    const overlay = document.createElement('div');
    overlay.id = 'skillTreeOverlay';
    overlay.className = 'skill-tree-overlay';
    overlay.innerHTML = `
        <div class="skill-tree-panel">
            <h2>📚 ${char.name} 的技能树</h2>
            <div class="skill-points">MP: ${char.currentMp}/${calculateStats(char).mp}</div>
            <div class="skills-grid">
                ${skills.map(skill => {
                    const isLearned = char.learnedSkills && char.learnedSkills.includes(skill.id);
                    const canLearn = char.level >= skill.level;
                    return `
                        <div class="skill-item ${isLearned ? 'learned' : ''} ${!isLearned && canLearn ? 'available' : ''} ${!canLearn ? 'locked' : ''}"
                             onclick="${isLearned ? `selectSkillForBattle(${charId}, '${skill.id}')` : ''}">
                            <div class="skill-icon">${skill.icon}</div>
                            <div class="skill-name">${skill.name}</div>
                            <div class="skill-level">Lv.${skill.level}</div>
                            <div class="skill-mp">${skill.mp} MP</div>
                            <div class="skill-desc">${skill.desc}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="skill-tree-buttons">
                <button class="btn btn-secondary" onclick="closeSkillTree()">关闭</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
}

// 关闭技能树
function closeSkillTree() {
    const overlay = document.getElementById('skillTreeOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

// 在战斗中选择技能
function selectSkillForBattle(charId, skillId) {
    if (!battleState) return;
    const char = gameState.party.find(c => c.id === charId);
    if (!char) return;

    const skill = getSkillById(char.classId, skillId);
    if (!skill) return;

    // 检查MP
    if (char.currentMp < skill.mp) {
        showToast('MP不足！', 'error');
        return;
    }

    // 关闭技能树
    closeSkillTree();

    // 根据技能类型执行
    executeSkill(char, skill);
}

// 根据ID获取技能
function getSkillById(classId, skillId) {
    const skills = SKILL_SYSTEM[classId] || [];
    return skills.find(s => s.id === skillId);
}

// 执行技能
function executeSkill(char, skill) {
    const stats = calculateStats(char);

    // 消耗MP
    char.currentMp -= skill.mp;

    switch(skill.type) {
        case 'attack':
        case 'magic':
            performSkillAttack(char, skill, stats);
            break;
        case 'aoe':
            performAOEAttack(char, skill, stats);
            break;
        case 'heal':
            performHeal(char, skill, stats);
            break;
        case 'partyHeal':
            performPartyHeal(char, skill, stats);
            break;
        case 'buff':
            performBuff(char, skill);
            break;
        case 'partyBuff':
            performPartyBuff(char, skill);
            break;
        case 'steal': {
            const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);
            if (aliveEnemies.length === 0) break;
            const target = aliveEnemies[battleState.selectedTarget % aliveEnemies.length];
            const stealChance = 0.6;
            if (Math.random() < stealChance) {
                if (Math.random() < 0.7) {
                    const gold = Math.floor(Math.random() * 41) + 10;
                    gameState.gold += gold;
                    addBattleLog(`${skill.icon} ${char.name} 从 ${target.name} 偷到了 ${gold} 金币！`, 'loot');
                } else {
                    const slots = ['weapon', 'helmet', 'armor', 'shield'];
                    const slot = slots[Math.floor(Math.random() * slots.length)];
                    const loot = generateEquipment(slot, char.level, null);
                    addItemToInventory(loot);
                    addBattleLog(`${skill.icon} ${char.name} 从 ${target.name} 偷到了 ${loot.name}！`, 'loot');
                }
            } else {
                addBattleLog(`${skill.icon} ${char.name} 偷窃失败了！`, 'normal');
            }
            break;
        }
        case 'drain': {
            const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);
            if (aliveEnemies.length === 0) break;
            const target = aliveEnemies[battleState.selectedTarget % aliveEnemies.length];
            const power = skill.power || 1.2;
            let damage = Math.max(1, Math.floor(stats.int * power - target.def / 2));
            target.currentHp = Math.max(0, target.currentHp - damage);
            const mpRestore = Math.floor(damage * 0.5);
            char.currentMp = Math.min(calculateStats(char).mp, char.currentMp + mpRestore + skill.mp);
            addBattleLog(`${skill.icon} ${char.name} 对 ${target.name} 造成 ${damage} 伤害，恢复了 ${mpRestore} MP！`, 'damage');
            if (target.currentHp <= 0) {
                addBattleLog(`${target.icon || '💀'} ${target.name} 被击败了！`, 'normal');
            }
            break;
        }
        case 'escape':
            addBattleLog(`${skill.icon} ${char.name} 使用 ${skill.name}，成功撤退！`, 'normal');
            setTimeout(() => {
                showScene('map');
            }, 1000);
            return;
        case 'revive': {
            const deadAlly = gameState.party.find(m => m.currentHp <= 0);
            if (deadAlly) {
                const maxHp = calculateStats(deadAlly).hp;
                const reviveHp = Math.floor(maxHp * (skill.power || 0.5));
                deadAlly.currentHp = Math.max(1, reviveHp);
                addBattleLog(`${skill.icon} ${char.name} 复活了 ${deadAlly.name}，恢复 ${deadAlly.currentHp} HP！`, 'heal');
                AudioSystem.playHeal();
            } else {
                addBattleLog(`${skill.icon} 没有需要复活的队友！`, 'normal');
                char.currentMp += skill.mp;
            }
            break;
        }
        case 'dispel': {
            const targetAlly = gameState.party.find(m => m.currentHp > 0 && m.buffs && m.buffs.some(b => b.type === 'debuff'));
            if (targetAlly) {
                targetAlly.buffs = targetAlly.buffs.filter(b => b.type !== 'debuff');
                addBattleLog(`${skill.icon} ${char.name} 驱散了 ${targetAlly.name} 的负面状态！`, 'heal');
            } else {
                const self = char;
                if (self.buffs) self.buffs = self.buffs.filter(b => b.value >= 1);
                addBattleLog(`${skill.icon} ${char.name} 使用 ${skill.name} 清除了负面效果！`, 'heal');
            }
            break;
        }
        case 'counter':
            if (!char.buffs) char.buffs = [];
            char.buffs.push({ type: 'counter', value: skill.power || 1.5, duration: skill.duration || 3 });
            addBattleLog(`${skill.icon} ${char.name} 进入反击姿态！`, 'heal');
            break;
        case 'dot': {
            const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);
            if (aliveEnemies.length === 0) break;
            const target = aliveEnemies[battleState.selectedTarget % aliveEnemies.length];
            const dotDamage = Math.max(1, Math.floor(stats.str * (skill.power || 0.5)));
            target.currentHp = Math.max(0, target.currentHp - dotDamage);
            if (!target.debuffs) target.debuffs = [];
            target.debuffs.push({ type: 'dot', damage: dotDamage, duration: skill.duration || 4 });
            addBattleLog(`${skill.icon} ${char.name} 对 ${target.name} 施加了持续伤害（每回合 ${dotDamage}）！`, 'damage');
            if (target.currentHp <= 0) {
                addBattleLog(`${target.icon || '💀'} ${target.name} 被击败了！`, 'normal');
            }
            break;
        }
        case 'debuff': {
            const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);
            if (aliveEnemies.length === 0) break;
            const target = aliveEnemies[battleState.selectedTarget % aliveEnemies.length];
            if (!target.debuffs) target.debuffs = [];
            target.debuffs.push({
                type: skill.debuffType || 'def',
                value: skill.debuffValue || 0.5,
                duration: skill.duration || 3
            });
            const debuffNames = { str: '攻击力', def: '防御力', spd: '速度', int: '智力' };
            addBattleLog(`${skill.icon} ${char.name} 降低了 ${target.name} 的${debuffNames[skill.debuffType] || '属性'}！`, 'damage');
            break;
        }
        default:
            addBattleLog(`${char.name} 使用了 ${skill.name}！`, 'normal');
    }

    renderBattle();
    endTurn();
}

// 技能攻击
function performSkillAttack(char, skill, stats) {
    const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);
    if (aliveEnemies.length === 0) return;

    const target = aliveEnemies[battleState.selectedTarget % aliveEnemies.length];

    // 计算伤害
    let power = skill.power || 1.5;
    let damage = 0;

    if (skill.type === 'magic') {
        damage = Math.max(1, stats.int * power - target.def / 2);
    } else {
        damage = Math.max(1, stats.str * power - target.def / 2);
    }

    // 暴击加成
    const isCritical = Math.random() < (0.15 + (skill.critBonus || 0));
    if (isCritical) damage *= 1.5;

    damage = Math.floor(damage);
    target.currentHp = Math.max(0, target.currentHp - damage);

    // 动画
    BattleAnimations.skillAnimation(skill.name);
    setTimeout(() => {
        const targetEl = document.querySelector(`[data-enemy-index="${battleState.selectedTarget % aliveEnemies.length}"]`);
        if (targetEl) {
            BattleAnimations.shakeElement(targetEl, 10, 400);
            BattleAnimations.flashElement(targetEl, skill.element === 'fire' ? '#ff6600' : '#ffaa00', 300);
        }
    }, 400);

    const critText = isCritical ? ' 💥暴击!' : '';
    addBattleLog(`${skill.icon} ${char.name} 使用 ${skill.name} 对 ${target.name} 造成 ${damage} 伤害！${critText}`, 'damage');
    AudioSystem.playAttack();

    if (target.currentHp <= 0) {
        addBattleLog(`${target.icon} ${target.name} 被击败了！`, 'normal');
    }
}

// 全体攻击
function performAOEAttack(char, skill, stats) {
    const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);

    let power = skill.power || 1.2;

    aliveEnemies.forEach((target, index) => {
        let damage = 0;
        if (skill.type === 'magic') {
            damage = Math.max(1, stats.int * power - target.def / 3);
        } else {
            damage = Math.max(1, stats.str * power - target.def / 3);
        }
        damage = Math.floor(damage);
        target.currentHp = Math.max(0, target.currentHp - damage);

        // 视觉反馈
        setTimeout(() => {
            const targetEl = document.querySelector(`[data-enemy-index="${index}"]`);
            if (targetEl) {
                BattleAnimations.shakeElement(targetEl, 8, 300);
            }
        }, index * 100);
    });

    BattleAnimations.skillAnimation(skill.name);
    addBattleLog(`${skill.icon} ${char.name} 使用 ${skill.name} 攻击了全体敌人！`, 'damage');
    AudioSystem.playAttack();
}

// 治疗
function performHeal(char, skill, stats) {
    const target = gameState.party[battleState.activeCharIndex];
    const maxHp = calculateStats(target).hp;
    const healAmount = Math.floor(stats.int * (skill.power || 1.5));

    const prevHp = target.currentHp;
    target.currentHp = Math.min(maxHp, target.currentHp + healAmount);
    const actualHeal = target.currentHp - prevHp;

    const targetEl = document.querySelector(`[data-char-id="${target.id}"]`);
    if (targetEl) BattleAnimations.flashElement(targetEl, '#00ff00', 300);

    addBattleLog(`${skill.icon} ${char.name} 使用 ${skill.name} 恢复了 ${actualHeal} 生命！`, 'heal');
    AudioSystem.playHeal();
}

// 全体治疗
function performPartyHeal(char, skill, stats) {
    const healAmount = Math.floor(stats.int * (skill.power || 1.0));

    gameState.party.forEach(member => {
        if (member.currentHp > 0) {
            const maxHp = calculateStats(member).hp;
            const prevHp = member.currentHp;
            member.currentHp = Math.min(maxHp, member.currentHp + healAmount);
        }
    });

    addBattleLog(`${skill.icon} ${char.name} 使用 ${skill.name} 恢复了全队生命！`, 'heal');
    AudioSystem.playHeal();
}

// BUFF技能
function performBuff(char, skill) {
    if (!char.buffs) char.buffs = [];

    // 添加BUFF
    char.buffs.push({
        type: skill.buffType,
        value: skill.buffValue,
        duration: skill.duration || 3
    });

    BattleAnimations.skillAnimation(skill.name);
    addBattleLog(`${skill.icon} ${char.name} 使用 ${skill.name}，${skill.desc}！`, 'heal');
}

// 全队BUFF
function performPartyBuff(char, skill) {
    gameState.party.forEach(member => {
        if (member.currentHp > 0) {
            if (!member.buffs) member.buffs = [];
            member.buffs.push({
                type: skill.buffType,
                value: skill.buffValue,
                duration: skill.duration || 3
            });
        }
    });

    BattleAnimations.skillAnimation(skill.name);
    addBattleLog(`${skill.icon} ${char.name} 使用 ${skill.name}，全队${skill.desc}！`, 'heal');
}

// 更新BUFF（每回合）
function updateBuffs() {
    gameState.party.forEach(char => {
        if (char.buffs) {
            char.buffs = char.buffs.filter(buff => {
                buff.duration--;
                return buff.duration > 0;
            });
        }
    });
}

// ==================== 技能系统CSS ====================

// ==================== 装备强化配置 ====================
const ENHANCE_CONFIG = {
    // 强化费用（金币）
    costs: {
        weapon: [100, 150, 220, 330, 500, 750, 1100, 1650, 2500, 4000, 6500, 10000, 15000, 25000, 40000],
        armor: [80, 120, 180, 270, 400, 600, 900, 1350, 2000, 3200, 5000, 8000, 12000, 20000, 35000],
        accessory: [120, 180, 270, 400, 600, 900, 1350, 2000, 3000, 4800, 7500, 12000, 18000, 30000, 50000]
    },
    // 强化材料需求
    materials: {
        1: { common: 1, magic: 0, rare: 0, epic: 0, legendary: 0 },
        2: { common: 2, magic: 0, rare: 0, epic: 0, legendary: 0 },
        3: { common: 3, magic: 1, rare: 0, epic: 0, legendary: 0 },
        4: { common: 4, magic: 2, rare: 0, epic: 0, legendary: 0 },
        5: { common: 5, magic: 3, rare: 1, epic: 0, legendary: 0 },
        6: { common: 0, magic: 4, rare: 2, epic: 0, legendary: 0 },
        7: { common: 0, magic: 5, rare: 3, epic: 0, legendary: 0 },
        8: { common: 0, magic: 0, rare: 4, epic: 1, legendary: 0 },
        9: { common: 0, magic: 0, rare: 5, epic: 2, legendary: 0 },
        10: { common: 0, magic: 0, rare: 0, epic: 3, legendary: 1 },
        11: { common: 0, magic: 0, rare: 0, epic: 4, legendary: 2 },
        12: { common: 0, magic: 0, rare: 0, epic: 5, legendary: 3 },
        13: { common: 0, magic: 0, rare: 0, epic: 0, legendary: 4 },
        14: { common: 0, magic: 0, rare: 0, epic: 0, legendary: 5 },
        15: { common: 0, magic: 0, rare: 0, epic: 0, legendary: 10 }
    },
    // 成功率 (百分比)
    successRate: {
        '1-3': 100,
        '4-6': 90,
        '7-9': 80,
        10: 70,
        11: 60,
        12: 50,
        13: 40,
        14: 30,
        15: 20
    },
    // 失败惩罚（+10以上失败会降低强化等级）
    failurePenalty: {
        10: 0,   // 10->9
        11: 1,   // 11->10
        12: 1,   // 12->11
        13: 2,   // 13->11
        14: 2,   // 14->12
        15: 3    // 15->12
    },
    // 属性加成系数
    statBonus: {
        weapon: { str: 0.08 },
        helmet: { def: 0.06, hp: 0.04 },
        armor: { def: 0.08, hp: 0.05 },
        shield: { def: 0.07, hp: 0.03 },
        accessory: { spd: 0.06, int: 0.05 }
    }
};

// 获取强化成功率
function getEnhanceSuccessRate(currentLevel) {
    if (currentLevel <= 3) return ENHANCE_CONFIG.successRate['1-3'];
    if (currentLevel <= 6) return ENHANCE_CONFIG.successRate['4-6'];
    if (currentLevel <= 9) return ENHANCE_CONFIG.successRate['7-9'];
    return ENHANCE_CONFIG.successRate[currentLevel + 1] || 20;
}

// 获取强化费用
function getEnhanceCost(equipment) {
    const slot = equipment.slot;
    const level = equipment.enhanceLevel || 0;
    const costs = ENHANCE_CONFIG.costs[slot] || ENHANCE_CONFIG.costs.armor;
    return costs[level] || costs[costs.length - 1];
}

// 获取强化材料需求
function getEnhanceMaterials(level) {
    return ENHANCE_CONFIG.materials[level + 1] || ENHANCE_CONFIG.materials[15];
}

// 检查是否有足够材料
function hasEnoughMaterials(materials) {
    for (const [type, amount] of Object.entries(materials)) {
        if ((gameState.enhancementMaterials[type] || 0) < amount) {
            return false;
        }
    }
    return true;
}

// 消耗材料
function consumeMaterials(materials) {
    for (const [type, amount] of Object.entries(materials)) {
        gameState.enhancementMaterials[type] = (gameState.enhancementMaterials[type] || 0) - amount;
        if (gameState.enhancementMaterials[type] < 0) gameState.enhancementMaterials[type] = 0;
    }
}

// 执行装备强化
function enhanceEquipment(charId, slot) {
    const char = gameState.party.find(c => c.id === charId);
    if (!char) return { success: false, message: '角色不存在' };

    const equipment = char.equipment[slot];
    if (!equipment) return { success: false, message: '没有装备' };

    const currentLevel = equipment.enhanceLevel || 0;
    if (currentLevel >= CONFIG.MAX_ENHANCE) {
        return { success: false, message: '已达到最大强化等级' };
    }

    const cost = getEnhanceCost(equipment);
    if (gameState.gold < cost) {
        return { success: false, message: '金币不足' };
    }

    const materials = getEnhanceMaterials(currentLevel);
    if (!hasEnoughMaterials(materials)) {
        return { success: false, message: '材料不足' };
    }

    // 扣除费用和材料
    gameState.gold -= cost;
    consumeMaterials(materials);

    // 计算成功率
    const successRate = getEnhanceSuccessRate(currentLevel);
    const roll = Math.random() * 100;

    if (roll <= successRate) {
        // 强化成功
        equipment.enhanceLevel = (equipment.enhanceLevel || 0) + 1;
        updateEnhancedStats(equipment);
        saveGame();
        return {
            success: true,
            message: `强化成功！${equipment.name} +${equipment.enhanceLevel}`,
            newLevel: equipment.enhanceLevel
        };
    } else {
        // 强化失败
        if (currentLevel >= 10) {
            // +10以上失败会降级
            const penalty = ENHANCE_CONFIG.failurePenalty[currentLevel + 1] || 1;
            const newLevel = Math.max(0, currentLevel + 1 - penalty);
            equipment.enhanceLevel = newLevel;
            updateEnhancedStats(equipment);
            saveGame();
            return {
                success: false,
                message: `强化失败！装备降至 +${newLevel}`,
                newLevel: newLevel,
                failed: true
            };
        }
        saveGame();
        return {
            success: false,
            message: '强化失败！装备无变化',
            failed: true
        };
    }
}

// 更新强化后的属性
function updateEnhancedStats(equipment) {
    const level = equipment.enhanceLevel || 0;
    const slot = equipment.slot;
    const bonusConfig = ENHANCE_CONFIG.statBonus[slot];

    if (!bonusConfig || level === 0) return;

    // 计算基础属性
    const baseStr = equipment.baseStr || equipment.str || 0;
    const baseDef = equipment.baseDef || equipment.def || 0;
    const baseHp = equipment.baseHp || equipment.hp || 0;
    const baseSpd = equipment.baseSpd || equipment.spd || 0;
    const baseInt = equipment.baseInt || equipment.int || 0;

    // 保存基础属性（如果还没保存）
    if (!equipment.baseStr && equipment.str) equipment.baseStr = equipment.str;
    if (!equipment.baseDef && equipment.def) equipment.baseDef = equipment.def;
    if (!equipment.baseHp && equipment.hp) equipment.baseHp = equipment.hp;
    if (!equipment.baseSpd && equipment.spd) equipment.baseSpd = equipment.spd;
    if (!equipment.baseInt && equipment.int) equipment.baseInt = equipment.int;

    // 应用强化加成
    if (bonusConfig.str) equipment.str = Math.floor(baseStr * (1 + bonusConfig.str * level));
    if (bonusConfig.def) equipment.def = Math.floor(baseDef * (1 + bonusConfig.def * level));
    if (bonusConfig.hp) equipment.hp = Math.floor(baseHp * (1 + bonusConfig.hp * level));
    if (bonusConfig.spd) equipment.spd = Math.floor(baseSpd * (1 + bonusConfig.spd * level));
    if (bonusConfig.int) equipment.int = Math.floor(baseInt * (1 + bonusConfig.int * level));
}

// 添加强化材料
function addEnhancementMaterial(type, amount) {
    if (!gameState.enhancementMaterials) {
        gameState.enhancementMaterials = { common: 0, magic: 0, rare: 0, epic: 0, legendary: 0 };
    }
    gameState.enhancementMaterials[type] = (gameState.enhancementMaterials[type] || 0) + amount;
}

// 显示强化界面
function showEnhanceInterface(charId, slot) {
    const char = gameState.party.find(c => c.id === charId);
    if (!char) return;

    const equipment = char.equipment[slot];
    if (!equipment) {
        showToast('该槽位没有装备', 'error');
        return;
    }

    const currentLevel = equipment.enhanceLevel || 0;
    const cost = getEnhanceCost(equipment);
    const materials = getEnhanceMaterials(currentLevel);
    const successRate = getEnhanceSuccessRate(currentLevel);

    const overlay = document.createElement('div');
    overlay.id = 'enhanceOverlay';
    overlay.className = 'enhance-overlay';
    overlay.innerHTML = `
        <div class="enhance-panel">
            <h2>⚔️ 装备强化</h2>
            <div class="enhance-equipment">
                <div class="equip-icon rarity-${equipment.rarity}">${equipment.icon}</div>
                <div class="equip-info">
                    <div class="equip-name rarity-${equipment.rarity}">${equipment.name}</div>
                    <div class="equip-level">强化等级: +${currentLevel} / +${CONFIG.MAX_ENHANCE}</div>
                </div>
            </div>

            <div class="enhance-stats">
                <div class="stat-row">
                    <span>成功率:</span>
                    <span class="success-rate ${successRate < 50 ? 'low' : successRate < 80 ? 'medium' : 'high'}">${successRate}%</span>
                </div>
                <div class="stat-row">
                    <span>所需金币:</span>
                    <span class="cost ${gameState.gold < cost ? 'insufficient' : ''}">${cost} 💰</span>
                </div>
            </div>

            <div class="enhance-materials">
                <h4>所需材料:</h4>
                ${Object.entries(materials).map(([type, amount]) => {
                    const has = gameState.enhancementMaterials[type] || 0;
                    const typeNames = { common: '普通', magic: '魔法', rare: '稀有', epic: '史诗', legendary: '传说' };
                    return amount > 0 ? `
                        <div class="material-item ${has < amount ? 'insufficient' : ''}">
                            <span class="material-icon material-${type}">◆</span>
                            <span>${typeNames[type]}强化石</span>
                            <span class="material-count">${has}/${amount}</span>
                        </div>
                    ` : '';
                }).join('')}
            </div>

            <div class="enhance-warning">
                ${currentLevel >= 9 ? '⚠️ +10以上强化失败会降级！' : ''}
            </div>

            <div class="enhance-buttons">
                <button class="btn btn-primary" onclick="performEnhance(${charId}, '${slot}')">
                    🔨 强化
                </button>
                <button class="btn btn-secondary" onclick="closeEnhanceInterface()">
                    关闭
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
}

// 执行强化
function performEnhance(charId, slot) {
    const result = enhanceEquipment(charId, slot);

    if (result.success) {
        showToast(result.message, 'success');
        AudioSystem.playLevelUp();
        closeEnhanceInterface();
        renderParty(); // 刷新队伍界面
    } else if (result.failed) {
        showToast(result.message, 'error');
        AudioSystem.playDamage();
        closeEnhanceInterface();
        renderParty();
    } else {
        showToast(result.message, 'error');
    }
}

// 关闭强化界面
function closeEnhanceInterface() {
    const overlay = document.getElementById('enhanceOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

// ==================== 技能系统配置 ====================
const SKILL_SYSTEM = {
    // 战士技能
    warrior: [
        { id: 'slash', name: '斩击', icon: '⚔️', mp: 0, type: 'attack', power: 1.2, desc: '基本的斩击', level: 1 },
        { id: 'heavyStrike', name: '重击', icon: '🔨', mp: 5, type: 'attack', power: 1.8, desc: '强力的打击', level: 3 },
        { id: 'whirlwind', name: '旋风斩', icon: '🌪️', mp: 15, type: 'aoe', power: 1.5, desc: '攻击全体敌人', level: 8 },
        { id: 'defendStance', name: '防御姿态', icon: '🛡️', mp: 8, type: 'buff', buffType: 'def', buffValue: 1.5, duration: 3, desc: '提升防御力', level: 5 },
        { id: 'berserk', name: '狂战士', icon: '👹', mp: 20, type: 'buff', buffType: 'str', buffValue: 1.8, duration: 3, desc: '大幅提升攻击力', level: 12 },
        { id: 'pierce', name: '破甲', icon: '💥', mp: 12, type: 'attack', power: 2.2, desc: '无视部分防御', level: 15 },
        { id: 'warCry', name: '战吼', icon: '📢', mp: 15, type: 'partyBuff', buffType: 'str', buffValue: 1.3, duration: 3, desc: '全队攻击力提升', level: 18 },
        { id: 'execute', name: '处决', icon: '⚡', mp: 25, type: 'attack', power: 3.0, condition: 'hpPercent', conditionValue: 0.3, desc: '对低血量敌人造成大量伤害', level: 25 },
        { id: 'counter', name: '反击', icon: '↩️', mp: 10, type: 'counter', power: 1.5, desc: '受到攻击时反击', level: 20 },
        { id: 'ultimateSlash', name: '终极斩', icon: '🔥', mp: 40, type: 'attack', power: 4.0, desc: '最强单体攻击', level: 35 }
    ],
    // 法师技能
    mage: [
        { id: 'fireball', name: '火球术', icon: '🔥', mp: 8, type: 'magic', power: 1.8, element: 'fire', desc: '火属性魔法', level: 1 },
        { id: 'iceShard', name: '冰锥术', icon: '❄️', mp: 8, type: 'magic', power: 1.6, element: 'ice', desc: '冰属性魔法，有几率冰冻', level: 1 },
        { id: 'thunder', name: '雷击', icon: '⚡', mp: 12, type: 'magic', power: 2.2, element: 'thunder', desc: '雷属性魔法', level: 5 },
        { id: 'heal', name: '治疗术', icon: '💚', mp: 10, type: 'heal', power: 1.5, desc: '恢复单体生命', level: 3 },
        { id: 'meteor', name: '陨石术', icon: '☄️', mp: 35, type: 'aoe', power: 2.8, element: 'fire', desc: '强力的全体攻击', level: 15 },
        { id: 'blizzard', name: '暴风雪', icon: '🌨️', mp: 30, type: 'aoe', power: 2.5, element: 'ice', desc: '冰属性全体攻击', level: 18 },
        { id: 'manaShield', name: '魔法盾', icon: '🔮', mp: 15, type: 'buff', buffType: 'def', buffValue: 2.0, duration: 3, desc: '用MP抵挡伤害', level: 10 },
        { id: 'enchant', name: '附魔', icon: '✨', mp: 20, type: 'partyBuff', buffType: 'int', buffValue: 1.4, duration: 4, desc: '全队智力提升', level: 22 },
        { id: 'drain', name: '魔力吸收', icon: '🌀', mp: 5, type: 'drain', power: 1.2, desc: '攻击并恢复MP', level: 12 },
        { id: 'armageddon', name: '末日审判', icon: '💫', mp: 60, type: 'aoe', power: 4.5, desc: '最强魔法攻击', level: 40 }
    ],
    // 弓箭手技能
    archer: [
        { id: 'aimedShot', name: '瞄准射击', icon: '🎯', mp: 5, type: 'attack', power: 1.6, desc: '精准的单体攻击', level: 1 },
        { id: 'doubleShot', name: '双重射击', icon: '🏹', mp: 8, type: 'attack', power: 1.2, hits: 2, desc: '连续两次攻击', level: 3 },
        { id: 'poisonArrow', name: '毒箭', icon: '☠️', mp: 10, type: 'dot', power: 0.5, duration: 4, desc: '附加中毒效果', level: 6 },
        { id: 'volley', name: '箭雨', icon: '🌧️', mp: 20, type: 'aoe', power: 1.4, desc: '攻击全体敌人', level: 10 },
        { id: 'snipe', name: '狙击', icon: '🔭', mp: 18, type: 'attack', power: 2.5, critBonus: 0.3, desc: '高暴击率攻击', level: 15 },
        { id: 'haste', name: '急速', icon: '💨', mp: 15, type: 'buff', buffType: 'spd', buffValue: 1.6, duration: 3, desc: '提升速度', level: 12 },
        { id: 'trap', name: '陷阱', icon: '🕸️', mp: 12, type: 'debuff', debuffType: 'spd', debuffValue: 0.5, duration: 3, desc: '降低敌人速度', level: 18 },
        { id: 'piercingShot', name: '穿透箭', icon: '↔️', mp: 22, type: 'attack', power: 2.0, pierce: true, desc: '穿透防御', level: 20 },
        { id: 'eagleEye', name: '鹰眼', icon: '👁️', mp: 20, type: 'buff', buffType: 'crit', buffValue: 2.0, duration: 3, desc: '大幅提升暴击', level: 25 },
        { id: 'barrage', name: '弹幕', icon: '📦', mp: 40, type: 'attack', power: 1.0, hits: 5, desc: '连续五次攻击', level: 35 }
    ],
    // 牧师技能
    priest: [
        { id: 'cure', name: '治愈', icon: '💚', mp: 8, type: 'heal', power: 1.3, desc: '基础治疗', level: 1 },
        { id: 'holyLight', name: '圣光', icon: '✨', mp: 10, type: 'magic', power: 1.5, element: 'holy', desc: '光属性攻击', level: 1 },
        { id: 'groupHeal', name: '群体治疗', icon: '💗', mp: 25, type: 'partyHeal', power: 1.0, desc: '恢复全队生命', level: 8 },
        { id: 'bless', name: '祝福', icon: '🙏', mp: 15, type: 'partyBuff', buffType: 'def', buffValue: 1.4, duration: 3, desc: '全队防御提升', level: 5 },
        { id: 'revive', name: '复活', icon: '👼', mp: 40, type: 'revive', power: 0.5, desc: '复活倒下的队友', level: 15 },
        { id: 'dispel', name: '驱散', icon: '🌟', mp: 12, type: 'dispel', desc: '移除负面状态', level: 10 },
        { id: 'sanctuary', name: '圣域', icon: '⛪', mp: 30, type: 'partyHeal', power: 0.3, duration: 3, desc: '持续恢复全队', level: 20 },
        { id: 'holyShield', name: '神圣护盾', icon: '🔆', mp: 20, type: 'buff', buffType: 'invincible', duration: 1, desc: '抵挡一次伤害', level: 18 },
        { id: 'judgment', name: '审判', icon: '⚖️', mp: 25, type: 'magic', power: 2.5, element: 'holy', desc: '强力光属性攻击', level: 22 },
        { id: 'divineBlessing', name: '神之恩赐', icon: '🌈', mp: 50, type: 'partyBuff', buffType: 'all', buffValue: 1.5, duration: 3, desc: '全属性大幅提升', level: 35 }
    ],
    // 盗贼技能
    rogue: [
        { id: 'stab', name: '突刺', icon: '🗡️', mp: 5, type: 'attack', power: 1.4, desc: '快速攻击', level: 1 },
        { id: 'backstab', name: '背刺', icon: '🔪', mp: 10, type: 'attack', power: 2.0, critBonus: 0.2, desc: '高伤害背刺', level: 3 },
        { id: 'steal', name: '偷窃', icon: '👋', mp: 8, type: 'steal', desc: '偷取物品或金币', level: 5 },
        { id: 'poisonBlade', name: '毒刃', icon: '🗡️', mp: 12, type: 'buff', buffType: 'poison', duration: 3, desc: '武器附加毒素', level: 8 },
        { id: 'smokeBomb', name: '烟雾弹', icon: '💣', mp: 15, type: 'escape', desc: '必定逃跑成功', level: 10 },
        { id: 'shadowStrike', name: '暗影打击', icon: '🌑', mp: 20, type: 'attack', power: 2.2, ignoreDef: 0.3, desc: '无视部分防御', level: 15 },
        { id: 'dualWield', name: '双持', icon: '⚔️', mp: 18, type: 'buff', buffType: 'doubleAttack', duration: 3, desc: '每次攻击两次', level: 18 },
        { id: 'hide', name: '隐身', icon: '👤', mp: 15, type: 'buff', buffType: 'hide', duration: 2, desc: '敌人无法选中', level: 20 },
        { id: 'assassinate', name: '暗杀', icon: '🎯', mp: 30, type: 'attack', power: 3.0, critBonus: 0.5, desc: '超高暴击伤害', level: 25 },
        { id: 'shadowDance', name: '影舞', icon: '💃', mp: 45, type: 'attack', power: 0.8, hits: 4, desc: '连续四次攻击', level: 35 }
    ]
};

// ==================== 消耗品定义 ====================
const CONSUMABLE_ITEMS = {
    smallPotion: { name: '小治疗药水', icon: '🧪', type: 'consumable', subType: 'heal', value: 50, desc: '恢复50HP', buyPrice: 30 },
    mediumPotion: { name: '中治疗药水', icon: '🧪', type: 'consumable', subType: 'heal', value: 150, desc: '恢复150HP', buyPrice: 100 },
    largePotion: { name: '大治疗药水', icon: '🧪', type: 'consumable', subType: 'heal', value: 500, desc: '恢复500HP', buyPrice: 300 },
    elixir: { name: '万灵药', icon: '✨', type: 'consumable', subType: 'fullHeal', value: 0, desc: '完全恢复HP', buyPrice: 1000 },
    ether: { name: '以太', icon: '💧', type: 'consumable', subType: 'mp', value: 50, desc: '恢复50MP', buyPrice: 80 }
};

function createConsumable(itemId) {
    const template = CONSUMABLE_ITEMS[itemId];
    if (!template) return null;
    return { ...template, itemId };
}

// ==================== 资源加载管理器 ====================
const AssetLoader = {
    loaded: false,
    loadProgress: 0,
    errors: [],

    // 检查图片是否存在并可加载
    async checkImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                resolve({ exists: false, src, error: 'timeout' });
            }, 5000);

            img.onload = () => {
                clearTimeout(timeout);
                resolve({ exists: true, src, width: img.width, height: img.height });
            };

            img.onerror = () => {
                clearTimeout(timeout);
                resolve({ exists: false, src, error: 'load failed' });
            };

            img.src = src;
        });
    },

    // 预加载所有资源
    async preloadAssets() {
        console.log('[AssetLoader] Starting asset preload...');
        this.loaded = false;
        this.loadProgress = 0;
        this.errors = [];

        const assets = [];

        // 收集角色图片
        Object.values(CLASSES).forEach(cls => {
            if (cls.imagePath) assets.push(cls.imagePath);
        });

        // 收集怪物图片
        Object.values(BESTIARY).forEach(monster => {
            if (monster.imagePath) assets.push(monster.imagePath);
        });

        // 收集BOSS图片
        Object.values(BOSSES).forEach(boss => {
            if (boss.imagePath) assets.push(boss.imagePath);
        });

        // 收集背景图片
        Object.values(ZONE_BACKGROUNDS).forEach(bg => {
            if (bg.imagePath) assets.push(bg.imagePath);
        });

        // 去重
        const uniqueAssets = [...new Set(assets)];
        console.log(`[AssetLoader] Found ${uniqueAssets.length} unique assets to check`);

        let loaded = 0;
        const results = [];

        for (const src of uniqueAssets) {
            const result = await this.checkImage(src + '?v=' + CONFIG.ASSETS_VERSION);
            results.push(result);
            if (!result.exists) {
                this.errors.push(result);
                console.warn(`[AssetLoader] Failed to load: ${src}`, result.error);
            } else {
                console.log(`[AssetLoader] Loaded: ${src}`);
            }
            loaded++;
            this.loadProgress = Math.floor((loaded / uniqueAssets.length) * 100);
            this.updateLoadingScreen();
        }

        this.loaded = true;
        console.log(`[AssetLoader] Preload complete. ${this.errors.length} errors.`);
        return results;
    },

    updateLoadingScreen() {
        const progressBar = document.getElementById('loadingProgress');
        const loadingText = document.getElementById('loadingText');
        if (progressBar) progressBar.style.width = this.loadProgress + '%';
        if (loadingText) loadingText.textContent = `加载资源中... ${this.loadProgress}%`;
    },

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) loadingScreen.classList.add('active');
    },

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.pointerEvents = 'none';
            setTimeout(() => {
                loadingScreen.classList.remove('active');
                loadingScreen.style.opacity = '';
                loadingScreen.style.pointerEvents = '';
            }, 500);
        }
    }
};

// ==================== 角色解锁配置 ====================
const CHARACTER_UNLOCKS = {
    forest: { classId: 'mage', name: '法师', desc: '森林的智者加入了你的队伍！' },
    cave: { classId: 'archer', name: '弓箭手', desc: '洞穴中的猎人加入了你的队伍！' },
    desert: { classId: 'priest', name: '牧师', desc: '沙漠的圣者加入了你的队伍！' },
    volcano: { classId: 'rogue', name: '盗贼', desc: '火山中的刺客加入了你的队伍！' }
};

// ==================== 区域背景 ====================
const ZONE_BACKGROUNDS = {
    forest: { color: 'linear-gradient(180deg, #1a3a1a 0%, #0d1f0d 100%)', particles: 'leaf' },
    cave: { color: 'linear-gradient(180deg, #2a2a3a 0%, #1a1a2a 100%)', particles: 'dust' },
    mine: { color: 'linear-gradient(180deg, #3a2a1a 0%, #1f150d 100%)', particles: 'spark' },
    crypt: { color: 'linear-gradient(180deg, #1a1a2a 0%, #0d0d1f 100%)', particles: 'mist' },
    desert: { color: 'linear-gradient(180deg, #3a3020 0%, #2a2010 100%)', particles: 'sand' },
    swamp: { color: 'linear-gradient(180deg, #1a2a1a 0%, #0d1f0d 100%)', particles: 'bubble' },
    volcano: { color: 'linear-gradient(180deg, #3a1a1a 0%, #2a0d0d 100%)', particles: 'ember' },
    darkForest: { color: 'linear-gradient(180deg, #0d1a0d 0%, #050f05 100%)', particles: 'shadow' },
    castle: { color: 'linear-gradient(180deg, #1a1a2a 0%, #0f0f1f 100%)', particles: 'ghost' },
    snow: { color: 'linear-gradient(180deg, #2a3a4a 0%, #1a2a3a 100%)', particles: 'snow' },
    skyCity: { color: 'linear-gradient(180deg, #2a3a5a 0%, #1a2a4a 100%)', particles: 'cloud' },
    abyss: { color: 'linear-gradient(180deg, #1a0a2a 0%, #0f051f 100%)', particles: 'void' },
    rift: { color: 'linear-gradient(180deg, #2a1a3a 0%, #1a0d2a 100%)', particles: 'time' },
    divine: { color: 'linear-gradient(180deg, #3a3a5a 0%, #2a2a4a 100%)', particles: 'light' },
    dragonRealm: { color: 'linear-gradient(180deg, #3a2a1a 0%, #2a1a0d 100%)', particles: 'fire' },
    demonCastle: { color: 'linear-gradient(180deg, #2a0a0a 0%, #1a0505 100%)', particles: 'chaos' }
};

// ==================== 粒子效果系统 ====================
const ParticleSystem = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,

    init() {
        this.canvas = document.getElementById('particleCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    createParticle(type, x, y) {
        const particle = {
            type,
            x: x || Math.random() * this.canvas.width,
            y: y || Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1,
            decay: 0.01 + Math.random() * 0.02,
            size: 2 + Math.random() * 4
        };

        switch(type) {
            case 'damage':
                particle.vy = -2 - Math.random() * 2;
                particle.color = '#ff4444';
                break;
            case 'heal':
                particle.vy = -1 - Math.random();
                particle.color = '#44ff44';
                break;
            case 'critical':
                particle.vx *= 3;
                particle.vy *= 3;
                particle.color = '#ffaa00';
                particle.size *= 2;
                break;
            case 'levelup':
                particle.vy = -3 - Math.random() * 2;
                particle.color = '#aa44ff';
                particle.size *= 1.5;
                break;
        }

        this.particles.push(particle);
        if (!this.animationId) this.animate();
    },

    createBurst(type, x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            this.createParticle(type, x, y);
        }
    },

    animate() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life > 0) {
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
                return true;
            }
            return false;
        });

        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.animationId = null;
        }
    },

    clear() {
        this.particles = [];
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
};

// ==================== 战斗动画系统 ====================
const BattleAnimations = {
    shakeElement(element, intensity = 5, duration = 300) {
        if (!element) return;
        const originalTransform = element.style.transform;
        const startTime = Date.now();

        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const x = (Math.random() - 0.5) * intensity;
                const y = (Math.random() - 0.5) * intensity;
                element.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(shake);
            } else {
                element.style.transform = originalTransform;
            }
        };
        shake();
    },

    flashElement(element, color = '#fff', duration = 200) {
        if (!element) return;
        const originalFilter = element.style.filter;
        element.style.filter = `brightness(2) drop-shadow(0 0 10px ${color})`;
        setTimeout(() => {
            element.style.filter = originalFilter;
        }, duration);
    },

    showDamageNumber(target, damage, isCritical = false) {
        const rect = target.getBoundingClientRect();
        const number = document.createElement('div');
        number.className = 'damage-number' + (isCritical ? ' critical' : '');
        number.textContent = damage;
        number.style.left = rect.left + rect.width / 2 + 'px';
        number.style.top = rect.top + 'px';
        document.body.appendChild(number);

        // Animate
        setTimeout(() => {
            number.style.transform = 'translateY(-50px)';
            number.style.opacity = '0';
        }, 10);

        setTimeout(() => number.remove(), 1000);
    },

    attackAnimation(attacker, target, callback) {
        const attackerEl = document.querySelector(`[data-char-id="${attacker.id}"]`);
        const targetEl = document.querySelector(`[data-enemy-index="${target}"]`);

        if (attackerEl) {
            attackerEl.style.transform = 'translateX(20px)';
            setTimeout(() => {
                attackerEl.style.transform = 'translateX(0)';
            }, 200);
        }

        setTimeout(() => {
            if (targetEl) {
                this.shakeElement(targetEl, 8, 300);
                this.flashElement(targetEl, '#ff0000', 150);
            }
            if (callback) callback();
        }, 200);
    },

    skillAnimation(skillName, target, callback) {
        // Create skill effect overlay
        const overlay = document.createElement('div');
        overlay.className = 'skill-effect-overlay';
        overlay.innerHTML = `<div class="skill-name">${skillName}</div>`;
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);

        setTimeout(() => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
            if (callback) callback();
        }, 800);
    }
};

// ==================== 声音设置 ====================
let SoundEnabled = true;

function toggleSound() {
    SoundEnabled = !SoundEnabled;
    localStorage.setItem('dq_sound_enabled', SoundEnabled);
    showToast(SoundEnabled ? '🔊 声音已开启' : '🔇 声音已关闭', 'info');
    return SoundEnabled;
}

function loadSoundSetting() {
    const saved = localStorage.getItem('dq_sound_enabled');
    if (saved !== null) {
        SoundEnabled = saved === 'true';
    }
}

// ==================== 更新后的音效系统 ====================
const AudioSystem = {
    ctx: null,

    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },

    canPlay() {
        return SoundEnabled && this.ctx;
    },

    playAttack() {
        if (!this.canPlay()) return;
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

    playDamage() {
        if (!this.canPlay()) return;
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

    playHeal() {
        if (!this.canPlay()) return;
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

    playLevelUp() {
        if (!this.canPlay()) return;
        if (!this.ctx) this.init();
        const notes = [523.25, 659.25, 783.99, 1046.50];
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

    playCritical() {
        if (!this.canPlay()) return;
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.15);
    },

    playVictory() {
        if (!this.canPlay()) return;
        if (!this.ctx) this.init();
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + i * 0.15 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.15 + 0.4);
            osc.start(this.ctx.currentTime + i * 0.15);
            osc.stop(this.ctx.currentTime + i * 0.15 + 0.4);
        });
    },

    playDefeat() {
        if (!this.canPlay()) return;
        if (!this.ctx) this.init();
        const notes = [523.25, 440, 349.23, 261.63];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime + i * 0.3);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.3 + 0.4);
            osc.start(this.ctx.currentTime + i * 0.3);
            osc.stop(this.ctx.currentTime + i * 0.3 + 0.4);
        });
    }
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
    slimeGreen: { name: '绿史莱姆', icon: '🟢', imagePath: 'assets/monsters/slime.svg', family: 'slime', level: 1, hp: 30, str: 5, def: 2, xp: 8, gold: 3, desc: '最弱小的史莱姆' },
    slimeBlue: { name: '蓝史莱姆', icon: '🔵', imagePath: 'assets/monsters/slime.svg', family: 'slime', level: 3, hp: 45, str: 7, def: 3, xp: 12, gold: 5, desc: '水属性的史莱姆' },
    slimeRed: { name: '红史莱姆', icon: '🔴', imagePath: 'assets/monsters/slime.svg', family: 'slime', level: 5, hp: 60, str: 10, def: 4, xp: 18, gold: 7, desc: '火属性的史莱姆' },
    slimeGold: { name: '黄金史莱姆', icon: '🟡', imagePath: 'assets/monsters/slime.svg', family: 'slime', level: 15, hp: 100, str: 15, def: 10, xp: 100, gold: 50, desc: '稀有史莱姆，掉落大量金币' },
    slimeKing: { name: '史莱姆王', icon: '👑', imagePath: 'assets/monsters/slime.svg', family: 'slime', level: 25, hp: 500, str: 30, def: 20, xp: 300, gold: 150, desc: '史莱姆的王者' },
    slimeMetal: { name: '金属史莱姆', icon: '⚪', imagePath: 'assets/monsters/slime.svg', family: 'slime', level: 30, hp: 20, str: 5, def: 99, xp: 1000, gold: 10, desc: '超高防御，逃跑很快' },

    // 昆虫家族
    bugBee: { name: '蜜蜂', icon: '🐝', family: 'insect', level: 2, hp: 25, str: 8, def: 2, xp: 10, gold: 4, desc: '会蜇人的蜜蜂' },
    bugAnt: { name: '巨蚁', icon: '🐜', family: 'insect', level: 3, hp: 35, str: 9, def: 5, xp: 12, gold: 5, desc: '巨大的蚂蚁' },
    bugBeetle: { name: '甲虫', icon: '🪲', family: 'insect', level: 4, hp: 50, str: 12, def: 8, xp: 15, gold: 6, desc: '有坚硬外壳' },
    bugScorpion: { name: '蝎子', icon: '🦂', family: 'insect', level: 8, hp: 80, str: 18, def: 10, xp: 30, gold: 15, desc: '沙漠毒蝎' },
    bugMantis: { name: '螳螂王', icon: '🦗', family: 'insect', level: 20, hp: 300, str: 45, def: 25, xp: 200, gold: 100, desc: '昆虫中的王者' },

    // 野兽家族
    beastWolf: { name: '野狼', icon: '🐺', imagePath: 'assets/monsters/wolf.svg', family: 'beast', level: 4, hp: 55, str: 14, def: 6, xp: 18, gold: 8, desc: '群居的野兽' },
    beastBoar: { name: '野猪', icon: '🐗', family: 'beast', level: 5, hp: 70, str: 16, def: 8, xp: 22, gold: 10, desc: '脾气暴躁' },
    beastBear: { name: '棕熊', icon: '🐻', family: 'beast', level: 10, hp: 150, str: 28, def: 15, xp: 60, gold: 30, desc: '力量强大' },
    beastTiger: { name: '老虎', icon: '🐅', family: 'beast', level: 15, hp: 200, str: 35, def: 18, xp: 90, gold: 50, desc: '森林之王' },
    beastLion: { name: '狮子', icon: '🦁', family: 'beast', level: 18, hp: 250, str: 40, def: 20, xp: 120, gold: 70, desc: '草原霸主' },
    beastElephant: { name: '巨象', icon: '🐘', family: 'beast', level: 25, hp: 400, str: 50, def: 35, xp: 200, gold: 120, desc: '皮糙肉厚' },
    beastWerewolf: { name: '狼人', icon: '🐺', imagePath: 'assets/monsters/wolf.svg', family: 'beast', level: 30, hp: 350, str: 55, def: 25, xp: 250, gold: 150, desc: '月圆之夜出没' },

    // 龙族
    dragonWhelp: { name: '幼龙', icon: '🐉', imagePath: 'assets/monsters/dragon.svg', family: 'dragon', level: 20, hp: 300, str: 45, def: 30, xp: 180, gold: 100, desc: '年幼的龙' },
    dragonFire: { name: '火龙', icon: '🔥', imagePath: 'assets/monsters/dragon.svg', family: 'dragon', level: 35, hp: 800, str: 80, def: 50, xp: 500, gold: 300, desc: '掌控火焰' },
    dragonIce: { name: '冰龙', icon: '❄️', imagePath: 'assets/monsters/dragon.svg', family: 'dragon', level: 38, hp: 850, str: 75, def: 55, xp: 550, gold: 320, desc: '掌控冰霜' },
    dragonThunder: { name: '雷龙', icon: '⚡', imagePath: 'assets/monsters/dragon.svg', family: 'dragon', level: 40, hp: 900, str: 85, def: 50, xp: 600, gold: 350, desc: '掌控雷电' },
    dragonKing: { name: '龙王', icon: '👑', imagePath: 'assets/monsters/dragon.svg', family: 'dragon', level: 50, hp: 2000, str: 120, def: 80, xp: 1500, gold: 1000, desc: '龙族之王' },

    // 不死族
    undeadSkeleton: { name: '骷髅兵', icon: '💀', imagePath: 'assets/monsters/skeleton.svg', family: 'undead', level: 8, hp: 70, str: 18, def: 5, xp: 28, gold: 12, desc: '复活的骷髅' },
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
    specialGod: { name: '古神', icon: '👁️', family: 'special', level: 99, hp: 9999, str: 300, def: 200, xp: 10000, gold: 10000, desc: '不可名状' },

    // ===== 新增怪物 =====
    // 洞穴新增
    batCave: { name: '洞穴蝙蝠', icon: '🦇', family: 'beast', level: 7, hp: 45, str: 14, def: 6, xp: 16, gold: 7, desc: '生活在洞穴中的蝙蝠' },
    spiderGiant: { name: '巨型蜘蛛', icon: '🕷️', family: 'insect', level: 9, hp: 70, str: 18, def: 10, xp: 22, gold: 10, desc: '有毒的巨型蜘蛛' },
    golemStone: { name: '石魔像', icon: '🗿', family: 'elemental', level: 14, hp: 200, str: 25, def: 35, xp: 55, gold: 30, desc: '由岩石构成的魔像' },

    // 矿坑新增
    dwarfMiner: { name: '矮人矿工', icon: '⛏️', family: 'human', level: 13, hp: 120, str: 28, def: 20, xp: 48, gold: 28, desc: '发疯的矮人矿工' },

    // 墓地新增
    lichApprentice: { name: '巫妖学徒', icon: '💀', family: 'undead', level: 18, hp: 180, str: 35, def: 20, xp: 75, gold: 45, desc: '学习死灵法术的学徒' },
    shadowBeast: { name: '暗影兽', icon: '👤', family: 'demon', level: 22, hp: 280, str: 45, def: 25, xp: 110, gold: 65, desc: '由阴影构成的怪物' },
    boneDragon: { name: '骨龙', icon: '🦴', family: 'undead', level: 28, hp: 600, str: 60, def: 45, xp: 200, gold: 130, desc: '死去的龙复活' },

    // 沙漠新增
    mummy: { name: '木乃伊', icon: '👳', family: 'undead', level: 22, hp: 200, str: 38, def: 30, xp: 85, gold: 50, desc: '被诅咒的法老护卫' },
    sandWorm: { name: '沙虫', icon: '🐛', family: 'beast', level: 25, hp: 350, str: 55, def: 25, xp: 130, gold: 80, desc: '潜伏在沙漠下的巨虫' },
    sphinx: { name: '斯芬克斯', icon: '🦁', family: 'myth', level: 30, hp: 800, str: 70, def: 60, xp: 300, gold: 200, desc: '守护金字塔的谜语者' },

    // 沼泽新增
    frogGiant: { name: '巨型青蛙', icon: '🐸', family: 'beast', level: 23, hp: 220, str: 42, def: 28, xp: 95, gold: 48, desc: '变异的巨型青蛙' },
    snakeViper: { name: '毒蛇', icon: '🐍', family: 'beast', level: 24, hp: 180, str: 48, def: 20, xp: 100, gold: 55, desc: '剧毒的蛇' },
    witchSwamp: { name: '沼泽女巫', icon: '🧙‍♀️', family: 'human', level: 28, hp: 320, str: 55, def: 35, xp: 150, gold: 90, desc: '隐居沼泽的女巫' },
    crocodile: { name: '巨鳄', icon: '🐊', family: 'beast', level: 26, hp: 400, str: 58, def: 45, xp: 140, gold: 75, desc: '沼泽霸主' },

    // 火山新增
    lavaGolem: { name: '熔岩魔像', icon: '🔥', family: 'elemental', level: 35, hp: 700, str: 75, def: 65, xp: 280, gold: 180, desc: '由熔岩构成的魔像' },
    phoenixYoung: { name: '幼凤凰', icon: '🔥', family: 'myth', level: 38, hp: 550, str: 68, def: 40, xp: 240, gold: 160, desc: '年轻的凤凰' },
    hellHound: { name: '地狱猎犬', icon: '🐕‍🦺', family: 'demon', level: 36, hp: 480, str: 72, def: 35, xp: 220, gold: 140, desc: '来自地狱的猎犬' },

    // 黑暗森林新增
    spiderShadow: { name: '暗影蜘蛛', icon: '🕷️', family: 'insect', level: 40, hp: 450, str: 68, def: 38, xp: 200, gold: 120, desc: '潜伏在黑暗中的蜘蛛' },
    wolfAlpha: { name: '狼王', icon: '🐺', family: 'beast', level: 42, hp: 600, str: 78, def: 45, xp: 260, gold: 160, desc: '狼群的首领' },
    spiritDark: { name: '黑暗精灵', icon: '👤', family: 'demon', level: 45, hp: 500, str: 85, def: 40, xp: 280, gold: 180, desc: '堕落的精灵' },
    treantEvil: { name: '邪恶树精', icon: '🌲', family: 'plant', level: 43, hp: 750, str: 72, def: 55, xp: 270, gold: 170, desc: '被腐化的树精' },

    // 城堡新增
    gargoyle: { name: '石像鬼', icon: '🗿', family: 'demon', level: 48, hp: 700, str: 88, def: 70, xp: 320, gold: 200, desc: '城堡的守护者' },
    ghostKnight: { name: '幽灵骑士', icon: '👻', family: 'undead', level: 50, hp: 850, str: 95, def: 60, xp: 380, gold: 240, desc: '死去的骑士' },
    darkWizard: { name: '黑巫师', icon: '🧙‍♂️', family: 'human', level: 52, hp: 650, str: 105, def: 45, xp: 360, gold: 230, desc: '研究黑暗魔法的巫师' },

    // 雪原新增
    yeti: { name: '雪怪', icon: '❄️', family: 'beast', level: 55, hp: 1200, str: 105, def: 80, xp: 450, gold: 300, desc: '传说中的雪怪' },
    bearPolar: { name: '北极熊', icon: '🐻‍❄️', family: 'beast', level: 54, hp: 1000, str: 110, def: 70, xp: 420, gold: 280, desc: '极地霸主' },
    iceElemental: { name: '冰元素', icon: '❄️', family: 'elemental', level: 56, hp: 900, str: 100, def: 75, xp: 440, gold: 290, desc: '极寒的化身' },
    snowQueen: { name: '冰雪女王', icon: '👸', family: 'human', level: 58, hp: 1100, str: 115, def: 65, xp: 480, gold: 320, desc: '掌控冰雪的女王' },

    // 天空之城新增
    angelGuard: { name: '天使守卫', icon: '👼', family: 'myth', level: 62, hp: 1300, str: 120, def: 90, xp: 550, gold: 380, desc: '天界的守卫' },
    pegasus: { name: '飞马', icon: '🦄', family: 'myth', level: 64, hp: 1100, str: 115, def: 80, xp: 520, gold: 360, desc: '天空的使者' },
    cloudGiant: { name: '云巨人', icon: '☁️', family: 'myth', level: 66, hp: 1800, str: 130, def: 100, xp: 600, gold: 420, desc: '云端巨人' },
    stormElemental: { name: '风暴元素', icon: '⛈️', family: 'elemental', level: 65, hp: 1200, str: 135, def: 70, xp: 580, gold: 400, desc: '风暴的化身' },

    // 深渊新增
    voidSpawn: { name: '虚空生物', icon: '👾', family: 'demon', level: 70, hp: 2000, str: 145, def: 110, xp: 700, gold: 500, desc: '来自虚空的怪物' },
    darknessEternal: { name: '永恒黑暗', icon: '🌑', family: 'demon', level: 72, hp: 2200, str: 140, def: 120, xp: 750, gold: 550, desc: '纯粹的黑暗' },
    chaosFiend: { name: '混沌恶魔', icon: '👹', family: 'demon', level: 74, hp: 2500, str: 155, def: 105, xp: 800, gold: 600, desc: '混沌的化身' },
    abyssWatcher: { name: '深渊守望者', icon: '👁️', family: 'demon', level: 76, hp: 2800, str: 165, def: 115, xp: 900, gold: 680, desc: '深渊的守护者' },

    // 时空裂隙新增
    timeTraveler: { name: '时间旅行者', icon: '⏳', family: 'special', level: 78, hp: 2000, str: 150, def: 130, xp: 850, gold: 650, desc: '穿越时空的旅人' },
    spaceHorror: { name: '太空恐惧', icon: '👽', family: 'special', level: 80, hp: 2600, str: 170, def: 110, xp: 950, gold: 750, desc: '宇宙的恐怖' },
    dimensionalHorror: { name: '次元恐怖', icon: '🌀', family: 'special', level: 82, hp: 3000, str: 180, def: 125, xp: 1100, gold: 900, desc: '跨次元的怪物' },
    voidLord: { name: '虚空领主', icon: '👑', family: 'demon', level: 85, hp: 3500, str: 200, def: 140, xp: 1300, gold: 1100, desc: '虚空的主宰' },

    // 神域新增
    angelSeraph: { name: '炽天使', icon: '👼', family: 'myth', level: 86, hp: 3200, str: 190, def: 150, xp: 1200, gold: 1000, desc: '最高阶天使' },
    holyKnight: { name: '圣骑士', icon: '⚔️', family: 'human', level: 88, hp: 3500, str: 185, def: 160, xp: 1250, gold: 1050, desc: '神圣骑士' },
    divineGuardian: { name: '神圣守护者', icon: '🛡️', family: 'myth', level: 90, hp: 4000, str: 195, def: 170, xp: 1400, gold: 1200, desc: '神域的守护者' },
    celestial: { name: '天界生物', icon: '✨', family: 'myth', level: 92, hp: 3800, str: 210, def: 145, xp: 1350, gold: 1150, desc: '来自天界' },

    // 龙之领域新增
    wyvern: { name: '双足飞龙', icon: '🐉', family: 'dragon', level: 92, hp: 4500, str: 220, def: 150, xp: 1600, gold: 1400, desc: '亚龙种' },
    drake: { name: '龙兽', icon: '🐲', family: 'dragon', level: 94, hp: 5000, str: 235, def: 165, xp: 1800, gold: 1600, desc: '有龙血统的野兽' },
    elderDragon: { name: '上古龙', icon: '👑', family: 'dragon', level: 96, hp: 6000, str: 260, def: 180, xp: 2200, gold: 2000, desc: '存活千年的龙' },

    // 魔王城新增
    chaosAvatar: { name: '混沌化身', icon: '💀', family: 'demon', level: 97, hp: 8000, str: 300, def: 200, xp: 3000, gold: 3000, desc: '混沌的具象化' },
    demonEmperor: { name: '恶魔皇帝', icon: '👑', family: 'demon', level: 98, hp: 9000, str: 320, def: 220, xp: 3500, gold: 3500, desc: '恶魔的最高统治者' },
    darkPrimordial: { name: '黑暗原初', icon: '🌑', family: 'special', level: 99, hp: 12000, str: 380, def: 280, xp: 5000, gold: 5000, desc: '黑暗的起源' },
    evilIncarnate: { name: '邪恶化身', icon: '👿', family: 'demon', level: 99, hp: 15000, str: 420, def: 300, xp: 8000, gold: 8000, desc: '所有邪恶的集合' }
};

// 按区域分组的怪物
const ZONE_ENEMIES = {
    plains: ['slimeGreen', 'slimeBlue', 'bugBee', 'bugAnt', 'plantMushroom', 'batCave'],
    forest: ['slimeRed', 'bugBeetle', 'beastWolf', 'plantMushroom', 'humanBandit', 'bugBee', 'bugAnt', 'slimeBlue'],
    cave: ['slimeRed', 'bugBeetle', 'undeadSkeleton', 'undeadZombie', 'beastBoar', 'batCave', 'spiderGiant', 'golemStone'],
    mine: ['elementalEarth', 'mechRobot', 'undeadGhost', 'beastBear', 'mythGolem', 'dwarfMiner', 'elementalFire', 'dragonWhelp'],
    crypt: ['undeadVampire', 'undeadGhost', 'undeadSkeleton', 'demonImp', 'humanNinja', 'lichApprentice', 'shadowBeast', 'boneDragon'],
    desert: ['bugScorpion', 'elementalFire', 'plantCactus', 'humanPirate', 'beastLion', 'mummy', 'sandWorm', 'elementalWind', 'sphinx'],
    swamp: ['plantFlower', 'plantTreant', 'elementalWater', 'slimeGold', 'frogGiant', 'snakeViper', 'witchSwamp', 'crocodile'],
    volcano: ['elementalFire', 'elementalThunder', 'dragonWhelp', 'demonDog', 'demonImp', 'lavaGolem', 'phoenixYoung', 'hellHound'],
    darkForest: ['beastWerewolf', 'undeadVampire', 'demonLord', 'humanNinja', 'spiderShadow', 'wolfAlpha', 'spiritDark', 'treantEvil'],
    castle: ['undeadLich', 'humanKnight', 'demonLord', 'undeadVampire', 'dragonWhelp', 'gargoyle', 'ghostKnight', 'darkWizard'],
    snow: ['dragonIce', 'beastWolf', 'mythGolem', 'elementalWind', 'yeti', 'bearPolar', 'iceElemental', 'snowQueen'],
    skyCity: ['elementalWind', 'elementalThunder', 'mythUnicorn', 'mechDrone', 'angelGuard', 'pegasus', 'cloudGiant', 'stormElemental'],
    abyss: ['demonArch', 'demonLord', 'dragonFire', 'undeadLich', 'voidSpawn', 'darknessEternal', 'chaosFiend', 'abyssWatcher'],
    rift: ['specialAlien', 'mythPhoenix', 'elementalThunder', 'dragonThunder', 'timeTraveler', 'spaceHorror', 'dimensionalHorror', 'voidLord'],
    divine: ['mythUnicorn', 'mythPhoenix', 'dragonIce', 'dragonFire', 'angelSeraph', 'holyKnight', 'divineGuardian', 'celestial'],
    dragonRealm: ['dragonWhelp', 'dragonFire', 'dragonIce', 'dragonThunder', 'dragonKing', 'wyvern', 'drake', 'elderDragon'],
    demonCastle: ['demonArch', 'dragonKing', 'specialRobot', 'specialGod', 'chaosAvatar', 'demonEmperor', 'darkPrimordial', 'evilIncarnate']
};

// ==================== BOSS图鉴 ====================
const BOSSES = {
    forest: {
        name: '远古树精', icon: '🌲', imagePath: 'assets/monsters/forest_boss.svg', level: 10, hp: 800, str: 35, def: 30, spd: 5,
        xp: 400, gold: 250,
        skills: ['entangle', 'heal', 'summonSapling'],
        desc: '森林的守护者'
    },
    cave: {
        name: '洞穴巨魔', icon: '👹', imagePath: 'assets/monsters/cave_boss.svg', level: 18, hp: 1500, str: 55, def: 40, spd: 6,
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
        name: '法老王', icon: '👳', imagePath: 'assets/monsters/desert_boss.svg', level: 35, hp: 4000, str: 85, def: 55, spd: 15,
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
        name: '火焰领主', icon: '🔥', imagePath: 'assets/monsters/volcano_boss.svg', level: 48, hp: 6000, str: 120, def: 70, spd: 25,
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
        name: '混沌魔王', icon: '👹', imagePath: 'assets/monsters/final_boss.svg', level: 99, hp: 100000, str: 500, def: 350, spd: 100,
        xp: 100000, gold: 100000,
        skills: ['chaos', 'armageddon', 'void'],
        desc: '一切的终结'
    }
};

// ==================== 职业定义 ====================
const CLASSES = {
    warrior: { id: 'warrior', name: '战士', icon: '⚔️', imagePath: 'assets/characters/warrior_v2.svg', baseHp: 120, baseStr: 15, baseDef: 12, baseSpd: 8, baseInt: 5, growth: { hp: 12, str: 3, def: 2, spd: 1, int: 0.5 } },
    mage: { id: 'mage', name: '法师', icon: '🔮', imagePath: 'assets/characters/mage_v2.svg', baseHp: 80, baseStr: 5, baseDef: 6, baseSpd: 10, baseInt: 18, growth: { hp: 6, str: 0.5, def: 1, spd: 2, int: 3 } },
    archer: { id: 'archer', name: '弓箭手', icon: '🏹', imagePath: 'assets/characters/archer_v2.svg', baseHp: 100, baseStr: 12, baseDef: 8, baseSpd: 15, baseInt: 8, growth: { hp: 9, str: 2, def: 1.5, spd: 3, int: 1 } },
    priest: { id: 'priest', name: '牧师', icon: '✝️', imagePath: 'assets/characters/priest_v2.svg', baseHp: 90, baseStr: 8, baseDef: 10, baseSpd: 7, baseInt: 15, growth: { hp: 8, str: 1, def: 2, spd: 1, int: 2.5 } },
    rogue: { id: 'rogue', name: '盗贼', icon: '🗡️', imagePath: 'assets/characters/rogue_v2.svg', baseHp: 95, baseStr: 14, baseDef: 7, baseSpd: 18, baseInt: 6, growth: { hp: 8, str: 2.5, def: 1, spd: 3.5, int: 0.5 } }
};

// ==================== 改进的图片辅助函数 ====================
function getCharImage(char, size = 48) {
    const classData = CLASSES[char.classId];
    const cacheBust = '?v=' + CONFIG.ASSETS_VERSION;

    if (classData && classData.imagePath) {
        // Try SVG first, fallback to emoji
        return `<img src="${classData.imagePath}${cacheBust}"
                     alt="${char.name}"
                     class="char-sprite"
                     style="width:${size}px;height:${size}px;object-fit:contain;image-rendering:pixelated;"
                     onerror="this.onerror=null; this.parentElement.innerHTML='<span style=font-size:${size*0.7}px class=emoji-fallback>${char.icon}</span>';"
                     loading="eager">`;
    }
    return `<span class="emoji-fallback" style="font-size:${size*0.7}px">${char.icon}</span>`;
}

function getMonsterImage(enemy, size = 50) {
    const cacheBust = '?v=' + CONFIG.ASSETS_VERSION;

    // Use imagePath if available directly on enemy object
    if (enemy.imagePath) {
        return `<img src="${enemy.imagePath}${cacheBust}"
                     alt="${enemy.name}"
                     class="monster-sprite"
                     style="width:${size}px;height:${size}px;object-fit:contain;image-rendering:pixelated;"
                     onerror="this.onerror=null; this.parentElement.innerHTML='<span style=font-size:${size*0.8}px class=emoji-fallback>${enemy.icon}</span>';"
                     loading="eager">`;
    }

    // Fallback to monster name mapping
    const monsterImages = {
        '绿史莱姆': 'assets/monsters/slime.svg',
        '蓝史莱姆': 'assets/monsters/slime.svg',
        '红史莱姆': 'assets/monsters/slime.svg',
        '黄金史莱姆': 'assets/monsters/slime.svg',
        '史莱姆王': 'assets/monsters/slime.svg',
        '金属史莱姆': 'assets/monsters/slime.svg',
        '骷髅兵': 'assets/monsters/skeleton.svg',
        '幼龙': 'assets/monsters/dragon.svg',
        '火龙': 'assets/monsters/dragon.svg',
        '冰龙': 'assets/monsters/dragon.svg',
        '龙王': 'assets/monsters/dragon.svg',
        '野狼': 'assets/monsters/wolf.svg',
        '狼人': 'assets/monsters/wolf.svg',
        '远古树精': 'assets/monsters/forest_boss.svg',
        '洞穴巨魔': 'assets/monsters/cave_boss.svg',
        '法老王': 'assets/monsters/desert_boss.svg',
        '火焰领主': 'assets/monsters/volcano_boss.svg',
        '混沌魔王': 'assets/monsters/final_boss.svg'
    };

    const imagePath = monsterImages[enemy.name];
    if (imagePath) {
        return `<img src="${imagePath}${cacheBust}"
                     alt="${enemy.name}"
                     class="monster-sprite"
                     style="width:${size}px;height:${size}px;object-fit:contain;image-rendering:pixelated;"
                     onerror="this.onerror=null; this.parentElement.innerHTML='<span style=font-size:${size*0.8}px class=emoji-fallback>${enemy.icon}</span>';"
                     loading="eager">`;
    }
    return `<span class="emoji-fallback" style="font-size:${size*0.8}px">${enemy.icon}</span>`;
}

// ==================== 装备类型 ====================
const EQUIPMENT_TYPES = {
    weapon: { name: '武器', stat: 'str' },
    helmet: { name: '头盔', stat: 'def' },
    armor: { name: '护甲', stat: 'def' },
    shield: { name: '盾牌', stat: 'def' },
    accessory: { name: '饰品', stat: 'spd' }
};

// ==================== 稀有度 ====================
const RARITY_NAMES = {
    common: '普通',
    magic: '魔法',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
};

// ==================== 词缀池 ====================
const AFFIX_POOL = {
    common: ['破损的', '生锈的', '简陋的', '普通的'],
    magic: ['精良的', '锋利的', '坚固的', '迅捷的'],
    rare: ['卓越的', '狂暴的', '守护的', '神秘的'],
    epic: ['传说的', '毁灭的', '不朽的', '睿智的'],
    legendary: ['神话的', '创世的', '灭世的', '永恒的']
};

// ==================== 地图区域 ====================
const MAP_ZONES = {
    village: { id: 'village', name: '新手村', icon: '🏘️', type: 'safe', level: 0, desc: '冒险开始的地方' },
    plains: { id: 'plains', name: '风吹草原', icon: '🌾', type: 'combat', level: 1, desc: '史莱姆和蘑菇怪出没', unlocks: ['forest'] },
    forest: { id: 'forest', name: '迷雾森林', icon: '🌲', type: 'combat', level: 5, desc: '灰狼和树精出没', unlocks: ['cave', 'mine'] },
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

// ==================== 游戏状态 ====================
var isGameStarted = false;

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

// 战斗状态
let battleState = null;

// ==================== 核心函数 ====================

// 开始新游戏
function startNewGame() {
    // 检查是否有存档
    const existingSave = localStorage.getItem('dragonQuestSave');
    if (existingSave) {
        showConfirmModal('⚠️ 已有存档', '开始新游戏将覆盖当前存档，是否继续？', () => {
            startNewGameConfirmed();
        });
        return;
    }
    startNewGameConfirmed();
}

function showConfirmModal(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.id = 'confirmModalOverlay';
    overlay.className = 'confirm-modal-overlay';
    overlay.innerHTML = `
        <div class="confirm-modal-panel">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="confirm-modal-buttons">
                <button class="btn btn-primary" id="confirmYes">确认</button>
                <button class="btn btn-secondary" id="confirmNo">取消</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);

    overlay.querySelector('#confirmYes').onclick = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
        onConfirm();
    };
    overlay.querySelector('#confirmNo').onclick = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };
}

function startNewGameConfirmed() {
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
        enhancementMaterials: { common: 5, magic: 2, rare: 0, epic: 0, legendary: 0 }
    };

    // 创建初始角色 - 只有勇者
    createCharacter('勇者', 'warrior');

    // 给新玩家一些初始装备
    const starterWeapon = generateEquipment('weapon', 1, 'common');
    const starterArmor = generateEquipment('armor', 1, 'common');
    gameState.party[0].equipment.weapon = starterWeapon;
    gameState.party[0].equipment.armor = starterArmor;

    // 初始药水
    gameState.inventory.push(createConsumable('smallPotion'));
    gameState.inventory.push(createConsumable('smallPotion'));
    gameState.inventory.push(createConsumable('smallPotion'));

    saveGame();
    isGameStarted = true;
    showToast('🎮 新游戏开始！', 'success');
    // 先播放序章剧情，结束后再切到队伍页面
    showStory('prologue', () => {
        showScene('party');
    });
}

// 继续游戏
function continueGame() {
    if (loadGame()) {
        isGameStarted = true;
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
        baseMp: classData.baseInt * 5, // MP基于智力
        currentMp: classData.baseInt * 5,
        maxMp: classData.baseInt * 5,
        equipment: {
            weapon: null,
            helmet: null,
            armor: null,
            shield: null,
            accessory: null
        },
        learnedSkills: (SKILL_SYSTEM[classId] || []).filter(s => s.level <= 1).map(s => s.id),
        buffs: []
    };

    gameState.party.push(char);
    return char;
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

// 计算角色属性
function calculateStats(char) {
    const classData = CLASSES[char.classId];
    if (!classData) return { hp: 100, mp: 50, str: 10, def: 10, spd: 10, int: 10 };

    const level = char.level;
    let stats = {
        hp: Math.floor(classData.baseHp + (level - 1) * classData.growth.hp),
        mp: Math.floor(classData.baseInt * 5 + (level - 1) * classData.growth.int * 3),
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
                stats.mp += (equip.int || 0) * 2; // 智力加成MP
            }
        });
    }

    // 应用BUFF效果
    if (char.buffs) {
        char.buffs.forEach(buff => {
            if (buff.type === 'str') stats.str = Math.floor(stats.str * buff.value);
            if (buff.type === 'def') stats.def = Math.floor(stats.def * buff.value);
            if (buff.type === 'spd') stats.spd = Math.floor(stats.spd * buff.value);
            if (buff.type === 'int') stats.int = Math.floor(stats.int * buff.value);
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

    logContainer.innerHTML = battleState.logs.map(log =>
        `<div class="log-entry log-${log.type || 'normal'}">${log.message}</div>`
    ).join('');

    logContainer.scrollTop = logContainer.scrollHeight;
}

// 生成敌人
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
            showStory(bossStories[zoneId], () => startBossBattle(zoneId));
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
    if (!zone) { console.warn('startBattle: unknown zone', zoneId); return; }

    // Apply battle background
    applyBattleBackground(zoneId);

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

// 开始BOSS战
function startBossBattle(zoneId) {
    const boss = BOSSES[zoneId];
    if (!boss) return;

    // Apply battle background
    applyBattleBackground(zoneId);

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
        selectedTarget: 0,
        logs: [],
        isBossBattle: true
    };

    showScene('battle');
    renderBattle();
    addBattleLog(`👑 BOSS战开始！${boss.name}出现了！`, 'boss');
    addBattleLog(`${boss.desc}`, 'info');

    nextTurn();
}

// 应用战斗背景
function applyBattleBackground(zoneId) {
    const battleField = document.getElementById('battleField');
    const bg = ZONE_BACKGROUNDS[zoneId];

    if (battleField && bg) {
        battleField.style.background = bg.color;
    }
}

// 下一回合
function nextTurn() {
    if (!battleState) return;

    // 更新BUFF
    updateBuffs();

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

    battleState.enemies.forEach((enemy, idx) => {
        if (enemy.currentHp > 0) {
            // 随机选择目标
            const aliveChars = gameState.party.filter(c => c.currentHp > 0);
            if (aliveChars.length === 0) return;

            const target = aliveChars[Math.floor(Math.random() * aliveChars.length)];
            const stats = calculateStats(target);

            const damage = Math.max(1, enemy.str - stats.def / 2);
            target.currentHp = Math.max(0, target.currentHp - damage);

            // Visual feedback
            const targetEl = document.querySelector(`[data-char-id="${target.id}"]`);
            if (targetEl) {
                BattleAnimations.shakeElement(targetEl, 5, 200);
                BattleAnimations.flashElement(targetEl, '#ff0000', 150);
            }

            addBattleLog(`${enemy.icon} ${enemy.name} 攻击 ${target.name} 造成 ${Math.floor(damage)} 伤害！`, 'damage');

            if (SoundEnabled) AudioSystem.playDamage();
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
    const isCritical = Math.random() < 0.15; // 15% crit chance
    const critMultiplier = isCritical ? 1.5 : 1;
    const damage = Math.max(1, stats.str * (0.9 + Math.random() * 0.2) * critMultiplier - target.def / 2);
    const finalDamage = Math.floor(damage);

    target.currentHp = Math.max(0, target.currentHp - finalDamage);

    // Animation
    const attackerEl = document.querySelector(`[data-char-id="${char.id}"]`);
    const targetEl = document.querySelector(`[data-enemy-index="${battleState.selectedTarget % aliveEnemies.length}"]`);

    if (attackerEl) {
        attackerEl.style.transform = 'translateX(15px)';
        setTimeout(() => attackerEl.style.transform = '', 200);
    }

    setTimeout(() => {
        if (targetEl) {
            BattleAnimations.shakeElement(targetEl, 8, 300);
            BattleAnimations.flashElement(targetEl, isCritical ? '#ffaa00' : '#ff0000', 200);
        }
    }, 200);

    // Particle effects
    if (isCritical && ParticleSystem.canvas) {
        const rect = targetEl?.getBoundingClientRect();
        if (rect) {
            ParticleSystem.createBurst('critical', rect.left + rect.width/2, rect.top);
        }
        AudioSystem.playCritical();
    } else {
        AudioSystem.playAttack();
    }

    const critText = isCritical ? ' 💥暴击!' : '';
    addBattleLog(`${char.icon} ${char.name} 攻击 ${target.icon} ${target.name} 造成 ${finalDamage} 伤害！${critText}`, isCritical ? 'damage' : 'normal');

    if (target.currentHp <= 0) {
        addBattleLog(`${target.icon} ${target.name} 被击败了！`, 'normal');
    }

    endTurn();
}

// 执行技能
function performSkill(char, stats) {
    // 显示技能树供选择
    showSkillTree(char.id);
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
        setTimeout(() => {
            showScene('map');
            // Reset battle background
            const battleField = document.getElementById('battleField');
            if (battleField) battleField.style.background = '';
        }, 1000);
    } else {
        addBattleLog('❌ 逃跑失败！', 'normal');
        endTurn();
    }
}

// 显示物品菜单
function showItemMenu() {
    const consumables = gameState.inventory.filter(item => item.type === 'consumable');
    if (consumables.length === 0) {
        addBattleLog('❌ 没有可用的道具！', 'normal');
        return;
    }

    // 合并同类物品
    const grouped = {};
    consumables.forEach(item => {
        const key = item.itemId || item.name;
        if (!grouped[key]) grouped[key] = { ...item, count: 0 };
        grouped[key].count++;
    });

    const overlay = document.createElement('div');
    overlay.id = 'itemMenuOverlay';
    overlay.className = 'item-menu-overlay';
    overlay.innerHTML = `
        <div class="item-menu-panel">
            <h3>💊 选择物品</h3>
            <div class="item-list">
                ${Object.values(grouped).map(item => `
                    <div class="item-option" onclick="useItem('${item.itemId || item.name}')">
                        <span class="item-icon">${item.icon || '🧪'}</span>
                        <span class="item-name">${item.name} x${item.count}</span>
                        <span class="item-desc">${item.desc || ''}</span>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-secondary" onclick="closeItemMenu()">取消</button>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
}

function closeItemMenu() {
    const overlay = document.getElementById('itemMenuOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

function useItem(itemId) {
    closeItemMenu();
    const item = gameState.inventory.find(i => (i.itemId || i.name) === itemId && i.type === 'consumable');
    if (!item) return;

    const char = gameState.party[battleState.activeCharIndex];
    const stats = calculateStats(char);

    switch (item.subType) {
        case 'heal': {
            const prevHp = char.currentHp;
            char.currentHp = Math.min(stats.hp, char.currentHp + (item.value || 50));
            const healed = char.currentHp - prevHp;
            addBattleLog(`🧪 ${char.name} 使用 ${item.name}，恢复了 ${healed} HP！`, 'heal');
            break;
        }
        case 'fullHeal':
            char.currentHp = stats.hp;
            addBattleLog(`✨ ${char.name} 使用 ${item.name}，HP完全恢复！`, 'heal');
            break;
        case 'mp': {
            const prevMp = char.currentMp;
            char.currentMp = Math.min(stats.mp, char.currentMp + (item.value || 50));
            const restored = char.currentMp - prevMp;
            addBattleLog(`💧 ${char.name} 使用 ${item.name}，恢复了 ${restored} MP！`, 'heal');
            break;
        }
        default:
            char.currentHp = Math.min(stats.hp, char.currentHp + (item.value || 50));
            addBattleLog(`🧪 使用了 ${item.name}！`, 'heal');
    }

    // 移除使用的道具
    const index = gameState.inventory.indexOf(item);
    if (index > -1) gameState.inventory.splice(index, 1);

    const targetEl = document.querySelector(`[data-char-id="${char.id}"]`);
    if (targetEl) BattleAnimations.flashElement(targetEl, '#00ff00', 300);
    AudioSystem.playHeal();
    renderBattle();
    endTurn();
}

// 渲染战斗界面
function renderBattle() {
    const enemiesContainer = document.getElementById('battleEnemies');
    const partyContainer = document.getElementById('battleParty');
    if (!enemiesContainer || !partyContainer || !battleState) return;

    // 渲染敌人
    enemiesContainer.innerHTML = battleState.enemies.map((enemy, index) => `
        <div class="enemy-unit ${enemy.currentHp <= 0 ? 'dead' : ''} ${battleState.selectedTarget === index ? 'targeted' : ''}"
             data-enemy-index="${index}"
             onclick="selectTarget(${index})">
            <div class="enemy-icon">${getMonsterImage(enemy, 50)}</div>
            <div class="enemy-name">${enemy.name}</div>
            <div class="enemy-hp-bar">
                <div class="hp-fill" style="width: ${(enemy.currentHp / enemy.maxHp) * 100}%; background: #e74c3c;"></div>
            </div>
            <div class="enemy-hp-text">${enemy.currentHp}/${enemy.maxHp}</div>
        </div>
    `).join('');

    // 渲染队伍
    partyContainer.innerHTML = gameState.party.map((char, index) => {
        const stats = calculateStats(char);
        const isActive = index === battleState.activeCharIndex;
        return `
            <div class="party-member ${isActive ? 'active' : ''} ${char.currentHp <= 0 ? 'dead' : ''}"
                 data-char-id="${char.id}">
                <div class="member-icon">${getCharImage(char, 36)}</div>
                <div class="member-name">${char.name}</div>
                <div class="member-hp-bar">
                    <div class="hp-fill" style="width: ${(char.currentHp / stats.hp) * 100}%; background: #27ae60;"></div>
                </div>
                <div class="member-mp-bar" style="width: 60px; height: 4px; background: rgba(0,0,0,0.5); border-radius: 2px; overflow: hidden; margin: 4px auto 0;">
                    <div style="height: 100%; width: ${(char.currentMp / stats.mp) * 100}%; background: linear-gradient(90deg, #3498db 0%, #2980b9 100%); transition: width 0.3s ease;"></div>
                </div>
                <div style="font-size: 9px; color: #7f8c8d; margin-top: 2px;">${char.currentMp}/${stats.mp}</div>
            </div>
        `;
    }).join('');

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

        // 恢复满血满蓝
        const stats = calculateStats(char);
        char.currentHp = stats.hp;
        char.currentMp = stats.mp;

        // 学习新技能
        const classSkills = SKILL_SYSTEM[char.classId] || [];
        classSkills.forEach(skill => {
            if (skill.level <= char.level && !char.learnedSkills.includes(skill.id)) {
                char.learnedSkills.push(skill.id);
            }
        });

        if (SoundEnabled) AudioSystem.playLevelUp();
    }

    return levelsGained;
}

// 胜利处理
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

    // 分配经验并恢复MP
    const aliveChars = gameState.party.filter(c => c.currentHp > 0);
    const xpPerChar = Math.floor(totalXp / aliveChars.length);

    aliveChars.forEach(char => {
        const levels = gainXp(char, xpPerChar);
        if (levels > 0) {
            addBattleLog(`🎉 ${char.name} 升到了 ${char.level} 级！`, 'levelup');
        }
        // 恢复部分MP
        const stats = calculateStats(char);
        const mpRecovery = Math.floor(stats.mp * 0.2); // 恢复20%MP
        char.currentMp = Math.min(stats.mp, char.currentMp + mpRecovery);
    });

    addBattleLog(`🏆 战斗胜利！获得 ${totalXp} 经验和 ${totalGold} 金币！`, 'reward');

    // 播放胜利音效
    AudioSystem.playVictory();

    // 显示胜利画面
    showVictoryScreen(totalXp, totalGold);

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

    // 掉落药水
    if (Math.random() < 0.4) {
        const potionPool = ['smallPotion', 'smallPotion', 'smallPotion', 'mediumPotion', 'mediumPotion', 'ether'];
        if (battleState.isBossBattle) potionPool.push('largePotion', 'elixir');
        const potionId = potionPool[Math.floor(Math.random() * potionPool.length)];
        const potion = createConsumable(potionId);
        if (potion) {
            gameState.inventory.push(potion);
            addBattleLog(`🧪 掉落：${potion.name}！`, 'loot');
        }
    }

    // 掉落强化材料
    const materialDropCount = battleState.isBossBattle ? 5 : (Math.floor(Math.random() * 3) + 1);
    for (let i = 0; i < materialDropCount; i++) {
        const rarityRoll = Math.random();
        let materialType = 'common';
        if (rarityRoll > 0.98) materialType = 'legendary';
        else if (rarityRoll > 0.90) materialType = 'epic';
        else if (rarityRoll > 0.75) materialType = 'rare';
        else if (rarityRoll > 0.50) materialType = 'magic';

        addEnhancementMaterial(materialType, 1);
        const typeNames = { common: '普通', magic: '魔法', rare: '稀有', epic: '史诗', legendary: '传说' };
        addBattleLog(`💎 掉落：${typeNames[materialType]}强化石 x1`, 'loot');
    }

    // BOSS战特殊奖励
    if (battleState.isBossBattle) {
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
}

// 显示胜利画面
function showVictoryScreen(xp, gold) {
    const overlay = document.createElement('div');
    overlay.className = 'victory-overlay';
    overlay.innerHTML = `
        <div class="victory-content">
            <div class="victory-title">🏆 胜利！</div>
            <div class="victory-stats">
                <div class="victory-stat">✨ 经验值: ${xp}</div>
                <div class="victory-stat">💰 金币: ${gold}</div>
            </div>
            <button class="btn btn-primary" onclick="this.closest('.victory-overlay').remove(); returnFromBattle();">继续</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Animate in
    setTimeout(() => overlay.classList.add('active'), 10);
}

// 失败处理
function defeat() {
    addBattleLog('💀 队伍全灭...', 'damage');
    AudioSystem.playDefeat();

    // Show defeat screen
    const overlay = document.createElement('div');
    overlay.className = 'defeat-overlay';
    overlay.innerHTML = `
        <div class="defeat-content">
            <div class="defeat-title">💀 战斗失败</div>
            <div class="defeat-message">队伍已撤退到村庄恢复...</div>
            <button class="btn btn-secondary" onclick="this.closest('.defeat-overlay').remove(); continueAfterDefeat();">继续</button>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
}

function continueAfterDefeat() {
    // 恢复角色
    gameState.party.forEach(char => {
        const stats = calculateStats(char);
        char.currentHp = Math.floor(stats.hp * 0.5);
    });

    gameState.currentMap = 'village';
    gameState.gold = Math.floor(gameState.gold * 0.9);

    returnFromBattle();
    updateUI();
}

// 战斗结束后返回：如果从冒险系统来的回到冒险，否则回地图
function returnFromBattle() {
    if (window.WorldSystem && window.WorldSystem.fromWorldExploration) {
        window.WorldSystem.fromWorldExploration = false;
        showScene('world');
    } else {
        showScene('map');
    }
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

// ==================== 渲染菜单 ====================
function renderMenu() {
    const menuEl = document.querySelector('#sceneMenu .main-menu');
    if (!menuEl) return;

    if (!isGameStarted) {
        const hasSave = !!localStorage.getItem('dragonQuestSave');
        menuEl.innerHTML = `
            <div class="game-title">
                <h2>DRAGON QUEST</h2>
                <p>勇者斗恶龙 RPG</p>
            </div>
            <div class="menu-buttons">
                <button class="btn btn-primary" onclick="startNewGame()">▶ 开始新游戏</button>
                ${hasSave ? '<button class="btn btn-secondary" onclick="continueGame()">📂 继续游戏</button>' : ''}
            </div>`;
    } else {
        menuEl.innerHTML = `
            <div class="game-title">
                <h2>DRAGON QUEST</h2>
                <p>勇者斗恶龙 RPG</p>
            </div>
            <div class="menu-buttons">
                <button class="btn btn-primary" onclick="saveGame(); showToast('💾 已保存', 'success');">💾 保存游戏</button>
                <button class="btn btn-secondary" onclick="if(loadGame()){showToast('📂 已加载','success');showScene('party');}else{showToast('❌ 没有存档','error');}">📂 选择存档</button>
                <button class="btn btn-secondary" onclick="isGameStarted=false;showScene('menu');">🏠 回到主菜单</button>
            </div>`;
    }
}

// ==================== 渲染场景 ====================
function showScene(sceneId) {
    document.querySelectorAll('.scene').forEach(scene => scene.classList.remove('active'));
    const sceneEl = document.getElementById('scene' + sceneId.charAt(0).toUpperCase() + sceneId.slice(1));
    if (sceneEl) sceneEl.classList.add('active');

    // 显示/隐藏导航栏 - 战斗场景隐藏，其他显示
    const navBar = document.getElementById('navBar');
    if (navBar) {
        if (sceneId === 'battle') {
            navBar.style.display = 'none';
        } else {
            navBar.style.display = 'flex';
        }
    }

    // 更新导航
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navMap = { menu: 0, party: 1, world: 2, map: 2, bestiary: 3, cosmetics: 4 };
    const navIndex = navMap[sceneId];
    if (navIndex !== undefined) {
        document.querySelectorAll('.nav-btn')[navIndex]?.classList.add('active');
    }

    // 渲染对应内容
    if (sceneId === 'menu') renderMenu();
    if (sceneId === 'party') renderParty();
    if (sceneId === 'map') renderMap();
    if (sceneId === 'bestiary') renderBestiary();
    if (sceneId === 'cosmetics') renderCosmetics();
    if (sceneId === 'world' && window.WorldSystem) {
        // 冒险场景需要隐藏导航栏，初始化Canvas
        if (navBar) navBar.style.display = 'none';
        window.WorldSystem.init();
    }
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
    const unlockInfo = document.getElementById('partyUnlockInfo');
    if (!container) return;

    // 更新解锁信息面板
    if (unlockInfo) {
        unlockInfo.style.display = 'block';

        const unlocks = {
            'unlock-mage': 'forest',
            'unlock-archer': 'cave',
            'unlock-priest': 'desert',
            'unlock-rogue': 'volcano'
        };

        Object.entries(unlocks).forEach(([id, bossId]) => {
            const el = document.getElementById(id);
            if (el) {
                if (gameState.defeatedBosses.includes(bossId)) {
                    el.classList.add('unlocked');
                    el.classList.remove('locked');
                } else {
                    el.classList.add('locked');
                    el.classList.remove('unlocked');
                }
            }
        });
    }

    // 解锁条件配置 (对应角色解锁)
    const unlockConditions = [
        null,
        { boss: 'forest', name: '法师 - 击败森林BOSS解锁', icon: '🔮' },
        { boss: 'cave', name: '弓箭手 - 击败洞穴BOSS解锁', icon: '🏹' },
        { boss: 'desert', name: '牧师 - 击败沙漠BOSS解锁', icon: '✝️' }
    ];

    let html = '';

    // 显示已解锁的角色
    gameState.party.forEach((char) => {
        const stats = calculateStats(char);
        html += `
            <div class="character-card">
                <div class="character-header">
                    <div class="character-avatar">${getCharImage(char, 60)}</div>
                    <div class="character-info">
                        <h3>${char.name}</h3>
                        <div class="character-class">${char.className} Lv.${char.level}</div>
                    </div>
                    <button class="btn btn-secondary skill-tree-btn" onclick="showSkillTree(${char.id})" style="padding:8px 12px;font-size:12px;">
                        📚 技能
                    </button>
                </div>
                <div class="bar-container">
                    <div class="bar-label"><span>HP</span><span>${char.currentHp}/${stats.hp}</span></div>
                    <div class="bar"><div class="bar-fill hp-bar" style="width:${(char.currentHp/stats.hp)*100}%"></div></div>
                </div>
                <div class="bar-container">
                    <div class="bar-label"><span>MP</span><span>${char.currentMp}/${stats.mp}</span></div>
                    <div class="bar"><div class="bar-fill mp-bar" style="width:${(char.currentMp/stats.mp)*100}%"></div></div>
                </div>
                <div class="character-stats">
                    <div class="stat"><span>力量</span><span>${stats.str}</span></div>
                    <div class="stat"><span>防御</span><span>${stats.def}</span></div>
                    <div class="stat"><span>速度</span><span>${stats.spd}</span></div>
                    <div class="stat"><span>智力</span><span>${stats.int}</span></div>
                </div>

                <!-- 装备栏 -->
                <div class="equipment-section">
                    <h4>🛡️ 装备</h4>
                    <div class="equipment-grid">
                        ${Object.entries(char.equipment).map(([slot, equip]) => {
                            const slotNames = { weapon: '武器', helmet: '头盔', armor: '护甲', shield: '盾牌', accessory: '饰品' };
                            if (!equip) {
                                return `<div class="equipment-slot empty" onclick="showEnhanceInterface(${char.id}, '${slot}')">
                                    <div class="slot-icon">⭕</div>
                                    <div class="slot-name">${slotNames[slot]}</div>
                                </div>`;
                            }
                            const enhanceText = equip.enhanceLevel > 0 ? `+${equip.enhanceLevel}` : '';
                            return `<div class="equipment-slot rarity-${equip.rarity}" onclick="showEnhanceInterface(${char.id}, '${slot}')">
                                <div class="slot-icon">${equip.icon}</div>
                                <div class="slot-name">${equip.name} ${enhanceText}</div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <!-- 强化材料显示 -->
                <div class="materials-display">
                    <h4>💎 强化材料</h4>
                    <div class="materials-grid">
                        ${Object.entries(gameState.enhancementMaterials || {}).map(([type, count]) => {
                            const typeNames = { common: '普通', magic: '魔法', rare: '稀有', epic: '史诗', legendary: '传说' };
                            const colors = { common: '#95a5a6', magic: '#2ecc71', rare: '#3498db', epic: '#9b59b6', legendary: '#f39c12' };
                            return `<div class="material-badge" style="color:${colors[type]}">
                                <span>◆</span> ${typeNames[type]}: ${count}
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    });

    // 显示锁定的空槽位
    for (let i = gameState.party.length; i < CONFIG.MAX_PARTY_SIZE; i++) {
        const condition = unlockConditions[i];
        const isUnlocked = condition && gameState.defeatedBosses.includes(condition.boss);

        if (isUnlocked) {
            html += `
                <div class="character-card" style="opacity:0.6;">
                    <div class="character-header">
                        <div class="character-avatar" style="background:#27ae60;">✓</div>
                        <div class="character-info">
                            <h3>待加入</h3>
                            <div class="character-class">条件已满足</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="character-card" style="opacity:0.5; border: 2px dashed rgba(255,255,255,0.2);">
                    <div class="character-header">
                        <div class="character-avatar" style="background:linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%);">${condition ? condition.icon : '🔒'}</div>
                        <div class="character-info">
                            <h3 style="color:#7f8c8d;">未解锁</h3>
                            <div class="character-class" style="color:#95a5a6;">${condition ? condition.name : '后续版本开放'}</div>
                        </div>
                    </div>
                    <div style="text-align:center; padding:20px; color:#7f8c8d; font-size:13px;">
                        <span>🎮 击败BOSS解锁新队友</span>
                    </div>
                </div>
            `;
        }
    }

    container.innerHTML = html;
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
                                <div class="entry-icon">${unlocked ? getMonsterImage(enemy, 32) : '?'}</div>
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

// 显示敌人详情
function showEnemyDetail(enemyId) {
    const enemy = BESTIARY[enemyId];
    const data = gameState.bestiary[enemyId];

    if (!enemy || !data?.seen) {
        showToast('尚未解锁该怪物信息', 'warning');
        return;
    }

    // 移除已存在的模态框
    const existing = document.getElementById('enemyDetailModal');
    if (existing) existing.remove();

    const modalHTML = `
        <div id="enemyDetailModal" class="enemy-detail-overlay">
            <div class="enemy-detail-modal">
                <div class="enemy-detail-header">
                    <div class="enemy-detail-icon">${getMonsterImage(enemy, 48)}</div>
                    <div class="enemy-detail-title">
                        <h3>${enemy.name}</h3>
                        <div class="enemy-level">Lv.${enemy.level}</div>
                    </div>
                </div>
                <div class="enemy-detail-stats">
                    <div class="enemy-stat-item">
                        <div><div class="stat-label">❤️ 生命</div><div class="stat-value">${enemy.hp}</div></div>
                    </div>
                    <div class="enemy-stat-item">
                        <div><div class="stat-label">⚔️ 攻击</div><div class="stat-value">${enemy.str}</div></div>
                    </div>
                    <div class="enemy-stat-item">
                        <div><div class="stat-label">🛡️ 防御</div><div class="stat-value">${enemy.def}</div></div>
                    </div>
                    <div class="enemy-stat-item">
                        <div><div class="stat-label">💨 速度</div><div class="stat-value">${enemy.spd || '?'}</div></div>
                    </div>
                </div>
                <div class="enemy-detail-desc">${enemy.desc}</div>
                <div class="enemy-detail-kills">🏆 已击败：${data.killed} 次</div>
                <button class="enemy-detail-close" onclick="document.getElementById('enemyDetailModal').remove()">关 闭</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 点击遮罩层关闭
    document.getElementById('enemyDetailModal').addEventListener('click', function(e) {
        if (e.target === this) this.remove();
    });
}

// ==================== 时装装备 ====================
function equipCosmetic(slot, cosmeticId) {
    if (gameState.cosmetics[slot]?.includes(cosmeticId)) {
        gameState.equippedCosmetics[slot] = cosmeticId;
        return true;
    }
    return false;
}

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

// ==================== 初始化 ====================
async function init() {
    console.log('[DragonQuest] Initializing v' + CONFIG.VERSION);

    try {
        // Load sound setting
        loadSoundSetting();

        // Initialize particle system
        if (ParticleSystem && ParticleSystem.init) ParticleSystem.init();

        // Show loading screen
        AssetLoader.showLoadingScreen();

        // Preload assets with timeout (don't block forever on slow networks)
        const preloadTimeout = new Promise(resolve => setTimeout(resolve, 8000));
        await Promise.race([AssetLoader.preloadAssets(), preloadTimeout]);

        // Hide loading screen
        AssetLoader.hideLoadingScreen();
    } catch (e) {
        console.error('[DragonQuest] Init error (non-fatal):', e);
        // Still hide loading screen on error
        AssetLoader.hideLoadingScreen();
    }

    // Load game
    loadGame();
    updateUI();

    // Always ensure menu scene is visible on startup
    showScene('menu');

    // Setup auto-save
    setInterval(autoSave, CONFIG.AUTO_SAVE_INTERVAL);
    setInterval(() => gameState.playTime++, 1000);

    console.log('[DragonQuest] Initialization complete');
}

// ==================== 更新UI ====================
function updateUI() {
    const goldEl = document.getElementById('headerGold');
    if (goldEl) goldEl.textContent = gameState.gold;

    // Update continue button
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        const hasSave = localStorage.getItem('dragonQuestSave') !== null;
        continueBtn.style.display = hasSave ? 'block' : 'none';
    }
}

// ==================== 提示 ====================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ==================== 剧情对话系统 ====================
const STORY = {
    prologue: {
        title: '序章：命运的开始',
        scenes: [
            { speaker: 'Narrator', text: '在一个平静的村庄，你是一名普通的村民...', bg: '🏘️' },
            { speaker: '村长', text: '不好了！村外出现了怪物！年轻的勇者啊，请帮帮我们！', bg: '👴' },
            { speaker: '勇者', text: '交给我吧！我会保护这个村子的！', bg: '⚔️' },
            { speaker: 'Narrator', text: '就这样，你的冒险开始了...', bg: '✨' }
        ]
    },
    forestBoss: {
        title: '第一章：森林守护者',
        scenes: [
            { speaker: 'Narrator', text: '深入森林，你感受到了强大的气息...', bg: '🌲' },
            { speaker: '远古树精', text: '人类...为何要打扰森林的宁静...', bg: '🌳' },
            { speaker: '勇者', text: '我是来打倒你，保护村庄的！', bg: '⚔️' },
            { speaker: '远古树精', text: '那就让森林来审判你吧！', bg: '🌿' }
        ]
    },
    caveBoss: {
        title: '第二章：洞穴深处',
        scenes: [
            { speaker: 'Narrator', text: '洞穴深处传来沉重的脚步声...', bg: '🕳️' },
            { speaker: '洞穴巨魔', text: '又有新鲜的食物送上门了...', bg: '👹' },
            { speaker: '勇者', text: '我不会让你伤害任何人的！', bg: '⚔️' },
            { speaker: '洞穴巨魔', text: '那就成为我的晚餐吧！', bg: '👿' }
        ]
    },
    desertBoss: {
        title: '第三章：沙漠王者',
        scenes: [
            { speaker: 'Narrator', text: '金字塔中传来古老的呢喃...', bg: '🏜️' },
            { speaker: '法老王', text: '沉睡千年...终于有人唤醒我了...', bg: '👳' },
            { speaker: '勇者', text: '你的诅咒到此为止了！', bg: '⚔️' },
            { speaker: '法老王', text: '放肆！感受沙漠的愤怒！', bg: '🌪️' }
        ]
    },
    volcanoBoss: {
        title: '第四章：烈焰试炼',
        scenes: [
            { speaker: 'Narrator', text: '火山在咆哮，岩浆在沸腾...', bg: '🌋' },
            { speaker: '火焰领主', text: '有趣...居然有人类能来到这里...', bg: '🔥' },
            { speaker: '勇者', text: '你的火焰会熄灭在我的剑下！', bg: '⚔️' },
            { speaker: '火焰领主', text: '狂妄！让你见识真正的地狱之火！', bg: '🔥' }
        ]
    },
    finalBoss: {
        title: '终章：混沌之战',
        scenes: [
            { speaker: 'Narrator', text: '魔王城的最深处，黑暗笼罩着一切...', bg: '🏯' },
            { speaker: '混沌魔王', text: '终于...又一个勇者来送死了...', bg: '👹' },
            { speaker: '勇者', text: '我是来结束你的暴政的！', bg: '⚔️' },
            { speaker: '混沌魔王', text: '哈哈哈！那就试试看吧！', bg: '😈' },
            { speaker: '混沌魔王', text: '感受混沌的力量吧！', bg: '💀' }
        ]
    }
};

let currentDialog = null;
let dialogIndex = 0;

let dialogCallback = null;

function showStory(storyId, onComplete) {
    const story = STORY[storyId];
    if (!story) {
        if (onComplete) onComplete();
        return;
    }

    currentDialog = story;
    dialogIndex = 0;
    dialogCallback = onComplete || null;

    createDialogBox();
    showDialogScene();
}

function createDialogBox() {
    const dialogHTML = `
        <div id="storyDialog" class="story-dialog-overlay">
            <div class="story-dialog-bg" id="dialogBg">✨</div>
            <div class="story-dialog-box">
                <div class="story-dialog-speaker" id="dialogSpeaker">Narrator</div>
                <div class="story-dialog-text" id="dialogText">...</div>
                <div class="story-dialog-hint">点击继续 ▼</div>
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
    // 执行回调（比如剧情结束后切换场景）
    if (dialogCallback) {
        const cb = dialogCallback;
        dialogCallback = null;
        cb();
    }
}

// ==================== 导出 ====================
window.startNewGame = startNewGame;
window.continueGame = continueGame;
window.showScene = showScene;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.battleAction = battleAction;
window.selectTarget = selectTarget;
window.enterZone = enterZone;
window.equipCosmetic = equipCosmetic;
window.showEnemyDetail = showEnemyDetail;
window.renderBestiary = renderBestiary;
window.renderCosmetics = renderCosmetics;
window.unlockCharacter = unlockCharacter;
window.showStory = showStory;
window.AudioSystem = AudioSystem;
window.getCharImage = getCharImage;
window.getMonsterImage = getMonsterImage;
window.toggleSound = toggleSound;
window.ParticleSystem = ParticleSystem;
window.BattleAnimations = BattleAnimations;
window.continueAfterDefeat = continueAfterDefeat;
window.showEnhanceInterface = showEnhanceInterface;
window.performEnhance = performEnhance;
window.closeEnhanceInterface = closeEnhanceInterface;
window.addEnhancementMaterial = addEnhancementMaterial;
window.ENHANCE_CONFIG = ENHANCE_CONFIG;
window.showSkillTree = showSkillTree;
window.closeSkillTree = closeSkillTree;
window.selectSkillForBattle = selectSkillForBattle;
window.getSkillById = getSkillById;
window.executeSkill = executeSkill;
window.SKILL_SYSTEM = SKILL_SYSTEM;
window.CONSUMABLE_ITEMS = CONSUMABLE_ITEMS;
window.createConsumable = createConsumable;
window.showItemMenu = showItemMenu;
window.closeItemMenu = closeItemMenu;
window.useItem = useItem;
window.showConfirmModal = showConfirmModal;
window.returnFromBattle = returnFromBattle;
window.startBattle = startBattle;

// 启动
window.onload = init;
