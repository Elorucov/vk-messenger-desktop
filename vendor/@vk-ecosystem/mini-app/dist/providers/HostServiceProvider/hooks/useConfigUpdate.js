import { useRef, useEffect } from 'react';
import { useOnCallback } from '../../../hooks/useOnCallback.js';
import { deepEqual } from '../../../modules/utils/index.js';

const useConfigUpdate=c=>{const i=useRef(c.config);const e=useOnCallback(()=>!deepEqual(c.config,i.current),[c.config]);useEffect(()=>{i.current=c.config;},[c.config]);return {onConfigChange:e}};

export { useConfigUpdate };
