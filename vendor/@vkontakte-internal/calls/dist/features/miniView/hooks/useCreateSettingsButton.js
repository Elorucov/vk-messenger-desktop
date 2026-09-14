import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { Icon24GearOutline } from '@vkontakte/icons';
import { useToggleMediaSettingsModal } from '../../../hooks/useToggleMediaSettingsModal';
import { useLang } from '../../../hooks/useLang';
export function useCreateSettingsButton() {
    const { getLang } = useLang();
    const handleOpenSettings = useToggleMediaSettingsModal();
    return useCallback(() => ({
        dataTestId: 'calls_call_widget_button_settings',
        tooltip: getLang('calls_call_menu_settings'),
        children: _jsx(Icon24GearOutline, {}),
        onClick: handleOpenSettings,
    }), [handleOpenSettings]);
}
//# sourceMappingURL=useCreateSettingsButton.js.map