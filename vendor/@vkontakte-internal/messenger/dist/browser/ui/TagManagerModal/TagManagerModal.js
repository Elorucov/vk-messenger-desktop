import React from 'react';
import { Icon24CheckCircleOutline, Icon24ErrorCircleOutline, } from '@vkontakte/icons';
import { getColorClass } from '@vkontakte-internal/vkcom-kit';
import { useBrowserEnv, useDispatch, useOrganisers, useOwner, } from '../../hooks/misc';
import { useApiFetchMany, useApiFetchSeq } from '../../hooks/useApiFetch';
import { useSnackbar } from '../../hooks/useSnackbar';
import * as Tag from '../../../core/model/Tag';
import { getOwnerGroupId } from '../../../data/store/State';
import { BaseTagManagerModal, } from './BaseTagManagerModal';
export function TagManagerModal({ onClose, peerId, }) {
    const { lang } = useBrowserEnv();
    const apiFetchMany = useApiFetchMany();
    const apiFetchSeq = useApiFetchSeq();
    const dispatch = useDispatch();
    const organisers = useOrganisers();
    const owner = useOwner();
    const snackbar = useSnackbar();
    const bindTags = async (binds, groupId, peerId) => {
        await apiFetchMany(binds.map((bind) => ({
            method: 'groups.tagBind',
            params: {
                act: bind.isSelected ? 'bind' : 'unbind',
                group_id: groupId,
                tag_id: bind.id,
                user_id: peerId,
            },
        })), { retries: 3 });
    };
    const createTags = async (created, groupId) => {
        return await apiFetchSeq(created.map((tag) => ({
            method: 'groups.tagAdd',
            params: {
                group_id: groupId,
                tag_color: tag.color,
                tag_name: tag.name,
            },
        })), { retries: 3 });
    };
    const removeTags = async (removed, groupId) => {
        await apiFetchMany(removed.map((id) => ({
            method: 'groups.tagDelete',
            params: {
                group_id: groupId,
                tag_id: id,
            },
        })), { retries: 3 });
    };
    const updateTags = async (updated, groupId) => {
        const requestList = updated.reduce((acc, tag) => {
            if (tag.name) {
                acc.push({
                    method: 'groups.tagUpdate',
                    params: {
                        group_id: groupId,
                        tag_id: tag.id,
                        tag_name: tag.name,
                    },
                });
            }
            return acc;
        }, []);
        if (requestList.length) {
            await apiFetchMany(requestList, { retries: 3 });
        }
    };
    const handleSubmit = async (changes) => {
        const groupId = getOwnerGroupId(owner.id);
        if (!groupId) {
            return {
                ...(changes.created.length ? { created: false } : {}),
                ...(changes.removed.length ? { removed: false } : {}),
                ...(changes.updated.length ? { updated: false } : {}),
            };
        }
        const result = {
            ...(changes.created.length ? { created: true } : {}),
            ...(changes.removed.length ? { removed: true } : {}),
            ...(changes.updated.length ? { updated: true } : {}),
        };
        let tagsCount = organisers.tags.items.length;
        if (changes.removed.length) {
            try {
                await removeTags(changes.removed, groupId);
                tagsCount -= changes.removed.length;
            }
            catch (error) {
                result.removed = false;
            }
        }
        if (changes.created.length) {
            if (tagsCount + changes.created.length <= Tag.TAG_LIMIT) {
                try {
                    const response = await createTags(changes.created, groupId);
                    const createdTags = response.filter((tag) => !!tag);
                    if (createdTags?.length) {
                        dispatch({ type: 'TagsCreated', tags: createdTags });
                    }
                    result.created = response.map((item) => item ? Tag.resolveId(item.id) : null);
                    if (peerId) {
                        const requestList = changes.created.reduce((acc, tag, index) => {
                            if (tag.isSelected && response[index]) {
                                acc.push({
                                    id: response[index].id,
                                    isSelected: true,
                                });
                            }
                            return acc;
                        }, []);
                        if (requestList.length) {
                            await bindTags(requestList, groupId, peerId);
                        }
                    }
                    result.created = true;
                }
                catch (error) {
                    if (!Array.isArray(result.created)) {
                        result.created = false;
                    }
                }
            }
            else {
                result.created = false;
            }
        }
        if (changes.updated.length) {
            try {
                await updateTags(changes.updated, groupId);
                const updatedTags = changes.updated.reduce((acc, tag) => {
                    if (tag.name) {
                        acc.push({
                            id: tag.id,
                            name: tag.name,
                        });
                    }
                    return acc;
                }, []);
                if (updatedTags?.length) {
                    dispatch({ type: 'TagsUpdated', updates: updatedTags });
                }
                if (peerId) {
                    const requestList = changes.updated.reduce((acc, { id, isSelected }) => {
                        if (typeof isSelected === 'boolean') {
                            acc.push({ id, isSelected });
                        }
                        return acc;
                    }, []);
                    if (requestList.length) {
                        await bindTags(requestList, groupId, peerId);
                    }
                }
            }
            catch (error) {
                result.updated = false;
            }
        }
        if (Object.values(result).some((value) => value !== true)) {
            snackbar({
                before: (React.createElement(Icon24ErrorCircleOutline, { className: getColorClass('color_icon_negative') })),
                message: lang.use('me_tag_manager_modal_notification_error_message'),
            });
        }
        else {
            snackbar({
                before: (React.createElement(Icon24CheckCircleOutline, { className: getColorClass('color_icon_positive') })),
                message: lang.use('me_tag_manager_modal_notification_success_message'),
            });
        }
        return result;
    };
    return (React.createElement(BaseTagManagerModal, { onClose: onClose, onSubmit: handleSubmit, peerId: peerId, tags: organisers.tags.items }));
}
//# sourceMappingURL=TagManagerModal.js.map