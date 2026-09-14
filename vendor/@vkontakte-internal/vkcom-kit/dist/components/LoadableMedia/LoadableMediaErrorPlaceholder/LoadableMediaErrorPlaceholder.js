import { jsx as _jsx } from "react/jsx-runtime";
import { memo } from 'react';
import { Button, Placeholder } from '../../Adopted';
import { Icon56IllustrationAntenna } from '../../icons/Icon56IllustrationAntenna/Icon56IllustrationAntenna';
export const LoadableMediaErrorPlaceholder = memo(function LoadableMediaErrorPlaceholder({ loadingErrorMessage, loadingErrorActionLabel, onRetry, }) {
    if (!loadingErrorMessage) {
        return null;
    }
    return (_jsx(Placeholder, { icon: _jsx(Icon56IllustrationAntenna, {}), action: Boolean(loadingErrorActionLabel) && (_jsx(Button, { mode: "tertiary", size: "m", onClick: onRetry, children: loadingErrorActionLabel })), children: loadingErrorMessage }));
});
//# sourceMappingURL=LoadableMediaErrorPlaceholder.js.map