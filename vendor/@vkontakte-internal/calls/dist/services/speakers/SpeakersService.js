import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { volumesDetectorGenerator } from '../volumeDetector';
import { VOLUME_LEVEL_DETECTION } from '../../constants';
/**
 * Класс отвечает за говорящих в данный момент
 * Поможет понять кого подсвечивать в данный момент
 */
let SpeakersService = class SpeakersService {
    constructor() {
        this.speakers = {};
        this.speakersInHeader = [];
        this.onVolumesDetected = volumesDetectorGenerator({
            onUpdate: (data) => {
                this.updateSpeakers(data);
            },
            volumeLevelDetection: VOLUME_LEVEL_DETECTION,
            debugCallback: () => { },
        });
        makeAutoObservable(this, {
            onVolumesDetected: false,
        });
    }
    replaceSpeaker(oldId, newId) {
        if (this.speakers[oldId]) {
            delete this.speakers[oldId];
            this.speakers[newId] = true;
        }
        const index = this.speakersInHeader.findIndex((peer) => peer === oldId);
        if (index >= 0) {
            this.speakersInHeader.splice(index, 1, newId);
        }
    }
    toggleSpeaker(id, toggle) {
        if (this.speakers[id] === toggle || (!toggle && this.speakers[id] === undefined)) {
            return;
        }
        if (toggle) {
            this.speakers[id] = true;
        }
        else {
            delete this.speakers[id];
        }
    }
    updateSpeakers({ speakers = this.speakers, speakersInHeader = this.speakersInHeader, }) {
        this.speakers = speakers;
        this.speakersInHeader = speakersInHeader;
    }
    isSpeaker(id) {
        return this.speakers[id] === true;
    }
};
SpeakersService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [])
], SpeakersService);
export { SpeakersService };
//# sourceMappingURL=SpeakersService.js.map