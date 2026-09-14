import { createContext } from 'react';
var LangProviderContext = createContext({
  getLang: function getLang() {
    return '';
  },
  getLangNumeric: function getLangNumeric() {
    return '';
  }
});
export { LangProviderContext };
