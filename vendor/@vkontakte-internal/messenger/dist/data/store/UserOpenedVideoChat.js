import * as VideoConvo from '../../core/model/VideoConvo';
import { exhaustivenessCheck } from '../../core/utils/misc';
import * as VideoEngineBatchReceived from '../store/VideoEngineBatchReceived';
import { insertPeers } from '../store/State';
import { fromApiComment } from '../converter/CommentConverter';
import { fromAttachVideoConvo } from '../converter/VideoConvoConverter';
import { VIDEO_COMMENTS_PER_PAGE } from '../../core/config/config';
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    switch (action.type) {
        case 'UserOpenedVideoChat': {
            const { video } = action;
            return [
                async function initVideoLongPoll({ api, videoEngine }) {
                    const count = VIDEO_COMMENTS_PER_PAGE;
                    try {
                        const [commentsResponse, videoEngineConfig] = await api.fetchMany([
                            {
                                method: 'video.getComments',
                                params: {
                                    extended: 1,
                                    video_id: video.id,
                                    owner_id: video.ownerId,
                                    access_key: video.accessKey,
                                    count,
                                    sort: 'desc',
                                },
                            },
                            ...(videoEngine && video.type === 'live'
                                ? [
                                    {
                                        method: 'video.getLongPollServer',
                                        params: {
                                            video_id: video.id,
                                            owner_id: video.ownerId,
                                            access_key: video.accessKey,
                                        },
                                    },
                                ]
                                : []),
                        ]);
                        if (videoEngine && videoEngineConfig) {
                            try {
                                videoEngine.connect(videoEngineConfig);
                            }
                            catch {
                                return {
                                    type: 'Noop',
                                };
                            }
                        }
                        return {
                            type: 'UserOpenedVideoChat_RequestCompleted',
                            commentsResponse,
                            video,
                            hasMore: commentsResponse.items.length >= count,
                        };
                    }
                    catch {
                        return {
                            type: 'UserOpenedVideoChat_RequestFailed',
                            video,
                        };
                    }
                },
            ];
        }
        case 'UserClosedVideoChat': {
            const { video } = action;
            draft.videoConvos.delete(VideoConvo.resolveId(video.id));
            return [
                async function shutdown({ videoEngine }) {
                    videoEngine?.shutdown();
                    return {
                        type: 'Noop',
                    };
                },
            ];
        }
        case 'UserOpenedVideoChat_RequestCompleted': {
            const { commentsResponse, video, hasMore } = action;
            const videoConvo = fromAttachVideoConvo(video, hasMore);
            const comments = commentsResponse.items
                .map((comment) => fromApiComment(comment))
                .reverse();
            videoConvo.comments.push(...comments);
            draft.videoConvos.set(VideoConvo.resolveId(video.id), videoConvo);
            insertPeers(draft, {
                apiUsers: commentsResponse.profiles || [],
                apiGroups: commentsResponse.groups || [],
                apiContacts: [],
            });
            return [
                async function firstTimePollChannelEngine({ videoEngine }) {
                    if (!videoEngine || video.type !== 'live') {
                        return {
                            type: 'Noop',
                        };
                    }
                    return {
                        type: 'VideoEngineBatchReceived',
                        variant: {
                            kind: 'FromVideoEngine',
                            next: await videoEngine.poll(),
                        },
                    };
                },
            ];
        }
        case 'UserOpenedVideoChat_RequestFailed': {
            const { video } = action;
            const videoConvo = fromAttachVideoConvo(video, false, true);
            draft.videoConvos.set(VideoConvo.resolveId(video.id), videoConvo);
            return [];
        }
        case 'VideoEngineBatchReceived':
            return VideoEngineBatchReceived.handler(draft, action, featureFlags, envFeatureFlags);
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserOpenedVideoChat.js.map