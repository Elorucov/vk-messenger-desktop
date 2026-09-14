import '../../ui/ServiceMessage/ServiceMessage.css';
import React, { useId } from 'react';
import cx from 'classnames';
import { useViewer } from '../../hooks/misc';
import { ServiceMessagePreview } from '../../ui/ServiceMessagePreview/ServiceMessagePreview';
import { ServiceMessageAttach } from '../../ui/ServiceMessageAttach/ServiceMessageAttach';
/**
 * Поскольку это сервисное сообщение, то оно меняется редко, поэтому можем
 * оптимизировать через React.memo.
 */
export const ServiceMessage = React.memo(({ message, onScrollToMessage, isCompact = false, withBubble, isNavigating, }) => {
    const { viewer } = useViewer();
    const id = useId();
    const previewId = `${id}preview`;
    const hasServiceMessagePreview = message.action.type !== 'cannot_call_privacy_settings' ||
        viewer.id === message.authorId;
    return (React.createElement("article", { "aria-labelledby": previewId, tabIndex: -1, className: cx('ServiceMessage', {
            'ServiceMessage--withBubble': withBubble,
            'ServiceMessage--navigating': isNavigating,
        }) },
        React.createElement("div", { id: previewId, role: "presentation", className: "ServiceMessage__preview" }, hasServiceMessagePreview && (React.createElement(ServiceMessagePreview, { isRich: true, message: message, onScrollToMessage: onScrollToMessage }))),
        React.createElement(ServiceMessageAttach, { message: message, isCompact: isCompact, isInBubble: withBubble })));
});
//# sourceMappingURL=ServiceMessage.js.map