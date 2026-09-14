import '../../ui/ContactList/ContactList.css';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { Avatar } from '../../ui/Avatar/Avatar';
import { useBrowserEnv, useDispatch, usePeers, useLastSeen, useViewer, useStoreState, } from '../../hooks/misc';
import { Icon20GlobeCrossOutline, Icon20UserAddOutline } from '@vkontakte/icons';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import * as Peer from '../../../core/model/Peer';
import * as Trie from '../../../core/model/Trie';
import { ImportContactModal } from '../../ui/ImportContactModal/ImportContactModal';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { OnlineStatus } from '../../ui/OnlineStatus/OnlineStatus';
import { FormattedPhoneNumber } from '../../ui/FormattedPhoneNumber/FormattedPhoneNumber';
import { useSearchHandlers } from '../../hooks/useSearch';
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
const VIRTUALIZER_CONFIG = {
    sliceCount: CONVOS_PER_PAGE,
    preloadCount: CONVOS_PER_PAGE / 10,
    throttleDelay: 100,
    sliceCountIncrement: CONVOS_PER_PAGE / 2,
    sliceByViewAreaRatio: 2.5,
};
export const ContactList = ({ onSelect, goBack, }) => {
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const { navigate } = useRouter();
    const snackbar = useSnackbar();
    const { viewer } = useViewer();
    const { items, contacts, hasMore } = useStoreState('contacts');
    const $input = useRef(null);
    const [isImportContactModalOpen, setImportContactModalOpen] = useState(false);
    const [state, setState] = useState('loading');
    const [results, setResults] = useState([]);
    const notMatchedContacts = useMemo(() => new Map([...contacts].filter(([, item]) => {
        return item.userId === 0;
    })), [contacts]);
    const { query, onChange, onKeyDown, onFocus, onBlur, reset } = useSearchHandlers();
    const openImportContactModal = useCallback(() => setImportContactModalOpen(true), []);
    const closeImportContactModal = useCallback(() => setImportContactModalOpen(false), []);
    const importContactButton = useCallback(() => (React.createElement("li", { className: "ContactList__itemWrapper" },
        React.createElement("button", { className: "ContactList__importButton", onClick: openImportContactModal },
            React.createElement("span", { className: "ContactList__importButtonIcon" },
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
    const writeByPhoneButton = useCallback(() => (React.createElement("li", { className: "ContactList__itemWrapper" },
        React.createElement(InviteButton, { onClick: phoneJoinModal.open, className: "ContactList__phoneJoin" }, lang.use('me_phone_invite_contacts_action')))), [phoneJoinModal.open, lang]);
    const actionButtons = useMemo(() => {
        const buttons = [{ key: 'import', render: importContactButton }];
        buttons.push({ key: 'writeByPhone', render: writeByPhoneButton });
        return buttons;
    }, [importContactButton, writeByPhoneButton]);
    const searchIndex = useMemo(() => Trie.add(Trie.create(), [...items.values(), ...contacts.values()], (peer) => ({
        id: peer.kind === 'Contact' && peer.userId ? peer.userId : peer.id,
        strings: Trie.peerWords(peer),
    })), [contacts, items]);
    useEffect(() => {
        if (hasMore) {
            dispatch({
                type: 'LoadContactList',
                offset: 0,
            });
            return;
        }
        const results = [...items.keys(), ...notMatchedContacts.keys()];
        setResults(results);
        setState(results.length === 0 ? 'empty' : 'results');
    }, [hasMore, dispatch, items, notMatchedContacts]);
    useEffect(() => {
        $input.current?.focus();
    }, []);
    useEffect(() => {
        if (state === 'loading') {
            return;
        }
        if (query) {
            const matches = [...Trie.search(searchIndex, query).values()];
            setResults(matches);
            setState(matches.length ? 'results' : 'empty');
            return;
        }
        const results = [...items.keys(), ...notMatchedContacts.keys()];
        setResults(results);
        setState(results.length === 0 ? 'empty' : 'results');
    }, [notMatchedContacts, query, items, searchIndex, state]);
    const renderActionButton = useCallback((index) => actionButtons[index]?.render() || null, [actionButtons]);
    const [scrollableNode, setScrollableNode] = useState(null);
    const [content, setContent] = useState(null);
    const scrollableProps = useMemo(() => ({
        ref: setScrollableNode,
    }), []);
    const contentProps = useMemo(() => ({
        className: 'ContactList__scrollbar-content',
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
        results.forEach((contactId) => result.push(contactId.toString()));
        return result;
    }, [results, actionButtons]);
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
        if (state === 'loading') {
            return React.createElement(OptimizedSpinner, { className: "ContactList__loader" });
        }
        return (React.createElement(ScrollbarProvider, { scrollableProps: scrollableProps, contentProps: contentProps, overflowX: "hidden" },
            React.createElement(VirtualScrollList, { virtualizerCore: virtualizerCore, virtualizerState: virtualizerState }, itemsKeys.map((key, index) => {
                return (React.createElement(VirtualScrollItem, { key: key, itemKey: key },
                    React.createElement(RowRenderer, { index: index, onSelect: onSelect, actionButtons: actionButtons, contacts: notMatchedContacts, results: results })));
            }))));
    };
    return (React.createElement("div", { className: "ContactList" },
        state !== 'loading' && contacts.size > 0 && (React.createElement("div", { className: "ContactList__search" },
            React.createElement(Search, { placeholder: lang.use('me_convo_list_search_placeholder'), getRef: $input, value: query, onChange: onChange, onKeyDown: onKeyDown, onFocus: onFocus, onBlur: onBlur, onReset: reset }))),
        state === 'empty' ? (React.createElement("div", { className: "ContactList__contacts" },
            actionButtons.length > 0 && (React.createElement("ul", null, actionButtons.map((_, i) => renderActionButton(i)))),
            React.createElement("div", { className: "ContactList__noResults" }, lang.use(query ? 'me_search_empty_contacts' : 'me_contacts_empty')))) : (React.createElement("div", { className: "ContactList__contacts" }, contentRenderer())),
        isImportContactModalOpen && (React.createElement(ImportContactModal, { onClose: closeImportContactModal })),
        phoneJoinModal.isActive && modal));
};
const RowRenderer = ({ index, contacts, results, onSelect, actionButtons, }) => {
    const peers = usePeers();
    if (index < actionButtons.length) {
        return actionButtons[index]?.render();
    }
    const id = results[index - actionButtons.length];
    if (!id) {
        return null;
    }
    const peer = peers.get(id) || contacts.get(id);
    if (!peer || (peer.kind !== 'User' && peer.kind !== 'Contact')) {
        return null;
    }
    return React.createElement(RowRendererItem, { peer: peer, onSelect: onSelect });
};
const RowRendererItem = React.memo(({ peer, onSelect }) => {
    const lastSeen = useLastSeen(peer.id);
    const onKeyDownHandler = (keyCombo, event) => {
        if (keyCombo === 'Enter') {
            event.stopPropagation();
            event.preventDefault();
            onSelect(peer.id);
        }
    };
    return (React.createElement("li", { className: "ContactList__itemWrapper", key: peer.id },
        React.createElement("div", { className: "ContactList__item", onClick: () => onSelect(peer.id), onKeyDown: onElementKeyDownFactory(onKeyDownHandler), tabIndex: 0, role: "button" },
            React.createElement("div", { className: "ContactList__avatar" },
                React.createElement(Avatar, { peer: peer, size: 40, withBirthday: true })),
            React.createElement("div", { className: "ContactList__itemContent" },
                React.createElement("div", { className: "ContactList__name" }, Peer.name(peer)),
                lastSeen ? (React.createElement(OnlineStatus, { user: peer, className: "ContactList__info" })) : peer.phone ? (React.createElement(FormattedPhoneNumber, { phone: peer.phone, className: "ContactList__info" })) : null))));
});
//# sourceMappingURL=ContactList.js.map