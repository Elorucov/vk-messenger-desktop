import '../../ui/ComposerMentionAutocomplete/ComposerMentionAutocomplete.css';
import { VariableSizeList as VirtualList, } from 'react-window';
import { useInView } from 'react-intersection-observer';
import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { Highlighter } from '../../ui/Highlighter/Highlighter';
import { Icon28MentionOutline } from '@vkontakte/icons';
import { exhaustivenessCheck, words } from '../../../core/utils/misc';
import { Avatar } from '../../ui/Avatar/Avatar';
import cx from 'classnames';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import * as TextChunk from '../../../core/model/TextChunk';
import * as Trie from '../../../core/model/Trie';
import { useBrowserEnv, useFeatureFlags, useLock, useOwner, usePeers, useSelectConvo, useViewer, } from '../../hooks/misc';
import { isMentionContent } from '../../../core/utils/mentions';
import * as ChatMembers from '../../../core/model/ChatMembers';
import { EmployeeVacationMark } from '../../ui/EmployeeVacationMark/EmployeeVacationMark';
import { useSearchConversationMembers } from '../../hooks/useSearch';
import { FakeAvatar, Skeleton } from '@vkontakte-internal/vkcom-kit';
import { useMassMentionWarning } from '../../hooks/useComposer';
import { ComposerMassMentionWarning } from '../../ui/ComposerMassMentionWarning/ComposerMassMentionWarning';
import { ComposerMentionUnavailabilityText } from '../../ui/ComposerMentionUnavailabilityText/ComposerMentionUnavailabilityText';
import { mentionStartStructure } from '../../../core/model/Tokenizer/misc';
const AVATAR_SIZE = 40;
const SUGGESTION_HEIGHT = 50;
const SUGGESTIONS_OVERSCAN = 5;
const INITIAL_SEARCH_STATE = {
    query: '',
    selection: { from: 0, to: 0 },
    results: new Map(),
    selectedIndex: -1,
};
export const ComposerMentionAutocomplete = React.forwardRef(({ isInputFocused, searchText, textSelection, className, onInsert, searchSpecial, maxDisplayCount, loadMoreMembers, peerId, isCompactView, }, $mentionAutocomplete) => {
    const { lang } = useBrowserEnv();
    const owner = useOwner();
    const peersCache = usePeers();
    const featureFlags = useFeatureFlags();
    const isAllowedPeerKind = Peer.isChatPeerId(peerId);
    const { convoMembers, isMembersListFullyLoaded } = useSelectConvo(peerId, useCallback((convo) => {
        if (convo.kind !== 'ChatConvo') {
            return {};
        }
        return {
            convoMembers: convo.members,
            isMembersListFullyLoaded: ChatMembers.isFullyLoaded(convo.members),
        };
    }, []));
    const { count: membersCount, memberIds, members } = convoMembers ?? {};
    const peerIds = useMemo(() => {
        if (!memberIds) {
            return [];
        }
        return Array.from(memberIds.values()).reduce((acc, memberId) => {
            if (Peer.isUserPeerId(memberId) || Peer.isGroupPeerId(memberId)) {
                acc.push(memberId);
            }
            return acc;
        }, []);
    }, [memberIds]);
    const isMembersPageLoading = useLock('getConversationMembers').has(peerId);
    const isPaginationEnabled = !!featureFlags.vkm_members_search_pagination;
    const searchQuery = useMemo(() => getSearchQuery(searchText, textSelection, featureFlags.vkm_regex_parser), [featureFlags.vkm_regex_parser, searchText, textSelection]);
    const params = useMemo(() => ({
        /**
         * Наличие {query} включает серверный поиск
         */
        query: isAllowedPeerKind && isPaginationEnabled ? searchQuery : {},
        peerId,
    }), [isAllowedPeerKind, isPaginationEnabled, peerId, searchQuery]);
    const { results: serverRawResults, isLoading: isSearchLoading } = useSearchConversationMembers(params);
    const [searchState, setSearchState] = useState(INITIAL_SEARCH_STATE);
    const serverResults = useMemo(() => serverRawResults.reduce((acc, { member_id: id, is_restricted_to_write: isRestrictedToWrite }) => {
        const peer = Peer.safeGet(peersCache, Peer.resolveId(id));
        if (!peer || (peer.kind !== 'User' && peer.kind !== 'Group')) {
            return acc;
        }
        const peerId = peer.id.toString();
        const firstName = Peer.firstName(peer);
        const domain = Peer.domain(peer);
        const screenName = Peer.screenName(peer);
        const suggestion = {
            kind: 'Peer',
            id: peerId,
            name: Peer.name(peer),
            screenName,
            substitution: domain || `${screenName} (${firstName})`,
            peer,
            isRestrictedToWrite,
        };
        acc.set(peerId, suggestion);
        return acc;
    }, new Map()), [serverRawResults, peersCache]);
    const results = useMemo(() => Array.from(new Map([...searchState.results, ...serverResults]).values()), [searchState.results, serverResults]);
    const searchPeers = useMemo(() => peerIds.map((peerId) => Peer.safeGet(peersCache, peerId)), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [peerIds]);
    const getSearchFn = useCallback(() => {
        const searchItems = new Map();
        searchPeers.forEach((peer) => {
            if (peer.id === owner.id) {
                return;
            }
            const peerId = peer.id.toString();
            const firstName = Peer.firstName(peer);
            const domain = Peer.domain(peer);
            const screenName = Peer.screenName(peer);
            const isRestrictedToWrite = members?.get(peer.id)?.isRestrictedToWrite;
            searchItems.set(peerId, {
                kind: 'Peer',
                id: peerId,
                name: Peer.name(peer),
                screenName,
                substitution: domain || `${screenName} (${firstName})`,
                peer,
                isRestrictedToWrite,
            });
        });
        if (searchSpecial) {
            TextChunk.MASS_MENTIONS.forEach(({ variant, mentions }) => {
                const name = lang.use(`me_composer_autocomplete_${variant}`);
                mentions.forEach((mention) => {
                    searchItems.set(mention, {
                        kind: 'Special',
                        id: mention,
                        name,
                        screenName: mention,
                        substitution: mention,
                        variant,
                    });
                });
            });
        }
        const searchTree = Trie.add(Trie.create(), Array.from(searchItems.values()), (suggestion) => {
            switch (suggestion.kind) {
                case 'Peer': {
                    return {
                        id: suggestion.id,
                        strings: [
                            suggestion.substitution,
                            suggestion.id,
                            ...words(suggestion.name),
                        ],
                    };
                }
                case 'Special': {
                    return {
                        id: suggestion.id,
                        strings: [suggestion.id, ...words(suggestion.name)],
                    };
                }
                default:
                    exhaustivenessCheck(suggestion);
            }
        });
        return (searchQuery) => {
            const suggestionIds = [...Trie.search(searchTree, searchQuery).values()];
            const searchResults = new Map();
            const uniqueSpecialSuggestions = new Set();
            suggestionIds.forEach((suggestionId) => {
                const suggestion = searchItems.get(suggestionId);
                if (!suggestion) {
                    return;
                }
                switch (suggestion.kind) {
                    case 'Peer': {
                        searchResults.set(suggestionId, suggestion);
                        break;
                    }
                    case 'Special': {
                        // Убираем алиасы специальных ментинов, имеющих один variant
                        if (uniqueSpecialSuggestions.has(suggestion.name)) {
                            break;
                        }
                        uniqueSpecialSuggestions.add(suggestion.name);
                        searchResults.set(suggestionId, suggestion);
                        break;
                    }
                    default:
                        exhaustivenessCheck(suggestion);
                }
            });
            return searchResults;
        };
    }, [owner, searchPeers, lang, searchSpecial, members]);
    const reset = useCallback(() => {
        setSearchState(INITIAL_SEARCH_STATE);
    }, []);
    const accept = useCallback((suggestion) => {
        onInsert(`@${suggestion.substitution} `, searchState.selection);
        reset();
    }, [onInsert, searchState.selection, reset]);
    const acceptSelected = useCallback(() => {
        const suggestion = results[searchState.selectedIndex];
        if (!suggestion) {
            return;
        }
        accept(suggestion);
    }, [results, searchState.selectedIndex, accept]);
    const move = useCallback((dir) => {
        setSearchState((prev) => {
            const delta = {
                up: -1,
                down: 1,
            }[dir];
            const resultsCount = results.length;
            const index = (prev.selectedIndex + delta) % resultsCount;
            const selectedIndex = index >= 0 ? index : resultsCount - Math.abs(index);
            return {
                ...prev,
                selectedIndex,
            };
        });
    }, [results.length]);
    const $search = useRef();
    const $prevGetSearchFn = useRef(() => { });
    useEffect(() => {
        setSearchState((prev) => {
            const { query, startedAt } = searchQuery;
            if (query === undefined || startedAt === undefined) {
                return INITIAL_SEARCH_STATE;
            }
            const shouldUpdateSearchFn = $prevGetSearchFn.current !== getSearchFn;
            if (query && query === prev.query && !shouldUpdateSearchFn) {
                return prev;
            }
            /**
             * Обновляем функцию поиска только при наличии запроса и если
             * изменалась getSearchFn, так как в getSearchFn перестраивается
             * поисковое дерево и это затратно при большом количестве участников чата.
             */
            if (!$search.current || shouldUpdateSearchFn) {
                $prevGetSearchFn.current = getSearchFn;
                $search.current = getSearchFn();
            }
            const localResults = $search.current(query);
            return {
                query,
                results: localResults,
                selection: {
                    from: startedAt,
                    to: textSelection.to,
                },
                selectedIndex: query && query === prev.query ? prev.selectedIndex : 0,
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, getSearchFn]);
    useImperativeHandle($mentionAutocomplete, () => ({
        accept,
        acceptSelected,
        move,
        reset,
        hasSuggestions: () => results.length !== 0,
    }), [accept, acceptSelected, move, reset, results]);
    const warning = useMassMentionWarning({
        message: searchText,
        membersCount: membersCount ?? 0,
    });
    if ((!isInputFocused ||
        !isAllowedPeerKind ||
        (results.length === 0 && !isSearchLoading)) &&
        !warning.visible) {
        return null;
    }
    if (warning.visible) {
        return (React.createElement(ComposerMassMentionWarning, { membersCount: membersCount ?? 0, isCompactView: isCompactView, onClose: warning.onClose }));
    }
    const isEmptyResultsList = results.length === (searchSpecial ? TextChunk.MASS_MENTIONS.length : 0);
    const isMembersListLoading = !isSearchLoading && !!isMembersPageLoading;
    return (React.createElement(MentionSuggestionsList, { className: className, maxDisplayCount: maxDisplayCount, onSuggestionClick: accept, selectedIndex: searchState.selectedIndex, query: searchState.query, suggestions: results, isPaginationEnabled: isPaginationEnabled, isSearchLoading: isSearchLoading, isMembersListLoading: isMembersListLoading, isMembersListFullyLoaded: !!isMembersListFullyLoaded, isEmptyResultsList: isEmptyResultsList, loadMoreMembers: loadMoreMembers }));
});
const MentionSuggestionsList = ({ query, maxDisplayCount, suggestions, className, selectedIndex, onSuggestionClick, isPaginationEnabled, isSearchLoading, isMembersListLoading, isMembersListFullyLoaded, isEmptyResultsList, loadMoreMembers, }) => {
    const { ref: lastSkeletonRef, inView: isLastSkeletonInView } = useInView();
    const $list = useRef(null);
    useLayoutEffect(() => {
        if (!$list.current) {
            return;
        }
        $list.current.scrollToItem(selectedIndex);
    }, [selectedIndex]);
    const getItemKey = useCallback((index) => {
        const suggestion = suggestions[index];
        if (!suggestion) {
            return index;
        }
        return suggestion.id;
    }, [suggestions]);
    const showSingleSkeleton = isPaginationEnabled && isSearchLoading;
    const showMultipleSkeletons = isPaginationEnabled &&
        !query &&
        (isMembersListLoading || !isMembersListFullyLoaded);
    let suggestionCount = suggestions.length;
    // Если грузится поиск, то добавляем 1 скелетон, если загружаются участники, то 2.
    if (showSingleSkeleton) {
        suggestionCount += 1;
    }
    else if (showMultipleSkeletons) {
        suggestionCount += 2;
    }
    const listHeight = useMemo(() => Math.min(maxDisplayCount, suggestionCount) * SUGGESTION_HEIGHT, [maxDisplayCount, suggestionCount]);
    useEffect(() => {
        if (!isPaginationEnabled ||
            !isLastSkeletonInView ||
            isMembersListLoading ||
            query ||
            isMembersListFullyLoaded ||
            isEmptyResultsList) {
            return;
        }
        loadMoreMembers();
    }, [
        isLastSkeletonInView,
        isEmptyResultsList,
        isMembersListFullyLoaded,
        isMembersListLoading,
        isPaginationEnabled,
        loadMoreMembers,
        query,
    ]);
    return (React.createElement("div", { className: cx('MentionSuggestionsList', className) },
        React.createElement(ScrollbarProvider, { style: {
                height: listHeight,
            }, overflowX: "hidden" }, ({ scrollableRef, contentRef }) => (React.createElement(VirtualList, { direction: "ltr", ref: $list, height: listHeight, width: "100%", overscanCount: SUGGESTIONS_OVERSCAN, itemSize: () => SUGGESTION_HEIGHT, itemKey: getItemKey, itemCount: suggestionCount, outerRef: scrollableRef, innerRef: contentRef, itemData: {
                suggestions,
                selectedIndex,
                query,
                onSelect: onSuggestionClick,
                lastSkeletonRef,
            } }, RowItem)))));
};
const RowItem = ({ style, index, data: { onSelect, selectedIndex, suggestions, query, lastSkeletonRef }, }) => {
    const suggestion = suggestions[index];
    const onClick = useCallback(() => suggestion && onSelect(suggestion), [suggestion, onSelect]);
    if (!suggestion && suggestions.length <= index) {
        return (React.createElement("div", { style: style, ref: index === suggestions.length ? lastSkeletonRef : undefined },
            React.createElement(MentionSuggestionSkeleton, null)));
    }
    if (!suggestion) {
        // Невозможная ситуация
        return null;
    }
    return (React.createElement("div", { style: style, key: suggestion.id },
        React.createElement(MentionSuggestion, { isSelected: index === selectedIndex, onClick: onClick, suggestion: suggestion, query: query })));
};
const MentionSuggestionSkeleton = () => {
    return (React.createElement("div", { className: "MentionSuggestion MentionSuggestion--skeleton" },
        React.createElement("div", { className: "MentionSuggestion__avatar" },
            React.createElement(FakeAvatar, null,
                React.createElement(Skeleton, { width: AVATAR_SIZE, height: AVATAR_SIZE, circle: true }))),
        React.createElement("div", { className: "MentionSuggestion__name" },
            React.createElement(Skeleton, { width: 160, height: 16 })),
        React.createElement("div", { className: "MentionSuggestion__subTitle" },
            React.createElement(Skeleton, { width: 80, height: 8 }))));
};
const MentionSuggestion = React.memo(({ isSelected, suggestion, query = '', onClick }) => {
    const { lang } = useBrowserEnv();
    const { profileType, viewer } = useViewer();
    const { vkm_enable_schedule_edu } = useFeatureFlags();
    const isEdu = Viewer.isEdu(profileType);
    const renderAvatar = () => {
        switch (suggestion.kind) {
            case 'Peer': {
                return React.createElement(Avatar, { peer: suggestion.peer, size: AVATAR_SIZE });
            }
            case 'Special': {
                return (React.createElement("div", { className: cx('MentionSuggestion__specialIcon', `MentionSuggestion__specialIcon--${suggestion.variant}`) },
                    React.createElement(Icon28MentionOutline, null)));
            }
            default:
                exhaustivenessCheck(suggestion);
        }
    };
    const hasVacationMark = suggestion.kind === 'Peer' &&
        suggestion.peer &&
        suggestion.peer.kind === 'User' &&
        suggestion.peer.employeeWorkingState;
    return (React.createElement("div", { className: "MentionSuggestion", key: suggestion.id, tabIndex: isSelected ? 0 : -1, "aria-selected": isSelected, onMouseDown: (event) => event.preventDefault(), onClick: onClick },
        React.createElement("div", { className: "MentionSuggestion__avatar" }, renderAvatar()),
        React.createElement("div", { className: "MentionSuggestion__name" },
            React.createElement(Highlighter, { text: suggestion.name, search: query, strategy: "variative" })),
        React.createElement("div", { className: "MentionSuggestion__subTitle" },
            React.createElement("span", { className: "MentionSuggestion__screenName" },
                React.createElement(Highlighter, { text: '@' + suggestion.screenName, search: query, strategy: "variative" })),
            /**
             * Рисуем компонент если включен тоггл, если аккаунт учебный,
             * у нас нет ролей учителя, сотрудника или администратора
             */
            vkm_enable_schedule_edu &&
                suggestion.kind === 'Peer' &&
                suggestion.peer &&
                suggestion.peer.kind === 'User' &&
                isEdu &&
                !Peer.hasEduOrganizationalRoles(viewer) && (React.createElement(ComposerMentionUnavailabilityText, { peer: suggestion.peer })),
            suggestion.kind === 'Peer' &&
                suggestion.isRestrictedToWrite &&
                !hasVacationMark && (React.createElement("span", { className: "MentionSuggestion__restrictedToWriteNotice", title: lang.use('me_composer_autocomplete_restricted_to_write_notice') },
                React.createElement("span", null, "\u00A0\u1427\u00A0"),
                React.createElement("span", { className: "MentionSuggestion__restrictedToWriteNotice--danger" }, lang.use('me_composer_autocomplete_restricted_to_write_notice')))),
            hasVacationMark && suggestion.peer.kind === 'User' && (React.createElement(EmployeeVacationMark, { peer: suggestion.peer, hasSeparator: true, className: "MentionSuggestion__vacationMark" })))));
});
const getSearchQuery = (searchText, textSelection, withNewParserDetection) => {
    if (textSelection.from !== textSelection.to) {
        return {};
    }
    /**
     * Ищем начало меншена.
     * Для этого находим последнее вхождение @ или * до каретки.
     */
    const beforeCaret = searchText.slice(0, textSelection.to);
    const startedAt = Math.max(beforeCaret.lastIndexOf('@'), beforeCaret.lastIndexOf('*'));
    // Если нет символа меншена
    if (startedAt < 0) {
        return {};
    }
    const charBefore = searchText[startedAt - 1];
    /**
     * Если перед символом меншена есть текст, убираем автокомплит.
     * Чтобы не появлялся при вводе имейлов.
     * Так же убираем, если два символа @ / * подряд.
     */
    if (withNewParserDetection) {
        if (charBefore &&
            !new RegExp(mentionStartStructure, 'iu').test(charBefore)) {
            return {};
        }
    }
    else {
        if (charBefore &&
            (isAlphanumeric(charBefore) || charBefore === '@' || charBefore === '*')) {
            return {};
        }
    }
    // Получаем поисковую строку для автокомплита.
    const query = searchText.slice(startedAt + 1, textSelection.to);
    if (!isMentionContent(query)) {
        return {};
    }
    return { query, startedAt };
};
/**
 * Проверяет, что строка содержит только буквы и цифры.
 * Главная особенность имплементации в том, что функция учитывает
 * различные алфавиты.
 */
const isAlphanumeric = (str) => {
    return str
        .split('')
        .every((char) => /\d/.test(char) ||
        char.toLocaleLowerCase() !== char.toLocaleUpperCase());
};
//# sourceMappingURL=ComposerMentionAutocomplete.js.map