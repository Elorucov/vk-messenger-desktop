import { jsxs, jsx } from 'react/jsx-runtime';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { useRef, useMemo, useEffect } from 'react';
import { getVideoSize } from '../../helpers/ads/image.js';
import { loadAdManSdk } from '../../helpers/ads/loadAdManSdk.js';
import { errorLogger } from '../../modules/logger.js';
import d from './BannerVideo.module.css.js';

const BannerVideo=({banner:m,className:c,badge:p,isBannerVertical:f,isBannerSlim:u,isBannerAlign:v,isDesktop:h})=>{const y=useRef(null);const w=useMemo(()=>{return `video${Math.floor(Math.random()*1e4)+Math.floor(Math.random()*1e5)+(m.bannerID??"")}`},[m.bannerID]);const{ctaText:I,video:M,trackingLink:g}=m;const k=parseInt(m.bannerID??"0");const D=getVideoSize(m,{isBannerVertical:f,isBannerSlim:u,isBannerAlign:v,isDesktop:h});useEffect(()=>{let e;const a=async()=>{await loadAdManSdk();if(!window.AdManSDK||y.current===null){return}e=new window.AdManSDK;const a={container:"#"+w,debug:false,iframe:true,controls:{progressBar:true,skip:false,volume:"leftBottom",cta:false,replay:false,playPause:false,allowClose:false,disclaimer:false},controlsSize:"small",slot:"preload",initMode:"preload",autoStart:true,visit:{settings:{preroll:{allowClose:false}},sections:{preroll:[{bannerID:k,doOnEmptyResponseFromId:false,ctaText:I,allowClose:false,type:"video",isStatByAPI:true,mediafiles:M?.mediafiles??[],duration:M?.duration??0,hasPause:false,hasVolume:true,statistics:m.video?.statistics??[],urlToNavigateOnClick:g,allowReplay:true,autoReplay:true,openLinkInPopup:false}]}}};e.init(a);};try{void a();}catch(e){errorLogger("Failed to init adman player",e);}},[m]);return jsxs("div",{className:clsx(d.video,c),style:D,children:[p,jsx("div",{className:d.inner,children:jsx("div",{id:w,ref:y})})]})};

export { BannerVideo };
