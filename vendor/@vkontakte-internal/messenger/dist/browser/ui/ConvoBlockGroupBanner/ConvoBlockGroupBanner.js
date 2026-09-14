import cx from 'classnames';
import '../../ui/ConvoBlockGroupBanner/ConvoBlockGroupBanner.css';
import { Icon24InfoCircleOutline } from '@vkontakte/icons';
import { BannerButtons, BannerPanel } from '../../ui/BannerPanel/BannerPanel';
import React from 'react';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { Button, getColorClass, Text } from '@vkontakte-internal/vkcom-kit';
export const ConvoBlockGroupBanner = ({ peerId, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const handleUnban = () => {
        dispatch({
            type: 'UserChangedConvo',
            peerId,
            userAction: 'unban',
        });
    };
    return (React.createElement(BannerPanel, { isVisible: true, mode: "custom", contentStyles: {
            gridTemplateAreas: `'icon text' '. buttons'`,
            gridTemplateColumns: 'auto 1fr',
            padding: '12px 12px 8px',
        } },
        React.createElement(Icon24InfoCircleOutline, { className: cx('ConvoBlockGroupBanner__icon', getColorClass('color_icon_secondary')) }),
        React.createElement(Text, { className: "ConvoBlockGroupBanner__text" }, lang.use('me_group_blocked_convo_banner_text')),
        React.createElement(BannerButtons, { buttons: React.createElement(Button, { mode: "secondary", onClick: handleUnban }, lang.use('me_group_blocked_convo_banner_button_unban')) })));
};
//# sourceMappingURL=ConvoBlockGroupBanner.js.map