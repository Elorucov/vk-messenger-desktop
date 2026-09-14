import { jsx as _jsx } from "react/jsx-runtime";
import { externalIdToString } from '@vkontakte-internal/calls-core';
import { Icon16CamSlash, Icon16Hand, Icon16MicrophoneSlash, Icon16ArrowUpRectangle, Icon16Question, Icon16Videocam, Icon16Microphone, } from '@vkontakte/icons';
import { getColorClass } from '@vkontakte-internal/vkcom-kit';
export const createMetaIcons = ({ externalId, isHandRaised, isHelpRequested, isScreenSharingEnabled, isAudioEnabled, isVideoEnabled, }) => {
    const key = externalIdToString(externalId);
    const meta = [];
    if (isHelpRequested) {
        meta.push(_jsx(Icon16Question, { className: getColorClass('color_accent_orange') }, `${key}-help-request`));
    }
    if (isScreenSharingEnabled) {
        meta.push(_jsx(Icon16ArrowUpRectangle, { className: getColorClass('color_icon_secondary') }, `${key}-screen`));
    }
    if (isHandRaised) {
        meta.push(_jsx(Icon16Hand, { className: getColorClass('color_icon_secondary') }, `${key}-hand`));
    }
    if (isAudioEnabled) {
        meta.push(_jsx(Icon16Microphone, { className: getColorClass('color_icon_secondary') }, `${key}-mic`));
    }
    else {
        meta.push(_jsx(Icon16MicrophoneSlash, { className: getColorClass('color_icon_secondary') }, `${key}-mic`));
    }
    if (isVideoEnabled) {
        meta.push(_jsx(Icon16Videocam, { className: getColorClass('color_icon_secondary') }, `${key}-video`));
    }
    else {
        meta.push(_jsx(Icon16CamSlash, { className: getColorClass('color_icon_secondary') }, `${key}-video`));
    }
    return meta;
};
//# sourceMappingURL=createMetaIcons.js.map