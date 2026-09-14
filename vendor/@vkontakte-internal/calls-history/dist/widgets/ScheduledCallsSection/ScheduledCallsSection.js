import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { CallStatSource, useCallsBridge, useNavigationContext, } from '@vkontakte-internal/calls-core';
import { createWidget } from '@vkontakte-internal/di';
import { useLangs } from '@vkontakte-internal/plugins';
import { Group, Header, HeaderLayout, Placeholder, Skeleton, Spacing } from '@vkontakte-internal/vkcom-kit';
import { copyTextToClipboard } from '@vkontakte/vkjs';
import { useCallback, useState } from 'react';
import { useHistoryConfig } from '../../services/HistoryConfig';
import { Header as HeaderComponent, ScheduledCallRow } from './components';
import { ScheduledCallsSectionModelProvider, useScheduledCallsSectionModel } from './models';
import { useCalendarEventDetails } from './hooks';
import { mapRecurrenceRule } from './helpers';
import { InfiniteScroll } from '../../components/InfiniteScroll';
const ScheduledCallsSectionView = observer(function ScheduledCallsSectionView() {
    const model = useScheduledCallsSectionModel();
    const langs = useLangs();
    const bridge = useCallsBridge();
    const { navigateToConvo } = useNavigationContext();
    const [timezone] = useState(() => new Intl.DateTimeFormat().resolvedOptions().timeZone);
    const details = useCalendarEventDetails({ meParticipant: model.localProfile ?? undefined });
    const { sferum, enableShortCredentials, enableShortCredentialsSferum } = useHistoryConfig();
    const isShortCredentialsEnabled = (enableShortCredentials && !sferum) || (enableShortCredentialsSferum && sferum);
    const handleCallEnter = useCallback((call) => {
        bridge.showJoinPopup(call.vk_join_link, CallStatSource.HISTORY);
    }, []);
    const handleCallCopyPlainLink = useCallback(async (call) => {
        if (!call.vk_join_link) {
            return;
        }
        await copyTextToClipboard(call.vk_join_link);
        model.showText(langs.getLang('calls_create_call_by_link_copied'));
    }, [langs.getLang, model.showText]);
    const handleCallCopyShortLink = useCallback(async (call) => {
        if (!call.short_credentials?.link_with_password) {
            return;
        }
        await copyTextToClipboard(call.short_credentials.link_with_password);
        model.showText(langs.getLang('calls_create_call_by_link_copied'));
    }, [langs.getLang, model.showText]);
    const handleCallShareQrCode = useCallback((call) => {
        const event = {
            callId: call.call_id,
            title: call.name || '',
            start: new Date((call.schedule?.time || 0) * 1000),
            timezone,
            duration: call.schedule?.duration || 0,
            joinLink: call.vk_join_link || '',
            repeatRule: mapRecurrenceRule(call.schedule?.recurrence_rule),
        };
        const dateText = details.getTitle(event);
        model.onShareQrCodeClick(event.joinLink, `${event.title} ${dateText}.png`);
    }, [model.onShareQrCodeClick, details]);
    const handleBroadcastCopyLink = useCallback(async (call) => {
        if (!call.broadcast?.video_id) {
            return;
        }
        const broadcastLink = await model.getBroadcastLink(call.broadcast);
        await copyTextToClipboard(broadcastLink);
        model.showText(langs.getLang('calls_broadcast_planning_link_copied'));
    }, [model.getBroadcastLink, langs.getLang, model.showText]);
    const handleCallCopyText = useCallback(async (call) => {
        const event = {
            callId: call.call_id,
            title: call.name || '',
            start: new Date((call.schedule?.time || 0) * 1000),
            timezone,
            duration: call.schedule?.duration || 0,
            joinLink: call.vk_join_link || '',
            repeatRule: mapRecurrenceRule(call.schedule?.recurrence_rule),
        };
        if (call.group?.name) {
            event.displayName = call.group.name;
        }
        const broadcastLink = call.broadcast?.video_id
            ? await model.getBroadcastLink(call.broadcast)
            : undefined;
        if (broadcastLink) {
            event.broadcastLink = broadcastLink;
        }
        await copyTextToClipboard(details.getDescription(event, isShortCredentialsEnabled));
        model.showText(langs.getLang('calls_create_call_by_link_text_copied'));
    }, [details, model.getBroadcastLink, langs.getLang, model.showText]);
    const handleCallMessage = useCallback((call) => {
        if (call.chat?.peer_id) {
            navigateToConvo(call.chat.peer_id);
        }
    }, [navigateToConvo]);
    const hasItems = !!model.allCalls.calls?.length;
    const isShowSkeleton = model.loading && !hasItems;
    const isShowEmptyList = !model.loading && !hasItems && model.isScheduledSection;
    const isShowScreen = hasItems || isShowEmptyList || isShowSkeleton;
    if (!isShowScreen) {
        return _jsx(_Fragment, {});
    }
    if (isShowSkeleton) {
        return (_jsx(Group, { children: _jsx(Skeleton, { height: model.skeletonHeight, borderRadius: 12 }) }));
    }
    const header = (_jsx(HeaderLayout, { aside: _jsx(HeaderComponent, { showOwnerPicker: model.isScheduledSection, onLinkClick: model.onLinkClick, ownerSelect: {
                options: model.ownerOptions,
                value: model.selectedOwnerId,
                onChange: (owner) => model.onOwnerChange(owner.id),
            } }), children: _jsx(Header, { "data-testid": "calls_scheduled_calls_header", children: langs.getLang('calls_scheduled') }) }));
    if (isShowEmptyList) {
        return (_jsx(Group, { header: header, children: isShowEmptyList && (_jsxs(_Fragment, { children: [_jsx(Spacing, { size: 20 }), _jsx(Placeholder, { children: langs.getLang('calls_history_scheduled_calls_list_stub') }), _jsx(Spacing, { size: 20 })] })) }));
    }
    return (_jsx(Group, { header: header, children: hasItems && (_jsx(InfiniteScroll, { hasMore: model.hasMore && model.isScheduledSection, loadMore: model.loadMore, children: model.allCalls.calls?.map((block, index) => (_jsx(Group, { mode: model.isScheduledSection && model.allCalls.calls.length > 1 ? 'card' : 'plain', header: _jsx(Header, { "data-testid": "calls_main_page_scheduled_calls_block_title", children: block.title }), children: block.calls.map((call) => (_jsx(ScheduledCallRow, { call: call, isToday: block.isToday, isTomorrow: block.isTomorrow, onCallEnter: handleCallEnter, onCallCopyPlainLink: handleCallCopyPlainLink, onCallCopyShortLink: handleCallCopyShortLink, onBroadcastCopyLink: handleBroadcastCopyLink, onCallCopyText: handleCallCopyText, onCallDelete: model.handleCallDelete, onCallShareQrCode: handleCallShareQrCode, onCallEdit: model.handleCallEdit, onCallMessage: handleCallMessage }, call.call_id + '-' + index))) }, block.title))) })) }));
});
export const ScheduledCallsSection = createWidget(ScheduledCallsSectionModelProvider, ScheduledCallsSectionView);
//# sourceMappingURL=ScheduledCallsSection.js.map