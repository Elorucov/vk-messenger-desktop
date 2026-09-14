import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { Icon24PictureInPictureOut16x9Outline } from '@vkontakte/icons';
import { useLang } from '../../../hooks/useLang';
import { useRestoreCall } from '../../../hooks/useRestoreCall';
export function useCreateRestoreButton() {
    const { getLang } = useLang();
    const handleRestoreCall = useRestoreCall();
    return useCallback(() => ({
        dataTestId: 'calls_call_widget_button_restore',
        tooltip: getLang('calls_restore'),
        children: _jsx(Icon24PictureInPictureOut16x9Outline, {}),
        onClick: handleRestoreCall,
    }), [handleRestoreCall]);
}
//# sourceMappingURL=useCreateRestoreButton.js.map