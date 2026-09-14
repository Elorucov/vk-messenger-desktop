import * as Viewer from '../../core/model/Viewer';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { updateSettingsCache } from '@vkontakte-internal/stickers-kit';
export const handler = (draft, action) => {
    const { type } = action;
    switch (type) {
        case 'LoadStickersSettingsFromApi': {
            if (draft.locks.loadStickersSettings) {
                return [];
            }
            draft.locks.loadStickersSettings = true;
            return [
                async function fetchStickersSettings({ api }) {
                    try {
                        const response = await api.fetch('stickers.getSettings', {}, {
                            retries: 2,
                        });
                        return {
                            type: 'LoadStickersSettingsFromApi_RequestCompleted',
                            response,
                        };
                    }
                    catch {
                        return {
                            type: 'Noop',
                        };
                    }
                },
            ];
        }
        case 'LoadStickersSettingsFromApi_RequestCompleted': {
            const { response } = action;
            draft.locks.loadStickersSettings = false;
            try {
                if (response.settings) {
                    Viewer.updateIsStickersAnimationEnabled(draft.viewer, response.settings.animation_autoplay);
                    Viewer.updateIsPopupStickersAutoplaySettingEnabled(draft.viewer, Boolean(response.settings.popup?.flags?.disable_peer_ids), Boolean(response.settings.popup?.flags?.animation_interrupter));
                    updateSettingsCache({
                        popupAutoplayOnGet: Boolean(response.settings.popup?.autoplay.on_get),
                        popupAutoplayOnSend: Boolean(response.settings.popup?.autoplay.on_send),
                        popupDisabledPeerIds: response.settings.popup?.autoplay.disabled_peer_ids ?? [],
                        animationAutoplay: response.settings.animation_autoplay,
                    });
                }
            }
            catch { }
            return [];
        }
        case 'ChangeStickersSettings': {
            const { setting, value } = action;
            let prevValue;
            let params;
            switch (setting) {
                case 'isStickersAnimationEnabled': {
                    prevValue = draft.viewer.settings[setting];
                    Viewer.updateIsStickersAnimationEnabled(draft.viewer, value);
                    params = {
                        name: 'animation_autoplay',
                        value: value ? 1 : 0,
                    };
                    break;
                }
                default:
                    exhaustivenessCheck(setting);
            }
            return [
                async function changeStickersSettings({ api }) {
                    try {
                        const response = await api.fetch('stickers.setSettings', params, {
                            retries: 2,
                        });
                        return {
                            type: 'ChangeStickersSettings_RequestCompleted',
                            setting,
                            isFailed: response.settings === undefined,
                            prevValue,
                        };
                    }
                    catch {
                        return {
                            type: 'ChangeStickersSettings_RequestCompleted',
                            setting,
                            isFailed: true,
                            prevValue,
                        };
                    }
                },
            ];
        }
        case 'ChangeStickersSettings_RequestCompleted': {
            const { setting, prevValue, isFailed } = action;
            if (isFailed) {
                switch (setting) {
                    case 'isStickersAnimationEnabled': {
                        Viewer.updateIsStickersAnimationEnabled(draft.viewer, prevValue);
                        break;
                    }
                    default:
                        exhaustivenessCheck(setting);
                }
                return [];
            }
            switch (setting) {
                case 'isStickersAnimationEnabled': {
                    draft.forceStickersReload = true;
                    break;
                }
                default:
                    exhaustivenessCheck(setting);
            }
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=LoadStickersSettingsFromApi.js.map