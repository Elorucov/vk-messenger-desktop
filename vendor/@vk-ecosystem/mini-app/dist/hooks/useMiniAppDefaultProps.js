import { ColorScheme } from '@vkontakte/vkui';
import { useMemo } from 'react';
import { DefaultMiniAppProps, Scheme } from '../entries/MiniAppBase/constants.js';

const convertAppearanceToScheme=r=>{return r===ColorScheme.LIGHT?Scheme.BRIGHT_LIGHT:Scheme.SPACE_GRAY};const useMiniAppDefaultProps=e=>{return useMemo(()=>{const{config:r,...t}=e;const{config:n,...c}=DefaultMiniAppProps;const p=r?.scrollTarget||n.scrollTarget;const a=r?.scheme||convertAppearanceToScheme(r?.appearance||n.appearance);return {...c,...t,config:{...n,...r,scheme:a,scrollTarget:p}}},[e])};

export { convertAppearanceToScheme, useMiniAppDefaultProps };
