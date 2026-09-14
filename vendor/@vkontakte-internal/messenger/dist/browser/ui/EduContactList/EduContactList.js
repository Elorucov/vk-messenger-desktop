import '../../ui/EduContactList/EduContactList.css';
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { Avatar } from '../../ui/Avatar/Avatar';
import { useBrowserEnv, useDispatch, usePeers, useLastSeen, useViewer, useInsertIntoCache, } from '../../hooks/misc';
import { Icon16Education, Icon20GlobeCrossOutline, Icon20UserAddOutline, } from '@vkontakte/icons';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { ImportContactModal } from '../../ui/ImportContactModal/ImportContactModal';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { OnlineStatus } from '../../ui/OnlineStatus/OnlineStatus';
import { FormattedPhoneNumber } from '../../ui/FormattedPhoneNumber/FormattedPhoneNumber';
import { useSearchHandlers, useSearchSferumContacts, } from '../../hooks/useSearch';
import { InviteButton } from '../../ui/InviteButton/InviteButton';
import { useModal } from '../../hooks/useModal';
import { usePhoneJoin } from '../../hooks/usePhoneJoin';
import { useRouter } from '../../ui/Router/Router';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Search } from '@vkontakte/vkui';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
import { IApi } from '../../../data/env/IApi';
import { API_ERROR_FLOOD, API_ERROR_MESSAGES_SPAM_RESTRICTION, } from '@vkontakte-internal/api-schema-typescript';
import { VirtualizerCore, } from '../../ui/VirtualScroll/VirtualizerCore';
import { CONVOS_PER_PAGE } from '../../../core/config/config';
import { useVirtualScroll } from '../../ui/VirtualScroll/useVirtualScroll';
import { VirtualScrollItem } from '../../ui/VirtualScroll/VirtualScrollItem';
import { VirtualScrollList } from '../../ui/VirtualScroll/VirtualScrollList';
import cx from 'classnames';
import { FakeAvatar, Skeleton } from '@vkontakte-internal/vkcom-kit';
import { useApiFetch } from '../../hooks/useApiFetch';
const VIRTUALIZER_CONFIG = {
    sliceCount: CONVOS_PER_PAGE,
    preloadCount: CONVOS_PER_PAGE / 10,
    throttleDelay: 100,
    sliceCountIncrement: CONVOS_PER_PAGE / 2,
    sliceByViewAreaRatio: 2.5,
};
const AVATAR_SIZE = 48;
export const EduContactList = ({ onSelect, goBack, }) => {
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const insertIntoCache = useInsertIntoCache();
    const { navigate } = useRouter();
    const snackbar = useSnackbar();
    const { viewer } = useViewer();
    const $input = useRef(null);
    const [isImportContactModalOpen, setImportContactModalOpen] = useState(false);
    const [state, setState] = useState('loading');
    const [results, setResults] = useState([]);
    const { query, onChange, onKeyDown, onFocus, onBlur, reset } = useSearchHandlers();
    const hasSferumSearchQuery = !!query;
    const onSearchLoadError = useCallback(() => {
        snackbar({
            message: lang.use('me_sferum_contacts_search_failed'),
            before: (React.createElement(Icon20GlobeCrossOutline, { style: { width: 28, height: 28 }, fill: "var(--vkui--color_icon_negative)" })),
        });
    }, [lang, snackbar]);
    const { results: sferumResults, isLoading: isSferumSearchLoading } = useSearchSferumContacts(query, onSearchLoadError);
    const openImportContactModal = useCallback(() => setImportContactModalOpen(true), []);
    const closeImportContactModal = useCallback(() => setImportContactModalOpen(false), []);
    const importContactButton = useCallback(() => (React.createElement("li", { className: "EduContactList__itemWrapper" },
        React.createElement("button", { className: "EduContactList__importButton", onClick: openImportContactModal },
            React.createElement("span", { className: "EduContactList__importButtonIcon" },
                React.createElement(Icon20UserAddOutline, null)),
            lang.use('me_contacts_import')))), [lang, openImportContactModal]);
    const phoneJoinModal = useModal();
    const handlePhoneJoin = useCallback((contactId) => {
        phoneJoinModal.close();
        navigate({
            kind: 'ConvoRoute',
            peerId: contactId,
            entrypoint: 'contacts_list',
        });
    }, [navigate, phoneJoinModal]);
    const handlePhoneJoinError = useCallback((error) => {
        let message = lang.use('me_phone_invite_contacts_unknown_error');
        if (error instanceof IApi.RequestError &&
            (error.code === API_ERROR_MESSAGES_SPAM_RESTRICTION ||
                error.code === API_ERROR_FLOOD)) {
            message = lang.use('me_phone_invite_contacts_spamblock_or_floodcontrol_error');
        }
        snackbar({
            before: (React.createElement(Icon20GlobeCrossOutline, { fill: "var(--vkui--color_text_negative)" })),
            message,
        });
    }, [snackbar, lang]);
    const { modal } = usePhoneJoin({
        onClose: phoneJoinModal.close,
        onSuccess: handlePhoneJoin,
        onError: handlePhoneJoinError,
        onMyNumberEntered: () => {
            goBack?.();
            phoneJoinModal.close();
            navigate({
                kind: 'ConvoRoute',
                peerId: viewer.id,
                entrypoint: 'contacts_list',
            });
        },
    });
    const writeByPhoneButton = useCallback(() => (React.createElement("li", { className: "EduContactList__itemWrapper" },
        React.createElement(InviteButton, { onClick: phoneJoinModal.open, className: "EduContactList__phoneJoin", buttonClassName: 'EduContactList__inviteButtonIcon--sferum' }, lang.use('me_phone_invite_contacts_action')))), [phoneJoinModal.open, lang]);
    const actionButtons = useMemo(() => {
        const buttons = [{ key: 'import', render: importContactButton }];
        buttons.push({ key: 'writeByPhone', render: writeByPhoneButton });
        return buttons;
    }, [importContactButton, writeByPhoneButton]);
    useEffect(() => {
        ;
        (async () => {
            const response = await apiFetch('messagesEdu.getContactList', {
                extended: 1,
                offset: 0,
                count: 100,
            }, { retries: 1 });
            const items = [];
            response.sections?.forEach((section) => {
                section.peers.forEach((rawPeerId) => {
                    const peerId = Peer.resolveId(rawPeerId);
                    if (Peer.isUserPeerId(peerId) || Peer.isContactPeerId(peerId)) {
                        items.push({
                            organizationId: section.organization_id,
                            organizationTitle: section.title,
                            peerId,
                            role: '',
                        });
                    }
                });
            });
            insertIntoCache({ profiles: response.profiles });
            setResults(items);
            setState(items.length === 0 ? 'empty' : 'results');
        })();
    }, [dispatch, insertIntoCache, apiFetch]);
    useEffect(() => {
        $input.current?.focus();
    }, []);
    const [scrollableNode, setScrollableNode] = useState(null);
    const [content, setContent] = useState(null);
    const scrollableProps = useMemo(() => ({
        ref: setScrollableNode,
    }), []);
    const contentProps = useMemo(() => ({
        className: 'ChannelsList__scrollbar-content',
        ref: setContent,
    }), []);
    const scrollPosition = useMemo(() => ({
        kind: 'Upper',
    }), 
    // При смене поискового запроса поднимает скролл наверх.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query]);
    const [virtualizerCore] = useState(() => new VirtualizerCore(VIRTUALIZER_CONFIG));
    const itemsKeys = useMemo(() => {
        const result = actionButtons.map(({ key }) => key);
        if (hasSferumSearchQuery) {
            sferumResults.forEach(({ peerId, organizationId, organizationTitle }) => result.push(`${peerId}_${organizationId ?? organizationTitle}`));
        }
        else {
            results.forEach(({ peerId, organizationId, organizationTitle }) => result.push(`${peerId}_${organizationId ?? organizationTitle}`));
        }
        return result;
    }, [actionButtons, results, hasSferumSearchQuery, sferumResults]);
    const { virtualizerState } = useVirtualScroll({
        virtualizerCore,
        wrapper: scrollableNode,
        content,
        options: {
            scrollPosition,
            itemsKeys,
            anchorAlign: 'scrollTop',
        },
    });
    const contentRenderer = () => {
        if (isSferumSearchLoading || state === 'loading') {
            return React.createElement(ContentRendererSkeleton, null);
        }
        return (React.createElement(ScrollbarProvider, { scrollableProps: scrollableProps, contentProps: contentProps, overflowX: "hidden" },
            React.createElement(VirtualScrollList, { virtualizerCore: virtualizerCore, virtualizerState: virtualizerState }, itemsKeys.map((key, index) => {
                return (React.createElement(VirtualScrollItem, { key: key, itemKey: key },
                    React.createElement(RowRenderer, { index: index, onSelect: onSelect, actionButtons: actionButtons, results: query ? sferumResults : results })));
            }))));
    };
    return (React.createElement("div", { className: cx('EduContactList') },
        state !== 'loading' && (React.createElement("div", { className: "EduContactList__search" },
            React.createElement(Search, { placeholder: lang.use('me_convo_list_search_placeholder'), getRef: $input, value: query, onChange: onChange, onKeyDown: onKeyDown, onFocus: onFocus, onBlur: onBlur, onReset: reset }))),
        (!hasSferumSearchQuery && state === 'empty') ||
            (hasSferumSearchQuery &&
                !isSferumSearchLoading &&
                sferumResults.length === 0) ? (React.createElement("div", { className: "EduContactList__contacts" },
            actionButtons.length > 0 && (React.createElement("ul", null, actionButtons.map(({ key, render }) => (React.createElement(Fragment, { key: key }, render()))))),
            React.createElement("div", { className: "EduContactList__noResults" }, lang.use(query ? 'me_search_empty_contacts' : 'me_contacts_empty')))) : (React.createElement("div", { className: "EduContactList__contacts" }, contentRenderer())),
        isImportContactModalOpen && (React.createElement(ImportContactModal, { onClose: closeImportContactModal })),
        phoneJoinModal.isActive && modal));
};
const RowRenderer = ({ index, results, onSelect, actionButtons, }) => {
    const peers = usePeers();
    if (index < actionButtons.length) {
        return actionButtons[index]?.render();
    }
    const offset = index - actionButtons.length;
    const peerIdWithSection = results[offset];
    if (!peerIdWithSection) {
        return null;
    }
    const { peerId, organizationTitle, role } = peerIdWithSection;
    const peer = peers.get(peerId);
    if (!peer || (peer.kind !== 'User' && peer.kind !== 'Contact')) {
        return null;
    }
    const roleFromPeer = peer.kind === 'User'
        ? peer.eduRoles?.organizations
            .find((org) => org.id === peerIdWithSection.organizationId)
            ?.roles.map(({ name }) => name)
            .join('; ')
        : null;
    const shouldDisplaySeparator = results[offset - 1]?.organizationTitle !== organizationTitle;
    return (React.createElement(React.Fragment, null,
        shouldDisplaySeparator && (React.createElement("div", { className: cx('EduContactList__sectionSeparator', {
                'EduContactList__sectionSeparator--first': offset === 0,
            }) }, organizationTitle)),
        React.createElement(RowRendererItem, { peer: peer, onSelect: onSelect, role: roleFromPeer || role, avatarSize: AVATAR_SIZE })));
};
const RowRendererItem = React.memo(({ peer, onSelect, avatarSize, role }) => {
    const { profileType } = useViewer();
    const peers = usePeers();
    const isEdu = Viewer.isEdu(profileType);
    const lastSeen = useLastSeen(peer.id);
    const onKeyDownHandler = (keyCombo, event) => {
        if (keyCombo === 'Enter') {
            event.stopPropagation();
            event.preventDefault();
            onSelect(peer.id);
        }
    };
    const renderVerifiedIcon = () => {
        if (peer.kind === 'Contact' || !peer.isVerified) {
            return null;
        }
        return (React.createElement("span", { className: "EduContactList__verifiedIcon" }, isEdu && peer.kind === 'User' && React.createElement(Icon16Education, null)));
    };
    const renderPeerDescription = () => {
        if (role) {
            return React.createElement("div", { className: "EduContactList__info" }, role);
        }
        if (lastSeen) {
            return React.createElement(OnlineStatus, { user: peer, className: "EduContactList__info" });
        }
        if (peer.kind === 'Contact' && peer.userId) {
            const user = Peer.safeGet(peers, peer.userId);
            if (user.kind === 'User' && user.eduRoles?.mainRole) {
                return (React.createElement("div", { className: "EduContactList__info" }, user.eduRoles?.mainRole));
            }
            return '';
        }
        if (peer.phone) {
            return (React.createElement(FormattedPhoneNumber, { phone: peer.phone, className: "EduContactList__info" }));
        }
        return null;
    };
    return (React.createElement("li", { className: "EduContactList__itemWrapper", key: peer.id },
        React.createElement("div", { className: "EduContactList__item", onClick: () => onSelect(peer.id), onKeyDown: onElementKeyDownFactory(onKeyDownHandler), tabIndex: 0, role: "button" },
            React.createElement("div", { className: "EduContactList__avatar" },
                React.createElement(Avatar, { peer: peer, size: avatarSize, withBirthday: true })),
            React.createElement("div", { className: "EduContactList__itemContent" },
                React.createElement("div", { className: "EduContactList__header" },
                    React.createElement("span", { className: "EduContactList__name" }, Peer.name(peer)),
                    renderVerifiedIcon()),
                renderPeerDescription()))));
});
const RowRendererItemSkeleton = () => {
    return (React.createElement("li", { className: "EduContactList__itemWrapper" },
        React.createElement("div", { className: "EduContactList__item ContactList__item--skeleton" },
            React.createElement("div", { className: "EduContactList__avatar" },
                React.createElement(FakeAvatar, null,
                    React.createElement(Skeleton, { width: AVATAR_SIZE, height: AVATAR_SIZE, circle: true }))),
            React.createElement("div", { className: "EduContactList__itemContent" },
                React.createElement("div", { className: "EduContactList__name" }, React.createElement(Skeleton, { width: 191, height: 16 })),
                React.createElement(Skeleton, { width: 80, height: 12 })))));
};
const ContentRendererSkeleton = () => {
    return [...Array(9).keys()].map((i) => React.createElement(RowRendererItemSkeleton, { key: i }));
};
//# sourceMappingURL=EduContactList.js.map