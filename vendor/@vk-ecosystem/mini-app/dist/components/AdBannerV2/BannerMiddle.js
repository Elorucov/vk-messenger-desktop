import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { AdaptivityProvider, Headline, Subhead } from '@vkontakte/vkui';
import { AdvertisingLabel } from './AdvertisingLabel.js';
import { TextClamp } from './TextClamp.js';
import c from './BannerMiddle.module.css.js';

const d=60;const m=65;function h(e){const t=e.title??"";const i=e.description??"";return t.length<=d&&i.length<=m}const BannerMiddle=({data:d,isDesktop:m})=>{const u=m?h(d):true;return jsxs("div",{className:c.box,children:[!u&&jsx("div",{className:c.gradient}),jsxs("div",{className:clsx(c.scroll,!m&&c.scrollMobile),children:[jsx("div",{className:clsx(c.inner,u&&c.innerShort,!m&&c.innerMobile),children:jsx(AdaptivityProvider,{sizeY:"compact",children:u?jsxs(Fragment,{children:[jsx(Headline,{level:"1",weight:"2",className:clsx(c.title,!m&&c.titleMoblie),useAccentWeight:true,children:jsx(TextClamp,{lines:1,children:d.title})}),jsx(Subhead,{weight:"3","data-testid":"adsBannerSubtitle",className:clsx(c.subtitle,!m&&c.subtitleMoblie),children:jsx(TextClamp,{lines:m?1:2,children:d.description})})]}):jsxs(Fragment,{children:[jsx(AdvertisingLabel,{data:d,className:c.label,isBannerAnimated:true,isDesktop:m}),jsx(Headline,{level:"1",weight:"2",className:c.title,useAccentWeight:true,children:d.title}),jsx(Subhead,{weight:"3","data-testid":"adsBannerSubtitle",className:c.subtitle,children:d.description})]})})}),u&&jsx(AdvertisingLabel,{data:d,className:clsx(c.bottomBadge,!m&&c.bottomBadgeMobile),isBannerAnimated:true,isDesktop:m})]})]})};

export { BannerMiddle };
