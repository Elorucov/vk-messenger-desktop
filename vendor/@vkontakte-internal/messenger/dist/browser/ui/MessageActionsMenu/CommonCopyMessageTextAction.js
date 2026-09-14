import React, { useMemo } from 'react';
import { Icon20CopyOutline, Icon24CheckCircleOutline } from '@vkontakte/icons';
import { ActionsMenuAction } from '../../ui/ActionsMenu/ActionsMenu';
import * as TextChunk from '../../../core/model/TextChunk';
import { useBrowserEnv } from '../../hooks/misc';
import { useSnackbar } from '../../hooks/useSnackbar';
import { copyTextToClipboard } from '@vkontakte/vkjs';
export const CommonCopyMessageTextAction = ({ chunks }) => {
    const text = useMemo(() => {
        return TextChunk.toPlainText(chunks, { multiline: true });
    }, [chunks]);
    const { lang } = useBrowserEnv();
    const snackbar = useSnackbar();
    const handleClick = () => {
        copyTextToClipboard(text).then(() => snackbar({
            message: lang.use('me_copy_text_success'),
            before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
        }));
    };
    return text ? (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20CopyOutline, null), title: lang.use('me_copy_message_text'), onClick: handleClick, type: "secondary" })) : null;
};
//# sourceMappingURL=CommonCopyMessageTextAction.js.map