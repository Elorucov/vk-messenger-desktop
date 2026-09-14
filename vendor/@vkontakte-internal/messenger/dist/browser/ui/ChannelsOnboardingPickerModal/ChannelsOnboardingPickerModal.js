import { Button } from '@vkontakte/vkui';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import React, { useCallback, useId, useRef, useState, } from 'react';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalView } from '../../ui/ModalView/ModalView';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List } from 'react-window';
import './ChannelsOnboardingPickerModal.css';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { fromApiChannel } from '../../../data/converter/ChannelConverter';
import { ChannelsOnboardingListItem } from '../../ui/ChannelsOnboardingListItem/ChannelsOnboardingListItem';
import { useApiFetch } from '../../hooks/useApiFetch';
const DEFAULT_LIST_ITEM_HEIGHT = 60;
const ARCHIVED_CHANNELS_PER_REQUEST = 30;
export const ChannelsOnboardingPickerModal = ({ title, subtitle, handleSubmit, handleBack }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const $list = useRef(null);
    const [archivedChannels, setArchivedChannels] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [pickedChannelsIds, setPickedChannelsIds] = useState([]);
    const modalTitleId = useId();
    const featureFlags = useFeatureFlags();
    const rowHeight = () => DEFAULT_LIST_ITEM_HEIGHT;
    const rowKey = useCallback((index) => {
        const channel = archivedChannels[index];
        if (!channel) {
            return '';
        }
        return channel.id;
    }, [archivedChannels]);
    const fetchMoreChannels = async () => {
        const response = await apiFetch('channels.get', {
            count: ARCHIVED_CHANNELS_PER_REQUEST,
            offset_minor_sort_id: archivedChannels[archivedChannels.length - 1]?.minorSortId,
            offset_channel_id: archivedChannels[archivedChannels.length - 1]?.id,
            filter: 'archived',
            extended: 1,
        }, {
            retries: 3,
        });
        if (!response.items) {
            return;
        }
        const items = [];
        for (const apiChannel of response['items'] || []) {
            const group = response.groups?.find((item) => -item.id === apiChannel.channel.channel_id);
            if (!group) {
                throw new Error('С бэка не приходит нужная группа для канала');
            }
            const channel = fromApiChannel(featureFlags, apiChannel, group);
            items.push(channel);
        }
        setHasMore((response.total_count || 0) > items.length + archivedChannels.length);
        const itemsToPush = archivedChannels.length ? items.slice(1) : items;
        setArchivedChannels((channels) => [...channels, ...itemsToPush]);
    };
    const onChannelClick = (id) => {
        if (pickedChannelsIds.includes(id)) {
            return setPickedChannelsIds((ids) => ids.filter((el) => el !== id));
        }
        setPickedChannelsIds((ids) => [...ids, id]);
    };
    const onSubmit = () => {
        handleSubmit(pickedChannelsIds);
    };
    return (React.createElement(ModalView, { contextClass: "MEConfig" },
        React.createElement(ModalBackdrop, null,
            React.createElement(ModalPanel, { className: "ChannelsOnboardingPickerModal", ariaLabelledby: modalTitleId },
                React.createElement(ModalBody, { withCustomLayout: true },
                    React.createElement("div", { className: "ChannelsOnboardingPickerModal_content" },
                        React.createElement("div", { className: "ChannelsOnboardingPickerModal__head" },
                            React.createElement("h2", { className: "ChannelsOnboardingPickerModal__title", id: modalTitleId }, title),
                            React.createElement("div", { className: "ChannelsOnboardingPickerModal__description" }, subtitle)),
                        React.createElement("div", { className: "ChannelsOnboardingPickerModal__body" },
                            React.createElement(AutoSizer, null, (size) => (React.createElement(List, { ref: $list, height: size.height || 0, width: size.width || 0, itemData: {
                                    channels: archivedChannels,
                                    pickedChannelsIds,
                                    onIntersection: fetchMoreChannels,
                                    onChannelClick,
                                }, overscanCount: 10, itemCount: hasMore
                                    ? archivedChannels.length + 1
                                    : archivedChannels.length, itemKey: rowKey, itemSize: rowHeight, innerElementType: "ol" }, RowRenderer)))))),
                React.createElement(ModalFooter, null,
                    React.createElement("div", { className: "ChannelsOnboardingPickerModal__actions" },
                        handleBack && (React.createElement(Button, { className: "ChannelsOnboardingPickerModal__action", mode: "secondary", onClick: handleBack }, lang.use('global_back'))),
                        React.createElement(Button, { className: "ChannelsOnboardingPickerModal__action", mode: "primary", key: "submit", onClick: onSubmit, disabled: pickedChannelsIds.length === 0 }, lang.use('me_channels_onboarding_continue'))))))));
};
const RowRenderer = React.memo(({ index, style, data: { channels, pickedChannelsIds, onIntersection, onChannelClick }, }) => {
    if (index === channels.length) {
        return (React.createElement("div", { key: "loader", className: "ChannelsOnboardingPickerModal__itemsLoader", style: style },
            React.createElement(OptimizedSpinner, { onIntersection: onIntersection })));
    }
    const channel = channels[index];
    if (!channel) {
        // Этот сценарий невозможен
        return null;
    }
    const isActive = pickedChannelsIds.includes(channel.id);
    return (React.createElement("li", { key: channel.id, style: style },
        React.createElement(ChannelsOnboardingListItem, { channel: channel, isActive: isActive, onClick: onChannelClick })));
});
//# sourceMappingURL=ChannelsOnboardingPickerModal.js.map