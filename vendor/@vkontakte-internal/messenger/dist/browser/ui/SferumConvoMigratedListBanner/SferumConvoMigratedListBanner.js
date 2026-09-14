import '../../ui/SferumConvoMigratedListBanner/SferumConvoMigratedListBanner.css';
import React, { useMemo, memo, useEffect } from 'react';
import { BannerPanel } from '../../ui/BannerPanel/BannerPanel';
import { useBrowserEnv, useInsertIntoCache, usePeers, useViewer, } from '../../hooks/misc';
import { Icon24CancelOutline, Icon24ChevronCompactRight, } from '@vkontakte/icons';
import { Button } from '@vkontakte/vkui';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
import { ExternalLink } from '../../ui/Link/Link';
import { Cell, Skeleton, Spacing, Subhead } from '@vkontakte-internal/vkcom-kit';
import { RightPanel } from '../../ui/RightPanel/RightPanel';
import { useModal, useModalGroup } from '../../hooks/useModal';
import { RightPanelTitle } from '../../ui/RightPanel/RightPanelTitle';
import { RightPanelIconButton } from '../../ui/RightPanel/RightPanelIconButton';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { Avatar } from '../../ui/Avatar/Avatar';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import * as Viewer from '../../../core/model/Viewer';
import * as Peer from '../../../core/model/Peer';
import { useRouter } from '../../ui/Router/Router';
import { useApiFetch } from '../../hooks/useApiFetch';
import { noop } from '../../../core/utils/misc';
import { IApi } from '../../../data/env/IApi';
const maxPhotosCount = 3;
const maxPeersCount = 50;
export const SferumConvoMigratedListBanner = memo(({ convo }) => {
    const { transitionData } = convo;
    const viewer = useViewer();
    const { navigate } = useRouter();
    const groupId = useModalGroup();
    const modal = useModal(groupId.id, 'rightPanel');
    const { lang, stats } = useBrowserEnv();
    const peers = usePeers();
    const apiFetch = useApiFetch();
    const insertIntoCache = useInsertIntoCache();
    const stackPhotos = useMemo(() => transitionData?.peerIds
        .map((userId) => peers.get(userId)?.photo)
        // здесь нет необходимости в фильтрации по наличию аватарки, потому что нам необходимо показать шиммер
        .slice(0, maxPhotosCount) ?? [], [transitionData?.peerIds, peers]);
    useEffect(() => {
        /**
         * Загрузка пиров, отсутствующих в кешэ
         * Если панель не открыта, нам нет смысла запрашивать всех пиров (их может быть до 50),
         * поэтому по умолчанию грузим только видимые
         */
        if (!transitionData || transitionData.peerIds.length > maxPeersCount) {
            return;
        }
        const requiredIds = transitionData.peerIds
            .slice(0, modal.isActive ? Infinity : maxPhotosCount)
            .filter((id) => !peers.has(id));
        if (!requiredIds.length) {
            return;
        }
        const userIds = requiredIds
            .filter((id) => Peer.isUserPeerId(id))
            .join(',');
        async function fetchProfiles() {
            const profiles = await apiFetch('users.get', { user_ids: userIds }, {
                retries: 3,
                trackId: IApi.resolveTrackId('users.get', 'migrated_users_getting'),
            });
            insertIntoCache({
                profiles: profiles || [],
            });
        }
        if (userIds.length) {
            fetchProfiles().catch(noop);
        }
        // не зависим от peers
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transitionData, modal.isActive, insertIntoCache, apiFetch]);
    useEffect(() => {
        if (modal.isActive) {
            stats.logEvent({
                type: 'type_view',
                screen: 'im',
                type_view: {
                    item: {
                        type: 'banner',
                    },
                    position: 0,
                    start_view: '',
                    end_view: '',
                    type: 'type_im_conversations_banner_view',
                    type_im_conversations_banner_view: {
                        banner_name: 'sferum_to_max_chat_counter',
                    },
                },
            });
        }
    }, [modal.isActive, stats]);
    if (!transitionData ||
        !transitionData.peerIds.length ||
        transitionData.peerIds.length > maxPeersCount) {
        return;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(BannerPanel, { mode: "oneLine", isVisible: true, onClick: modal.open },
            React.createElement("div", { className: "SferumConvoMigratedListBanner" },
                React.createElement(UsersStack, { photos: stackPhotos, size: 24, count: stackPhotos.length, visibleCount: stackPhotos.length }),
                React.createElement("div", null,
                    React.createElement(Subhead, null, lang.use('me_sferum_offboarding_convo_banner_title', {
                        values: {
                            migratedCount: String(transitionData.peerIds.length),
                            membersCount: String(convo.members.count),
                        },
                    })),
                    transitionData.link && (React.createElement(ExternalLink, { className: "SferumConvoMigratedListBanner__link", href: transitionData.link }, lang.use('me_sferum_offboarding_convo_banner_subtitle'))))),
            React.createElement(Icon24ChevronCompactRight, { className: "SferumConvoMigratedListBanner__button" })),
        React.createElement(RightPanel, { indexInStack: modal.indexInStack, isActive: modal.isActive, onEscape: modal.close, className: "RightPanel__profile" },
            React.createElement(RightPanelTitle, { left: React.createElement(RightPanelIconButton, { "aria-label": lang.use('me_cancel'), side: "left", onClick: modal.close },
                    React.createElement(Icon24CancelOutline, null)) }, lang.use('me_sferum_offboarding_convo_panel_title')),
            React.createElement(ScrollbarProvider, { overflowX: "hidden" },
                React.createElement(Spacing, null),
                transitionData.peerIds.map((peerId) => {
                    const peer = peers.get(peerId);
                    if (!peer) {
                        return React.createElement(PeerSkeleton, { key: peerId });
                    }
                    return (React.createElement(Cell, { key: peerId, before: React.createElement(Avatar, { peer: peer, size: 40 }), onClick: () => navigate({
                            kind: 'PeerPanel',
                            peerId: peer.id,
                            screenName: Peer.screenName(peer),
                        }) },
                        React.createElement(PeerTitle, { peer: peer, isClassic: Viewer.isEdu(viewer.profileType) })));
                })),
            transitionData.link && (React.createElement("div", { className: "SferumConvoMigratedListBanner__actions" },
                React.createElement(Button, { appearance: "accent", mode: "primary", stretched: true, size: "l", href: transitionData.link, target: "_blank", className: "SferumConvoMigratedListBanner__transitionButton", onClick: () => stats.logEvent({
                        type: 'type_action',
                        type_action: {
                            type: 'type_im_conversations_banner_item',
                            type_im_conversations_banner_item: {
                                event_type: 'click',
                                banner_name: 'sferum_to_max_chat_counter',
                            },
                        },
                    }) }, lang.use('me_sferum_offboarding_convo_panel_button')))))));
});
const PeerSkeleton = () => (React.createElement(Cell, { before: React.createElement(Skeleton, { width: 40, height: 40, borderRadius: "50%" }) },
    React.createElement(Skeleton, { width: 120 })));
//# sourceMappingURL=SferumConvoMigratedListBanner.js.map