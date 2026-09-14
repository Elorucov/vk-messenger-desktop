import { Emitter } from '@vkontakte-internal/utils';
export class MediaSessionObject {
    #emitter = new Emitter();
    #actionHandlers = new Map();
    #positionState;
    #metadata = null;
    #playbackState = 'none';
    #cameraActive = false;
    #microphoneActive = false;
    get events() {
        return this.#emitter.listenable;
    }
    get metadata() {
        return this.#metadata;
    }
    set metadata(value) {
        this.#metadata = value;
        this.#emitChange({ metadata: value });
    }
    get playbackState() {
        return this.#playbackState;
    }
    set playbackState(value) {
        this.#playbackState = value;
        this.#emitChange({ playbackState: value });
    }
    get actionHandlers() {
        return this.#actionHandlers;
    }
    get positionState() {
        return this.#positionState;
    }
    get cameraActive() {
        return this.#cameraActive;
    }
    get microphoneActive() {
        return this.#microphoneActive;
    }
    setPositionState(state) {
        this.#positionState = state;
        this.#emitChange({ positionState: state });
    }
    setActionHandler(action, handler) {
        this.actionHandlers.set(action, handler);
        this.#emitChange({ actionHandler: [action, handler] });
    }
    setCameraActive(value) {
        this.#cameraActive = value;
        this.#emitChange({ cameraActive: value });
    }
    setMicrophoneActive(value) {
        this.#microphoneActive = value;
        this.#emitChange({ microphoneActive: value });
    }
    #emitChange(diff) {
        this.#emitter.emit('change', { diff });
    }
}
//# sourceMappingURL=MediaSessionObject.js.map