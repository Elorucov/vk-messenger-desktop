import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { isParticipantGroup } from '@vkontakte-internal/calls-core';
import { useLangs } from '@vkontakte-internal/plugins';
import { Button, Div, DropdownActionSheet, DropdownActionSubSheet, Flex, getColorClass, Headline, Spacing, } from '@vkontakte-internal/vkcom-kit';
import { Icon20ArticleBoxOutline, Icon20Chain, Icon20DeleteOutline, Icon20LiveOutline, Icon20MessageOutline, Icon20PhoneOutline, Icon20QrCodeOutline, Icon20WriteOutline, Icon24MoreHorizontal, } from '@vkontakte/icons';
import * as CallHistoryItem from '../../../../components/CallHistoryItem';
import { useHistoryConfig } from '../../../../services/HistoryConfig';
import { Description } from './Description';
export function ScheduledCallRow({ call, isToday, ...props }) {
    const langs = useLangs();
    const { enableQRCode, enableQRCodeSferum, sferum, enableShortCredentials, enableShortCredentialsSferum } = useHistoryConfig();
    const isShortCredentialsEnabled = (enableShortCredentials && !sferum) || (enableShortCredentialsSferum && sferum);
    const isQrCodeEnabled = (enableQRCode && !sferum) || (enableQRCodeSferum && sferum);
    const isShortCredentialsShown = Boolean(call.short_credentials && isShortCredentialsEnabled);
    const handleEnter = () => props.onCallEnter?.(call);
    const handleDelete = () => props.onCallDelete?.(call);
    const handleCopyText = () => props.onCallCopyText?.(call);
    const handleCopyPlainLink = () => props.onCallCopyPlainLink?.(call);
    const handleCopyShortLink = () => props.onCallCopyShortLink?.(call);
    const handleCopyBroadcastLink = () => props.onBroadcastCopyLink?.(call);
    const handleShareQrCode = () => props.onCallShareQrCode?.(call);
    const handleEdit = () => props.onCallEdit?.(call);
    const handleGoToChat = () => props.onCallMessage?.(call);
    const actions = (_jsxs(_Fragment, { children: [_jsx(DropdownActionSheet.Item, { "data-testid": "calls_scheduled_calls_item_menu_join", onClick: handleEnter, before: _jsx(Icon20PhoneOutline, {}), children: langs.getLang('calls_history_join_call_button') }), _jsx(DropdownActionSheet.Item, { "data-testid": "calls_scheduled_calls_item_menu_edit", onClick: handleEdit, before: _jsx(Icon20WriteOutline, {}), children: langs.getLang('calls_edit_call') }), !isParticipantGroup(call.caller_id) && (_jsx(DropdownActionSheet.Item, { "data-testid": "calls_scheduled_calls_item_menu_goto_chat", onClick: handleGoToChat, before: _jsx(Icon20MessageOutline, {}), children: langs.getLang('calls_goto_chat') })), _jsx(DropdownActionSheet.Separator, {}), !isShortCredentialsShown && (_jsxs(Div, { mode: "vertical", spacing: 8, paddingTop: 0, paddingBottom: 0, children: [_jsx(Spacing, { size: 9 }), _jsx(Headline, { level: "2", className: getColorClass('color_text_secondary'), "data-testid": "calls_scheduled_calls_item_menu_copy", children: langs.getLang('calls_scheduled_copy_box') }), _jsx(Spacing, { size: 9 })] })), _jsx(DropdownActionSheet.Item, { "data-testid": "calls_scheduled_calls_item_menu_copy_invite", onClick: handleCopyText, before: _jsx(Icon20ArticleBoxOutline, {}), children: isShortCredentialsShown ? langs.getLang('calls_copy_text') : langs.getLang('calls_copy_invite') }), isShortCredentialsShown ? (_jsx(DropdownActionSubSheet, { before: _jsx(Icon20Chain, {}), sheet: _jsxs(_Fragment, { children: [_jsx(DropdownActionSubSheet.Item, { "data-testid": "calls_scheduled_calls_item_menu_copy_plain_link", onClick: handleCopyPlainLink, children: langs.getLang('calls_scheduled_calls_plain_link') }), _jsx(DropdownActionSubSheet.Item, { "data-testid": "calls_scheduled_calls_item_menu_copy_short_link", onClick: handleCopyShortLink, children: langs.getLang('calls_scheduled_calls_short_with_password') })] }), children: langs.getLang('calls_scheduled_calls_join_link') })) : (_jsx(DropdownActionSheet.Item, { "data-testid": "calls_scheduled_calls_item_menu_copy_link", onClick: handleCopyPlainLink, before: _jsx(Icon20Chain, {}), children: langs.getLang('calls_copy_call_link') })), call.broadcast?.video_id && (_jsx(DropdownActionSheet.Item, { "data-testid": "calls_scheduled_calls_item_menu_copy_broadcast_link", onClick: handleCopyBroadcastLink, before: _jsx(Icon20LiveOutline, {}), children: langs.getLang('calls_copy_broadcast_link') })), isQrCodeEnabled && (_jsx(DropdownActionSheet.Item, { "data-testid": "calls_scheduled_calls_item_menu_share_qr_code", onClick: handleShareQrCode, before: _jsx(Icon20QrCodeOutline, {}), children: langs.getLang('calls_share_qr_code') })), _jsx(DropdownActionSheet.Separator, {}), _jsx(DropdownActionSheet.Item, { "data-testid": "calls_scheduled_calls_item_menu_delete", onClick: handleDelete, before: _jsx(Icon20DeleteOutline, {}), type: "destructive", children: langs.getLang('calls_delete') })] }));
    const photo = call.group?.photo_50 || call.chat?.photo_50;
    const labelId = `${call.call_id}_${call.caller_id}`;
    return (_jsx(CallHistoryItem.Item, { avatar: _jsx(CallHistoryItem.Avatar, { src: photo, alt: call.name || '' }), hint: _jsx(Description, { call: call, isToday: isToday, isTomorrow: props.isTomorrow }), title: call.name, actions: [
            isToday && (_jsx(Flex.Item, { children: _jsx(Button, { "data-testid": "calls_scheduled_calls_item_join", onClick: handleEnter, mode: "secondary", "aria-describedby": labelId, size: "m", children: langs.getLang('calls_history_join_call_button') }) }, "today_button")),
            _jsx(Flex.Item, { children: _jsx(CallHistoryItem.DropdownMenu, { dataTestId: "calls_scheduled_calls_item_menu_root", content: actions, children: _jsx(CallHistoryItem.ActionButton, { "data-testid": "calls_scheduled_calls_item_menu_button", label: langs.getLang('calls_actions'), "aria-describedby": labelId, children: _jsx(Icon24MoreHorizontal, {}) }) }) }, "dropdown"),
        ], dataTestId: "calls_scheduled_calls_item" }));
}
//# sourceMappingURL=ScheduledCallRow.js.map