import { createContext } from 'react';
export const LangContext = createContext({
    getLang: (key) => key,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    langReplace: (key, tokens) => key,
    langSex: (_, key) => key,
    langNumeric: (_, key) => `${key}`,
    langShortDateTime: (time) => `${time}`,
    langShortDate: (time) => `${time}`,
});
//# sourceMappingURL=LangContext.js.map