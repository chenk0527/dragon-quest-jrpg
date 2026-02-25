/**
 * Dragon Quest JRPG - Enhanced Edition
 * 音效、音乐与剧情对话系统
 */

// ==================== 全局音频上下文 ====================
let audioCtx = null;
let masterGain = null;
let bgmOscillators = [];
let isMuted = false;
let volume = 0.5;

// 初始化音频系统
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = volume;
        masterGain.connect(audioCtx.destination);
    }
}

// ==================== 8-bit音效系统 ====================
const SoundEffects = {
    // 播放攻击音效 - 短促的方波滑音
    playAttack() {
        if (isMuted || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.1);
    },

    // 播放受伤音效 - 锯齿波下滑
    playDamage() {
        if (isMuted || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.2);
    },

    // 播放胜利音效 - 经典的上升和弦
    playVictory() {
        if (isMuted || !audioCtx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C, E, G, C, E
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + i * 0.15 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.4);
            
            osc.start(audioCtx.currentTime + i * 0.15);
            osc.stop(audioCtx.currentTime + i * 0.15 + 0.4);
        });
    },

    // 播放升级音效 - 欢快的上升音阶
    playLevelUp() {
        if (isMuted || !audioCtx) return;
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.50];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + i * 0.08 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.08 + 0.15);
            
            osc.start(audioCtx.currentTime + i * 0.08);
            osc.stop(audioCtx.currentTime + i * 0.08 + 0.15);
        });
    },

    // 播放治疗音效 - 柔和的上升
    playHeal() {
        if (isMuted || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
    },

    // 播放菜单选择音效 - 短促的"哔"声
    playMenuMove() {
        if (isMuted || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.type = 'square';
        osc.frequency.value = 800;
        
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.05);
    },

    // 播放确认音效
    playConfirm() {
        if (isMuted || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.type = 'square';
        osc.frequency.value = 1200;
        
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.08);
    },

    // 播放取消音效
    playCancel() {
        if (isMuted || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.1);
    },

    // 播放错误音效
    playError() {
        if (isMuted || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.15);
    },

    // 播放暴击音效
    playCritical() {
        if (isMuted || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.15);
    },

    // 播放游戏结束音效
    playGameOver() {
        if (isMuted || !audioCtx) return;
        const notes = [523.25, 440, 349.23, 261.63];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.3);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.3 + 0.4);
            
            osc.start(audioCtx.currentTime + i * 0.3);
            osc.stop(audioCtx.currentTime + i * 0.3 + 0.4);
        });
    }
};

// ==================== 背景音乐系统 ====================
const BGM = {
    currentTrack: null,
    currentOscillators: [],
    isPlaying: false,
    fadeGain: null,
    
    // 音符频率表
    notes: {
        'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
        'C6': 1046.50, 'rest': 0
    },

    // BGM旋律定义
    tracks: {
        // 标题画面 - 宏伟的开场
        title: {
            tempo: 120,
            melody: [
                ['C4', 'E4', 'G4', 'C5'], ['G3', 'B3', 'D4', 'G4'], 
                ['A3', 'C4', 'E4', 'A4'], ['F3', 'A3', 'C4', 'F4'],
                ['C4', 'E4', 'G4', 'C5'], ['G3', 'B3', 'D4', 'G4'],
                ['C4', 'E4', 'G4', 'C5'], ['C4', 'E4', 'G4', 'C5']
            ]
        },
        
        // 村庄BGM - 平和的旋律
        village: {
            tempo: 90,
            melody: [
                ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4'],
                ['F3', 'A3', 'C4'], ['F3', 'A3', 'C4'],
                ['G3', 'B3', 'D4'], ['G3', 'B3', 'D4'],
                ['C3', 'E3', 'G3', 'C4'], ['rest']
            ]
        },
        
        // 战斗BGM - 紧张的快节奏
        battle: {
            tempo: 150,
            melody: [
                ['E4', 'G4', 'B4'], ['D4', 'F4', 'A4'],
                ['C4', 'E4', 'G4'], ['B3', 'D4', 'F4'],
                ['A3', 'C4', 'E4'], ['G3', 'B3', 'D4'],
                ['F3', 'A3', 'C4'], ['E3', 'G3', 'B3']
            ]
        },
        
        // BOSS战BGM - 激烈的战斗
        boss: {
            tempo: 140,
            melody: [
                ['C3', 'G3', 'C4'], ['G2', 'D3', 'G3'],
                ['A2', 'E3', 'A3'], ['F2', 'C3', 'F3'],
                ['C3', 'G3', 'C4'], ['C3', 'G3', 'C4'],
                ['B2', 'F3', 'B3'], ['C3', 'G3', 'C4']
            ]
        },
        
        // 胜利BGM - 欢快庆祝
        victory: {
            tempo: 160,
            melody: [
                ['C5'], ['E5'], ['G5'], ['C6'],
                ['G5'], ['E5'], ['C5'], ['rest'],
                ['C5', 'E5', 'G5', 'C6'], ['C5', 'E5', 'G5', 'C6']
            ]
        },
        
        // 游戏结束BGM - 悲伤
        gameover: {
            tempo: 70,
            melody: [
                ['C4'], ['B3'], ['A3'], ['G3'],
                ['F3'], ['E3'], ['D3'], ['C3']
            ]
        }
    },

    // 播放指定BGM
    play(trackName, loop = true) {
        if (isMuted || !audioCtx) return;
        if (this.currentTrack === trackName) return;
        
        this.stop();
        
        const track = this.tracks[trackName];
        if (!track) return;
        
        this.currentTrack = trackName;
        this.isPlaying = true;
        
        // 创建淡入增益节点
        this.fadeGain = audioCtx.createGain();
        this.fadeGain.connect(masterGain);
        this.fadeGain.gain.setValueAtTime(0, audioCtx.currentTime);
        this.fadeGain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 1);
        
        this.playSequence(track, loop);
    },

    // 播放序列
    playSequence(track, loop) {
        if (!this.isPlaying) return;
        
        const beatDuration = 60 / track.tempo;
        let currentTime = audioCtx.currentTime;
        
        track.melody.forEach((chord, index) => {
            chord.forEach(note => {
                if (note === 'rest') return;
                
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                osc.connect(gain);
                gain.connect(this.fadeGain);
                
                osc.type = 'triangle';
                osc.frequency.value = this.notes[note] || 261.63;
                
                gain.gain.setValueAtTime(0, currentTime);
                gain.gain.linearRampToValueAtTime(0.1, currentTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, currentTime + beatDuration * 0.8);
                
                osc.start(currentTime);
                osc.stop(currentTime + beatDuration);
                
                this.currentOscillators.push(osc);
            });
            
            currentTime += beatDuration;
        });
        
        // 循环播放
        if (loop) {
            const totalDuration = track.melody.length * beatDuration;
            setTimeout(() => {
                if (this.isPlaying && this.currentTrack === trackName) {
                    this.currentOscillators = [];
                    this.playSequence(track, loop);
                }
            }, totalDuration * 1000);
        }
    },

    // 停止BGM
    stop() {
        if (this.fadeGain && audioCtx) {
            this.fadeGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        }
        
        this.currentOscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
        });
        this.currentOscillators = [];
        this.currentTrack = null;
        this.isPlaying = false;
    },

    // 暂停
    pause() {
        if (this.fadeGain && audioCtx) {
            this.fadeGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        }
        this.isPlaying = false;
    },

    // 恢复
    resume() {
        if (this.currentTrack && !isMuted) {
            this.play(this.currentTrack);
        }
    }
};

// ==================== 音量控制 ====================
const AudioControl = {
    // 设置主音量
    setVolume(value) {
        volume = Math.max(0, Math.min(1, value));
        if (masterGain) {
            masterGain.gain.setValueAtTime(volume, audioCtx.currentTime);
        }
        localStorage.setItem('dq_volume', volume);
    },

    // 静音切换
    toggleMute() {
        isMuted = !isMuted;
        if (masterGain) {
            masterGain.gain.setValueAtTime(isMuted ? 0 : volume, audioCtx.currentTime);
        }
        localStorage.setItem('dq_muted', isMuted);
        return isMuted;
    },

    // 加载设置
    loadSettings() {
        const savedVolume = localStorage.getItem('dq_volume');
        const savedMute = localStorage.getItem('dq_muted');
        if (savedVolume !== null) volume = parseFloat(savedVolume);
        if (savedMute !== null) isMuted = savedMute === 'true';
    }
};

// ==================== 剧情对话系统 ====================
const StoryDialog = {
    currentStory: null,
    currentIndex: 0,
    isTyping: false,
    skipTyping: false,
    callback: null,
    
    // 头像SVG
    avatars: {
        hero: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="36" width="4" height="10" fill="#000080"/><rect x="28" y="36" width="4" height="10" fill="#000080"/><rect x="12" y="20" width="24" height="20" fill="#4169e1"/><rect x="18" y="8" width="12" height="14" fill="#ffdbac"/><rect x="18" y="6" width="12" height="6" fill="#8b4513"/><rect x="16" y="8" width="2" height="8" fill="#8b4513"/><rect x="30" y="8" width="2" height="8" fill="#8b4513"/><rect x="20" y="12" width="2" height="2" fill="#000"/><rect x="26" y="12" width="2" height="2" fill="#000"/></svg>`,
        mage: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="36" width="4" height="10" fill="#4b0082"/><rect x="28" y="36" width="4" height="10" fill="#4b0082"/><rect x="12" y="20" width="24" height="20" fill="#9932cc"/><rect x="18" y="8" width="12" height="14" fill="#ffdbac"/><rect x="16" y="4" width="16" height="8" fill="#c0c0c0"/><rect x="14" y="6" width="2" height="10" fill="#c0c0c0"/><rect x="32" y="6" width="2" height="10" fill="#c0c0c0"/><rect x="20" y="12" width="2" height="2" fill="#000"/><rect x="26" y="12" width="2" height="2" fill="#000"/></svg>`,
        archer: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="36" width="4" height="10" fill="#8b4513"/><rect x="28" y="36" width="4" height="10" fill="#8b4513"/><rect x="12" y="20" width="24" height="20" fill="#228b22"/><rect x="18" y="8" width="12" height="14" fill="#ffdbac"/><rect x="16" y="6" width="16" height="6" fill="#8b4513"/><rect x="20" y="12" width="2" height="2" fill="#000"/><rect x="26" y="12" width="2" height="2" fill="#000"/><rect x="30" y="14" width="8" height="2" fill="#8b4513"/></svg>`,
        priest: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="36" width="4" height="10" fill="#000"/><rect x="28" y="36" width="4" height="10" fill="#000"/><rect x="12" y="20" width="24" height="20" fill="#ffffff"/><rect x="20" y="16" width="8" height="8" fill="#ffd700"/><rect x="18" y="8" width="12" height="14" fill="#ffdbac"/><rect x="16" y="4" width="16" height="6" fill="#ffd700"/><rect x="20" y="12" width="2" height="2" fill="#000"/><rect x="26" y="12" width="2" height="2" fill="#000"/></svg>`,
        rogue: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="36" width="4" height="10" fill="#000"/><rect x="28" y="36" width="4" height="10" fill="#000"/><rect x="12" y="20" width="24" height="20" fill="#2f2f2f"/><rect x="18" y="8" width="12" height="14" fill="#ffdbac"/><rect x="16" y="4" width="16" height="8" fill="#000"/><rect x="14" y="8" width="2" height="6" fill="#000"/><rect x="32" y="8" width="2" height="6" fill="#000"/><rect x="20" y="14" width="2" height="2" fill="#000"/><rect x="26" y="14" width="2" height="2" fill="#000"/></svg>`,
        king: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="36" width="4" height="10" fill="#8b4513"/><rect x="28" y="36" width="4" height="10" fill="#8b4513"/><rect x="12" y="20" width="24" height="20" fill="#4169e1"/><rect x="18" y="8" width="12" height="14" fill="#ffdbac"/><rect x="16" y="4" width="16" height="8" fill="#ffd700"/><rect x="20" y="4" width="8" height="8" fill="#ff0000"/><rect x="20" y="12" width="2" height="2" fill="#000"/><rect x="26" y="12" width="2" height="2" fill="#000"/></svg>`,
        slime: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><ellipse cx="24" cy="30" rx="20" ry="16" fill="#00ff00"/><ellipse cx="20" cy="26" rx="6" ry="4" fill="#ffffff" opacity="0.4"/><rect x="14" y="24" width="4" height="6" fill="#000"/><rect x="30" y="24" width="4" height="6" fill="#000"/><rect x="15" y="25" width="1" height="2" fill="#fff"/><rect x="31" y="25" width="1" height="2" fill="#fff"/><rect x="20" y="32" width="8" height="2" fill="#000"/></svg>`,
        boss: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="20" width="24" height="20" fill="#8b0000"/><rect x="16" y="8" width="16" height="16" fill="#ff4500"/><rect x="14" y="4" width="4" height="10" fill="#ffff00"/><rect x="30" y="4" width="4" height="10" fill="#ffff00"/><rect x="18" y="14" width="4" height="4" fill="#ffff00"/><rect x="26" y="14" width="4" height="4" fill="#ffff00"/><rect x="19" y="15" width="2" height="2" fill="#000"/><rect x="27" y="15" width="2" height="2" fill="#000"/><rect x="22" y="30" width="4" height="4" fill="#ffff00"/></svg>`,
        narrator: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="32" height="32" fill="#87ceeb" rx="4"/><rect x="12" y="12" width="24" height="4" fill="#4169e1"/><rect x="12" y="20" width="20" height="4" fill="#4169e1"/><rect x="12" y="28" width="16" height="4" fill="#4169e1"/></svg>`
    },

    // 显示对话界面
    show(storyId, onComplete = null) {
        this.currentStory = STORIES[storyId];
        if (!this.currentStory) return;
        
        this.currentIndex = 0;
        this.callback = onComplete;
        this.createDialogElement();
        this.showCurrentLine();
        
        // 播放相应的BGM
        if (storyId.includes('opening')) BGM.play('title');
        else if (storyId.includes('victory')) BGM.play('victory', false);
    },

    // 创建对话框元素
    createDialogElement() {
        // 移除已存在的对话框
        const existing = document.getElementById('storyDialog');
        if (existing) existing.remove();

        const dialog = document.createElement('div');
        dialog.id = 'storyDialog';
        dialog.className = 'story-dialog-overlay';
        dialog.innerHTML = `
            <div class="story-dialog-panel">
                <div class="story-avatar" id="storyAvatar"></div>
                <div class="story-content">
                    <div class="story-speaker" id="storySpeaker"></div>
                    <div class="story-text" id="storyText"></div>
                </div>
                <div class="story-controls">
                    <button class="story-btn" onclick="StoryDialog.next()">▶ 继续</button>
                    <button class="story-btn" onclick="StoryDialog.skip()">⏩ 跳过</button>
                </div>
                <div class="story-indicator" id="storyIndicator">▼</div>
            </div>
        `;
        
        // 添加点击跳过打字效果
        dialog.addEventListener('click', (e) => {
            if (e.target.classList.contains('story-text') || e.target.id === 'storyDialog') {
                this.skipTyping = true;
            }
        });
        
        document.body.appendChild(dialog);
        
        // 添加CSS动画
        setTimeout(() => dialog.classList.add('active'), 10);
        
        SoundEffects.playConfirm();
    },

    // 显示当前对话行
    showCurrentLine() {
        const line = this.currentStory[this.currentIndex];
        if (!line) {
            this.close();
            return;
        }

        const avatarEl = document.getElementById('storyAvatar');
        const speakerEl = document.getElementById('storySpeaker');
        const textEl = document.getElementById('storyText');
        const indicatorEl = document.getElementById('storyIndicator');

        // 设置头像
        avatarEl.innerHTML = this.avatars[line.avatar] || this.avatars.narrator;
        
        // 设置说话者名称
        speakerEl.textContent = line.speaker;
        speakerEl.style.color = this.getSpeakerColor(line.avatar);

        // 打字机效果显示文本
        this.isTyping = true;
        this.skipTyping = false;
        textEl.textContent = '';
        indicatorEl.style.display = 'none';
        
        this.typeText(textEl, line.text, () => {
            this.isTyping = false;
            indicatorEl.style.display = 'block';
        });
    },

    // 打字机效果
    typeText(element, text, onComplete) {
        let index = 0;
        const speed = 30; // 每个字符间隔ms
        
        const type = () => {
            if (this.skipTyping) {
                element.textContent = text;
                onComplete();
                return;
            }
            
            if (index < text.length) {
                element.textContent += text[index];
                index++;
                
                // 每隔几个字符播放打字音效
                if (index % 3 === 0 && !isMuted) {
                    SoundEffects.playMenuMove();
                }
                
                setTimeout(type, speed);
            } else {
                onComplete();
            }
        };
        
        type();
    },

    // 获取说话者颜色
    getSpeakerColor(avatar) {
        const colors = {
            hero: '#87ceeb',
            mage: '#dda0dd',
            archer: '#90ee90',
            priest: '#ffd700',
            rogue: '#a9a9a9',
            king: '#ffd700',
            slime: '#00ff00',
            boss: '#ff4500',
            narrator: '#87ceeb'
        };
        return colors[avatar] || '#f0f0f0';
    },

    // 下一句
    next() {
        if (this.isTyping) {
            this.skipTyping = true;
            return;
        }
        
        this.currentIndex++;
        SoundEffects.playConfirm();
        
        if (this.currentIndex >= this.currentStory.length) {
            this.close();
        } else {
            this.showCurrentLine();
        }
    },

    // 跳过全部
    skip() {
        SoundEffects.playCancel();
        this.close();
    },

    // 关闭对话框
    close() {
        const dialog = document.getElementById('storyDialog');
        if (dialog) {
            dialog.classList.remove('active');
            setTimeout(() => {
                dialog.remove();
                if (this.callback) this.callback();
                this.currentStory = null;
                this.currentIndex = 0;
            }, 300);
        }
        
        // 恢复游戏BGM
        if (battleState) {
            BGM.play(battleState.isBossBattle ? 'boss' : 'battle');
        } else {
            BGM.play('village');
        }
    }
};

// ==================== 剧情内容 ====================
const STORIES = {
    // 开场剧情
    opening: [
        { avatar: 'narrator', speaker: '旁白', text: '在很久很久以前，有一片被众神祝福的大陆...' },
        { avatar: 'narrator', speaker: '旁白', text: '这片土地曾经和平繁荣，人们安居乐业。' },
        { avatar: 'narrator', speaker: '旁白', text: '然而有一天，黑暗的力量开始侵蚀这个世界...' },
        { avatar: 'narrator', speaker: '旁白', text: '魔王率领着他的军团，从深渊中崛起。' },
        { avatar: 'king', speaker: '国王', text: '勇者啊！你是我们最后的希望！' },
        { avatar: 'king', speaker: '国王', text: '只有你能阻止魔王，拯救这个世界！' },
        { avatar: 'hero', speaker: '勇者', text: '我明白了，陛下。' },
        { avatar: 'hero', speaker: '勇者', text: '我一定会击败魔王，恢复世界的和平！' }
    ],

    // 迷雾森林剧情
    forest: [
        { avatar: 'narrator', speaker: '旁白', text: '勇者来到了迷雾森林的边缘...' },
        { avatar: 'narrator', speaker: '旁白', text: '这片森林常年笼罩在神秘的雾气中。' },
        { avatar: 'hero', speaker: '勇者', text: '这就是迷雾森林吗...感觉有些诡异。' },
        { avatar: 'slime', speaker: '史莱姆', text: '咕噜咕噜！（突然跳了出来）' },
        { avatar: 'hero', speaker: '勇者', text: '是史莱姆！看来这里就是冒险的起点了。' },
        { avatar: 'narrator', speaker: '旁白', text: '勇者的冒险正式开始了！' }
    ],

    // 森林BOSS战前
    forestBoss: [
        { avatar: 'narrator', speaker: '旁白', text: '森林深处传来不祥的气息...' },
        { avatar: 'hero', speaker: '勇者', text: '这股气息...有什么强大的怪物在前面！' },
        { avatar: 'boss', speaker: '远古树精', text: '我是这片森林的守护者，凡人！' },
        { avatar: 'boss', speaker: '远古树精', text: '想要通过这里，就先打败我吧！' },
        { avatar: 'hero', speaker: '勇者', text: '我不想与你为敌，但我必须通过！' }
    ],

    // 击败森林BOSS后
    forestVictory: [
        { avatar: 'boss', speaker: '远古树精', text: '咕...好强的力量...' },
        { avatar: 'mage', speaker: '???', text: '住手！请不要再伤害它了！' },
        { avatar: 'hero', speaker: '勇者', text: '你是谁？' },
        { avatar: 'mage', speaker: '法师', text: '我是隐居在这片森林中的法师。' },
        { avatar: 'mage', speaker: '法师', text: '树精大人其实是在保护森林不被魔王的军队入侵。' },
        { avatar: 'hero', speaker: '勇者', text: '原来是这样...我误会了。' },
        { avatar: 'boss', speaker: '远古树精', text: '年轻人...你的力量让我想起了古老的预言...' },
        { avatar: 'boss', speaker: '远古树精', text: '法师，你和这位勇者一起去吧，对抗魔王需要你的力量。' },
        { avatar: 'mage', speaker: '法师', text: '遵命，树精大人。勇者，让我加入你的队伍吧！' },
        { avatar: 'hero', speaker: '勇者', text: '太好了！有你的魔法，我们一定能成功！' }
    ],

    // 阴暗洞穴剧情
    cave: [
        { avatar: 'narrator', speaker: '旁白', text: '勇者和法师来到了阴暗洞穴...' },
        { avatar: 'mage', speaker: '法师', text: '这里的黑暗气息很重，大家小心。' },
        { avatar: 'hero', speaker: '勇者', text: '我感觉到有很多亡灵在附近...' },
        { avatar: 'mage', speaker: '法师', text: '这是不死族的巢穴，我们必须穿过去才能到达下一个区域。' }
    ],

    // 洞穴BOSS战前
    caveBoss: [
        { avatar: 'narrator', speaker: '旁白', text: '洞穴深处传来沉重的脚步声...' },
        { avatar: 'hero', speaker: '勇者', text: '有什么巨大的东西正在靠近！' },
        { avatar: 'boss', speaker: '洞穴巨魔', text: '吼！！！又有新鲜的猎物送上门来了！' },
        { avatar: 'mage', speaker: '法师', text: '是洞穴巨魔！这种怪物力大无穷，小心！' },
        { avatar: 'hero', speaker: '勇者', text: '来吧，怪物！让我们一决胜负！' }
    ],

    // 击败洞穴BOSS后
    caveVictory: [
        { avatar: 'boss', speaker: '洞穴巨魔', text: '嗷...不可能...我居然会被打败...' },
        { avatar: 'archer', speaker: '???', text: '太好了！你们击败了那只巨魔！' },
        { avatar: 'hero', speaker: '勇者', text: '是谁？' },
        { avatar: 'archer', speaker: '弓箭手', text: '我是住在附近村庄的猎人。' },
        { avatar: 'archer', speaker: '弓箭手', text: '那只巨魔一直在袭击我们的村子，多谢你们！' },
        { avatar: 'mage', speaker: '法师', text: '原来它一直在危害村民啊。' },
        { avatar: 'archer', speaker: '弓箭手', text: '勇者，我听说你在对抗魔王。请让我加入吧！' },
        { avatar: 'archer', speaker: '弓箭手', text: '我的箭术一定会帮上忙的！' },
        { avatar: 'hero', speaker: '勇者', text: '欢迎加入！我们一起拯救这个世界！' }
    ],

    // 废弃矿坑剧情
    mine: [
        { avatar: 'narrator', speaker: '旁白', text: '队伍来到了废弃的矿坑...' },
        { avatar: 'mage', speaker: '法师', text: '这里曾经是矮人们的矿场。' },
        { avatar: 'mage', speaker: '法师', text: '但自从魔王的势力扩张后，这里就被怪物占领了。' },
        { avatar: 'hero', speaker: '勇者', text: '小心脚下，这里到处都是陷阱。' },
        { avatar: 'archer', speaker: '弓箭手', text: '前方有动静...准备战斗！' }
    ],

    // 灼热沙漠剧情
    desert: [
        { avatar: 'narrator', speaker: '旁白', text: '勇者们穿越沙漠，烈日炎炎...' },
        { avatar: 'mage', speaker: '法师', text: '好热...我的魔力都快耗尽了...' },
        { avatar: 'archer', speaker: '弓箭手', text: '坚持住！前方好像有绿洲！' },
        { avatar: 'hero', speaker: '勇者', text: '那里似乎有人影...小心可能是埋伏！' }
    ],

    // 沙漠BOSS战前
    desertBoss: [
        { avatar: 'narrator', speaker: '旁白', text: '金字塔深处，沉睡千年的王者苏醒...' },
        { avatar: 'boss', speaker: '法老王', text: '是谁打扰了本王的安眠...' },
        { avatar: 'hero', speaker: '勇者', text: '是法老王！传说中的沙漠统治者！' },
        { avatar: 'boss', speaker: '法老王', text: '凡人们，献上你们的生命作为祭品吧！' },
        { avatar: 'mage', speaker: '法师', text: '他的魔力好强！大家全力以赴！' }
    ],

    // 击败沙漠BOSS后
    desertVictory: [
        { avatar: 'boss', speaker: '法老王', text: '不...本王居然会被凡人击败...' },
        { avatar: 'priest', speaker: '???', text: '以神圣之名，让这位迷途的灵魂安息吧。' },
        { avatar: 'hero', speaker: '勇者', text: '你是...？' },
        { avatar: 'priest', speaker: '牧师', text: '我是来自圣光教会的牧师。' },
        { avatar: 'priest', speaker: '牧师', text: '法老王也曾是这片土地的守护者，但被黑暗侵蚀了。' },
        { avatar: 'mage', speaker: '法师', text: '多亏了你，法老王终于解脱了。' },
        { avatar: 'priest', speaker: '牧师', text: '勇者，我感受到你身上纯洁的光芒。' },
        { avatar: 'priest', speaker: '牧师', text: '请让我加入你的队伍，用神圣之力对抗黑暗！' },
        { avatar: 'hero', speaker: '勇者', text: '当然！我们正需要你的治疗能力！' }
    ],

    // 熔岩地带剧情
    volcano: [
        { avatar: 'narrator', speaker: '旁白', text: '勇者们来到了危险的熔岩地带...' },
        { avatar: 'priest', speaker: '牧师', text: '这里充满了恶魔的气息...' },
        { avatar: 'archer', speaker: '弓箭手', text: '空气好热，呼吸困难...' },
        { avatar: 'hero', speaker: '勇者', text: '魔王城就在前方了，坚持住！' }
    ],

    // 火山BOSS战前
    volcanoBoss: [
        { avatar: 'narrator', speaker: '旁白', text: '熔岩开始剧烈翻滚，一个庞大的身影浮现...' },
        { avatar: 'boss', speaker: '火焰领主', text: '哈哈哈哈！又有不知死活的蝼蚁送上门！' },
        { avatar: 'mage', speaker: '法师', text: '是火焰领主！魔王手下的四大天王之一！' },
        { avatar: 'boss', speaker: '火焰领主', text: '你们的旅程到此为止了！' },
        { avatar: 'boss', speaker: '火焰领主', text: '在我的烈焰中化为灰烬吧！' },
        { avatar: 'hero', speaker: '勇者', text: '我们不会退缩的！为了这个世界！' }
    ],

    // 击败火山BOSS后
    volcanoVictory: [
        { avatar: 'boss', speaker: '火焰领主', text: '不...不可能...我的火焰居然...' },
        { avatar: 'rogue', speaker: '???', text: '干得漂亮！我一直想找机会偷袭这家伙！' },
        { avatar: 'hero', speaker: '勇者', text: '你是谁？从哪里冒出来的？' },
        { avatar: 'rogue', speaker: '盗贼', text: '嘿嘿，我是专门偷取魔王军情报的盗贼。' },
        { avatar: 'rogue', speaker: '盗贼', text: '火焰领主一直阻碍我潜入魔王城。' },
        { avatar: 'rogue', speaker: '盗贼', text: '多亏你们干掉了他！' },
        { avatar: 'priest', speaker: '牧师', text: '原来你一直在暗中对抗魔王。' },
        { avatar: 'rogue', speaker: '盗贼', text: '勇者，我知道魔王城的秘密通道。' },
        { avatar: 'rogue', speaker: '盗贼', text: '让我加入，带你们潜入魔王城！' },
        { avatar: 'hero', speaker: '勇者', text: '太好了！有你的带路，我们就能直捣黄龙！' }
    ],

    // 魔王城决战前
    demonCastle: [
        { avatar: 'narrator', speaker: '旁白', text: '勇者们终于来到了魔王城...' },
        { avatar: 'rogue', speaker: '盗贼', text: '这就是魔王城，黑暗力量的源头。' },
        { avatar: 'mage', speaker: '法师', text: '我能感觉到...魔王就在城堡最深处。' },
        { avatar: 'archer', speaker: '弓箭手', text: '大家，这可能是最后的战斗了。' },
        { avatar: 'priest', speaker: '牧师', text: '愿圣光保佑我们...' },
        { avatar: 'hero', speaker: '勇者', text: '伙伴们，感谢一路有你们。' },
        { avatar: 'hero', speaker: '勇者', text: '无论结果如何，我们都已经尽了全力。' },
        { avatar: 'hero', speaker: '勇者', text: '现在，让我们一起结束这一切吧！' },
        { avatar: 'all', speaker: '全员', text: '为了世界的和平！冲啊！' }
    ],

    // 最终BOSS战前
    finalBoss: [
        { avatar: 'narrator', speaker: '旁白', text: '魔王城的王座之间，黑暗笼罩一切...' },
        { avatar: 'boss', speaker: '混沌魔王', text: '终于来了吗，所谓的"勇者"...' },
        { avatar: 'boss', speaker: '混沌魔王', text: '你们一路走来，打败了我不少手下啊。' },
        { avatar: 'hero', speaker: '勇者', text: '魔王！你的暴政到此为止了！' },
        { avatar: 'boss', speaker: '混沌魔王', text: '哈哈哈哈！可笑！' },
        { avatar: 'boss', speaker: '混沌魔王', text: '你以为就凭你们几个能打败我？' },
        { avatar: 'boss', speaker: '混沌魔王', text: '我可是混沌的化身，不灭的黑暗！' },
        { avatar: 'mage', speaker: '法师', text: '他的魔力...比想象的还要强大...' },
        { avatar: 'boss', speaker: '混沌魔王', text: '来吧，让我看看你们有多少本事！' },
        { avatar: 'boss', speaker: '混沌魔王', text: '在绝望中死去吧！' },
        { avatar: 'hero', speaker: '勇者', text: '大家，全力以赴！这是最后的战斗！' }
    ],

    // 通关剧情
    ending: [
        { avatar: 'boss', speaker: '混沌魔王', text: '不...不可能...我居然会...' },
        { avatar: 'hero', speaker: '勇者', text: '结束了，魔王。' },
        { avatar: 'boss', speaker: '混沌魔王', text: '该死...你们以为这样就赢了吗...' },
        { avatar: 'boss', speaker: '混沌魔王', text: '黑暗是永远不会消失的...' },
        { avatar: 'boss', speaker: '混沌魔王', text: '总有一天...我会再次...' },
        { avatar: 'narrator', speaker: '旁白', text: '魔王化为黑雾消散了...' },
        { avatar: 'narrator', speaker: '旁白', text: '笼罩世界的黑暗也随之退去...' },
        { avatar: 'mage', speaker: '法师', text: '我们...我们赢了...' },
        { avatar: 'archer', speaker: '弓箭手', text: '太棒了！我们真的打败了魔王！' },
        { avatar: 'priest', speaker: '牧师', text: '圣光啊...感谢您听到了我们的祈祷...' },
        { avatar: 'rogue', speaker: '盗贼', text: '哈哈哈！这下我可是传说中的英雄了！' },
        { avatar: 'hero', speaker: '勇者', text: '大家...谢谢你们...' },
        { avatar: 'hero', speaker: '勇者', text: '没有你们，我一个人绝对做不到...' },
        { avatar: 'king', speaker: '国王(传声)', text: '勇者啊！你们做到了！' },
        { avatar: 'king', speaker: '国王', text: '整个世界都在庆祝你们的胜利！' },
        { avatar: 'narrator', speaker: '旁白', text: '就这样，勇者和他的伙伴们拯救了世界。' },
        { avatar: 'narrator', speaker: '旁白', text: '他们的传说将被世代传颂...' },
        { avatar: 'narrator', speaker: '旁白', text: '感谢你玩这个游戏！' },
        { avatar: 'narrator', speaker: '旁白', text: 'THE END' }
    ]
};

// ==================== 导出到全局 ====================
window.SoundEffects = SoundEffects;
window.BGM = BGM;
window.AudioControl = AudioControl;
window.StoryDialog = StoryDialog;
window.initAudio = initAudio;
