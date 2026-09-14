import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon20Add } from '@vkontakte/icons';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { Button, Flex, Placeholder } from '@vkontakte-internal/vkcom-kit';
import cx from 'classnames';
import { useBrowserEnv } from '../../hooks/misc';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import * as Peer from '../../../core/model/Peer';
import * as Tag from '../../../core/model/Tag';
import './BaseTagManagerModal.css';
import { TagInput } from './TagInput';
import { TagRemoveConfirmModal } from './TagRemoveConfirmModal';
export function BaseTagManagerModal({ onClose, onSubmit, peerId = Peer.resolveId(), tags: storedTags, }) {
    const { lang } = useBrowserEnv();
    const [tags, setTags] = useState(storedTags);
    const tagMap = useMemo(() => tags.reduce((acc, tag) => {
        acc.set(tag.id, tag);
        return acc;
    }, new Map()), [tags]);
    const nextId = useRef(-1);
    const [changes, setChanges] = useState({
        created: [],
        removed: new Set(),
        updated: new Map(),
    });
    const [isLoading, setIsLoading] = useState(false);
    const colors = useMemo(() => {
        const usedColors = new Set([
            ...tags.reduce((acc, tag) => {
                if (!changes.removed.has(tag.id)) {
                    acc.push(tag.color);
                }
                return acc;
            }, []),
            ...changes.created.map((tag) => tag.color),
        ]);
        return Tag.TAG_COLOR_LIST.map((color) => ({
            color,
            isFree: !usedColors.has(color),
        }));
    }, [changes.created, changes.removed, tags]);
    const isValid = useMemo(() => {
        if (changes.created.some((tag) => tag.name.length < 1 || tag.name.length > Tag.TAG_NAME_LIMIT)) {
            return false;
        }
        return ![...changes.updated.values()].some((tag) => typeof tag.name === 'string' &&
            (tag.name.length < 1 || tag.name.length > Tag.TAG_NAME_LIMIT));
    }, [changes.created, changes.updated]);
    const [removedTag, setRemovedTag] = useState(null);
    const createdCount = useRef(0);
    const listWrapperRef = useRef(null);
    const scrollableProps = useMemo(() => ({
        ref: (el) => {
            listWrapperRef.current = el;
        },
    }), []);
    const tagsCount = tags.length + changes.created.length - changes.removed.size;
    const handleRemove = (id, withChecking = false) => {
        const tag = tagMap.get(id);
        if (!tag) {
            return;
        }
        if (withChecking && tag.uses) {
            return setRemovedTag(tag);
        }
        setChanges((state) => {
            const nextState = {
                ...state,
                removed: new Set([...state.removed, id]),
            };
            const tag = state.updated.get(id);
            if (!tag) {
                return nextState;
            }
            nextState.updated = new Map(state.updated);
            nextState.updated.delete(id);
            return nextState;
        });
    };
    const handleUpdate = (id, property, value) => {
        setChanges((state) => {
            const tag = state.updated.get(id);
            if (tag?.[property] === value) {
                return state;
            }
            const nextState = {
                ...state,
                updated: new Map(state.updated),
            };
            nextState.updated.set(id, { ...tag, [property]: value });
            return nextState;
        });
    };
    const handleCreateNewTag = () => {
        const colorItem = colors.find((item) => item.isFree);
        if (!colorItem) {
            return;
        }
        setChanges((state) => ({
            ...state,
            created: [
                ...state.created,
                {
                    color: colorItem.color,
                    id: Tag.resolveId(nextId.current--),
                    isSelected: true,
                    name: '',
                },
            ],
        }));
    };
    const handleRemoveNewTag = (id) => {
        setChanges((state) => ({
            ...state,
            created: state.created.filter((tag) => tag.id !== id),
        }));
    };
    const handleUpdateNewTag = (id, property, value) => {
        setChanges((state) => {
            const index = state.created.findIndex((tag) => tag.id === id);
            const tag = state.created[index];
            if (!tag || tag[property] === value) {
                return state;
            }
            const nextState = {
                ...state,
                created: [...state.created],
            };
            nextState.created.splice(index, 1, {
                ...tag,
                [property]: value,
            });
            return nextState;
        });
    };
    const handleSubmit = () => {
        const isEqualsToInitial = (id, property, value) => {
            const tag = tagMap.get(id);
            switch (property) {
                case 'isSelected':
                    return tag?.peerIds?.has(peerId) === value;
                case 'name':
                    return tag?.name === value;
                default:
                    const _typeguard = property;
                    return false;
            }
        };
        setIsLoading(true);
        onSubmit({
            created: changes.created.map((tag) => ({
                color: tag.color,
                ...(tag.isSelected ? { isSelected: tag.isSelected } : {}),
                name: tag.name,
            })),
            removed: [...changes.removed],
            updated: [...changes.updated].reduce((acc, [id, tag]) => {
                const updatedTag = {
                    id,
                    ...(typeof tag.isSelected !== 'undefined' &&
                        !isEqualsToInitial(id, 'isSelected', tag.isSelected)
                        ? { isSelected: tag.isSelected }
                        : {}),
                    ...(typeof tag.name !== 'undefined' &&
                        !isEqualsToInitial(id, 'name', tag.name)
                        ? { name: tag.name }
                        : {}),
                };
                if (Object.keys(updatedTag).length > 1) {
                    acc.push(updatedTag);
                }
                return acc;
            }, []),
        }).then((result) => {
            if (Object.values(result).some((value) => value !== true)) {
                const { created } = result;
                if (Array.isArray(created)) {
                    setChanges((state) => {
                        const nextState = {
                            ...state,
                            created: [],
                            updated: new Map(state.updated),
                        };
                        created.forEach((id, index) => {
                            const tag = state.created[index];
                            if (tag) {
                                if (id) {
                                    nextState.updated.set(id, { isSelected: tag.isSelected });
                                }
                                else {
                                    nextState.created.push(tag);
                                }
                            }
                        });
                        return nextState;
                    });
                }
                setIsLoading(false);
            }
            else {
                onClose();
            }
        });
    };
    const handleCloseConfirmModal = () => {
        setRemovedTag(null);
    };
    const handleSubmitConfirmModal = (id) => {
        setRemovedTag(null);
        handleRemove(id);
    };
    useEffect(() => {
        /**
         * Обновления приходящие по ЛП в процессе выполнения запросов вызывают
         * перерисовку, поэтому на это время обновление тегов ограничено, а в случае
         * успешного завершения обновление и не потребуется, т.к. модалка закроется
         */
        if (!isLoading) {
            setTags(storedTags);
        }
    }, [isLoading, storedTags]);
    useEffect(() => {
        setChanges((state) => {
            const nextRemovedState = new Set(state.removed);
            const nextUpdatedState = new Map(state.updated);
            state.removed.forEach((id) => {
                if (!tagMap.has(id)) {
                    nextRemovedState.delete(id);
                }
            });
            state.updated.forEach((_, id) => {
                if (!tagMap.has(id)) {
                    nextUpdatedState.delete(id);
                }
            });
            const nextState = {
                ...state,
                removed: nextRemovedState.size !== state.removed.size
                    ? nextRemovedState
                    : state.removed,
                updated: nextUpdatedState.size !== state.updated.size
                    ? nextUpdatedState
                    : state.updated,
            };
            return nextState.removed !== state.removed ||
                nextState.updated !== state.updated
                ? nextState
                : state;
        });
    }, [tagMap]);
    useEffect(() => {
        if (changes.created.length > createdCount.current) {
            // Прокрутка вниз при создании новой метки
            listWrapperRef.current?.scrollTo({
                behavior: 'smooth',
                top: listWrapperRef.current.scrollHeight,
            });
        }
        createdCount.current = changes.created.length;
    }, [changes.created]);
    return (React.createElement(ModalInterface, { buttons: [
            React.createElement(Button, { appearance: "accent", key: "cancel", mode: "secondary", onClick: onClose, size: "m" }, lang.use('me_cancel')),
            React.createElement(Button, { appearance: "accent", disabled: !isValid, key: "submit", loading: isLoading, mode: "primary", onClick: handleSubmit, size: "m" }, lang.use('me_save')),
        ], closeLabel: lang.use('me_close'), onClose: onClose, panelClass: "BaseTagManagerModal", title: lang.use('me_tag_manager_modal_title'), withCustomLayout: true },
        React.createElement("div", { className: "BaseTagManagerModal__content" },
            React.createElement(ScrollbarProvider, { className: "BaseTagManagerModal__listWrapper", overflowX: "hidden", scrollableProps: scrollableProps },
                React.createElement(Flex, { className: "BaseTagManagerModal__list", direction: "column", gap: 12 },
                    tags.reduce((acc, tag) => {
                        if (!changes.removed.has(tag.id)) {
                            const updatedTag = changes.updated.get(tag.id);
                            acc.push(React.createElement(TagInput, { color: tag.color, id: tag.id, isCheckboxDisabled: !Tag.hasBit(tag), isDisabled: isLoading, isSelectable: !!peerId, isSelected: updatedTag?.isSelected ??
                                    tagMap.get(tag.id)?.peerIds.has(peerId), key: tag.id, onChange: (value) => handleUpdate(tag.id, 'name', value), onRemove: () => handleRemove(tag.id, true), onSelect: (value) => handleUpdate(tag.id, 'isSelected', value), value: updatedTag?.name ?? tag.name }));
                        }
                        return acc;
                    }, []),
                    changes.created.map((tag) => (React.createElement(TagInput, { color: tag.color, id: tag.id, isDisabled: isLoading, isSelectable: !!peerId, isSelected: tag.isSelected ?? tagMap.get(tag.id)?.peerIds.has(peerId), key: tag.id, onChange: (value) => handleUpdateNewTag(tag.id, 'name', value), onRemove: () => handleRemoveNewTag(tag.id), onSelect: (value) => handleUpdateNewTag(tag.id, 'isSelected', value), value: tag.name }))))),
            React.createElement("div", { className: cx('BaseTagManagerModal__addWrapper', !tagsCount && 'BaseTagManagerModal__addWrapper--alone') }, tagsCount < Tag.TAG_LIMIT ? (React.createElement(Button, { align: "left", before: React.createElement(Icon20Add, null), disabled: isLoading, mode: "link", onClick: handleCreateNewTag }, lang.use('me_tag_manager_modal_button_add'))) : (React.createElement(Placeholder, { className: "BaseTagManagerModal__limitPlaceholder", noPadding: true }, lang.use('me_tag_manager_modal_max_limit_message')))),
            removedTag && (React.createElement(TagRemoveConfirmModal, { onClose: handleCloseConfirmModal, onSubmit: () => handleSubmitConfirmModal(removedTag.id), tag: removedTag })))));
}
//# sourceMappingURL=BaseTagManagerModal.js.map