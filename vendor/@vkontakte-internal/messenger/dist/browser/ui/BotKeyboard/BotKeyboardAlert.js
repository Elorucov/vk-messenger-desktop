import { useBrowserEnv } from '../../hooks/misc';
import { useConfirmExternalLink } from '../../hooks/useConfirmExternalLink';
import { useState, useEffect } from 'react';
export const BotKeyboardAlert = () => {
    const { botKeyboard, lang } = useBrowserEnv();
    const { handleConfirmExternalLink, renderConfirmExternalLinkModal } = useConfirmExternalLink();
    const [alertParams, setAlertParams] = useState(null);
    useEffect(() => {
        const handleOpen = (params) => {
            setAlertParams(params);
            handleConfirmExternalLink(params.link);
        };
        botKeyboard.setOpenAlertHandler?.(handleOpen);
    }, [botKeyboard, handleConfirmExternalLink]);
    if (!alertParams) {
        return null;
    }
    const header = lang.use('me_callback_popup_title');
    const text = lang.use('me_callback_popup_text', {
        values: {
            name: alertParams.name,
            domain: new URL(alertParams.link).hostname,
        },
    });
    return renderConfirmExternalLinkModal({ header, text });
};
//# sourceMappingURL=BotKeyboardAlert.js.map