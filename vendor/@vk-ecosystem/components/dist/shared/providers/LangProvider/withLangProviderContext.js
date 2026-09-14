import { jsx } from 'react/jsx-runtime';
import { useLangProviderContext } from './LangProvider.js';
var withLangProviderContext = function withLangProviderContext(Component) {
  var WithLangContext = function WithLangContext(props) {
    var langContext = useLangProviderContext();
    return jsx(Component, Object.assign({}, props, {
      langContext: langContext
    }));
  };
  return WithLangContext;
};
export { withLangProviderContext };
