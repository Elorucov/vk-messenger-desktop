import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
let SoundsManager = class SoundsManager {
    constructor() {
        this.soundsMap = undefined;
        this.disabled = false;
        this.buffers = undefined;
        this.context = undefined;
        // попытки распарсить звук
        this.MAX_COUNT_PARSE = 3;
        this.unlock = async () => {
            if (!this.context) {
                return;
            }
            try {
                debugMessage(DebugMessageType.LOG, 'AudioContext unlocking...');
                await this.context.resume();
                debugMessage(DebugMessageType.LOG, 'AudioContext unlocked');
            }
            catch (e) {
                debugMessage(DebugMessageType.LOG, 'AudioContext unlock failed');
            }
        };
        this.playing = new Map();
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
            const Context = window.AudioContext ?? window.webkitAudioContext;
            this.context = new Context();
        }
        else {
            this.disabled = true;
        }
    }
    init(sounds) {
        this.soundsMap = sounds;
        if (this.disabled) {
            return;
        }
        this.prepareBuffers();
    }
    decodeBuffer(buffer) {
        return new Promise((resolve, reject) => {
            if (this.context) {
                this.context.decodeAudioData(buffer, resolve, reject);
            }
            else {
                reject();
            }
        });
    }
    async prepareBuffers() {
        const parseAudio = async (url) => {
            for (let i = 0; i < this.MAX_COUNT_PARSE; i++) {
                try {
                    const response = await fetch(url);
                    const buffer = await response.arrayBuffer();
                    return this.decodeBuffer(buffer);
                }
                catch (err) {
                    console.error(`Failed to parse audio at ${url}, attempt ${i + 1}`, err);
                }
            }
            return null;
        };
        const promises = Object.entries(this.soundsMap ?? {}).map(async ([key, url]) => {
            const buffer = await parseAudio(url);
            if (!buffer) {
                return null;
            }
            return { [key]: buffer };
        });
        const results = await Promise.all(promises);
        const result = Object.assign({}, ...results);
        if (Object.keys(result).length === 0) {
            this.disabled = true;
            return;
        }
        this.buffers = result;
    }
    /**
     * Хак для сафари: при любом взаимодействии со страницей,
     * проигрываем пустой буффер, чтоб получить доступ к аудио контексту.
     * Иначе, Сафари не будет воспроизводить звуки
     */
    unlockAudioContext() {
        if (this.disabled) {
            return;
        }
        document.body.addEventListener('mousedown', this.unlock, { once: true, passive: true });
        document.body.addEventListener('touchstart', this.unlock, { once: true, passive: true });
    }
    playBuffer(audioBuffer, loop = false) {
        if (!this.context || this.playing.has(audioBuffer)) {
            return;
        }
        const source = this.context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.context.destination);
        source.loop = loop;
        source.start();
        source.onended = () => {
            this.playing.delete(audioBuffer);
        };
        this.playing.set(audioBuffer, source);
        return source;
    }
    stopBuffer(audioBuffer) {
        const source = this.playing.get(audioBuffer);
        if (source) {
            source.stop();
        }
    }
    play(type, loop) {
        const buffer = this.buffers?.[type];
        if (this.disabled || !buffer) {
            return;
        }
        this.playBuffer(buffer, loop);
    }
    stop(type) {
        const buffer = this.buffers?.[type];
        if (this.disabled || !buffer) {
            return;
        }
        this.stopBuffer(buffer);
    }
    stopAll() {
        this.buffers &&
            Object.values(this.buffers).forEach((buffer) => {
                this.stopBuffer(buffer);
            });
    }
};
SoundsManager = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [])
], SoundsManager);
export { SoundsManager };
//# sourceMappingURL=SoundManager.js.map