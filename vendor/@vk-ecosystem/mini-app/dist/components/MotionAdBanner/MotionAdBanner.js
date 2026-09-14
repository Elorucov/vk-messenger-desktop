import { jsxs, jsx } from 'react/jsx-runtime';
import { useAdaptivityWithJSMediaQueries } from '@vkontakte/vkui';
import e from '@webads/motion-ads/motion-kit-games';
import { useRef, useEffect } from 'react';
import { getBannerContainerStyles } from '../AdBannerV2/AdBannerV2.js';
import { LEAD_ADS_FORM_APP_ID } from '../../constants/ads.js';
import { useIsLandscape } from '../../hooks/useIsLandscape.js';
import { errorLogger } from '../../modules/logger.js';
import { MOTION_ADS_STICKY_LEADADS_TYPE } from './constants.js';

const MotionAdsBanner=({bannerAdParams:p,onAdReady:l,onAdShown:u,bannerData:f,onUserClick:h,onUserClose:b,onUpdateDimensions:w,leadAdsSupport:A,onShowLeadads:g,onHideLeadads:k})=>{const v=useRef(null);const y=useRef(null);const B=f.bannerData;const M=useRef(false);const x=useRef(false);const{isDesktop:j}=useAdaptivityWithJSMediaQueries();const C=useIsLandscape();const E=()=>{return {banner_height:v?.current?.clientHeight??0,banner_width:v?.current?.clientWidth??0}};useEffect(()=>{const n=async()=>{const n=y.current;if(!n){return}const t={};if(A&&B.creativeType===MOTION_ADS_STICKY_LEADADS_TYPE){t.appApi={showModal:(n,t)=>{g();f.showMiniAppModal({hash:n,appId:LEAD_ADS_FORM_APP_ID},()=>{k();t();});}};}try{await e.init(t);const r={container:n,banner:{...B},onClicked:()=>{if(!M.current){M.current=true;h?.();}},onClosed:()=>{b?.();},onClosedByUser:()=>{b?.();},onReady:()=>{if(!x.current){x.current=true;l?.(E());}},onShowed:()=>{w?.(E());u?.();},onError:n=>{errorLogger("MotionAdBanner",n);}};e.create(r);}catch(n){errorLogger(n);b();throw n}};void n();},[B,w,g,k,b]);const{containerClass:I,containerHeight:V}=getBannerContainerStyles(p,{isDesktop:j,isLandscape:C,bannerAnimationEnabled:true});return jsxs("div",{className:I,style:{height:V},ref:v,children:[jsx("div",{ref:y}),";"]})};

export { MotionAdsBanner };
