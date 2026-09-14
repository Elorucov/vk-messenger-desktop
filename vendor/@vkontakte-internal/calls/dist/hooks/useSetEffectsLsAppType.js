import { useMemo } from 'react';
import { useTypedSelector } from './useTypedSelector';
import { EffectAppType, EEffectAppType } from '../helpers/localStorage';
/** выставляет тип приложения (вк звонки \ сферум) для ключей с настройками в `localStorage` */
export const useSetEffectsLsAppType = () => {
    /** признак, что приложение открыли из сферума */
    const isSferum = useTypedSelector((state) => !!state.config.sferum);
    /** выставим тип приложения для ключей в localStorage */
    useMemo(() => {
        const type = isSferum ? EEffectAppType.Sferum : EEffectAppType.VkCalls;
        EffectAppType.setAppType(type);
    }, [isSferum]);
};
//# sourceMappingURL=useSetEffectsLsAppType.js.map