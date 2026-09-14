import { jsx } from 'react/jsx-runtime';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { useAdaptivityWithJSMediaQueries } from '@vkontakte/vkui';
import e from '@webads/motion-ads/motion-kit-games';
import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { AdShowStage, LEAD_ADS_FORM_APP_ID } from '../../constants/ads.js';
import { nativeAdShouldBeSticky } from '../../helpers/ads/index.js';
import { errorLogger } from '../../modules/logger.js';
import { InterstitialBackground } from '../InterstitialBackground/InterstitialBackground.js';
import u from './InterstitialMotionAd.module.css.js';
import { MOTION_ADS_LEADADS_TYPE } from './constants.js';

const InterstitialMotionAd=({motionAdParams:g,onClose:I})=>{const S={adFormat:"interstitial",isMotion:true,isInterstitialMulti:false};const v=g.data;const{isDesktop:E}=useAdaptivityWithJSMediaQueries();const h=useRef(null);const k=useRef(null);const b=useRef(false);const M=useRef(false);const[R,O]=useState(false);useEffect(()=>{b.current=false;M.current=false;g.onStatEvent({...S,stage:AdShowStage.RENDER,bannerId:String(g.data.id)});},[g]);useEffect(()=>{const t=async()=>{const t=h.current;if(!t){return}const r={};if(v.creativeType===MOTION_ADS_LEADADS_TYPE){r.appApi={showModal:(t,r)=>{g.showMiniAppModal({hash:t,appId:LEAD_ADS_FORM_APP_ID},()=>{r();});}};}try{await e.init(r);const n={container:t,banner:v,onClicked:()=>{if(!b.current){b.current=true;g.onClick();}},onClosed:I,onClosedByUser:I,onReady:()=>{if(!M.current){M.current=true;g.onImpression();}g.onStatEvent({...S,stage:AdShowStage.MOTION_READY,bannerId:String(g.data.id)});},onShowed:()=>{g.onStatEvent({...S,stage:AdShowStage.MOTION_SHOWED,bannerId:String(g.data.id)});},onError:t=>{g.onStatEvent({...S,stage:AdShowStage.MOTION_ERROR,bannerId:String(g.data.id),error:String(t.code)});}};e.create(n);}catch(t){errorLogger(t);g.onStatEvent({...S,stage:AdShowStage.ERROR,bannerId:String(g.data.id),error:String(t)});I();throw t}};void t();},[]);useLayoutEffect(()=>{const t=k.current;if(!t){return}if(nativeAdShouldBeSticky(t)){O(true);}},[]);return jsx(InterstitialBackground,{ref:k,children:jsx("div",{className:clsx(u.banner,!E&&u.bannerFullscreen,R&&u.bannerCenteredScroll),children:jsx("div",{className:u.inner,children:jsx("div",{ref:h})})})})};

export { InterstitialMotionAd };
