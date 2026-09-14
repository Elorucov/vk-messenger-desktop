import React from 'react';
import cx from 'classnames';
import { Icon24PhoneCrossOutline } from '@vkontakte/icons';
import { Button, Flex, Group } from '@vkontakte-internal/vkcom-kit';
import { useBrowserEnv } from '../../hooks/misc';
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell';
import { ServiceMessagePreview } from '../../ui/ServiceMessagePreview/ServiceMessagePreview';
import { FormattedDate } from '../../ui/Time/Time';
import './MissedCall.css';
export function MissedCall({ className, isInBubble, message, }) {
    const { lang, stats, vkcom_me } = useBrowserEnv();
    const date = (React.createElement("div", { className: "MissedCall__date" },
        React.createElement(FormattedDate, { timestamp: message.sentAt, variant: "time" })));
    const handleClick = () => {
        vkcom_me?.openCallsPrivacyManagement?.();
        stats.logEvent({
            type: 'type_click',
            screen: 'im_chat',
            type_click: {
                item: { type: 'click_item' },
                type: 'type_im_service_missed_call_settings_click',
                type_im_service_missed_call_settings_click: {
                    event_type: 'inbox_service_privacy_message_click',
                    source: 'im_chat',
                },
            },
        });
    };
    return (React.createElement("div", { className: cx('MissedCall', className) },
        React.createElement(Group, { className: cx('MissedCall__wrapper', {
                'MissedCall__wrapper--inBubble': isInBubble,
            }), mode: isInBubble ? 'card' : 'plain' },
            React.createElement(Flex, { direction: "column", gap: "m" },
                React.createElement(Flex.Item, null,
                    !isInBubble && date,
                    React.createElement(AttachmentCell, { className: "MissedCall__attachmentCell", icon: React.createElement(Icon24PhoneCrossOutline, null), imageShape: "round", isClickable: false, subtitle: lang.use('me_service_message_missed_call_description'), title: React.createElement(ServiceMessagePreview, { message: message }) }),
                    isInBubble && date),
                vkcom_me?.openCallsPrivacyManagement && (React.createElement(Button, { mode: "secondary", onClick: handleClick, stretched: true }, lang.use('me_service_message_missed_call_button_open_settings_text')))))));
}
//# sourceMappingURL=MissedCall.js.map