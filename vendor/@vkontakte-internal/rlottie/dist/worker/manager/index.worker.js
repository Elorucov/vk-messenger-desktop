import { exposeApi } from 'threads-es';
import { LottiePlayerWorker } from '../player';
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LottieManagerWorker {
    static #players = new Map();
    static async createPlayer({ send: options, }) {
        const player = new LottiePlayerWorker(options);
        this.#players.set(player.id, player);
        await player.init();
        player.addEventListener('destroy', () => {
            this.#players.delete(player.id);
        }, {
            once: true,
        });
    }
    static createPlayerMethodProxy(method) {
        return (id, ...args) => {
            const player = this.#players.get(id);
            if (!player) {
                return;
            }
            return player[method](...args);
        };
    }
}
const lottieManagerWorker = {
    createPlayer: LottieManagerWorker.createPlayer.bind(LottieManagerWorker),
    setOptions: LottieManagerWorker.createPlayerMethodProxy('setOptions'),
    play: LottieManagerWorker.createPlayerMethodProxy('play'),
    playPart: LottieManagerWorker.createPlayerMethodProxy('playPart'),
    playTo: LottieManagerWorker.createPlayerMethodProxy('playTo'),
    pause: LottieManagerWorker.createPlayerMethodProxy('pause'),
    reset: LottieManagerWorker.createPlayerMethodProxy('reset'),
    stop: LottieManagerWorker.createPlayerMethodProxy('stop'),
    destroyCache: LottieManagerWorker.createPlayerMethodProxy('destroyCache'),
    destroy: LottieManagerWorker.createPlayerMethodProxy('destroy'),
    paused: LottieManagerWorker.createPlayerMethodProxy('paused'),
    state: LottieManagerWorker.createPlayerMethodProxy('state'),
    render: LottieManagerWorker.createPlayerMethodProxy('render'),
    redraw: LottieManagerWorker.createPlayerMethodProxy('redraw'),
};
exposeApi(lottieManagerWorker);
//# sourceMappingURL=index.worker.js.map