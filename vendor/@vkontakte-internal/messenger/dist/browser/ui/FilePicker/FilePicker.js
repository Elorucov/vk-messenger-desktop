import '../../ui/FilePicker/FilePicker.css';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useBrowserEnv, useCommunityMessagingWithToggle, useOwner, } from '../../hooks/misc';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { debounce, formatFileSize, isSameMonth } from '../../../core/utils/misc';
import { Icon16SearchOutline, Icon24AddOutline } from '@vkontakte/icons';
import { Input } from '@vkontakte/vkui';
import { fromApiDoc } from '../../../data/converter/AttachConverter';
import cx from 'classnames';
import { AttachDoc } from '../../ui/AttachDoc/AttachDoc';
import { useNow } from '../../hooks/useNow';
import { useApiFetch } from '../../hooks/useApiFetch';
const FILES_PAGE_COUNT = 50;
export const FilePicker = ({ onClose, setAttachments, addFileAttachments, selected = [], }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const owner = useOwner();
    const now = useNow();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const $inputRef = useRef(null);
    const [documents, setDocuments] = useState({
        items: new Map(),
        hasMore: false,
    });
    const [query, setQuery] = useState('');
    const [isLoading, setLoading] = useState(true);
    const loadFiles = useCallback(async (query = '', offset = 0) => {
        try {
            const response = query.length > 0
                ? await apiFetch('docs.search', {
                    q: query,
                    search_own: isCommunityMessaging ? undefined : 1,
                    owner_id: isCommunityMessaging ? owner.id : undefined,
                    count: FILES_PAGE_COUNT,
                    offset,
                })
                : await apiFetch('docs.get', {
                    count: FILES_PAGE_COUNT,
                    offset,
                    owner_id: isCommunityMessaging ? owner.id : undefined,
                });
            const results = response.items
                .map((apiDoc) => fromApiDoc(apiDoc))
                .filter((doc) => doc !== undefined);
            // @todo убрать проверку с lastElementId после фикса бага ME-34267
            const lastElementId = results[results.length - 1]?.id;
            setDocuments((prevState) => {
                const items = results.reduce((acc, doc) => {
                    return acc.set(doc.id, doc);
                }, new Map(offset > 0 ? prevState.items : []));
                const hasMore = items.size < response.count &&
                    (!lastElementId || !prevState.items.has(lastElementId));
                return {
                    items,
                    hasMore,
                };
            });
            setLoading(false);
        }
        catch (error) { }
    }, [apiFetch, isCommunityMessaging, owner.id]);
    const searchDebounced = useMemo(() => debounce(loadFiles, 2000, false), [loadFiles]);
    useEffect(() => {
        searchDebounced(query);
    }, [query, searchDebounced]);
    useEffect(() => {
        return () => searchDebounced.cancel();
    }, [searchDebounced]);
    const handleAttachSelect = useCallback((doc) => {
        onClose();
        setAttachments({ docs: [doc] });
    }, [setAttachments, onClose]);
    const handleSelectFile = useCallback(() => {
        if (!$inputRef.current) {
            return;
        }
        $inputRef.current.value = '';
        $inputRef.current.click();
    }, []);
    const handleInputChange = useCallback(({ target: { files: fileList } }) => {
        const files = Array.from(fileList || []);
        if (!files.length) {
            return;
        }
        onClose();
        addFileAttachments(files, { asFiles: true });
    }, [addFileAttachments, onClose]);
    const getSeparatorTitle = useCallback((doc, prevDoc) => {
        const isMyDoc = owner.id === doc.ownerId;
        const date = lang.use('me_month_year_date', {
            now,
            date: doc.date * 1000,
            genMonths: false,
        });
        if (!prevDoc) {
            return isMyDoc ? date : lang.use('me_files_global_search');
        }
        if (isMyDoc && !isSameMonth(doc.date * 1000, prevDoc.date * 1000)) {
            return date;
        }
        if (!isMyDoc && prevDoc?.ownerId === owner.id) {
            return lang.use('me_files_global_search');
        }
        return '';
    }, [lang, now, owner.id]);
    const modalContent = () => {
        if (isLoading) {
            return React.createElement(OptimizedSpinner, { className: "FilePicker__spinner" });
        }
        if (documents.items.size === 0) {
            return (React.createElement("div", { className: "FilePicker__empty" }, lang.use('me_files_empty_list_placeholder')));
        }
        return (React.createElement("div", { className: "FilePicker__items" },
            [...documents.items.values()].map((doc, i) => {
                return (React.createElement(FilePickerRow, { key: doc.id, doc: doc, separator: getSeparatorTitle(doc, [...documents.items.values()][i - 1]), onClick: handleAttachSelect, isSelected: !!selected.find(({ id }) => id === doc.id) }));
            }),
            documents.hasMore && (React.createElement(OptimizedSpinner, { className: "FilePicker__spinner", onIntersection: () => searchDebounced(query, documents.items.size) }))));
    };
    return (React.createElement("div", { className: "FilePicker", onDragEnter: onClose },
        React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), title: React.createElement("span", { className: "FilePicker__title" }, lang.use('me_files_title')), panelClass: "FilePicker__panel", withCustomLayout: true },
            React.createElement("div", { className: "FilePicker__uploader" },
                React.createElement("div", { className: "FilePicker__uploaderText", onClick: handleSelectFile },
                    React.createElement(Icon24AddOutline, null),
                    lang.use('me_files_upload_new'))),
            React.createElement("div", { className: "FilePicker__search" },
                React.createElement(Input, { before: React.createElement(Icon16SearchOutline, { className: "FilePicker__searchIcon" }), className: "FilePicker__searchInput", size: 32, placeholder: lang.use('me_search'), value: query, onChange: (e) => setQuery(e.target.value) })),
            modalContent(),
            React.createElement("input", { ref: $inputRef, className: "FilePicker__input", type: "file", multiple: true, onChange: handleInputChange, accept: "*" }))));
};
const FilePickerRow = ({ doc, separator, onClick, isSelected, }) => {
    const { lang } = useBrowserEnv();
    const now = useNow();
    const textDate = lang.use('global_short_date', {
        now,
        date: doc.date * 1000,
    });
    const fileSize = formatFileSize(doc.size);
    const extension = doc.ext.toUpperCase();
    const className = cx('FilePicker__item', {
        'FilePicker__item--selected': isSelected,
    });
    return (React.createElement(React.Fragment, null,
        separator && (React.createElement("div", { className: "FilePicker__subtitleSeparator" }, separator)),
        React.createElement("button", { className: className, onClick: isSelected ? undefined : () => onClick(doc) },
            React.createElement(AttachDoc, { doc: doc, subtitle: `${extension} · ${fileSize} · ${textDate}`, isClickDisabled: true, className: 'FilePicker__document' }))));
};
//# sourceMappingURL=FilePicker.js.map