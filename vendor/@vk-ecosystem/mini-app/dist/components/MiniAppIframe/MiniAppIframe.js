import { jsx } from 'react/jsx-runtime';
import { useHostServiceProviderContext } from '../../providers/HostServiceProvider/HostServiceProviderContext.js';

const MiniAppIframe=()=>{const{host:o}=useHostServiceProviderContext();if(!o){return null}const{buildUrl:e,getIframeRef:i}=o;const n=i();const{iframePropsState:s}=o?.getMiniAppState()||{};const[c]=s;const p=e().toString();return jsx("iframe",{...c,ref:n,src:p})};

export { MiniAppIframe };
