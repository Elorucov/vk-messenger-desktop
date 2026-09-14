import { useEffect, useState } from 'react';
import { ColorScheme, useConfigProvider } from '../../components/Adopted';
const SCHEME_ATTRIBUTE = 'scheme';
export function useAppearanceDetector() {
    const { colorScheme: configProviderAppearance } = useConfigProvider();
    const [appearance, setAppearance] = useState(() => configProviderAppearance || getBodySchemeAppearance());
    useEffect(() => {
        if (configProviderAppearance) {
            setAppearance(configProviderAppearance);
            return;
        }
        setAppearance(getBodySchemeAppearance());
        const observer = new MutationObserver(() => setAppearance(getBodySchemeAppearance()));
        observer.observe(document.body, { attributes: true, attributeFilter: [SCHEME_ATTRIBUTE] });
        return () => observer.disconnect();
    }, [configProviderAppearance]);
    return appearance;
}
function getBodySchemeAppearance() {
    if (typeof window === 'undefined') {
        return ColorScheme.LIGHT;
    }
    const scheme = document.body.getAttribute(SCHEME_ATTRIBUTE);
    switch (scheme) {
        case 'vkcom_dark':
        case 'space_gray':
            return ColorScheme.DARK;
        default:
            return ColorScheme.LIGHT;
    }
}
//# sourceMappingURL=useAppearanceDetector.js.map