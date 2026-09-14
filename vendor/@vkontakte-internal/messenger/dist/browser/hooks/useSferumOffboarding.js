import { useEffect } from 'react';
import { useBrowserEnv } from './misc';
/**
 * Хук, который шлет события при рендеринге.
 * Внутри не проверяем idEdu или вьювера, потому что sferumOffboardingProcess не существует в ином контексте
 */
export const useSferumOffboarding = (screen, isEnabled) => {
    const { sferumOffboardingProcess } = useBrowserEnv();
    useEffect(() => {
        if (isEnabled) {
            sferumOffboardingProcess?.logEvent({ kind: 'navigation', screen });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled, screen]);
};
//# sourceMappingURL=useSferumOffboarding.js.map