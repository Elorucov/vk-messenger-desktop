import { useRef, useEffect } from 'react';
import { Hook } from '../modules/hook/Hook.js';

const useOnCallback=(t,n)=>{const c=useRef(new Hook);useEffect(()=>{if(t()){c.current.fire();}},n);useEffect(()=>()=>c.current.clear(),[]);return c.current.add.bind(c.current)};

export { useOnCallback };
