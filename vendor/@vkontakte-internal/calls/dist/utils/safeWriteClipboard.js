import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import { copyTextToClipboard } from '@vkontakte/vkjs';
/**
 * Безопасная запись в буфер обмена
 * @param text
 */
export async function safeWriteClipboard(text) {
    if (document.visibilityState !== 'visible' || !document.hasFocus()) {
        return;
    }
    try {
        return await copyTextToClipboard(text);
    }
    catch (err) {
        debugMessage(DebugMessageType.ERROR, 'fail to update clipboard', err?.message);
    }
}
//# sourceMappingURL=safeWriteClipboard.js.map