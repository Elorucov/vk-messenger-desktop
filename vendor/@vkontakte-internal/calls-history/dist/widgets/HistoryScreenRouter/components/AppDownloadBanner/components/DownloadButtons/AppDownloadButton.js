import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useLangs } from '@vkontakte-internal/plugins';
export function AppDownloadButton({ icon, text, onClick }) {
    const langs = useLangs();
    const label = langs.getLang('calls_app_for_desktop');
    return (_jsx(Button, { mode: "secondary", "aria-label": `${label} ${text}`, onClick: onClick, after: icon, children: text }));
}
//# sourceMappingURL=AppDownloadButton.js.map