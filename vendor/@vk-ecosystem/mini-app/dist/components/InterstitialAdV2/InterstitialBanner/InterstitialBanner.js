import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import './../../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../../deps/clsx/dist/clsx.js';
import './../../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { Div, Button } from '@vkontakte/vkui';
import { useRef, useState, useLayoutEffect } from 'react';
import { nativeAdShouldBeSticky } from '../../../helpers/ads/index.js';
import { BannerInfo } from './BannerInfo/BannerInfo.js';
import m from './InterstitialBanner.module.css.js';
import { MainImage } from './MainImage/MainImage.js';

const f={vertical:m.bannerVertical,horizontal:undefined};const h={vertical:m.rootVertical,horizontal:undefined};const InterstitialBanner=({href:p,direction:v,image:I,captionBadge:b,captionBadgeIconUrl:k,disclaimer:B,headerLabel:z,iconAfterHeaderLabel:g,title:N,subtitle:j,buttonText:x,onClick:C,getRef:F,closeIcon:M,mode:V,isFullScreen:H,imageSize:S})=>{const _=useRef(null);const[q,w]=useState(false);const y={url:I,captionBadge:b,captionBadgeIconUrl:k,disclaimer:B,direction:v,imageSize:S};const A={direction:v,headerLabel:z,iconAfterHeaderLabel:g,title:N,subtitle:j,closeIcon:M};useLayoutEffect(()=>{const t=_.current;if(!t){return}if(nativeAdShouldBeSticky(t)){w(true);}},[]);return jsx("a",{target:"_blank",ref:_,href:p,className:clsx(m.root,H&&m.rootFullscreen,h[v],V==="multi"&&m.rootMulti),onClick:C,rel:"noreferrer","data-testid":"adsInterstitialContainer",children:jsx("div",{ref:F,className:clsx(m.banner,V==="interstitial"&&m.roundBorder,f[v],H&&m.bannerFullscreen,V==="interstitial"&&v!=="vertical"&&m.bannerCentered,V==="interstitial"&&q&&m.bannerCenteredScroll),children:v==="horizontal"?jsxs(Fragment,{children:[jsx(MainImage,{...y}),jsxs("div",{className:m.right,children:[jsx(BannerInfo,{...A}),jsx(Div,{className:m.buttonHorizontal,children:jsx(Button,{stretched:true,size:"l","data-testid":"adsInterstitialButton",children:x})})]})]}):jsxs(Fragment,{children:[jsx(BannerInfo,{...A}),jsx(MainImage,{...y}),jsx(Div,{className:m.buttonVertical,children:jsx(Button,{stretched:true,size:"l","data-testid":"adsInterstitialButton",children:x})})]})})})};

export { InterstitialBanner };
