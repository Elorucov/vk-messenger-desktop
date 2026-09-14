import { jsx as _jsx } from "react/jsx-runtime";
import { ToolButton as VKUIToolButton } from '@vkontakte/vkui';
/**
 * TODO
 *  - заменить/применить `mode="secondary"` в кодовой базе, в местах использования `appearance="neutral"`
 *  - применить `appearance="neutral"` в местах использования `mode="secondary"`
 */
export const ToolButton = ({ appearance: appearanceProp, mode: modeProp, ...restProps }) => {
    /**
     * [VKCOMKIT-1559] определяем `mode` как `'secondary'` при `appearance === 'neutral'`
     *
     * Связано с https://github.com/VKCOM/VKUI/pull/7802
     */
    const mode = modeProp === undefined && appearanceProp === 'neutral' ? 'secondary' : modeProp;
    const appearance = appearanceProp === undefined && modeProp === 'secondary' ? 'neutral' : appearanceProp;
    return _jsx(VKUIToolButton, { ...restProps, mode: mode, appearance: appearance });
};
//# sourceMappingURL=ToolButton.js.map