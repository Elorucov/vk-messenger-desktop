import '../../ui/ChannelClosed/ChannelClosed.css';
import React, { useState } from 'react';
import { Icon28SunglassesCircleFillGray } from '@vkontakte/icons';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import * as Channel from '../../../core/model/Channel';
import cx from 'classnames';
import { Button } from '@vkontakte/vkui';
import { useRouter } from '../../ui/Router/Router';
export const ChannelClosed = ({ isThemed, isPrivate, channel }) => {
    const { lang } = useBrowserEnv();
    const { screenRoute } = useRouter();
    const dispatch = useDispatch();
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const onChannelJoinClick = () => {
        setButtonDisabled(true);
        const source = (screenRoute.kind === 'ChannelRoute' && screenRoute.entrypoint) ||
            'channel';
        dispatch({
            type: 'UserChangedChannel',
            userAction: Channel.isInboundRequest(channel)
                ? 'join_inbound_request'
                : 'join',
            source,
            channelId: channel.id,
            onComplete: () => setButtonDisabled(false),
            onFail: () => setButtonDisabled(false),
        });
    };
    const onChannelLeaveClick = () => {
        setButtonDisabled(true);
        dispatch({
            type: 'UserChangedChannel',
            userAction: 'leave',
            channelId: channel.id,
            onComplete: () => setButtonDisabled(false),
            onFail: () => setButtonDisabled(false),
        });
    };
    return (React.createElement("div", { className: cx('ChannelClosed', {
            'ChannelClosed--themed': isThemed,
        }) },
        React.createElement(Icon28SunglassesCircleFillGray, { width: 48, height: 48 }),
        React.createElement("div", { className: "ChannelClosed__info" },
            React.createElement("span", { className: "ChannelClosed__title" }, isPrivate
                ? lang.use('me_channel_private_title')
                : lang.use('me_channel_closed_title')),
            React.createElement("span", { className: "ChannelClosed__description" }, isPrivate
                ? lang.use('me_channel_private_description')
                : lang.use('me_channel_closed_description'))),
        !isPrivate && channel.memberStatus === 0 && (React.createElement(Button, { size: "m", mode: "secondary", appearance: "accent", disabled: buttonDisabled, className: "ChannelClosed__button", onClick: onChannelJoinClick }, lang.use('me_channel_closed_button'))),
        !isPrivate && channel.memberStatus === 4 && (React.createElement(Button, { size: "m", mode: "secondary", disabled: buttonDisabled, appearance: "accent", className: "ChannelClosed__button", onClick: onChannelLeaveClick }, lang.use('me_channel_return_request')))));
};
//# sourceMappingURL=ChannelClosed.js.map