import { jsxs, jsx } from 'react/jsx-runtime';
import { Icon16LogoVkAds } from '@vkontakte/icons';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { Caption } from '@vkontakte/vkui';
import { useLangProviderContext } from '../../providers/LangProvider/LangProvider.js';
import n from './AdsBadge.module.css.js';

const AdsBadge=({advertisingLabel:m,ageRestrictions:d})=>{const{getLang:c}=useLangProviderContext();let p=a(m,c("apps_ad_subtitle_prefix"));if(d){p+=` ${d}`;}return jsxs(Caption,{level:"1",className:clsx(n.badge),children:[jsx("div",{className:n.icon,children:jsx(Icon16LogoVkAds,{width:12,height:12})}),p]})};function a(r,e){if(!r||r.length>10){return e}return r}

export { AdsBadge };
