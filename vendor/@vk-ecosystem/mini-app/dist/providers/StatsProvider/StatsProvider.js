import { jsx } from 'react/jsx-runtime';
import { useMemo } from 'react';
import { FeatureEnabledKeys } from '../../constants/featureToggles.js';
import { MyTrackerService } from '../../services/MyTrackerService/MyTrackerService.js';
import { StatsProviderContext } from './StatsProviderContext.js';
import t from './../../deps/uuid/dist/esm-browser/v4.js';
import { BridgeEventStatsCollector } from '../../modules/collectors/action/BridgeEventStatCollector.js';
import { AdEventStatCollector } from '../../modules/collectors/action/AdEventStatCollector.js';
import { AdRequestStatCollector } from '../../modules/collectors/action/AdRequestStatCollector.js';
import { AdsDevNullStatCollector } from '../../modules/collectors/custom/AdsDevNullStatCollector.js';
import { SessionEventStatCollector } from '../../modules/collectors/action/SessionEventStatCollector.js';
import { PerformanceStatsService } from '../../services/PerformanceStatsService/PerformanceStatsService.js';
import { MiniAppPerformanceCollector } from '../../modules/collectors/benchmark/MiniAppPerformanceCollector.js';
import { SessionsManager } from '../../services/SessionManager/SessionManager.js';

const StatsProvider=({children:u,sendStatEvent:S,forceSendStatEvent:d,bridgeMethodsToLogCallArguments:k,featureToggles:w,sessionUuidFromProps:T,app:{id:M,url:P,myTrackerTimeSpentCounterId:y},performanceFromProps:b,onExternalSessionStart:g,featureEnabled:x,userId:C,statsConfig:E})=>{const j=x?.(FeatureEnabledKeys.MiniAppsSDKMyTracker);const A=Boolean(y);const I=useMemo(()=>T||t(),[]);const V=useMemo(()=>S&&new BridgeEventStatsCollector(S,k,E),[]);const h=useMemo(()=>S&&new AdEventStatCollector(S,E),[]);const B=useMemo(()=>S&&new AdRequestStatCollector(S,E),[]);const D=useMemo(()=>S&&new AdsDevNullStatCollector(S),[]);const G=useMemo(()=>(S||d)&&new SessionEventStatCollector(S,d,E),[]);const K=useMemo(()=>{if(!w?.enableCollectPerformance||!S){return}const r={miniAppPerformanceCollector:new MiniAppPerformanceCollector(S),sessionUuid:I,appId:M,webviewUrl:P,performanceFromProps:b};return new PerformanceStatsService(r)},[]);const U=useMemo(()=>{if(j||A){return new MyTrackerService({id:M,url:P,isEnabledMyTrackerTrackEvents:j})}},[]);const q=()=>{if(j){return U?.trackEvent}};const z=({requestApiMethod:r})=>{if(!G||!w?.enableSessionManager){return}const e=x?.(FeatureEnabledKeys.PerfomanceStatsInGames);const t=r=>{if(y){void U?.trackTimeSpentEvent({activityId:y,eventType:r,userId:C});}};const n={requestApiMethod:r,sessionEventStatCollector:G,disableVisitorTrackerService:w?.disableVisitorTrackerService,onExternalSessionStart:g,isExternalInitAvailable:e,appId:M,sessionUuid:I,appUrl:P,onMyTrackerTrackTimeSpentEvent:t};SessionsManager.create(n);};return jsx(StatsProviderContext.Provider,{value:{bridgeEventStatsCollector:V,adEventStatCollector:h,adsDevNullStatCollector:D,adRequestStatCollector:B,initSessionManager:z,sessionUuid:I,performanceStatsService:K,trackMyTrackerEvent:q(),statsConfig:E},children:u})};

export { StatsProvider };
