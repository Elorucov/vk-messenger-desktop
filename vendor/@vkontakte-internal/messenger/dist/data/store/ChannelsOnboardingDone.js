import { exhaustivenessCheck } from '../../core/utils/misc';
import * as ChannelFilters from '../../core/model/ChannelFilters';
import { insertChannels } from './State';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'ChannelsOnboardingDone': {
            if (action.pickedChannelsIds.length === 0) {
                ChannelFilters.push(draft.organisers.channelFilters, 'all', [], false);
                return [
                    async function ({ api }) {
                        await api.fetch('account.hideHelpHint', {
                            hint_id: 'im:channels_onboarding',
                        }, {
                            retries: Infinity,
                        });
                        return {
                            type: 'Noop',
                        };
                    },
                ];
            }
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('channels.unarchive', {
                            channel_ids: action.pickedChannelsIds.join(',') || '',
                            extended: 1,
                        });
                        return {
                            type: 'ChannelsOnboardingDone_RequestSucceeded',
                            responseChannels: response,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'ChannelsOnboardingDone_RequestFailed',
                        };
                    }
                },
            ];
        }
        case 'ChannelsOnboardingDone_RequestSucceeded': {
            const channels = insertChannels(draft, {
                apiChannels: action.responseChannels.succeeded || [],
                apiGroups: action.responseChannels.groups || [],
                featureFlags,
            });
            ChannelFilters.push(draft.organisers.channelFilters, 'all', channels, false);
            return [
                async function ({ api }) {
                    await api.fetch('account.hideHelpHint', {
                        hint_id: 'im:channels_onboarding',
                    }, {
                        retries: Infinity,
                    });
                    return {
                        type: 'Noop',
                    };
                },
            ];
        }
        case 'ChannelsOnboardingDone_RequestFailed': {
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=ChannelsOnboardingDone.js.map