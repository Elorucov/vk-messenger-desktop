import { useMemo } from 'react';
import { MiniAppLifecycle } from './MiniAppLifecycle.js';

const lifecycle=new MiniAppLifecycle;const getMiniAppLifecycle=e=>{const t=({app:c})=>c.id===e;const i=new MiniAppLifecycle({predicate:t});const o=i.wrap(lifecycle);i.hooks.onDestroy.addAfterAll(()=>{i.clear();o();});return i};const useMiniAppLifecycle=c=>{return useMemo(()=>getMiniAppLifecycle(c),[c])};

export { getMiniAppLifecycle, lifecycle, useMiniAppLifecycle };
