import { createContext, useContext } from 'react';

const StatsProviderContext=createContext({sessionUuid:""});function useStatsProviderContext(){return useContext(StatsProviderContext)}

export { StatsProviderContext, useStatsProviderContext };
