import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Viewer from '../../core/model/Viewer';
export const handler = (draft, action) => {
    const { type } = action;
    switch (type) {
        case 'UserChangedSetting': {
            const lockKey = action.setting;
            if (draft.locks.settings.has(lockKey)) {
                return [];
            }
            draft.locks.settings.add(lockKey);
            const previousValue = draft.viewer.settings[action.setting];
            draft.viewer.settings[action.setting] = action.value;
            return [
                async function changeSetting(env) {
                    try {
                        const response = await saveUserSetting({
                            env,
                            setting: action.setting,
                            value: action.value,
                        });
                        const isRequestSuccessful = response === 1 || response.version !== undefined;
                        if (action.setting === 'messageReactionAnimation' &&
                            isRequestSuccessful) {
                            env.stats.logEvent({
                                type: 'type_action',
                                type_action: {
                                    type: 'type_messaging_action_item',
                                    type_messaging_action_item: {
                                        action_type: 'REACT_ANIMATION',
                                        label: action.value ? 'ON' : 'OFF',
                                    },
                                },
                            });
                        }
                        if (isRequestSuccessful && action.setting === 'callsEnabled') {
                            if (action.value) {
                                env.calls?.init?.();
                            }
                            else {
                                env.calls?.dispose();
                            }
                        }
                        if (isRequestSuccessful &&
                            action.entrypoint !== 'reduced_motion' &&
                            Viewer.isReducedMotionSetting(action.setting)) {
                            const prevReducedMotionSettings = env.storage.get('prev-reduced-motion-settings');
                            if (prevReducedMotionSettings) {
                                env.storage.set('prev-reduced-motion-settings', {
                                    ...prevReducedMotionSettings,
                                    [action.setting]: action.value,
                                });
                            }
                        }
                        return {
                            type: 'UserChangedSetting_RequestCompleted',
                            hasFailed: !isRequestSuccessful,
                            setting: action.setting,
                            value: action.value,
                            previousValue,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedSetting_RequestCompleted',
                            hasFailed: true,
                            setting: action.setting,
                            value: action.value,
                            previousValue,
                        };
                    }
                },
            ];
        }
        case 'UserChangedSetting_RequestCompleted': {
            const lockKey = action.setting;
            draft.locks.settings.delete(lockKey);
            if (action.hasFailed) {
                draft.viewer.settings[action.setting] = action.previousValue;
                return [];
            }
            if (action.setting === 'eduAccountSwitchBanner') {
                const viewer = draft.viewer;
                const isEdu = Viewer.isEdu(viewer.profileType);
                return [
                    async function sendStat(env) {
                        env.stats.logEvent({
                            type: 'general',
                            name: isEdu ? 'go_to_messenger_banner' : 'go_to_sferum_banner',
                            value_new: action.value ? 'enable' : 'disable',
                            value_old: action.value ? 'disable' : 'enable',
                        });
                        return {
                            type: 'Noop',
                        };
                    },
                ];
            }
            return [
                async function updateCounters() {
                    if (action.setting === 'countGroupDialogs' ||
                        action.setting === 'countChannels') {
                        return {
                            type: 'CountersUpdate',
                        };
                    }
                    return {
                        type: 'Noop',
                    };
                },
            ];
        }
        case 'CountersUpdate': {
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
function saveUserSetting({ env, setting, value, }) {
    const { api, storage } = env;
    switch (setting) {
        case 'ctrSubmitFromApi': {
            return api.fetch('account.setInfo', {
                name: 'messages_multiline_input',
                value: String(Number(value)),
            }, { retries: 3 });
        }
        case 'soundNotifications': {
            if (typeof value === 'boolean') {
                storage.set('settings-sound-notifications-on', value);
            }
            return Promise.resolve(1);
        }
        case 'eduAccountSwitchBanner': {
            return api.fetch('messages.setConfig', {
                config: JSON.stringify({ edu_account_switch_banner: Number(value) }),
            }, { retries: 3 });
        }
        case 'showRecommendations': {
            return Promise.resolve(1);
        }
        case 'countOnlyNotMuted': {
            return api.fetch('account.setInfo', {
                name: 'show_only_not_muted_messages',
                value: String(Number(value)),
            }, { retries: 3 });
        }
        case 'countGroupDialogs': {
            return api.fetch('account.setInfo', {
                name: 'messages_counter_settings_include_group_dialogs',
                value: String(Number(value)),
            }, { retries: 3 });
        }
        case 'countChannels': {
            return api.fetch('account.setInfo', {
                name: 'include_channel_notifications',
                value: String(Number(value)),
            }, { retries: 3 });
        }
        case 'autoUnarchive': {
            return api.fetch('account.setInfo', {
                name: 'messages_auto_unarchive',
                value: String(Number(value)),
            }, { retries: 3 });
        }
        case 'verticalFoldersView': {
            return api.fetch('messages.setConfig', {
                config: JSON.stringify({ vertical_folders_view: Number(value) }),
            }, { retries: 3 });
        }
        case 'messageReactionAnimation': {
            return api.fetch('messages.setConfig', {
                config: JSON.stringify({
                    message_reactions_animation: Number(value),
                }),
            }, { retries: 3 });
        }
        case 'fastActionsTriggerFromApi': {
            let backendValue = 'hover_and_right_button_click';
            switch (value) {
                case 'hover':
                case false:
                    backendValue = 'hover';
                    break;
                case 'rightClick':
                case true:
                    backendValue = 'right_button_click';
                    break;
                case 'hoverAndRightClick':
                    backendValue = 'hover_and_right_button_click';
                    break;
                default:
                    backendValue = 'hover_and_right_button_click';
            }
            return api.fetch('messages.setConfig', {
                config: JSON.stringify({
                    fast_action_type: backendValue,
                }),
            }, { retries: 3 });
        }
        case 'autoExtendReactionPicker': {
            return api.fetch('messages.setConfig', {
                config: JSON.stringify({
                    auto_extend_reactions_picker: Number(value),
                }),
            }, { retries: 3 });
        }
        case 'showThemeStyles': {
            if (typeof value === 'boolean') {
                storage.set('settings-show-theme-styles', value);
            }
            return Promise.resolve(1);
        }
        case 'callsEnabled': {
            if (typeof value === 'boolean') {
                storage.set('settings-calls-enabled', value);
            }
            return Promise.resolve(1);
            // @TODO Раскомментить в ME-61632
            //   return api.fetch(
            //     'messages.setConfig',
            //     {
            //       config: JSON.stringify({
            //         callsEnabled: Number(value),
            //       }),
            //     },
            //     { retries: 3 },
            //   )
        }
        case 'convoListWidthPercent': {
            return api.fetch('messages.setConfig', {
                config: JSON.stringify({
                    chat_list_collapse: Number(value),
                }),
            }, { retries: 3 });
        }
        case 'videoMessageAutoplay': {
            if (typeof value === 'boolean') {
                storage.set('video-message-autoplay', value);
            }
            return Promise.resolve(1);
        }
        case 'performanceTweaksEnabled': {
            if (typeof value === 'boolean') {
                storage.set('performance-tweaks-enabled', value);
            }
            return Promise.resolve(1);
        }
        case 'shouldShowCompactModeButton': {
            if (typeof value === 'boolean') {
                storage.set('settings-show-compact-mode-button', value);
            }
            return Promise.resolve(1);
        }
        /**
         * Заглушка для настройки "Получать сообщения в сообщества", тк пока эта настройка только в глобальном интерфейсе настроек.
         * Но нужна в интеграции для корректного mute/unmute сообществ в папке сообществ
         * */
        case 'groupsMessagesNotifySetting': {
            return Promise.resolve(1);
        }
        case 'featuresDisabledConvoBannerContent': {
            return Promise.resolve(1);
        }
        case 'layoutMode': {
            return api.fetch('messages.setConfig', {
                config: JSON.stringify({
                    reforged_enabled: value === 'one-column' ? 'disabled' : 'enabled',
                }),
            }, { retries: 3 });
        }
        default: {
            exhaustivenessCheck(setting);
        }
    }
}
//# sourceMappingURL=UserChangedSetting.js.map