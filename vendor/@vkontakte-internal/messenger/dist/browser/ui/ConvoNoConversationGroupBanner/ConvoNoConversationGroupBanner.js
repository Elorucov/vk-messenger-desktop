import React from 'react';
import { getColorClass, Text } from '@vkontakte-internal/vkcom-kit';
import { Icon24InfoCircleOutline } from '@vkontakte/icons';
import { BannerPanel } from '../../ui/BannerPanel/BannerPanel';
import { useBrowserEnv } from '../../hooks/misc';
import cx from 'classnames';
import './ConvoNoConversationGroupBanner.css';
export function ConvoNoConversationGroupBanner() {
    const { lang } = useBrowserEnv();
    return (React.createElement(BannerPanel, { isVisible: true, mode: "oneLine" },
        React.createElement(Icon24InfoCircleOutline, { className: cx('ConvoNoConversationGroupBanner__icon', getColorClass('color_icon_secondary')) }),
        React.createElement(Text, { className: "ConvoNoConversationGroupBanner__text" }, lang.use('me_group_no_conversation_banner'))));
}
//# sourceMappingURL=ConvoNoConversationGroupBanner.js.map