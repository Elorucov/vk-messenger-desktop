import { jsx } from 'react/jsx-runtime';
import { useContext } from 'react';
import { LangProviderContext } from './LangProviderContext.js';

function LangProvider(e){const n={getLang:e.getLang};return jsx(LangProviderContext.Provider,{value:n,children:e.children})}function useLangProviderContext(){return useContext(LangProviderContext)}

export { LangProvider, useLangProviderContext };
