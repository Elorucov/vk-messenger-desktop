import { jsx } from 'react/jsx-runtime';
import { useEffect } from 'react';
import { MiniAppEvents } from '../../constants/events.js';
import { IFRAME_LOADING_TIMEOUT } from '../../constants/performance.js';
import { LifecycleHooksKeys } from '../../modules/lifecycle/types.js';
import { useStatsProviderContext } from '../StatsProvider/StatsProviderContext.js';
import { LifecycleHooksProviderContext } from './LifecycleHooksProviderContext.js';
import { PageActiveStateShared } from '../../modules/pageActiveState/PageActiveState.js';
import { PageLeaveEventNames } from '../../modules/pageActiveState/types.js';

const LifecycleHooksProvider=({children:c,iframe:d,lifecycle:f,...p})=>{const{onBridgeMethod:v,onInit:l,onDestroy:u}=f.hooks;const E=useStatsProviderContext();useEffect(()=>{f.fire(LifecycleHooksKeys.onBeforeMount,p);const e=new PageActiveStateShared;const o=()=>{e.destroy();f.fire(LifecycleHooksKeys.onDestroy,p);};e.eventHooks[PageLeaveEventNames.BEFORE_LEAVE].add(o);const r=v.add(({params:{handler:e}})=>{if(e===MiniAppEvents.Init){E.performanceStatsService?.setInitType("bridge");f.fire(LifecycleHooksKeys.onInit,p);r();}});return o},[]);useEffect(()=>{if(d){f.fire(LifecycleHooksKeys.onMount,{...p,iframe:d});const e=()=>{E.performanceStatsService?.setInitType("frame_load");f.fire(LifecycleHooksKeys.onInit,p);d.removeEventListener("load",e);};if(p.app.isWithoutInitApp){d.addEventListener("load",e);}const o=setTimeout(()=>{f.fire(LifecycleHooksKeys.onIframeTimeoutError,p);d.removeEventListener("load",e);},IFRAME_LOADING_TIMEOUT);const t=()=>{window.clearTimeout(o);d.removeEventListener("load",e);};l.add(t,{once:true});u.add(t,{once:true});}},[d]);return jsx(LifecycleHooksProviderContext.Provider,{value:f,children:c})};

export { LifecycleHooksProvider };
