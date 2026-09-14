import React, { useRef } from 'react';
import { Icon20CopyOutline } from '@vkontakte/icons';
import { ActionsMenuAction } from '../../ui/ActionsMenu/ActionsMenu';
import { useBrowserEnv } from '../../hooks/misc';
export const CommonCopySelectionAction = () => {
    // фиксируем состояние в момент маунта
    // нет смысла вешать слушателя на selectionchange так как это контекстное меню и никаких других взаимодействий с сообщением быть не может
    const hasSelectionRange = useRef(document.getSelection()?.type === 'Range');
    const { lang } = useBrowserEnv();
    const handleClick = () => {
        // мы подменяем эмоджи на картинки, поэтому они в текст не сериализуются,
        // поэтому используем document.execCommand("copy")
        document.execCommand('copy');
    };
    return hasSelectionRange.current ? (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20CopyOutline, null), title: lang.use('me_copy_selected_text'), onClick: handleClick, type: "secondary" })) : null;
};
//# sourceMappingURL=CommonCopySelectionAction.js.map