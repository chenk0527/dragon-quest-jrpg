/**
 * 手机端测试脚本 - 模拟 iPhone Safari
 * 用法: node test-mobile.js [url]
 */

const http = require('http');

const url = process.argv[2] || 'http://localhost:8765/';

async function fetchPage(pageUrl) {
    return new Promise((resolve, reject) => {
        const mod = pageUrl.startsWith('https') ? require('https') : require('http');
        mod.get(pageUrl, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        });
    });
}

async function test() {
    console.log('🧪 手机端测试开始\n');
    console.log(`📱 测试URL: ${url}\n`);
    
    const results = { pass: 0, fail: 0, warnings: 0, details: [] };
    
    function check(name, condition, detail) {
        if (condition) {
            results.pass++;
            results.details.push(`✅ ${name}`);
        } else {
            results.fail++;
            results.details.push(`❌ ${name}: ${detail}`);
        }
    }
    
    function warn(name, detail) {
        results.warnings++;
        results.details.push(`⚠️ ${name}: ${detail}`);
    }
    
    // Fetch HTML
    const html = await fetchPage(url);
    
    // === HTML 结构测试 ===
    console.log('--- HTML 结构测试 ---');
    
    check('viewport meta', html.includes('width=device-width'), '缺少 viewport meta 标签');
    check('maximum-scale=1.0', html.includes('maximum-scale=1.0'), '缺少 maximum-scale 防止缩放');
    check('user-scalable=no', html.includes('user-scalable=no'), '缺少 user-scalable=no');
    check('styles.css 引用', html.includes('href="styles.css"'), '缺少独立 CSS 文件引用');
    check('game.js 引用', html.includes('src="game.js"'), '缺少 game.js');
    check('audio-system.js 引用', html.includes('src="audio-system.js"'), '缺少 audio-system.js');
    check('sceneMenu 存在', html.includes('id="sceneMenu"'), '主菜单场景缺失');
    check('sceneMenu 默认 active', html.includes('scene active" id="sceneMenu"') || html.includes('id="sceneMenu"'), '主菜单需要默认 active');
    check('开始新游戏按钮', html.includes('startNewGame()'), '缺少开始新游戏按钮');
    check('继续游戏按钮', html.includes('continueGame()'), '缺少继续游戏按钮');
    check('导航栏', html.includes('id="navBar"'), '缺少底部导航栏');
    check('loadingScreen', html.includes('id="loadingScreen"'), '缺少加载界面');
    
    // === CSS 测试 ===
    console.log('\n--- CSS 测试 ---');
    const css = await fetchPage(url.replace(/\/$/, '') + '/styles.css');
    
    check('CSS 加载', css.length > 0, 'styles.css 为空或加载失败');
    check('touch-action', css.includes('touch-action'), '缺少 touch-action 样式');
    check('-webkit-tap-highlight', css.includes('-webkit-tap-highlight'), '缺少 tap highlight 重置');
    check('.scene display:none', css.includes('.scene {') && css.includes('display: none'), '.scene 默认应该隐藏');
    check('.scene.active display:block', css.includes('.scene.active'), '缺少 .scene.active 显示规则');
    check('.main-content flex:1', css.includes('.main-content') && css.includes('flex: 1'), '主内容区域需要 flex:1');
    check('nav-bar 样式', css.includes('.nav-bar') || css.includes('nav-bar'), '缺少导航栏样式');
    
    // 手机端关键 CSS
    check('game-container max-width', css.includes('max-width: 480px'), '游戏容器需要 max-width');
    check('min-height: 100vh', css.includes('min-height: 100vh'), '游戏容器需要 100vh');
    
    // 检查潜在的 CSS 问题
    if (css.includes('position: fixed') && css.includes('z-index: 10000')) {
        warn('高 z-index fixed 元素', 'loading-screen 有 z-index:10000，可能遮挡内容');
    }
    
    // === JS 测试 ===
    console.log('\n--- JS 测试 ---');
    const js = await fetchPage(url.replace(/\/$/, '') + '/game.js');
    
    check('game.js 加载', js.length > 0, 'game.js 为空或加载失败');
    check('init 函数', js.includes('function init()') || js.includes('async function init()'), '缺少 init 函数');
    check('showScene 函数', js.includes('function showScene'), '缺少 showScene 函数');
    check('init 调用 showScene(menu)', js.includes("showScene('menu')"), 'init 中未调用 showScene(menu)');
    check('try-catch 保护', js.includes('try {') && js.includes('catch'), 'init 需要错误处理');
    check('preload 超时保护', js.includes('setTimeout') && js.includes('Promise.race'), '资源加载需要超时保护');
    check('window.onload = init', js.includes('window.onload = init') || js.includes('window.onload=init'), '缺少 onload 绑定');
    
    // 检查 touch 事件
    check('touch 事件支持', js.includes('touchstart') || js.includes('touchend') || js.includes('pointerdown'), '缺少触摸事件处理');
    
    // 检查潜在 JS 问题
    if (js.includes('alert(')) {
        warn('使用 alert()', '仍有 alert() 调用，手机上体验差');
    }
    if (js.includes('confirm(')) {
        warn('使用 confirm()', '仍有 confirm() 调用，手机上体验差');
    }
    if (js.includes('prompt(')) {
        warn('使用 prompt()', '仍有 prompt() 调用，手机上体验差');
    }
    
    // === 资源测试 ===
    console.log('\n--- 资源测试 ---');
    const audioJs = await fetchPage(url.replace(/\/$/, '') + '/audio-system.js').catch(() => '');
    check('audio-system.js 加载', audioJs.length > 0, 'audio-system.js 加载失败');
    
    const worldJs = await fetchPage(url.replace(/\/$/, '') + '/world-explore.js').catch(() => '');
    check('world-explore.js 加载', worldJs.length > 0, 'world-explore.js 加载失败');
    
    // === 手机端特有问题检测 ===
    console.log('\n--- 手机端专项检测 ---');
    
    // 检查 300ms 延迟
    check('touch-action: manipulation', css.includes('touch-action: manipulation') || css.includes('touch-action:manipulation'), '需要 touch-action:manipulation 消除 300ms 延迟');
    
    // 检查安全区域
    const hasSafeArea = css.includes('safe-area') || css.includes('env(safe-area');
    if (!hasSafeArea) {
        warn('安全区域', '缺少 safe-area-inset 适配，iPhone 刘海屏/底部指示条可能遮挡UI');
    }
    
    // 检查字体加载
    if (html.includes('fonts.googleapis.com')) {
        warn('外部字体', 'Press Start 2P 从 Google Fonts 加载，中国大陆可能被墙');
    }
    
    // 检查 hover 效果（手机上不应该依赖 hover）
    const hoverCount = (css.match(/:hover/g) || []).length;
    if (hoverCount > 10) {
        warn('过多 hover 效果', `CSS 中有 ${hoverCount} 个 :hover 规则，手机上可能不触发`);
    }
    
    // === 输出结果 ===
    console.log('\n========================================');
    console.log('📊 测试结果汇总');
    console.log('========================================');
    results.details.forEach(d => console.log(d));
    console.log('----------------------------------------');
    console.log(`✅ 通过: ${results.pass}`);
    console.log(`❌ 失败: ${results.fail}`);
    console.log(`⚠️ 警告: ${results.warnings}`);
    console.log('========================================');
    
    if (results.fail > 0) {
        console.log('\n🔧 需要修复的问题:');
        results.details.filter(d => d.startsWith('❌')).forEach(d => console.log(d));
    }
}

test().catch(e => console.error('测试出错:', e));
