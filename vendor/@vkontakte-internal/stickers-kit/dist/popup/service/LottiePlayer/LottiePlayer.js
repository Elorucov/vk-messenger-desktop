import { makeAutoObservable } from 'mobx';
import { DEFAULT_PLAYER_OPTIONS } from '../../constants';
export class LottiePlayer {
    constructor() {
        this.options = { ...DEFAULT_PLAYER_OPTIONS };
        this.setOptions = (options) => {
            this.options = options;
        };
        this.setOption = ({ key, value }) => {
            if (typeof this.options[key] === typeof value) {
                this.options = {
                    ...this.options,
                    [key]: value,
                };
            }
        };
        this.reset = () => {
            this.options = { ...DEFAULT_PLAYER_OPTIONS };
        };
        makeAutoObservable(this);
    }
}
//# sourceMappingURL=LottiePlayer.js.map