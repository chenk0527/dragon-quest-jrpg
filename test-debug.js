// Dragon Quest JRPG - 调试测试脚本
// 在浏览器控制台运行这些测试来检查游戏状态

const GameTests = {
    // 测试世界探索系统
    testWorldSystem() {
        console.log('=== 测试世界探索系统 ===');
        console.log('WorldSystem exists:', typeof window.WorldSystem !== 'undefined');
        if (window.WorldSystem) {
            console.log('WorldSystem.init exists:', typeof window.WorldSystem.init === 'function');
            console.log('WorldSystem.fromWorldExploration:', window.WorldSystem.fromWorldExploration);
        }
        console.log('');
    },

    // 测试战斗系统
    testBattleSystem() {
        console.log('=== 测试战斗系统 ===');
        console.log('startBattle exists:', typeof window.startBattle === 'function');
        console.log('startBossBattle exists:', typeof window.startBossBattle === 'function');
        console.log('battleAction exists:', typeof window.battleAction === 'function');
        console.log('');
    },

    // 测试场景系统
    testSceneSystem() {
        console.log('=== 测试场景系统 ===');
        console.log('showScene exists:', typeof window.showScene === 'function');
        console.log('');
    },

    // 测试游戏状态
    testGameState() {
        console.log('=== 测试游戏状态 ===');
        console.log('gameState exists:', typeof window.gameState !== 'undefined');
        if (window.gameState) {
            console.log('Party size:', window.gameState.party?.length || 0);
            console.log('Gold:', window.gameState.gold);
            console.log('Current map:', window.gameState.currentMap);
        }
        console.log('');
    },

    // 测试音频系统
    testAudioSystem() {
        console.log('=== 测试音频系统 ===');
        console.log('SoundEffects exists:', typeof window.SoundEffects !== 'undefined');
        console.log('BGM exists:', typeof window.BGM !== 'undefined');
        console.log('StoryDialog exists:', typeof window.StoryDialog !== 'undefined');
        console.log('');
    },

    // 运行所有测试
    runAll() {
        console.clear();
        console.log('🔧 Dragon Quest JRPG 调试测试开始...\n');
        this.testWorldSystem();
        this.testBattleSystem();
        this.testSceneSystem();
        this.testGameState();
        this.testAudioSystem();
        console.log('✅ 测试完成！');
    }
};

// 自动运行测试
window.addEventListener('load', () => {
    setTimeout(() => GameTests.runAll(), 1000);
});

// 暴露到全局
window.GameTests = GameTests;
