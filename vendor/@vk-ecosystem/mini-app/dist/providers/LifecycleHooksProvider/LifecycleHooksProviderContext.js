import { createContext } from 'react';
import { lifecycle } from '../../modules/lifecycle/hooks.js';

const LifecycleHooksProviderContext=createContext(lifecycle);

export { LifecycleHooksProviderContext };
