import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { SpeakersService } from '../../../services/speakers';
import { StateBridge } from '../../../utils/stateBridge';
import { LangUtils } from '../../../services/Lang';
import { scope } from '@vkontakte-internal/di';
import { isGroupCallByPeerAndMe } from '@vkontakte-internal/calls-core';
import { getParticipantsListLabel } from '../../../helpers/helpers';
import { getUserShortName } from '../../../helpers/user';
let SpeakersTexts = class SpeakersTexts {
    constructor(speakersService, state, langs) {
        this.speakersService = speakersService;
        this.state = state;
        this.langs = langs;
        this.SPEAKER_IN_HEADER_LIMIT = 2;
        makeAutoObservable(this);
    }
    get isGroupCall() {
        return isGroupCallByPeerAndMe(this.state.peer, this.state.me);
    }
    get speakersInHeader() {
        if (!this.isGroupCall) {
            return null;
        }
        const participants = this.speakersService.speakersInHeader.reduce((acc, deviceId) => {
            const device = this.state.devices[deviceId];
            // Если у юзера выключен микрофон, то не показываем его в списке говорящих
            if (!device?.mediaSettings.isAudioEnabled) {
                return acc;
            }
            const participant = this.state.participants[this.state.devices[deviceId]?.externalId.id ?? ''];
            if (participant && (participant.shortName || participant.name)) {
                acc.push(participant);
            }
            return acc;
        }, []);
        if (!participants.length) {
            return null;
        }
        const pattern = '{names}';
        const phrase = this.langs.getLang('calls_participants_speak', participants.length);
        const patternIndex = phrase.indexOf(pattern);
        const phraseBeforePattern = phrase.substring(0, patternIndex);
        const phraseAfterPattern = phrase.substring(pattern.length + patternIndex);
        const speakersLabels = getParticipantsListLabel(participants, participants.slice(0, this.SPEAKER_IN_HEADER_LIMIT), getUserShortName, this.langs.getLang, this.langs.langNumeric, 0, this.SPEAKER_IN_HEADER_LIMIT);
        return { phraseBeforePattern, speakersLabels, phraseAfterPattern };
    }
};
SpeakersTexts = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [SpeakersService,
        StateBridge,
        LangUtils])
], SpeakersTexts);
export { SpeakersTexts };
//# sourceMappingURL=SpeakersTexts.js.map