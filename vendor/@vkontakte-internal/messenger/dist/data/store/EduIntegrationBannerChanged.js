import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    const { type } = action;
    switch (type) {
        case 'HideEduIntegrationBanner': {
            const hiddenAt = Date.now();
            const hiddenCount = draft.eduIntegrationBanner.hiddenCount + 1;
            draft.eduIntegrationBanner.hiddenAt = hiddenAt;
            draft.eduIntegrationBanner.hiddenCount = hiddenCount;
            return [
                async function ({ storage, stats }) {
                    storage.set('edu-integration-banner', {
                        hiddenAt,
                        hiddenCount,
                    });
                    stats.logEvent({
                        type: 'type_action',
                        type_action: {
                            type: 'type_im_conversations_banner_item',
                            type_im_conversations_banner_item: {
                                event_type: 'hide',
                                banner_name: 'edu_joining_ejd_chats',
                            },
                        },
                    });
                    return {
                        type: 'Noop',
                    };
                },
            ];
        }
        case 'ShowEduIntegrationBanner': {
            const hiddenAt = null;
            const hiddenCount = draft.eduIntegrationBanner.hiddenCount;
            draft.eduIntegrationBanner.hiddenAt = hiddenAt;
            draft.eduIntegrationBanner.hiddenCount = hiddenCount;
            return [
                async function ({ storage }) {
                    storage.set('edu-integration-banner', {
                        hiddenAt,
                        hiddenCount,
                    });
                    return {
                        type: 'Noop',
                    };
                },
            ];
        }
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=EduIntegrationBannerChanged.js.map