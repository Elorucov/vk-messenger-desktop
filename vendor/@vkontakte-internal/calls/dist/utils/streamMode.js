import { jsx as _jsx } from "react/jsx-runtime";
import { Icon16Videocam, Icon16LogoVkVideo, Icon16ArrowUpRectangle, Icon16ScribblePencilRectangle, } from '@vkontakte/icons';
import { MediaType } from '@vkontakte/calls-sdk';
export const getStreamModeIcon = (type) => {
    switch (type) {
        case MediaType.STREAM:
        case MediaType.MOVIE: {
            return _jsx(Icon16LogoVkVideo, {});
        }
        case MediaType.SCREEN: {
            return _jsx(Icon16ArrowUpRectangle, {});
        }
        case MediaType.SHARED_URL: {
            return _jsx(Icon16ScribblePencilRectangle, {});
        }
        case MediaType.CAMERA: {
            return _jsx(Icon16Videocam, {});
        }
        default: {
            return _jsx(Icon16Videocam, {});
        }
    }
};
export const getStreamModeLabel = (type, getLang) => {
    switch (type) {
        case MediaType.STREAM:
        case MediaType.MOVIE: {
            return getLang('calls_stream_mode_movie');
        }
        case MediaType.SCREEN: {
            return getLang('calls_stream_mode_screen');
        }
        case MediaType.CAMERA: {
            return getLang('calls_stream_mode_camera');
        }
        case MediaType.SHARED_URL: {
            return getLang('calls_sferum_board');
        }
        default: {
            return type;
        }
    }
};
//# sourceMappingURL=streamMode.js.map