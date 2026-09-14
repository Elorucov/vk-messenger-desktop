import '../../ui/ConvoMessageDeleted/ConvoMessageDeleted.css';
import '../../ui/ConvoMessageDeleted/ConvoMessageDeletedWithoutBubblesTheme.css';
import React, { useCallback, useId } from 'react';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import cx from 'classnames';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
export const ConvoMessageDeleted = ({ historyNode, peerId, isThemed, isNavigating, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const message = historyNode.restorable;
    const handleRestoreButtonClick = useCallback(() => {
        dispatch({
            type: 'UserRestoreMessage',
            userAction: 'restore',
            cmid: message.cmid,
            peerId,
        });
    }, [dispatch, message, peerId]);
    const id = useId();
    const previewId = `${id}preview`;
    return (React.createElement("article", { "aria-labelledby": previewId, tabIndex: -1, className: cx('ConvoMessageDeleted__wrapper', {
            'ConvoMessageDeleted__wrapper--out MEAppThemeStylesContrastEnable': message.isOut,
            'ConvoMessageDeleted--wrapperWithoutBubbles': isWithoutBubblesTheme,
            'ConvoMessageDeleted--themed': isThemed,
            'ConvoMessageDeleted__wrapper--navigating': isNavigating,
        }) },
        React.createElement("div", { role: "presentation", className: cx('ConvoMessageDeleted', isWithoutBubblesTheme && 'ConvoMessageDeleted--withoutBubbles') },
            React.createElement("span", { id: previewId }, historyNode.isSpam
                ? lang.use('me_message_marked_spam')
                : lang.use('me_message_deleted')),
            React.createElement("button", { type: "button", onClick: handleRestoreButtonClick, className: "ConvoMessageDeleted__restoreButton" }, lang.use('me_message_action_restore')))));
};
//# sourceMappingURL=ConvoMessageDeleted.js.map