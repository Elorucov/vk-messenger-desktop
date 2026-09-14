import { jsxs, jsx } from 'react/jsx-runtime';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { useState } from 'react';
import r from './BannerImage.module.css.js';
import { getImageAttributes, getImageSize } from '../../helpers/ads/image.js';

const BannerImage=({data:m,className:i,badge:d,isBannerVertical:c,isBannerAlign:l,isBannerSlim:g,isDesktop:p})=>{const h=getImageAttributes(m);const[B,f]=useState(false);const u=()=>{f(true);};const x=getImageSize(h?.aspectRatio??null,{isBannerVertical:c,isBannerAlign:l,isBannerSlim:g,isDesktop:p});return jsxs("div",{className:clsx(r.container,i),"data-testid":"adsBannerImageBox",style:{width:x.width,height:x.height},children:[d,jsx("img",{className:clsx(r.image,B&&r.loaded),"data-testid":"adsBannerImage",src:h?.src,onLoad:u,alt:"adsBannerImage"})]})};

export { BannerImage };
