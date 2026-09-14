import { jsxs, jsx } from 'react/jsx-runtime';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { Div, Subhead, Title, Button } from '@vkontakte/vkui';
import { AdsBadge } from '../AdBannerV2/AdsBadge.js';
import { TextClamp } from '../AdBannerV2/TextClamp.js';
import { useLangProviderContext } from '../../providers/LangProvider/LangProvider.js';
import d from './InterstitialSmall.module.css.js';

const InterstitialSmall=({href:c,adChoice:p,title:g,headerLabel:v,image:f,domainName:h,onClick:k,isFullScreen:u,isLandscape:x})=>{const{getLang:N}=useLangProviderContext();return jsxs("a",{href:c,target:"_blank",rel:"noreferrer",className:clsx(d.root,u&&d.rootFullscreen,u&&x&&d.rootFullscreenLandscape),onClick:k,children:[p,jsxs("div",{className:d.imageBox,children:[jsx("img",{src:f,className:d.image,alt:""}),jsx(AdsBadge,{advertisingLabel:v,ageRestrictions:""})]}),jsxs(Div,{className:d.bottom,children:[jsx(Subhead,{className:d.domain,"data-testid":"adsInterstitialHeaderLabel",children:h??""}),jsx(Title,{className:d.title,level:"2","data-testid":"adsInterstitialTitle",children:jsx(TextClamp,{lines:u?1:2,children:g})}),jsx(Button,{stretched:true,size:"l","data-testid":"adsInterstitialButton",children:N("apps_ad_go_to_site")})]})]})};

export { InterstitialSmall };
