import { jsx } from 'react/jsx-runtime';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { IconButton } from '@vkontakte/vkui';
import { forwardRef } from 'react';
import { useLangProviderContext } from '../../providers/LangProvider/LangProvider.js';
import i from './AdChoices.module.css.js';
import { iconMap } from './constants.js';

const AdChoiceButton=forwardRef(({className:e,onClick:n,icon:m,size:c},d)=>{const{getLang:p}=useLangProviderContext();const l=iconMap[m];return jsx("div",{className:e,onClick:n,ref:d,"data-testid":"adsBannerAdChoicesButton",children:jsx(IconButton,{className:clsx(i.button,c==="l"&&i.buttonLarge),"aria-label":p("apps_ad_options"),children:jsx(l,{className:i.icon})})})});AdChoiceButton.displayName="AdChoiceButton";

export { AdChoiceButton };
