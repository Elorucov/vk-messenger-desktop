import { jsx, jsxs } from 'react/jsx-runtime';
import './../../../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../../../deps/clsx/dist/clsx.js';
import './../../../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { Div, ImageBase, Caption } from '@vkontakte/vkui';
import l from './MainImage.module.css.js';

const n={vertical:l.boxVertical,horizontal:undefined};const c={vertical:328,horizontal:280};const MainImage=({direction:m,captionBadge:o,captionBadgeIconUrl:d,disclaimer:I,url:g,imageSize:v})=>{return jsx(Div,{className:clsx(l.box,n[m]),children:jsxs(ImageBase,{className:l.image,size:v??c[m],src:g,"data-testid":"adsInterstitialImageContainer",children:[jsx("img",{src:g,className:l.blur,alt:"","data-testid":"adsInterstitialImage"}),(d||o)&&jsxs("div",{className:clsx(l.caption,!d&&l.captionNoImage),children:[d&&jsx(ImageBase,{size:16,className:l.icon,src:d}),o&&jsx(Caption,{level:"1","data-testid":"adsInterstitialImageCaption",children:o})]}),I&&jsx(Caption,{level:"1",className:l.disclaimer,"data-testid":"adsInterstitialImageDisclaimer",children:I})]})})};

export { MainImage };
