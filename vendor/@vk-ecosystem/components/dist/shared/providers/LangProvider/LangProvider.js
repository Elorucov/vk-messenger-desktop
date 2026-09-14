import { jsx } from 'react/jsx-runtime';
import { useContext } from 'react';
import { LangProviderContext } from './LangProviderContext.js';
function LangProvider(props) {
  var context = {
    getLang: props.getLang,
    getLangNumeric: props.getLangNumeric
  };
  return jsx(LangProviderContext.Provider, {
    value: context,
    children: props.children
  });
}
function useLangProviderContext() {
  return useContext(LangProviderContext);
}
export { LangProvider as default, useLangProviderContext };
