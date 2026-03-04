# audio-system 模块

## 文件: audio-system.js (~852行)

## 概述
Web Audio API 实现的 8-bit 风格音效系统。

## 导出接口
```javascript
window.AudioSystem = {
    playBGM(type),      // 播放背景音乐
    stopBGM(),          // 停止背景
    playAttack(),       // 攻击音效
    playHit(),          // 受击音效
    playHeal(),         // 治疗音效
    playVictory(),      // 胜利音效
    playDefeat(),       // 失败音效
    playLevelUp(),      // 升级音效
    toggle()            // 开关音效
}
```
