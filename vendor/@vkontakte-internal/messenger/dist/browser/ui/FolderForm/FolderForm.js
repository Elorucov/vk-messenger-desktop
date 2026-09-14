import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import * as Folder from '../../../core/model/Folder';
import * as Convo from '../../../core/model/Convo';
import { CONVOS_PER_PAGE } from '../../../core/config/config';
import './FolderForm.css';
import { FolderConvoListRow } from '../../ui/FolderConvoListRow/FolderConvoListRow';
import { useBrowserEnv } from '../../hooks/misc';
import { FolderAddButton } from '../../ui/FolderAddButton/FolderAddButton';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { FormItem, SimpleCell, Avatar, Switch } from '@vkontakte/vkui';
import { Icon24Cancel, Icon24MessageOutline, Icon24WorkOutline, Icon24UsersOutline, Icon24MessageUnreadTopOutline, } from '@vkontakte/icons';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import cx from 'classnames';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { getLengthWithEmoji } from '../../../core/utils/emoji';
import { useFetchConvosByIds } from '../../hooks/useFetchConvosByIds';
import { FieldGroupItem } from '../../ui/FieldGroup/FieldGroup';
export const FolderForm = ({ name, folderId, folderType, peerIds, folders, sublists, convosCache, listClassName, autoNameFocus = true, isRecommendedFolder = false, countFolder, onNameChange, onAddClick, onValidChange, onDeleteItem, onCountChange, onSubmit, }) => {
    const { lang } = useBrowserEnv();
    const { fetchConvosByIds } = useFetchConvosByIds();
    const folder = folders.find((f) => f.id === folderId);
    const $nameInput = useRef(null);
    const [nameBeyondLimit, setNameBeyondLimit] = useState(false);
    const folderSublists = useMemo(() => {
        if (!folder || !sublists) {
            return [];
        }
        return sublists.filter((sublist) => folder.sublists.has(sublist.type));
    }, [sublists, folder]);
    const getSublistIcon = (type) => {
        switch (type) {
            case 'business_notify':
                return React.createElement(Icon24WorkOutline, null);
            case 'unread':
                return React.createElement(Icon24MessageUnreadTopOutline, null);
            case 'personal':
                return React.createElement(Icon24UsersOutline, null);
            default:
                return React.createElement(Icon24MessageOutline, null);
        }
    };
    const updateName = useCallback((name) => {
        const length = getLengthWithEmoji(name);
        onNameChange(name);
        setNameBeyondLimit(length > Folder.FOLDER_NAME_LIMIT);
    }, [onNameChange]);
    const handleNameChange = useCallback((e) => {
        const value = e.target.value;
        updateName(value);
    }, [updateName]);
    const isChannelFolder = Folder.isChannelFolder(folderType);
    const isManagedGroupFolder = Folder.isManagedGroupFolder(folderType);
    const convos = useMemo(() => {
        return peerIds.reduce((acc, peerId) => {
            const convo = convosCache.get(peerId);
            if (convo && !Convo.isDeleted(convo)) {
                acc.push(convo);
            }
            return acc;
        }, []);
    }, [convosCache, peerIds]);
    /**
     * Собираем peerId, которые необходимо дозагрузить
     */
    const peerIdsToLoad = useMemo(() => {
        return peerIds
            .reduce((acc, peerId) => {
            const convo = convosCache.get(peerId);
            if (!convo) {
                acc.push(peerId);
            }
            return acc;
        }, [])
            .slice(0, CONVOS_PER_PAGE);
    }, [convosCache, peerIds]);
    const hasMore = useMemo(() => peerIdsToLoad.length !== 0, [peerIdsToLoad]);
    const isValid = name.trim().length > 0 &&
        !nameBeyondLimit &&
        (isRecommendedFolder || convos.length > 0);
    const isEditRestricted = isChannelFolder;
    useEffect(() => {
        onValidChange?.(isValid);
    }, [isValid, onValidChange]);
    useEffect(() => {
        updateName(name);
        if ($nameInput.current && autoNameFocus) {
            $nameInput.current.focus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (React.createElement("div", { className: "FolderForm" },
        React.createElement("form", { onSubmit: (e) => {
                // Не даем странице перегружаться.
                e.preventDefault();
                onSubmit();
            } },
            React.createElement(FormItem, { top: lang.use('me_folders_form_name_label'), className: cx('FolderForm__row', {
                    'FolderForm__row--disabled': isEditRestricted,
                }), status: nameBeyondLimit ? 'error' : 'default', bottom: !isEditRestricted && (React.createElement("div", { className: "FolderForm__subTitle" }, nameBeyondLimit
                    ? lang.use('me_folders_form_name_error_limit')
                    : lang.use('me_folders_form_name_limit'))), topComponent: "h5" },
                React.createElement(Input, { disabled: isEditRestricted, type: "text", ref: $nameInput, placeholder: isEditRestricted
                        ? name
                        : lang.use('me_folders_form_name_placeholder'), value: isEditRestricted ? undefined : name, onChange: handleNameChange })),
            (isChannelFolder || isManagedGroupFolder) && (React.createElement(FormItem, null,
                React.createElement(FieldGroupItem, { id: "countFolder", className: "FolderForm__checkbox", subtitle: lang.use('me_folders_form_count_subtitle'), after: React.createElement(Switch, { checked: countFolder, "aria-labelledby": "countFolder", onChange: (e) => onCountChange?.(e.target.checked) }) }, lang.use('me_folders_form_count_title')))),
            !isChannelFolder && !isManagedGroupFolder && (React.createElement(FormItem, { top: lang.use('me_folders_form_convos_label'), className: "FolderForm__row", topComponent: "h5" },
                React.createElement("div", { className: "FolderForm__convosWrapper" },
                    React.createElement(ScrollbarProvider, { overflowX: "hidden" },
                        React.createElement("ul", { className: cx('FolderForm__convosList', listClassName) },
                            React.createElement("li", null,
                                React.createElement(FolderAddButton, { onClick: onAddClick }, lang.use('me_folders_form_convos_action_change'))),
                            convos.map((convo) => (React.createElement("li", { key: convo.peerId },
                                React.createElement(FolderConvoListRow, { convo: convo, after: onDeleteItem && (React.createElement(Tooltip, { content: lang.use('me_folders_form_convo_remove_tooltip') },
                                        React.createElement("button", { type: "button", "aria-label": lang.use('me_folders_form_convo_remove_tooltip'), className: "FolderForm__deleteBtn", onClick: () => onDeleteItem(convo.peerId) },
                                            React.createElement(Icon24Cancel, null)))) })))),
                            folderSublists.map((sublist) => (React.createElement("li", { key: sublist.type },
                                React.createElement(SimpleCell, { disabled: true, subtitle: sublist.description, before: React.createElement(Avatar, { className: cx('FolderForm__sublistAvatar', {
                                            'FolderForm__sublistAvatar--businessNotify': sublist.type === 'business_notify',
                                            'FolderForm__sublistAvatar--unread': sublist.type === 'unread',
                                            'FolderForm__sublistAvatar--personal': sublist.type === 'personal',
                                        }), size: 40 }, getSublistIcon(sublist.type)) }, sublist.name)))),
                            hasMore && (React.createElement("li", { className: "FolderForm__loader" },
                                React.createElement(OptimizedSpinner, { onIntersection: () => fetchConvosByIds(peerIdsToLoad) })))))))))));
};
const Input = forwardRef(({ before, after, status = 'default', onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setFocus] = useState(false);
    const disabled = props.disabled;
    const handleFocus = useCallback((e) => {
        onFocus?.(e);
        setFocus(true);
    }, [onFocus]);
    const handleBlur = useCallback((e) => {
        onBlur?.(e);
        setFocus(false);
    }, [onBlur]);
    return (React.createElement("label", { className: cx('FolderForm__input', `FolderForm__input--${status}`, {
            'FolderForm__input--focus': isFocused,
            'FolderForm__input--disabled': disabled,
        }) },
        before && React.createElement("span", { className: "FolderForm__input-before" }, before),
        React.createElement("input", { ref: ref, onFocus: handleFocus, onBlur: handleBlur, ...props, className: "FolderForm__inputControl" }),
        after && React.createElement("span", null, after)));
});
//# sourceMappingURL=FolderForm.js.map