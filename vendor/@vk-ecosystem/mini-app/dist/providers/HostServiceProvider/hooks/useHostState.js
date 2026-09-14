import { useState } from 'react';
import { getInitialHash } from '../../../modules/utils/index.js';

const r={width:"100%",height:"100%",scrolling:"yes",frameBorder:"0"};const useHostState=s=>{const e=useState({});const c=useState(getInitialHash(s.app));const n=useState("");const i=useState("");const m=useState({...r,...s.iframeProps});return {hostSettingsState:e,hashState:c,exchangeHashState:n,logoutHashState:i,iframePropsState:m}};

export { useHostState };
