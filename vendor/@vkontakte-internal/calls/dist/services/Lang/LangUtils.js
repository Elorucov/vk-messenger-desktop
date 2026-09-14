import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
let LangUtils = class LangUtils {
};
LangUtils = __decorate([
    scope.container()
], LangUtils);
export { LangUtils };
export const wrapLangUtilsImplementation = (legacyLangUtils) => {
    let LangUtilsImpl = class LangUtilsImpl {
        constructor() {
            this.getLang = legacyLangUtils.getLang;
            this.langNumeric = legacyLangUtils.langNumeric;
            this.langReplace = legacyLangUtils.langReplace;
            this.langSex = legacyLangUtils.langSex;
            this.langShortDate = legacyLangUtils.langShortDate;
            this.langShortDateTime = legacyLangUtils.langShortDateTime;
        }
    };
    LangUtilsImpl = __decorate([
        scope.container()
    ], LangUtilsImpl);
    return LangUtilsImpl;
};
//# sourceMappingURL=LangUtils.js.map