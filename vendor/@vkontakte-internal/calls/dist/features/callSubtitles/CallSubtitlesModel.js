import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { SubtitlesService } from '../../services/subtitles';
import { makeAutoObservable } from 'mobx';
let CallSubtitlesModel = class CallSubtitlesModel {
    constructor(props, subtitlesService) {
        this.props = props;
        this.subtitlesService = subtitlesService;
        this.setSubtitlesLines = (subtitleLines) => {
            this.subtitlesService.setSubtitlesLines(subtitleLines);
        };
        this.clearOldSubtitles = (history) => {
            this.subtitlesService.clearOldSubtitles(history);
        };
        makeAutoObservable(this);
    }
    get subtitleLines() {
        return this.subtitlesService.subtitleLines;
    }
    get history() {
        return this.subtitlesService.asrTranscription;
    }
};
CallSubtitlesModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        SubtitlesService])
], CallSubtitlesModel);
export { CallSubtitlesModel };
export const { useModel: useCallSubtitlesModel, Provider: CallSubtitlesModelProvider } = createProvider(CallSubtitlesModel);
//# sourceMappingURL=CallSubtitlesModel.js.map