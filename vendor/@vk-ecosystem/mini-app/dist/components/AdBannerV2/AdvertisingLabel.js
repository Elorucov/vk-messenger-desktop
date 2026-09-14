import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Icon16LogoVkAds, Icon16Favorite, Icon12Favorite } from '@vkontakte/icons';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { Caption, Avatar } from '@vkontakte/vkui';
import { TextClamp } from './TextClamp.js';
import { dot } from '../../constants/ads.js';
import { useLangProviderContext } from '../../providers/LangProvider/LangProvider.js';
import h from './AdvertisingLabel.module.css.js';

const v=`\xa0${dot}\xa0`;const g=14;function f(i,e){let t=i;if(e.ageRestrictions){t+=` ${e.ageRestrictions}`;}return t}function p(i,e){let t=f(i,e);if(i.length<=10&&(e.domain||e.rating)){const i=e.rating||e.domain;t+=`${v}${i}`;}return t}function b(i,e,t){const a=i.advertisingLabel??e;if(t){return f(a,i)}return p(a,i)}const AdvertisingLabel=({data:d,noMargin:c,className:g,isBannerAnimated:p,isDesktop:u})=>{const{getLang:x}=useLangProviderContext();const N=b(d,x("apps_ad_subtitle_prefix"),p);const L=f(d.advertisingLabel??x("apps_ad_subtitle_prefix"),d);const k=u?16:12;return jsx(Caption,{level:"1",className:clsx(h.label,!u&&h.labelMobile,c&&h.labelBottom,p&&h.animated,p&&!u&&h.animatedMobile,g),"data-testid":"adsBannerAdvertisingLabel",children:p?jsxs(Fragment,{children:[!u&&jsx("div",{className:clsx(h.icon,h.iconAnimated),children:jsx(Icon16LogoVkAds,{width:k,height:k})}),N,d.domain&&jsxs(Fragment,{children:[v,jsx("div",{className:h.domainIcon,children:jsx(Avatar,{src:d.iconLink,size:k})}),d.domain]}),d.rating&&jsxs(Fragment,{children:[v,jsx(Icon16Favorite,{className:clsx(h.favorite,h.favoriteAnimated),width:k,height:k}),d.rating]})]}):jsxs(Fragment,{children:[jsx("div",{className:h.icon,children:jsx(Icon16LogoVkAds,{width:12,height:12})}),!d.rating&&N,d.rating&&jsxs(Fragment,{children:[L,v,jsx(Icon12Favorite,{className:clsx(h.favorite,h.favoriteBefore),width:k,height:k}),d.rating]})]})})};const AdvertisingLabelSlim=({data:n})=>{const{getLang:r}=useLangProviderContext();const o=b(n,r("apps_ad_subtitle_prefix"),true);const c=o.length>=g;return jsx(Caption,{level:"1",className:clsx(h.label,h.labelSlim),"data-testid":"adsBannerAdvertisingLabel",children:jsxs(Fragment,{children:[jsx("div",{className:h.item,children:o}),!c&&n.domain&&!n.rating&&jsx("div",{className:h.item,children:n.domain}),!c&&n.rating&&jsxs("div",{className:h.item,children:[jsx(Icon12Favorite,{className:clsx(h.favorite,h.favoriteSlim)}),n.rating]}),jsx(TextClamp,{lines:1,children:n.disclaimer??n.description??""})]})})};

export { AdvertisingLabel, AdvertisingLabelSlim };
