import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EMPTY_USER_ID, getIdForColorCalculation, isEmptyPeerId, isParticipantContact, peerIdToVkId, useNavigationContext, useVkmeContext, } from '@vkontakte-internal/calls-core';
import { useLangs } from '@vkontakte-internal/plugins';
import { Ranges } from '@vkontakte-internal/shared';
import { calcInitialsAvatarColor, DropdownActionSheet, Flex, Text, getColorClass, } from '@vkontakte-internal/vkcom-kit';
import { Icon12ArrowDownLeft, Icon12ArrowUpRight, Icon20DeleteOutline, Icon20LiveOutline, Icon20MessageOutline, Icon20UserOutline, Icon24MoreHorizontal, Icon24PhoneOutline, Icon24VideocamOutline, } from '@vkontakte/icons';
import { formatDuration, isDateToday, leadingZero } from '@vkontakte/vkjs';
import { memo, useMemo } from 'react';
import { getHistoryCallPeerId, getHistoryItemOwner } from '../../helpers/historyScreen';
import { useHistoryConfig } from '../../services/HistoryConfig';
import { HistoryCallMenuActionsEnum, } from '../../types';
import { CallUsersStack, getMemberForUserStack } from '../CallUsersStack';
import * as CallHistoryItem from '../CallHistoryItem';
export const getCallFinishTime = (langShortDate, finishedAt = 0) => {
    let finishTime = '';
    if (finishedAt) {
        const finishedAtDate = new Date(finishedAt);
        if (isDateToday(finishedAtDate)) {
            const minutes = leadingZero(finishedAtDate.getMinutes());
            finishTime = `${finishedAtDate.getHours()}:${minutes}`;
        }
        else {
            finishTime = finishedAt ? langShortDate(new Date(finishedAt)) : '';
        }
    }
    return finishTime;
};
const getRecordItemData = (langs, { title = '', photo = '', finished_at = 0, id = EMPTY_USER_ID, participants = [], participantsCount = 0, }) => {
    const href = id !== EMPTY_USER_ID ? '/im?sel=c' + id : '';
    const status = langs.getLang('calls_history_call_type_group_hint');
    const finishTime = getCallFinishTime(langs.compactDate.bind(langs), finished_at);
    let hint = '';
    if (participants.length) {
        hint = (_jsxs(Flex, { gap: "s", align: "center", children: [_jsx(CallUsersStack, { items: participants.map(getMemberForUserStack), size: "s" }), _jsx(Text, { children: langs.langReplace(langs.numeric(participantsCount, langs.getLang('calls_participant_management_count', true)), {
                        count: `${participantsCount}`,
                    }) }), finishTime && _jsx(Text, { children: "\u00B7" }), finishTime && _jsx(Text, { children: finishTime })] }));
    }
    else if (finishTime) {
        hint = (_jsx(Text, { children: langs.getLang('calls_history_call_type_group_time_hint').replace('{time}', finishTime) }));
    }
    const avatar = (_jsx(CallHistoryItem.Avatar, { "data-testid": "calls_history_list_item_avatar", nft: false, src: photo, alt: title }));
    return {
        title,
        href,
        hint,
        photo: avatar,
        status,
    };
};
const getFinishedAtDateAndTime = (finishedAt = 0) => {
    if (!finishedAt) {
        return { date: '', time: '' };
    }
    const date = new Date(finishedAt);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minutes = date.getMinutes();
    return {
        date: [leadingZero(day), leadingZero(month), year].join('.'),
        time: [leadingZero(hour), leadingZero(minutes)].join(':'),
    };
};
const getMemberItemData = (getLang, langShortDate, { name = '', photo, id = EMPTY_USER_ID, link = '', is_nft, peerId, is_inbound = false, finished_at = 0, reach_status = '', }) => {
    const gradientColor = photo ? undefined : calcInitialsAvatarColor(getIdForColorCalculation(peerId));
    const entityPhoto = (_jsx(CallHistoryItem.Avatar, { "data-testid": "calls_history_list_item_avatar", alt: name, gradientColor: gradientColor, name: name, nft: !!is_nft, src: photo }));
    const hintIcon = is_inbound ? _jsx(Icon12ArrowDownLeft, {}) : _jsx(Icon12ArrowUpRight, {});
    let finishTime = getCallFinishTime(langShortDate, finished_at);
    let hintText = '';
    let isImportant = false;
    if (is_inbound) {
        if (reach_status === 'CANCELLED_BY_INITIATOR') {
            hintText = getLang('calls_history_status_inb_cancelled_by_initiator');
            isImportant = true;
        }
        else if (reach_status === 'REACHED') {
            hintText = getLang('calls_history_status_inb_reached');
        }
        else if (reach_status === 'REJECTED_BY_RECEIVER') {
            hintText = getLang('calls_history_status_inb_reject_by_receiver');
        }
        else {
            hintText = getLang('calls_history_status_inb');
        }
    }
    else {
        if (reach_status === 'CANCELLED_BY_INITIATOR') {
            hintText = getLang('calls_history_status_out_cancelled_by_initiator');
        }
        else if (reach_status === 'REACHED') {
            hintText = getLang('calls_history_status_out_reached');
        }
        else if (reach_status === 'REJECTED_BY_RECEIVER') {
            hintText = getLang('calls_history_status_out_reject_by_receiver');
            isImportant = true;
        }
        else {
            hintText = getLang('calls_history_status_out');
        }
    }
    return {
        title: name,
        href: link || (id !== EMPTY_USER_ID ? '/id' + id : undefined),
        hint: (_jsxs(Flex, { align: "center", gap: 4, className: getColorClass(isImportant ? 'color_accent_red' : undefined), children: [_jsx(Flex.Item, { children: hintIcon }), _jsx(Flex.Item, { children: _jsx(Text, { children: getLang('calls_history_call_list_item_description')
                            .replace('%type', hintText)
                            .replace('%time', finishTime) }) })] })),
        photo: entityPhoto,
        status: hintText,
    };
};
const getAllBroadcasts = (call) => {
    if (call.type === 'merged' && call.items) {
        const uniqueIds = call.items.reduce((acc, record) => {
            if (record?.broadcast_recording_ids) {
                record.broadcast_recording_ids.forEach((id) => acc.add(id));
            }
            return acc;
        }, new Set());
        return Array.from(uniqueIds);
    }
    else {
        return call.broadcast_recording_ids || [];
    }
};
const CallHistoryListItemElement = ({ index, call, onMenuItemClick, selectedOwnerId = 0, profiles, onBroadcastClick, }) => {
    const langs = useLangs();
    const { isVkme } = useVkmeContext();
    const { member, chat } = getHistoryItemOwner(call, profiles);
    const { navigateToConvo } = useNavigationContext();
    const broadcasts = useMemo(() => {
        return getAllBroadcasts(call);
    }, [call]);
    const { enableBroadcastRecordsHistory, sferum, enableHistoryGroupUserStackPreview, anonymPhotoBaseUrls } = useHistoryConfig();
    const peerId = useMemo(() => getHistoryCallPeerId(call), [call]);
    const isContact = useMemo(() => isParticipantContact(peerId), [peerId]);
    const { title, photo, href, hint, status } = useMemo(() => {
        const { type, items } = call;
        const getItemData = () => {
            if (member) {
                return getMemberItemData(langs.getLang.bind(langs), langs.compactDate.bind(langs), {
                    ...member,
                    is_inbound: call.is_inbound,
                    finished_at: call.finished_at,
                    reach_status: call.reach_status,
                });
            }
            return getRecordItemData(langs, {
                title: call.record_title ?? chat?.title ?? '',
                photo: call.record_photo ?? chat?.photo_100 ?? '',
                finished_at: call.finished_at,
                id: chat?.id ?? EMPTY_USER_ID,
                participants: enableHistoryGroupUserStackPreview
                    ? call.participant_ids
                        ?.map((id) => profiles[id] ?? {
                        id: id,
                        peerId: id,
                        name: 'Anonymous',
                        // анонимные id прилетает с минусом, нужно убрать его, чтоб фото правильно подбиралось
                        photo: anonymPhotoBaseUrls[Math.abs(peerIdToVkId(id) % anonymPhotoBaseUrls.length)],
                    })
                        .filter(Boolean) ?? []
                    : [],
                participantsCount: call.participant_count,
            });
        };
        const itemData = getItemData();
        if (type === 'merged') {
            itemData.title += ` (${items?.length})`;
        }
        return itemData;
    }, [call, chat, member, profiles]);
    const statusElement = useMemo(() => {
        const { started_at, finished_at } = call;
        let duration = '';
        if (started_at && finished_at) {
            duration = formatDuration(Math.floor((finished_at - started_at) / 1000));
        }
        const { date, time } = getFinishedAtDateAndTime(finished_at);
        return _jsx(CallHistoryItem.Status, { date: date, time: time, status: status, duration: duration }, date);
    }, [call, status]);
    const actions = useMemo(() => {
        const { can_download_call_join_history } = call;
        const actions = [statusElement];
        const getMenuAction = (type, selectedOwnerId) => () => onMenuItemClick(call, type, index, selectedOwnerId);
        if (can_download_call_join_history && !isContact) {
            actions.push(_jsx(CallHistoryItem.DropdownMenuAction, { icon: _jsx(Icon20UserOutline, {}), text: langs.getLang('calls_history_dropdown_item_participants'), onClick: getMenuAction(HistoryCallMenuActionsEnum.PARTICIPANTS), dataTestId: "calls_history_list_item_menu_item" }, "participants"));
        }
        if (broadcasts.length && !isContact && (sferum || enableBroadcastRecordsHistory)) {
            actions.push(_jsx(CallHistoryItem.DropdownMenuAction, { icon: _jsx(Icon20LiveOutline, {}), text: langs.getLang('calls_history_dropdown_item_broadcasts'), onClick: () => {
                    onBroadcastClick({
                        broadcasts,
                        ownerId: selectedOwnerId,
                        callTitle: title,
                        callId: call.call_id,
                    });
                }, dataTestId: "calls_history_list_item_menu_item" }, "broadcasts"));
        }
        if (!isEmptyPeerId(peerId) && !isContact) {
            actions.push(_jsx(CallHistoryItem.DropdownMenuAction, { icon: _jsx(Icon20MessageOutline, {}), text: langs.getLang('calls_history_dropdown_item_message'), onClick: getMenuAction(HistoryCallMenuActionsEnum.MESSAGE), dataTestId: "calls_history_list_item_menu_item" }, "message"));
            actions.push(_jsx(DropdownActionSheet.Separator, {}, "separator"));
        }
        actions.push(_jsx(CallHistoryItem.DropdownMenuAction, { icon: _jsx(Icon20DeleteOutline, {}), text: langs.getLang('calls_history_dropdown_item_delete'), onClick: getMenuAction(HistoryCallMenuActionsEnum.DELETE, selectedOwnerId), dataTestId: "calls_history_list_item_menu_item" }, "delete"));
        return actions;
    }, [call, isContact, peerId, title, broadcasts, selectedOwnerId, index, statusElement]);
    const onCallsRichCellClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isVkme || !href) {
            return;
        }
        navigateToConvo(peerIdToVkId(peerId));
    };
    const isAnonymousPeerId = Ranges.isAnonymousCallPeerId(peerIdToVkId(peerId));
    const canCall = (!isEmptyPeerId(peerId) && !isAnonymousPeerId && !isContact && !chat?.left_or_kicked) || call.join_link;
    return (_jsx(CallHistoryItem.Item, { avatar: photo, hint: hint || langs.getLang('calls_history_call_type_group_hint'), href: href, title: title, onClick: onCallsRichCellClick, actions: [
            canCall && (_jsx(Flex.Item, { children: _jsx(CallHistoryItem.ActionButton, { "data-testid": "calls_history_list_audiocall", label: `${langs.getLang('calls_history_dropdown_item_audio')} ${title}`, onClick: () => onMenuItemClick(call, HistoryCallMenuActionsEnum.AUDIO, index, selectedOwnerId), description: langs.getLang('calls_history_join_with_audio'), children: _jsx(Icon24PhoneOutline, {}) }, "call") }, "call")),
            canCall && (_jsx(Flex.Item, { children: _jsx(CallHistoryItem.ActionButton, { "data-testid": "calls_history_list_videocall", label: `${langs.getLang('calls_history_dropdown_item_video')} ${title}`, onClick: () => onMenuItemClick(call, HistoryCallMenuActionsEnum.VIDEO, index, selectedOwnerId), description: langs.getLang('calls_history_join_with_video'), children: _jsx(Icon24VideocamOutline, {}) }, "video") }, "video")),
            _jsx(Flex.Item, { children: _jsx(CallHistoryItem.DropdownMenu, { content: actions, dataTestId: "calls_history_list_item_menu", children: _jsx(CallHistoryItem.ActionButton, { label: langs.getLang('calls_actions'), "data-testid": "calls_history_list_item_menu_button", children: _jsx(Icon24MoreHorizontal, {}) }) }, "dropdown") }, "dropdown"),
        ], dataTestId: "calls_history_list_item" }));
};
export const CallHistoryListItem = memo(CallHistoryListItemElement);
//# sourceMappingURL=CallHistoryListItem.js.map