import { decodeHTMLEntities, escape } from '@vkontakte/vkjs';
/** Утащил тут static/js/modules/web/calls/utils/lang.ts
 *  декодер с учётом спец символов */
export const decode = (str) => {
    return escape(decodeHTMLEntities(str || ''));
};
//# sourceMappingURL=textUtils.js.map