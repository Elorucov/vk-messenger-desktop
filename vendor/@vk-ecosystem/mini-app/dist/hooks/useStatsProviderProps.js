import { useMemo } from 'react';

const useStatsProviderProps=({sendStatEvent:o,forceSendStatEvent:e,bridgeMethodsToLogCallArguments:s,featureToggles:t,sessionUuid:n,app:p,config:{performance:i}={},featureEnabled:m,onExternalSessionStart:c,userId:u,statsConfig:P})=>{return useMemo(()=>{return {sendStatEvent:o,forceSendStatEvent:e,bridgeMethodsToLogCallArguments:s,featureToggles:t,sessionUuidFromProps:n,app:p,performanceFromProps:i,onExternalSessionStart:c,featureEnabled:m,userId:u,statsConfig:P}},[o,e,s,t,n,p,i,c,m,u,P])};

export { useStatsProviderProps };
