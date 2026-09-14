import { jsx } from 'react/jsx-runtime';
import { Icon28Dismiss } from '@vkontakte/icons';
import { IconButton } from '@vkontakte/vkui';
import { useState, useEffect } from 'react';
import { INTERSTITIAL_AD_DURATION } from '../../constants.js';
import { useLangProviderContext } from '../../../../providers/LangProvider/LangProvider.js';
import { ProgressCircle } from '../ProgressCircle/ProgressCircle.js';
import m from './CloseTimer.module.css.js';

const CloseTimer=({onClose:c,timerPaused:l})=>{const{getLang:p}=useLangProviderContext();const[d,u]=useState(INTERSTITIAL_AD_DURATION);useEffect(()=>{const r=setInterval(()=>{if(document.visibilityState==="hidden"||l?.current){return}u(t=>{const e=t-1;!e&&clearInterval(r);return e});},1e3);return ()=>{clearInterval(r);}},[]);const v=r=>{r.stopPropagation();r.preventDefault();c(r);};if(d===0){return jsx(IconButton,{onClick:v,"data-testid":"adsInterstitialCloseButton","aria-label":p("apps_ad_interstitial_close"),children:jsx(Icon28Dismiss,{className:m.icon})})}return jsx(ProgressCircle,{value:d,min:0,max:INTERSTITIAL_AD_DURATION,size:28})};

export { CloseTimer };
