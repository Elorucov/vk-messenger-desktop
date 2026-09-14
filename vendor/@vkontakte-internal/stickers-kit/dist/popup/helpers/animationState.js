import { Emitter } from '@vkontakte-internal/utils';
export const AnimationStatusTypes = {
    Preparing: 'preparing',
    Loaded: 'loaded',
    Playing: 'playing',
    Finished: 'finished',
};
export class AnimationState extends Emitter {
    #status;
    constructor() {
        super();
        this.#status = AnimationStatusTypes.Preparing;
        this.markStateAsLoaded = () => {
            this.#status = AnimationStatusTypes.Loaded;
            this.emit('onLoaded');
        };
        this.markStateAsPlaying = () => {
            this.#status = AnimationStatusTypes.Playing;
            this.emit('onPlaying');
        };
        this.markStateAsFinished = () => {
            this.#status = AnimationStatusTypes.Finished;
            this.emit('onFinished');
        };
    }
    get status() {
        return this.#status;
    }
}
//# sourceMappingURL=animationState.js.map