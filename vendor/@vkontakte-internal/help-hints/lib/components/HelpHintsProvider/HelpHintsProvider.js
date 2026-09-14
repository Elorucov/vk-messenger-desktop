import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { HelpHints } from '../../';
import { HelpHintsContext } from '../../hooks/helpHints';
export function HelpHintsProvider({ api, noToken, ...props }) {
    const [isHelpHintsReloading, setIsHelpHintsReloading] = useState(true);
    const reload = async () => {
        setIsHelpHintsReloading(true);
        await HelpHints.reload();
        setIsHelpHintsReloading(false);
    };
    useEffect(() => {
        if (api) {
            HelpHints.setAPI(api);
            if (noToken && !api.options.token && typeof api.options.requestMethod !== 'function') {
                return;
            }
        }
        reload();
    }, [api, noToken]);
    return (_jsx(HelpHintsContext.Provider, { value: {
            isHelpHintsReloading,
        }, ...props }));
}
//# sourceMappingURL=HelpHintsProvider.js.map