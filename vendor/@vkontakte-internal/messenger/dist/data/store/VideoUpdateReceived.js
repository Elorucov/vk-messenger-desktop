import { exhaustivenessCheck } from '../../core/utils/misc';
import * as VideoConvo from '../../core/model/VideoConvo';
import * as Convo from '../../core/model/Convo';
import * as Channel from '../../core/model/Channel';
import { IRouter } from '../env/IRouter';
import { fromAttachVideoConvo } from '../converter/VideoConvoConverter';
import { findMessageVideoLayer, findPostVideoLayer } from '../../core/utils/video';
/**
 * Обновляет рекурсивно все включения видео аттача, исходя из роута модалки
 */
export const handler = (draft, action) => {
    switch (action.type) {
        case 'VideoUpdateReceived': {
            const { video, routeVideo } = action;
            const videoConvo = draft.videoConvos.get(VideoConvo.resolveId(video.id));
            if (videoConvo) {
                draft.videoConvos.set(VideoConvo.resolveId(video.id), {
                    ...fromAttachVideoConvo(video, videoConvo.hasMore),
                    comments: [...videoConvo.comments],
                });
            }
            const source = routeVideo?.source;
            /**
             * Ищем место, откуда открыто видео, и обновляем аттач
             */
            if (source) {
                switch (source.kind) {
                    case IRouter.RouteSourceKind.Message:
                    case IRouter.RouteSourceKind.PostponedMessage: {
                        const convo = draft.convos.get(source.peerId);
                        const nodeData = convo && Convo.findHistoryNodeByCmid(convo, source.cmid);
                        if (nodeData === undefined ||
                            nodeData.status === 'NotLoaded' ||
                            nodeData.status === 'Deleted' ||
                            nodeData.node.item.kind !== 'Normal') {
                            return [];
                        }
                        const message = nodeData.node.item;
                        const currentVideoAttach = findMessageVideoLayer(message, routeVideo.id);
                        if (!currentVideoAttach) {
                            return [];
                        }
                        Object.assign(currentVideoAttach, video);
                        break;
                    }
                    case IRouter.RouteSourceKind.Post:
                    case IRouter.RouteSourceKind.PostponedPost:
                    case IRouter.RouteSourceKind.Comment:
                        const channel = draft.channels.get(source.channelId);
                        if (channel?.kind === 'ChannelRestricted') {
                            return [];
                        }
                        const findPost = source.kind === IRouter.RouteSourceKind.PostponedPost
                            ? Channel.findPostInPostponedByCmid
                            : Channel.findPostByCmid;
                        const nodeData = channel &&
                            findPost(channel, source.kind === IRouter.RouteSourceKind.Comment
                                ? source.postCmid
                                : source.cmid);
                        if (nodeData === undefined ||
                            nodeData.kind === 'DeletedNode' ||
                            (nodeData.kind === 'Node' && nodeData.item.kind !== 'Normal')) {
                            return [];
                        }
                        const post = nodeData.kind === 'Postponed' ? nodeData : nodeData.item;
                        const currentVideoAttach = findPostVideoLayer(post, routeVideo.id);
                        if (!currentVideoAttach) {
                            return [];
                        }
                        Object.assign(currentVideoAttach, video);
                        break;
                    case IRouter.RouteSourceKind.Composer:
                    case IRouter.RouteSourceKind.ChannelComposer:
                    case IRouter.RouteSourceKind.CommentsComposer: {
                        break;
                    }
                    default:
                        exhaustivenessCheck(source);
                }
            }
            return [];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=VideoUpdateReceived.js.map