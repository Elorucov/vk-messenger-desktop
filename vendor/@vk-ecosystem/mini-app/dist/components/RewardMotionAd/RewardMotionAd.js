import { jsx } from 'react/jsx-runtime';
import { debounce } from './../../deps/@vkontakte/vkjs/lib/es6/async/debounce.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { useAdaptivityWithJSMediaQueries } from '@vkontakte/vkui';
import e from '@webads/motion-ads/motion-kit-games';
import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { InterstitialBackground } from '../InterstitialBackground/InterstitialBackground.js';
import { AdShowStage, LEAD_ADS_FORM_APP_ID } from '../../constants/ads.js';
import { buildMAConfig } from '../../helpers/ads/motionReward.js';
import { errorLogger } from '../../modules/logger.js';
import u from './RewardMotionAd.module.css.js';
import { MOTION_ADS_REWARD_LEADADS_TYPE } from './constants.js';

const RewardMotionAd=({rewardAdParams:w})=>{const h={adFormat:"reward",isMotion:true,isInterstitialMulti:false};const k=useRef(null);const R=useRef(null);const{isDesktop:E}=useAdaptivityWithJSMediaQueries();const[M,I]=useState(false);useLayoutEffect(()=>{I(g(k,E));const t=debounce(()=>{I(g(k,E));},100);window.addEventListener("resize",t);return ()=>{window.removeEventListener("resize",t);}},[E]);useEffect(()=>{w.onStatEvent({...h,stage:AdShowStage.RENDER,bannerId:String(w.data.id)});const t=R.current;if(!t){return}try{const r={};if(w.data.creativeType===MOTION_ADS_REWARD_LEADADS_TYPE){r.appApi={showModal:(t,r)=>{w.showMiniAppModal({hash:t,appId:LEAD_ADS_FORM_APP_ID},()=>{r();});}};}void e.init(r);const o=buildMAConfig(t,w);e.create(o);}catch(t){errorLogger(t);w.onStatEvent({...h,stage:AdShowStage.ERROR,bannerId:String(w.data.id),error:String(t)});w.onDestroy(false,false);throw t}},[w]);return jsx(InterstitialBackground,{ref:k,children:jsx("div",{className:clsx(u.container,M&&u.fullscreen,!!w.data.title&&u.wide),children:jsx("div",{ref:R})})})};const w=900;function g(t,r){const o=t.current;if(!o){return !r}return !r||o.clientWidth<=w}

export { RewardMotionAd };
