import '../../ui/ChannelsListInboundRequestsHeader/ChannelsListInboundRequestsHeader.css';
import React from 'react';
import { Header } from '@vkontakte-internal/vkcom-kit';
import { useBrowserEnv } from '../../hooks/misc';
export const ChannelsListInboundRequestsHeader = ({ mode = 'primary', multiline = true, size = 'small', ...otherProps }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(Header, { ...otherProps, mode: mode, multiline: multiline, size: size },
        React.createElement("span", { className: "ChannelsListInboundRequestsHeader__title" }, lang.use('me_channels_inbound_request_header_title'))));
};
//# sourceMappingURL=ChannelsListInboundRequestsHeader.js.map