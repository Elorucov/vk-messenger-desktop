import { jsx } from 'react/jsx-runtime';
import { useAdaptivityWithJSMediaQueries, ViewWidth } from '@vkontakte/vkui';
import { useRef, useEffect } from 'react';
import { useInView as b } from './../../deps/react-intersection-observer/react-intersection-observer.modern.js';
import { InterstitialSmall } from '../InterstitialSmall/InterstitialSmall.js';
import { LEAD_ADS_FORM_APP_ID } from '../../constants/ads.js';
import { sendStatistics, extractPixelsOfType, extractMainImage, extractHeaderLabel, extractAdChoiceOptions, extractAppHash } from '../../helpers/ads/index.js';
import { useIsLandscape } from '../../hooks/useIsLandscape.js';
import { useLangProviderContext } from '../../providers/LangProvider/LangProvider.js';
import { AdChoices } from '../AdChoices/AdChoices.js';
import { CloseTimer } from './InterstitialBanner/CloseTimer/CloseTimer.js';
import { InterstitialBanner } from './InterstitialBanner/InterstitialBanner.js';

const InterstitialAdV2=({interstitialAdParams:k,mode:v,onClose:L,leadAdsSupport:b$1,imageSize:_,skipSendStats:x,adChoice:A,onShowLeadads:B,onHideLeadads:M})=>{const P=k.data;const{getLang:z}=useLangProviderContext();const N=useIsLandscape();const{viewWidth:S}=useAdaptivityWithJSMediaQueries();const T=useRef(false);const j=useRef(false);const w=useRef(false);const{inView:E,ref:O}=b({threshold:.5,fallbackInView:true});const V=S<=ViewWidth.MOBILE;useEffect(()=>{j.current=false;T.current=false;w.current=false;},[k]);useEffect(()=>{if(P&&E&&!j.current&&!x){sendStatistics(extractPixelsOfType(P,"impression"));k.onImpression();j.current=true;}},[k,E,x]);if(!P){return null}const y=t=>{if(!T.current){T.current=true;sendStatistics(extractPixelsOfType(P,"click"));k.onClick();}if(!b$1||P.type!=="leadads"){return}const e=extractAppHash(P.url);if(!e){return}t.preventDefault();t.stopPropagation();w.current=true;B?.();k.showMiniAppModal({appId:LEAD_ADS_FORM_APP_ID,hash:e},()=>{w.current=false;M?.();});};const D=S>ViewWidth.MOBILE?"horizontal":N?"horizontal":"vertical";const H={href:P.url,headerLabel:extractHeaderLabel(z("apps_ad_subtitle_prefix"),P),buttonText:z("apps_ad_go_to_site"),title:P.title,image:extractMainImage(P),onClick:y,isFullScreen:V};const R=extractAdChoiceOptions(P.adChoices?.options??[],L);if(v==="small"){return jsx(InterstitialSmall,{...H,adChoice:A,domainName:P.domainName,isLandscape:N})}return jsx(InterstitialBanner,{...H,iconAfterHeaderLabel:A??jsx(AdChoices,{options:R,icon:"info"}),getRef:O,direction:D,captionBadge:P.domainName,disclaimer:P.disclaimer,subtitle:P.description,closeIcon:v==="interstitial"?jsx(CloseTimer,{onClose:L,timerPaused:w}):undefined,mode:v,imageSize:_})};

export { InterstitialAdV2 };
