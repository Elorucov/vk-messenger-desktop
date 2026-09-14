import '../../ui/ChannelPostMediaAttaches/ChannelPostMediaAttaches.css';
import React from 'react';
import * as Attach from '../../../core/model/Attach';
import cx from 'classnames';
import { AttachPhotosVideos } from '../../ui/AttachPhotosVideos/AttachPhotosVideos';
import { useFeatureFlags } from '../../hooks/misc';
export const ChannelPostMediaAttaches = ({ className, attaches, hidePublicVideoInfo, getMediaAttachLinkPayload, onWidthChange, }) => {
    const featureFlags = useFeatureFlags();
    const hasAttaches = attaches.photos ||
        attaches.videos ||
        (featureFlags.vkm_channel_stub_attach &&
            (attaches.channelStubPhoto ||
                attaches.channelStubVideo ||
                Attach.channelStubDocsWithPreview(attaches.channelStubDoc))) ||
        Attach.docsWithPreview(attaches.docs);
    if (!hasAttaches) {
        return null;
    }
    // Для поддержки сквозного просмотра передаем этот параметр,
    // в каналах, в отличии от беседы, не нужен точный position, достаточно передать положительный number
    const getMediaAttachLinkPayloadWrapper = () => getMediaAttachLinkPayload?.({ mediaViewerItemPosition: 1 });
    return (React.createElement("div", { className: cx('ChannelPostMediaAttaches', className) },
        React.createElement(AttachPhotosVideos, { attaches: attaches, hidePublicVideoInfo: hidePublicVideoInfo, getAdditionalLinkPayload: getMediaAttachLinkPayloadWrapper, onWidthChange: onWidthChange, attachmentsCount: Attach.count(attaches), isForwarded: false, isInChannel: true })));
};
//# sourceMappingURL=ChannelPostMediaAttaches.js.map