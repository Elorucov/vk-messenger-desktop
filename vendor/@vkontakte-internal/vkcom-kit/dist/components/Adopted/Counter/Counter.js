import { jsx as _jsx } from "react/jsx-runtime";
import { Counter as VKUICounter } from '@vkontakte/vkui';
/**
 * @see https://github.com/VKCOM/VKUI/pull/7919
 *
 * Было:
 * type Mode = 'inherit' | 'primary' | 'contrast' | 'secondary' | 'prominent';
 *
 * Стало:
 * type Mode = 'inherit' | 'primary' | 'contrast' | 'tertiary';
 *
 * NOTE: нужно отдельной задачей глобально пройтись по всем `Counter` в проекте.
 */
const LEGACY_MAP = {
    secondary: { mode: 'primary', appearance: 'neutral' },
    prominent: { mode: 'primary', appearance: 'accent-red' },
};
export const Counter = ({ mode: modeProp = 'inherit', appearance: appearanceProp, ...restProps }) => {
    let mode;
    let appearance;
    if (modeProp === 'secondary' || modeProp === 'prominent') {
        const { mode: resolvedMode, appearance: resolveAppearance } = LEGACY_MAP[modeProp];
        mode = resolvedMode;
        // пробуем сначала применить тот, что передал пользователь
        appearance = appearanceProp || resolveAppearance;
    }
    else {
        mode = modeProp;
        appearance = appearanceProp;
    }
    return _jsx(VKUICounter, { mode: mode, appearance: appearance, ...restProps });
};
//# sourceMappingURL=Counter.js.map