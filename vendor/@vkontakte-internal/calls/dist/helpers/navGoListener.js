/**
 * __не__ полный список возможных параметров ссылки
 *
 * например:
 * ```url
 * /im?sel=2000005162&z=photo587809171_457239018%2Fmail692810
 * ```
 */
/**
 * @see https://jira.mvk.com/browse/CALL-9528
 *
 * хелпер для отслеживания переходов между урлами глобального
 * объекта `cur.nav`
 *
 * перед использованием проверьте, что фастчаты есть на странице
 * через `calls/helpers/fastchat.ts::isFastChatActive();`
 */
export const createNavGoListener = (callback) => {
    function callsHandleNavPush(changed, oldLoc, newLoc, opts) {
        callback(changed, oldLoc, newLoc, opts);
        return true;
    }
    function callsHandleNavDestroy() {
        // eslint-disable-next-line
        // @ts-ignore TODO Wrong types
        window.nav?.subscribeOnModuleEvaluated?.(init);
        return true;
    }
    function init() {
        /**
         * на init мы более менее уверены, что модуль
         * _уже_ инициирован поэтому сразу подписываемся
         * на push
         */
        // eslint-disable-next-line
        // @ts-ignore TODO Wrong types
        window.cur?.nav?.push?.(callsHandleNavPush);
        window.cur?.destroy?.push?.(callsHandleNavDestroy);
    }
    function destroy() {
        // eslint-disable-next-line
        // @ts-ignore TODO Wrong types
        window.nav?.unsubscribeOnModuleEvaluated?.(init);
        // вычищаем коллебек из nav
        // eslint-disable-next-line
        // @ts-ignore TODO Wrong types
        if (window.cur?.nav && Array.isArray(window.cur?.nav)) {
            // eslint-disable-next-line
            // @ts-ignore TODO Wrong types
            window.cur.nav = window.cur.nav.filter((cb) => {
                return cb !== callsHandleNavPush;
            });
        }
        if (window.cur?.destroy && Array.isArray(window.cur?.destroy)) {
            window.cur.destroy = window.cur.destroy.filter((cb) => {
                return cb !== callsHandleNavDestroy;
            });
        }
    }
    return {
        init,
        destroy,
    };
};
//# sourceMappingURL=navGoListener.js.map