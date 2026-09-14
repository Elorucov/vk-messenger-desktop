import * as ChannelComposerDraft from '../../core/model/ChannelComposerDraft';
import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { current } from 'immer';
import { applyAttachmentActions, } from '../store/UserChangedComposerDraft';
export const handler = (draft, action, featureFlags) => {
    const { channelId } = action;
    const oldDraft = draft.channelComposerDrafts[channelId] ??
        ChannelComposerDraft.empty();
    let newDraft = ChannelComposerDraft.empty();
    switch (action.type) {
        case 'UserChangedChannelComposerDraft': {
            switch (action.kind) {
                case 'text': {
                    const { text, visibility, donutDelay, date, sendOptions, ads } = action;
                    newDraft = {
                        ...oldDraft,
                        text: text ?? oldDraft.text,
                        visibility: visibility || oldDraft.visibility,
                        donutDelay: donutDelay || oldDraft.donutDelay,
                        date: date,
                        sendOptions: sendOptions || oldDraft.sendOptions,
                        ads: ads || oldDraft.ads,
                    };
                    break;
                }
                case 'addAttaches':
                case 'removeAttach':
                case 'removeVoice':
                case 'startUploading':
                case 'removeUploads':
                case 'rearrangeAttaches':
                    const change = applyAttachmentActions(oldDraft, action);
                    newDraft = {
                        ...oldDraft,
                        ...change,
                    };
                    break;
                case 'editing': {
                    const { editing } = action;
                    const selectedSendOptions = [];
                    const disabledSendOptions = [
                        'mute_notifications',
                    ];
                    if (editing.comments.canClose) {
                        selectedSendOptions.push('enable_comments');
                    }
                    if (editing.signerId) {
                        selectedSendOptions.push('signed');
                    }
                    newDraft = {
                        editing,
                        text: Post.toRawText(editing),
                        attaches: editing.attaches,
                        uploadsTrackIds: oldDraft.uploadsTrackIds,
                        visibility: Post.isDonut(editing) ? 'donut' : 'all',
                        donutDelay: editing.donut?.duration || -1,
                        sendOptions: {
                            selected: selectedSendOptions,
                            disabled: disabledSendOptions,
                        },
                        ads: ChannelComposerDraft.empty().ads,
                    };
                    break;
                }
                case 'forward': {
                    const { forward } = action;
                    if (!featureFlags.vkm_channels_new_forwards) {
                        const post = forward?.items[0];
                        const channel = post
                            ? Channel.safeGet(draft.channels, post.channelId)
                            : null;
                        if (post &&
                            channel &&
                            channel.kind !== 'ChannelRestricted' &&
                            Channel.isCommunityChannel(channel) &&
                            featureFlags.vkm_channels_forward_as_text) {
                            /**
                             * Генерим ссылку на пост
                             */
                            const linkForPost = Post.toPostChannelUrl(post);
                            newDraft = {
                                ...oldDraft,
                                text: oldDraft.text.length
                                    ? oldDraft.text + ' ' + linkForPost
                                    : linkForPost,
                            };
                            break;
                        }
                    }
                    newDraft = {
                        ...(forward && oldDraft.editing
                            ? ChannelComposerDraft.empty()
                            : oldDraft),
                        forward,
                        attaches: {},
                        ads: ChannelComposerDraft.empty().ads,
                        uploadsTrackIds: new Set(),
                    };
                    break;
                }
                default:
                    exhaustivenessCheck(action);
            }
            break;
        }
        // Ничего не делаем, так как выше newDraft задается как ChannelComposerDraft.DEFAULT_DRAFT,
        // следовательно будет удален
        case 'UserClearedChannelComposerDraft': {
            break;
        }
        default:
            exhaustivenessCheck(action);
    }
    const isNewDraftEmpty = !newDraft.text &&
        Object.keys(newDraft.attaches).length === 0 &&
        newDraft.uploadsTrackIds.size === 0 &&
        newDraft.visibility === 'all' &&
        newDraft.date === undefined &&
        newDraft.donutDelay === -1 &&
        newDraft.sendOptions.selected.length === 0 &&
        newDraft.sendOptions.disabled.length === 0 &&
        newDraft.forward === undefined &&
        newDraft.ads.erId === '' &&
        newDraft.ads.predId === '' &&
        newDraft.ads.isAd === false;
    if (isNewDraftEmpty) {
        delete draft.channelComposerDrafts[channelId];
    }
    else {
        draft.channelComposerDrafts[channelId] = newDraft;
    }
    const undraftedComposerDrafts = current(draft.channelComposerDrafts);
    return [
        async ({ storage }) => {
            storage.set('channels-drafts', undraftedComposerDrafts);
            return {
                type: 'Noop',
            };
        },
    ];
};
//# sourceMappingURL=UserChangedChannelComposerDraft.js.map