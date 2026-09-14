import { jsx } from 'react/jsx-runtime';
import { useRef, useMemo, useEffect } from 'react';
import { useMiniAppLifecycle } from '../../modules/lifecycle/hooks.js';
import { LifecycleHooksKeys } from '../../modules/lifecycle/types.js';
import { useHostService } from './HostService.js';
import { LifecycleHooksProvider } from '../LifecycleHooksProvider/LifecycleHooksProvider.js';
import { useStatsProviderContext } from '../StatsProvider/StatsProviderContext.js';
import { HostServiceProviderContext } from './HostServiceProviderContext.js';

const HostServiceProvider=({props:d,children:f})=>{const{id:u}=d.app;const a=useMiniAppLifecycle(u);const v=useHostService(d);const{getMiniAppInfo:p}=v;const P=useStatsProviderContext();const S=v.getIframeRef();const x=useRef(null);const y=useRef(null);const H=useMemo(()=>{return {iframeRef:S,lifecycle:a,props:d,get ads(){return x.current?.()||null},get handlers(){return y.current?.()||null},host:v,stats:P,registerAdsController:r=>void(x.current=r),registerHandlersController:r=>void(y.current=r)}},[S.current,d,v]);useEffect(()=>{d.onExternalInit?.(()=>{a.fire(LifecycleHooksKeys.onInit,p());P.performanceStatsService?.setInitType("external");});},[]);return jsx(HostServiceProviderContext.Provider,{value:H,children:jsx(LifecycleHooksProvider,{...p(),iframe:S.current,lifecycle:a,children:f})})};

export { HostServiceProvider };
