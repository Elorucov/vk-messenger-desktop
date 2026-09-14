import { jsx as _jsx } from "react/jsx-runtime";
import { useSelector } from 'react-redux';
import { ScreenSpinner } from '@vkontakte-internal/vkcom-kit';
export function WaitingContainer() {
    const isLoaderVisible = useSelector((state) => state.isLoaderVisible);
    return isLoaderVisible ? _jsx(ScreenSpinner, { mode: "overlay" }) : null;
}
//# sourceMappingURL=WaitingContainer.js.map