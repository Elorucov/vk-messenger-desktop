import '../../ui/ComposerBlocked/ComposerBlocked.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { Icon24ErrorCircleOutline, Icon24Info, Icon24MuteOutline, Icon24VolumeOutline, } from '@vkontakte/icons';
import { useBrowserEnv, useFeatureFlags, useGroupBannedUser, useOwner, usePeers, useUserDetails, useViewer, } from '../../hooks/misc';
import cx from 'classnames';
import { useNow } from '../../hooks/useNow';
import { useModal } from '../../hooks/useModal';
import { BanInfoModal } from '../../ui/BanInfoModal/BanInfoModal';
import { Button } from '@vkontakte/vkui';
import { useSnackbar } from '../../hooks/useSnackbar';
import { getColorClass } from '@vkontakte-internal/vkcom-kit';
import { SferumMigrateToMaxComposer } from '../../ui/SferumMigrateToMaxComposer/SferumMigrateToMaxComposer';
import { useConvoAttachesGetMissedPeers } from '../../hooks/useConvoAttaches';
const EDU_MESSAGE_REQUEST_REASONS = [
    'need_edu_role',
    'need_message_request',
    'pending_message_request',
];
export const ComposerBlocked = ({ reason, className, dispatch, convo, peer, until, }) => {
    const { lang, envFeatureFlags } = useBrowserEnv();
    const now = useNow();
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const featureFlags = useFeatureFlags();
    const owner = useOwner();
    const bannedInfo = useGroupBannedUser(peer);
    const snackbar = useSnackbar();
    const userInfo = useUserDetails(peer.id);
    const { fetchProfilesAndGroups: fetchAdmin } = useConvoAttachesGetMissedPeers(userInfo?.is_answer_locked && userInfo?.answer_locked_by_user_id
        ? [userInfo.answer_locked_by_user_id]
        : []);
    const onRequestCompleted = useCallback((hasFailed) => {
        if (hasFailed) {
            snackbar({
                before: (React.createElement(Icon24ErrorCircleOutline, { className: getColorClass('color_icon_negative') })),
                message: lang.use('me_ban_info_request_error_snackbar_text'),
            });
        }
    }, [snackbar, lang]);
    useEffect(() => {
        if (envFeatureFlags.isCommunityMessagingEnabled &&
            bannedInfo === undefined &&
            !userInfo?.is_answer_locked &&
            peer.kind === 'User' &&
            convo.kind === 'UserConvo' &&
            owner.kind === 'Group' &&
            !convo.isNew) {
            dispatch({
                type: 'LoadGroupBannedUser',
                groupId: owner.id,
                peerId: peer.id,
                requestCompletedUICallback: onRequestCompleted,
            });
        }
    }, [
        bannedInfo,
        envFeatureFlags,
        peer,
        convo,
        owner,
        dispatch,
        onRequestCompleted,
        userInfo,
    ]);
    const peers = usePeers();
    const [adminCached, setAdminCached] = useState(() => !(userInfo?.is_answer_locked &&
        userInfo?.answer_locked_by_user_id &&
        !peers.has(userInfo.answer_locked_by_user_id)) || undefined);
    useEffect(() => {
        if (reason === 'community_messages_other_admin_acquired_user_convo' &&
            userInfo?.answer_locked_by_user_id &&
            adminCached === undefined) {
            fetchAdmin()
                .then(() => setAdminCached(true))
                .catch(() => setAdminCached(false));
        }
    }, [fetchAdmin, userInfo?.answer_locked_by_user_id, adminCached, reason]);
    const deactivatedText = useMemo(() => {
        if (peer.kind === 'User' && peer.isDeactivated) {
            if (peer.deactivationReason === Peer.DEACTIVATED_REASON_BANNED) {
                return lang.use('me_composer_peer_banned');
            }
            if (peer.deactivationReason === Peer.DEACTIVATED_REASON_DELETED) {
                return lang.use('me_composer_peer_deleted');
            }
        }
        return;
    }, [peer, lang]);
    const actionClickHandler = useCallback((userAction) => {
        dispatch({
            type: 'UserChangedMute',
            peerId: convo.peerId,
            userAction,
            timer: 0,
        });
    }, [dispatch, convo.peerId]);
    const renderTextBlockWithIcon = (reason, icon, text) => {
        return (React.createElement("div", { className: "ComposerBlocked__info" },
            React.createElement("i", { role: "img", className: "ComposerBlocked__icon" }, icon),
            React.createElement("span", { className: "ComposerBlocked__message" }, text ||
                lang.use(reasonText(reason), {
                    values: {
                        peer: Peer.name(peer, 'acc'),
                    },
                    sex: Peer.sex(peer),
                }))));
    };
    if (featureFlags.vkm_edu_offboarding &&
        isEdu &&
        Convo.hasMigratedSferumRestrictions(convo)) {
        return React.createElement(SferumMigrateToMaxComposer, { convo: convo });
    }
    if (reason === 'sending_postponed_messages_is_resticted_because_user_left_chat') {
        return (React.createElement("div", { className: cx(className, 'ComposerBlocked') }, renderTextBlockWithIcon(reason, React.createElement(Icon24Info, null))));
    }
    if (convo.kind === 'ChatConvo' && reason === 'forbid_writing_for_all') {
        const text = convo.forbidedWritingForAll && convo.forbidedWritingForAll.until
            ? lang.use('me_forbid_writing_for_all_with_time', {
                date: convo.forbidedWritingForAll.until,
                now: now,
            })
            : lang.use('me_forbid_writing_for_all');
        return (React.createElement("div", { className: cx(className, 'ComposerBlocked') }, renderTextBlockWithIcon(reason, React.createElement(Icon24Info, null), text)));
    }
    if (Convo.isDeleted(convo)) {
        return (React.createElement("div", { className: cx(className, 'ComposerBlocked') }, renderTextBlockWithIcon(reason, React.createElement(Icon24Info, null), lang.use('me_composer_chat_deleted'))));
    }
    if (reason === 'community_messages_other_admin_acquired_user_convo') {
        const adminPeer = adminCached &&
            userInfo?.answer_locked_by_user_id &&
            Peer.safeGet(peers, userInfo.answer_locked_by_user_id);
        const banDescriptionText = adminPeer
            ? lang.use('me_composer_can_write_admin_acquired', {
                values: {
                    name: Peer.name(adminPeer),
                },
                sex: adminPeer.sex,
            })
            : '';
        return (React.createElement("div", { className: cx(className, 'ComposerBlocked') }, renderTextBlockWithIcon(reason, React.createElement(Icon24Info, null), React.createElement(React.Fragment, null, banDescriptionText))));
    }
    /**
     * Продуктово, если это запрос на общение, тогда блокируя композер не показывает текстом почему пользователь
     * не может написать сообщение, потому что сверху будет плашка запроса на общение которая дает все пояснения
     * @see https://jira.mvk.com/browse/ME-58813
     */
    if (isEdu && EDU_MESSAGE_REQUEST_REASONS.includes(reason)) {
        return null;
    }
    if (reason === 'announcements') {
        return (React.createElement("div", { className: cx(className, 'ComposerBlocked', 'ComposerBlocked--announcements') },
            React.createElement("div", { className: "ComposerBlocked__info" },
                React.createElement("span", { className: "ComposerBlocked__message" }, lang.use('me_composer_can_write_announcements')))));
    }
    if (reason === 'spam_restriction') {
        return (React.createElement("div", { className: cx(className, 'ComposerBlocked') }, renderTextBlockWithIcon(reason, React.createElement(Icon24Info, null))));
    }
    if (envFeatureFlags.isCommunityMessagingEnabled &&
        convo.kind === 'UserConvo' &&
        bannedInfo &&
        peer.kind === 'User' &&
        owner.kind === 'Group') {
        const userBanInfoText = bannedInfo.endDate
            ? lang.use('me_group_banned_user_until_banner', {
                now,
                date: bannedInfo.endDate,
                values: {
                    name: Peer.firstName(peer),
                },
            })
            : lang.use('me_group_banned_user_forever_banner', {
                values: {
                    name: Peer.firstName(peer),
                },
            });
        const banDesctiptionText = lang.use('me_group_banned_user_banner_description', {
            sex: Peer.sex(peer),
        });
        return (React.createElement("div", { className: cx(className, 'ComposerBlocked') }, renderTextBlockWithIcon(reason, React.createElement(Icon24Info, null), React.createElement(React.Fragment, null,
            userBanInfoText,
            React.createElement("br", null),
            banDesctiptionText))));
    }
    if ((convo.kind !== 'ChatConvo' && convo.kind !== 'BusinessNotify') ||
        reason === 'kicked' ||
        reason === 'chat_unsupported' ||
        reason === 'chat_disabled' ||
        reason === 'no_conversation' ||
        reason === 'peer_blacklisted' ||
        reason === 'mr_rejected') {
        return (React.createElement("div", { className: cx(className, 'ComposerBlocked') }, renderTextBlockWithIcon(reason, React.createElement(Icon24Info, null), deactivatedText)));
    }
    if (convo.kind === 'ChatConvo' && reason === 'restricted_to_write_in_chat') {
        const text = until
            ? lang.use('me_composer_can_write_banned_in_chat', {
                values: {
                    date: new Date(until).toLocaleDateString(),
                    time: lang.formatDate(until, { now, variant: 'time' }),
                },
            })
            : lang.use('me_composer_can_write_banned_in_chat_forever');
        return (React.createElement("div", { className: cx(className, 'ComposerBlocked') }, renderTextBlockWithIcon(reason, React.createElement(Icon24Info, null), text)));
    }
    const isMuted = Convo.isMuted(convo);
    const text = isMuted ? lang.use('me_convo_unmute') : lang.use('me_convo_mute');
    const icon = !isMuted ? React.createElement(Icon24MuteOutline, null) : React.createElement(Icon24VolumeOutline, null);
    return (React.createElement("div", { className: cx(className, 'ComposerBlocked') },
        React.createElement("button", { className: "ComposerBlocked__button", onClick: () => actionClickHandler(isMuted ? 'unmute' : 'mute') }, renderTextBlockWithIcon(reason, icon, text))));
};
function reasonText(reason) {
    switch (reason) {
        case 'peer_deleted':
            return 'me_composer_can_write_peer_deleted';
        case 'no_access':
            return 'me_composer_can_write_no_access';
        case 'no_conversation':
            return 'me_composer_can_write_no_conversation';
        case 'peer_blacklisted':
            return 'me_composer_can_write_peer_blacklisted_text';
        case 'peer_blacklisted_by_me':
            return 'me_composer_can_write_peer_blacklisted_by_me';
        case 'disabled_by_peer':
            return 'me_composer_can_write_disabled_by_peer';
        case 'disabled_by_community':
            return 'me_composer_can_write_disabled_by_community';
        case 'kicked':
            return 'me_composer_can_write_kicked';
        case 'chat_unsupported':
        case 'chat_disabled':
            return 'me_composer_can_write_unknown';
        case 'mr_rejected':
            return 'me_composer_can_write_rejected_mr';
        case 'spam_restriction':
            return 'me_composer_can_write_spam_restriction';
        case 'sending_postponed_messages_is_resticted_because_user_left_chat':
            return 'me_postponed_messages_composer_blocked';
        default:
            return 'me_composer_can_write_unknown';
    }
}
export const ChannelComposerBlocked = ({ banInfo, className }) => {
    const { lang } = useBrowserEnv();
    const now = useNow();
    const banInfoModal = useModal();
    const shoudShowMoreButton = banInfo.reason !== 0 /* BanInfoReason.Other */ || banInfo.comment !== undefined;
    const text = banInfo.endDate
        ? lang.use('me_channel_user_banned_until', {
            date: banInfo.endDate,
            now,
        })
        : lang.use('me_channel_user_banned_permanently');
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: cx(className, 'ComposerBlocked', 'ComposerBlocked--channel') },
            React.createElement("div", { className: "ComposerBlocked__info" },
                React.createElement("i", { role: "img", className: "ComposerBlocked__icon" },
                    React.createElement(Icon24Info, null)),
                React.createElement("span", { className: "ComposerBlocked__message" }, text),
                shoudShowMoreButton && (React.createElement(Button, { className: "ComposerBlocked__banInfo", size: "s", mode: "secondary", appearance: "accent", onClick: banInfoModal.open }, lang.use('me_channel_ban_info_more'))))),
        banInfoModal.isActive && (React.createElement(BanInfoModal, { banInfo: banInfo, handleModalClose: banInfoModal.close }))));
};
//# sourceMappingURL=ComposerBlocked.js.map