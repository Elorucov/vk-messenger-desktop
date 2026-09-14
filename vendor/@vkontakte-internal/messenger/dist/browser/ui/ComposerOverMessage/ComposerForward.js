import React, { useCallback } from 'react';
import { useBrowserEnv, useFeatureFlags, usePeers } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Post from '../../../core/model/Post';
import * as Message from '../../../core/model/Message';
import { ComposerOverMessage, } from './ComposerOverMessage';
import { MessagePreview } from '../../ui/MessagePreview/MessagePreview';
import * as ComposerDraft from '../../../core/model/ComposerDraft';
import { ChannelPostPreview } from '../../ui/ChannelPostPreview/ChannelPostPreview';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { PostCommentPreview } from '../../ui/PostCommentPreview/PostCommentPreview';
import { Icon20CheckCircleOn, Icon24GearOutline } from '@vkontakte/icons';
import { ActionsMenu, ActionsMenuAction, ActionsMenuSeparator, } from '../../ui/ActionsMenu/ActionsMenu';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { getPeersInlineNames } from '../../utils/misc';
export const ComposerForward = React.memo(({ className, forward, isCompactView, onRemoveForward, onForwardTargetChange, isForwardAuthorHidden = ComposerDraft.DEFAULT_FORWARD_AUTHOR_HIDDEN, setIsForwardAuthorHidden, actionsButtonClassname = 'ComposerOverMessage__actionsButton', }) => {
    const peers = usePeers();
    const { lang } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const { items, kind } = forward;
    let props;
    switch (kind) {
        case "message" /* ComposerDraft.ForwardKind.Message */: {
            // Бэк вырежет пустые форварды из сообщений, синхронизируем превью с логикой бэка
            const itemsWithoutEmptyForwards = featureFlags.vkm_new_remove_empty_forwards
                ? Message.removeEmptyForwards(items)
                : items;
            const actions = onForwardTargetChange &&
                setIsForwardAuthorHidden &&
                featureFlags.vkm_hide_forward_author && (React.createElement(ForwardActions, { setIsForwardAuthorHidden: setIsForwardAuthorHidden, isForwardAuthorHidden: isForwardAuthorHidden, onForwardTargetChange: onForwardTargetChange, actionsButtonClassname: actionsButtonClassname }));
            if (itemsWithoutEmptyForwards.length === 1) {
                const message = itemsWithoutEmptyForwards[0];
                // Получаем пользователей не через Peer.safeGet, так как они могут быть не
                // загружены на момент рендера.
                // Но они точно будут загружены в экшене: ActualizeComposerDraft .
                const author = peers.get(message.authorId);
                let title;
                if (isForwardAuthorHidden) {
                    title = lang.use('me_author_name_hidden');
                }
                else {
                    title =
                        author !== undefined
                            ? Peer.name(author)
                            : lang.use('me_chat_members_count', {
                                num: 1,
                            });
                }
                props = {
                    title,
                    content: React.createElement(MessagePreview, { message: message }),
                    date: message.sentAt,
                    onRemove: onRemoveForward,
                    actions,
                };
                break;
            }
            const authorsIds = new Set(itemsWithoutEmptyForwards.map((message) => message.authorId));
            const authors = [...authorsIds.values()]
                .slice(0, 3)
                // Получаем пользователей не через Peer.safeGet, так как они могут быть не
                // загружены на момент рендера.
                // Но они точно будут загружены в экшене: ActualizeComposerDraft .
                .map((authorId) => peers.get(authorId))
                .reduce((result, author) => {
                if (author !== undefined) {
                    result.push(author);
                }
                return result;
            }, []);
            props = {
                title: isForwardAuthorHidden
                    ? lang.use('me_author_name_hidden')
                    : getPeersInlineNames(authors, authorsIds.size, (peer) => Peer.firstName(peer), lang) ?? '',
                content: lang.use('me_attaches_messages', {
                    num: itemsWithoutEmptyForwards.length,
                }),
                onRemove: onRemoveForward,
                actions,
            };
            break;
        }
        case "post" /* ComposerDraft.ForwardKind.Post */: {
            const post = items[0];
            // Получаем канал не через Peer.safeGet, так как он может быть не
            // загружен на момент рендера.
            // Но он точно будет загружены в экшене: ActualizeComposerDraft
            // Для новых каналов берем в качестве пира родительское соо
            const authorId = Post.isFromCommunityChannel(post)
                ? post.parentId
                : post.channelId;
            const author = peers.get(Peer.resolveId(authorId || post.channelId));
            props = {
                title: author !== undefined
                    ? Peer.name(author)
                    : lang.use('me_chat_members_count', {
                        num: 1,
                    }),
                content: React.createElement(ChannelPostPreview, { post: post }),
                date: post.sentAt,
                highlighted: true,
                onRemove: onRemoveForward,
            };
            break;
        }
        case "comment" /* ComposerDraft.ForwardKind.Comment */: {
            const comment = items[0];
            // Получаем пользователей не через Peer.safeGet, так как они могут быть не
            // загружены на момент рендера.
            // Но они точно будут загружены в экшене: ActualizeComposerDraft
            const author = peers.get(Peer.resolveId(comment.peerId));
            props = {
                title: author !== undefined
                    ? Peer.name(author)
                    : lang.use('me_chat_members_count', {
                        num: 1,
                    }),
                content: React.createElement(PostCommentPreview, { comment: comment }),
                onRemove: onRemoveForward,
            };
            break;
        }
        default:
            exhaustivenessCheck(forward);
    }
    return (React.createElement(ComposerOverMessage, { className: className, isCompactView: isCompactView, ...props }));
});
const ForwardActions = ({ setIsForwardAuthorHidden, isForwardAuthorHidden, onForwardTargetChange, actionsButtonClassname, }) => {
    const { lang } = useBrowserEnv();
    const icon = (React.createElement(Icon20CheckCircleOn, { className: "ComposerOverMessage__actionIcon" }));
    return (React.createElement(Dropdown, { content: React.createElement(ActionsMenu, { className: "ComposerOverMessage__actionsMenu" },
            React.createElement(ActionsMenuAction, { title: lang.use('me_show_forward_author'), onClick: useCallback(() => setIsForwardAuthorHidden(false), [setIsForwardAuthorHidden]), rightIcon: isForwardAuthorHidden ? undefined : icon }),
            React.createElement(ActionsMenuAction, { title: lang.use('me_hide_forward_author'), onClick: useCallback(() => setIsForwardAuthorHidden(true), [setIsForwardAuthorHidden]), rightIcon: isForwardAuthorHidden ? icon : undefined }),
            React.createElement(ActionsMenuSeparator, null),
            React.createElement(ActionsMenuAction, { title: lang.use('me_change_forward_target'), onClick: () => {
                    // Делаем небольшую задержку, чтобы дать сначала закрыться поповеру
                    // и потом открыть модалку с пикером бесед, а не наоборот.
                    setTimeout(() => onForwardTargetChange(), 50);
                } })), position: "top", align: "left", openType: "click", hideOnClick: true },
        React.createElement("div", { className: actionsButtonClassname },
            React.createElement("div", { className: "ComposerOverMessage__actionsButtonClickArea" }),
            React.createElement(Icon24GearOutline, null))));
};
//# sourceMappingURL=ComposerForward.js.map