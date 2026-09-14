import { jsx } from 'react/jsx-runtime';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { useAdaptivityWithJSMediaQueries, ViewWidth } from '@vkontakte/vkui';
import e from '@webads/motion-ads/motion-kit-games';
import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { MOTION_ADS_LEADADS_TYPE } from '../InterstitialMotionAd/constants.js';
import { LEAD_ADS_FORM_APP_ID } from '../../constants/ads.js';
import { nativeAdShouldBeSticky } from '../../helpers/ads/index.js';
import { useIsLandscape } from '../../hooks/useIsLandscape.js';
import { errorLogger } from '../../modules/logger.js';
import { InterstitialBackground } from '../InterstitialBackground/InterstitialBackground.js';
import k from '../InterstitialMulti/InterstitialMulti.module.css.js';

const InterstitialMultiMotion=({interstitialMulti:M,onClose:h,leadAdsSupport:I})=>{const v=useRef(null);const w=useRef(null);const[y,g]=useState(false);const A=useIsLandscape();const{viewWidth:L}=useAdaptivityWithJSMediaQueries();const b=L<=ViewWidth.SMALL_TABLET;const x=useRef(0);const C=useRef(0);const j=({id:t,event:o})=>{const r=t!==undefined?M.find(({data:o})=>o.id===t):undefined;switch(o){case "Ready":if(x.current<2){r?.onImpression();x.current+=1;}return;case "Clicked":if(C.current<2){r?.onClick();C.current+=1;}return}};useEffect(()=>{const t=async()=>{const t=w.current;if(!t){return}const o={container:t,banners:M.map(({data:t})=>t),maxAtMoment:2,asmName:"VKGames",onClicked:j,onClosed:h,onReady:j,onError:({code:t})=>{errorLogger("InterstitialMultiMotion error",t);}};const r={};const n=M.some(({data:t})=>t.creativeType===MOTION_ADS_LEADADS_TYPE);if(n&&I){r.appApi={showModal:(t,o)=>{M[0].showMiniAppModal({hash:t,appId:LEAD_ADS_FORM_APP_ID},()=>{o();});}};}try{await e.init(r);const t=await e.getProducer(o);await t.play();}catch(t){errorLogger(t);h();throw t}};void t();},[]);useLayoutEffect(()=>{const t=v.current;if(!t){return}if(nativeAdShouldBeSticky(t)){g(true);}},[]);return jsx(InterstitialBackground,{ref:v,children:jsx("div",{className:clsx(k.root,y&&k.rootSticky,b&&k.rootMobile,b&&A&&k.rootMobileLandscape),children:jsx("div",{ref:w})})})};

export { InterstitialMultiMotion };
