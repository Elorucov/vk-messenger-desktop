import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { useBrowserEnv, useFeatureFlags, usePeers } from '../../hooks/misc';
import { Icon28LockOutline, Icon32Play } from '@vkontakte/icons';
import { PhotoItem } from '../../ui/PhotoItem/PhotoItem';
import * as Peer from '../../../core/model/Peer';
import '../../ui/AttachVideosClip/AttachVideosClip.css';
import { useConvoAttachesGetMissedPeers } from '../../hooks/useConvoAttaches';
import { AttachVideoClipsTitle } from '../../ui/AttachVideosClip/AttachVideoClipsTitle';
import { AttachAvatar } from '../../ui/AttachAvatar/AttachAvatar';
import { Button, ButtonGroup } from '@vkontakte/vkui';
export const AttachVideosClip = ({ ownerId, clip, previewUrl, width, height, isRestricted = false, className, isMarkedPlayed, openClipRecommendations, openCoOwnersModal, }) => {
    const peers = usePeers();
    const { lang, vkDomain, envFeatureFlags } = useBrowserEnv();
    const { vkm_clip_co_owners_modal, vkm_reply_clip_sharing } = useFeatureFlags();
    const [peersCached, setPeersCached] = useState(false);
    const author = Peer.safeGet(peers, Peer.resolveId(ownerId));
    const { fetchProfilesAndGroups } = useConvoAttachesGetMissedPeers([
        Peer.resolveId(ownerId),
        ...getCoownersPeerIds(clip),
    ]);
    useEffect(() => {
        if (!peers.has(Peer.resolveId(ownerId)) ||
            !checkCoownersFetched(clip, peers)) {
            fetchProfilesAndGroups().then(() => setPeersCached(true));
        }
        else {
            setPeersCached(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const coownerPeers = useMemo(() => {
        return getCoownersPeerIds(clip).reduce((acc, peerId) => {
            let author;
            try {
                author = { ...Peer.safeGet(peers, peerId) };
            }
            catch {
                author = Peer.safeGet(peers, Peer.resolveId());
            }
            author && acc.push(author);
            return acc;
        }, []);
    }, [clip, peers]);
    const showRecommendationsButton = isMarkedPlayed &&
        openClipRecommendations &&
        envFeatureFlags?.replyClipSharing &&
        vkm_reply_clip_sharing;
    const onClipTitleClicked = (e) => {
        if (!vkm_clip_co_owners_modal) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (getCoownersPeerIds(clip).length) {
            openCoOwnersModal?.(`${clip.ownerId}_${clip.id}`);
            return;
        }
        window.open(`https://${vkDomain}${Peer.link(author)}`);
    };
    return (React.createElement("div", { className: cx('AttachVideosClip', {
            'AttachVideosClip--restricted': isRestricted,
        }, className), style: {
            width,
            height,
        } },
        React.createElement("div", { className: "AttachVideosClip__container" },
            !isRestricted && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: cx('AttachVideosClip__head', {
                        'AttachVideosClip__head--coowners': coownerPeers.length,
                    }) },
                    React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "AttachVideosClip__avatar", onClick: onClipTitleClicked },
                            React.createElement(AttachAvatar, { coownerPeers: coownerPeers, author: author, singleAvatarSize: 24 })),
                        React.createElement(AttachVideoClipsTitle, { coownerPeers: coownerPeers, author: author, peersCached: peersCached, onClick: onClipTitleClicked, clipId: clip.id, ownerId: ownerId }))),
                isMarkedPlayed && React.createElement("div", { className: "AttachVideosClip__overlay" }),
                React.createElement(PhotoItem, { width: width, height: height, src: previewUrl, alt: clip.title, cover: true }),
                showRecommendationsButton ? (React.createElement(ButtonGroup, { className: "AttachVideosClip__isMarkedPlayed", gap: "m", mode: "vertical", align: "center", stretched: true },
                    React.createElement(Button, { onClick: (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            openClipRecommendations();
                        }, mode: "primary", size: "m", appearance: "overlay" }, lang.use('me_clip_find_clip')),
                    React.createElement(Button, { mode: "tertiary", size: "m", appearance: "overlay" }, lang.use('me_clip_watch_again')))) : (React.createElement("div", { className: "AttachVideosClip__videoPlay" },
                    React.createElement(Icon32Play, null))))),
            isRestricted && (React.createElement("div", { className: "AttachVideosClip__restrictedContainer" },
                React.createElement(Icon28LockOutline, { className: "AttachVideosClip__restrictedIcon" }),
                React.createElement("p", { className: "AttachVideosClip__restrictedText" }, lang.use('me_attach_clip_private')))))));
};
const getCoownersPeerIds = (clip) => {
    return clip.coownerPeerIds || [];
};
const checkCoownersFetched = (clip, peers) => {
    return !getCoownersPeerIds(clip).some((coownerPeerId) => !peers.has(coownerPeerId));
};
//# sourceMappingURL=AttachVideosClip.js.map