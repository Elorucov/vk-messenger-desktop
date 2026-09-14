import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserReportAttach': {
            const { attach, reason } = action;
            let fetchAction;
            switch (attach.kind) {
                case 'Photo':
                    fetchAction = (api) => api.fetch('photos.report', {
                        reason,
                        owner_id: attach.ownerId,
                        photo_id: attach.id,
                    });
                    break;
                case 'Video':
                    fetchAction = (api) => api.fetch('video.report', {
                        reason,
                        owner_id: attach.ownerId,
                        video_id: attach.id,
                    });
                    break;
                default:
                    exhaustivenessCheck(attach);
            }
            return [
                async function applyAction({ api }) {
                    try {
                        if (fetchAction) {
                            await fetchAction(api);
                        }
                    }
                    catch { }
                    return { type: 'Noop' };
                },
            ];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=UserReportAttach.js.map