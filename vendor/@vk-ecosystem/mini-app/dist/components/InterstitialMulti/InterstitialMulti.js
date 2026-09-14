import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Icon28SkipForward } from '@vkontakte/icons';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { useAdaptivityWithJSMediaQueries, ViewWidth, IconButton } from '@vkontakte/vkui';
import { useRef, useState, useLayoutEffect } from 'react';
import { AdChoiceActionSheet } from '../AdChoices/AdChoiceActionSheet.js';
import { AdChoiceButton } from '../AdChoices/AdChoiceButton.js';
import { InterstitialAdV2 } from '../InterstitialAdV2/InterstitialAdV2.js';
import { CloseTimer } from '../InterstitialAdV2/InterstitialBanner/CloseTimer/CloseTimer.js';
import { INTERSTITIAL_AD_DURATION_LONG } from '../InterstitialAdV2/constants.js';
import { InterstitialBackground } from '../InterstitialBackground/InterstitialBackground.js';
import { extractAdChoiceOptions } from '../../helpers/ads/index.js';
import { useIsLandscape } from '../../hooks/useIsLandscape.js';
import k from './InterstitialMulti.module.css.js';
import { ProgressAnimated } from './ProgressAnimated.js';

const g=200;const A=1.5;const w={FirstBanner:0,SkipFirstBanner:.5,SecondBanner:1,SkipSecondBanner:1.5,TwoBanners:2};const InterstitialMulti=({interstitialMulti:v,onClose:P,leadAdsSupport:N})=>{const I=useIsLandscape();const F=useRef(null);const[x,L]=useState(w.FirstBanner);const[M,b]=useState(false);const V=useRef(false);const H=v[0];const j=v[1];const z=useRef(null);const D=useRef(null);const{viewWidth:E}=useAdaptivityWithJSMediaQueries();const y=E<=ViewWidth.SMALL_TABLET;const[R,_]=useState(null);const q=jsx(AdChoiceButton,{onClick:n=>{n.stopPropagation();n.preventDefault();_(n=>n===null?{ref:z,options:extractAdChoiceOptions(H.data.adChoices?.options??[],()=>{if(x===w.FirstBanner||x===w.SkipFirstBanner){L(w.SecondBanner);}else {P();}})}:null);},ref:z,className:clsx(y&&k.adChoiceSmall),icon:y?"more":"info"});const G=jsx(AdChoiceButton,{onClick:n=>{n.stopPropagation();n.preventDefault();_(n=>n===null?{ref:D,options:extractAdChoiceOptions(j.data.adChoices?.options??[],()=>{if(x===w.SecondBanner||x===w.SkipSecondBanner){L(w.TwoBanners);}else {P();}})}:null);},ref:D,className:clsx(y&&k.adChoiceSmall),icon:y?"more":"info"});const J=()=>{if(x===w.TwoBanners){P();}};const K=()=>{V.current=true;};const O=()=>{V.current=false;};const Q=()=>V.current;const U={leadAdsSupport:N,mode:"multi",onClose:J,onShowLeadads:K,onHideLeadads:O};const W=()=>{L(n=>{return n===w.SkipFirstBanner?w.SecondBanner:w.TwoBanners});};const X=n=>{n.stopPropagation();P();};useLayoutEffect(()=>{const n=F.current;if(!n){return}if(n.clientHeight>document.documentElement.clientHeight*A){b(true);}},[]);return jsx(InterstitialBackground,{ref:F,children:jsxs("div",{className:clsx(k.root,M&&k.rootSticky,y&&k.rootMobile,y&&I&&k.rootMobileLandscape,x===w.TwoBanners&&!y&&k.rootMulti),children:[x<w.TwoBanners&&jsxs("div",{className:k.progress,children:[jsx(ProgressAnimated,{fixedValue:x<w.SecondBanner?undefined:100,maxShowTimeSeconds:INTERSTITIAL_AD_DURATION_LONG,onHalfProgress:()=>{L(w.SkipFirstBanner);},onCompleted:()=>{L(w.SecondBanner);},isPaused:Q}),jsx(ProgressAnimated,{fixedValue:x<w.SecondBanner?0:undefined,maxShowTimeSeconds:INTERSTITIAL_AD_DURATION_LONG,onHalfProgress:()=>{L(w.SkipSecondBanner);},onCompleted:()=>{L(w.TwoBanners);},isPaused:Q})]}),x===w.SkipFirstBanner&&jsx(IconButton,{className:k.skip,onClick:W,children:jsx(Icon28SkipForward,{className:k.icon})}),x===w.SkipSecondBanner&&jsx(IconButton,{className:k.skip,onClick:W,children:jsx(Icon28SkipForward,{className:k.icon})}),x===w.TwoBanners&&jsx("div",{className:k.closeTimer,children:jsx(CloseTimer,{onClose:X,timerPaused:V})}),jsxs("div",{className:clsx(k.banner,x===w.TwoBanners&&k.bannerMulti,!y&&k.bannerVertical,x===w.TwoBanners&&y&&I&&k.bannerMobileLandscape),children:[x<w.SecondBanner&&jsx(InterstitialAdV2,{...U,interstitialAdParams:H}),x<w.TwoBanners&&x>=w.SecondBanner&&jsx(InterstitialAdV2,{...U,interstitialAdParams:j}),x===w.TwoBanners&&jsxs(Fragment,{children:[jsx(InterstitialAdV2,{...U,interstitialAdParams:H,mode:y?"small":"multi",imageSize:g,skipSendStats:true,adChoice:q}),y&&I&&jsx("div",{className:k.divider}),jsx(InterstitialAdV2,{...U,interstitialAdParams:j,mode:y?"small":"multi",imageSize:g,skipSendStats:true,adChoice:G})]})]}),R&&jsx(AdChoiceActionSheet,{toggleRef:R.ref,options:R.options,onClose:()=>{_(null);}})]})})};

export { InterstitialMulti };
