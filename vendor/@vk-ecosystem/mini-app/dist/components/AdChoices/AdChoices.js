import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { IconButton } from '@vkontakte/vkui';
import { useState, useRef, useCallback } from 'react';
import { useLangProviderContext } from '../../providers/LangProvider/LangProvider.js';
import { AdChoiceActionSheet } from './AdChoiceActionSheet.js';
import i from './AdChoices.module.css.js';
import { iconMap, POPUP_BOX_ID } from './constants.js';

const AdChoices=({options:f,className:u,popupOffsetDistance:v,fitParent:h,icon:g,size:k})=>{const{getLang:C}=useLangProviderContext();const[x,A]=useState(false);const P=useRef(null);const j=useCallback(o=>{o.preventDefault();o.stopPropagation();A(o=>!o);},[]);const N=()=>{A(false);};if(f&&f.length){const n=iconMap[g];return jsxs(Fragment,{children:[jsx("div",{className:u,onClick:j,ref:P,"data-testid":"adsBannerAdChoicesButton",children:jsx(IconButton,{className:clsx(i.button,k==="l"&&i.buttonLarge),"aria-label":C("apps_ad_options"),children:jsx(n,{className:i.icon})})}),jsx("div",{className:i.popupBox,id:POPUP_BOX_ID,onClick:o=>{o.preventDefault();o.stopPropagation();},children:x&&jsx(AdChoiceActionSheet,{onClose:N,options:f,fitParent:h,popupOffsetDistance:v,toggleRef:P})})]})}return null};

export { AdChoices };
