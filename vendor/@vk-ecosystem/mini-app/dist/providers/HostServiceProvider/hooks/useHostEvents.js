import { useRef, useCallback, useEffect, useMemo } from 'react';
import { Hook } from '../../../modules/hook/Hook.js';

const useHostEvents=({scrollTarget:s})=>{const c=useRef({hashchange:new Hook("window(hashchange)"),resize:new Hook("window(resize)"),message:new Hook(""),scroll:new Hook("window(scroll)")});const a=useCallback(e=>{return n=>{return c.current[e].add(n)}},[]);const i=useCallback(()=>{Object.keys(c.current).forEach(e=>{const n=e;const t=c.current[n];const o=t.fire;n==="scroll"&&s&&s.tagName!=="HTML"?s.removeEventListener(n,o):window.removeEventListener(n,o);t.clear();});},[]);useEffect(()=>{Object.keys(c.current).forEach(e=>{const n=e;const t=c.current[n];const o=t.fire;n==="scroll"&&s&&s.tagName!=="HTML"?s.addEventListener(n,o):window.addEventListener(n,o);});return i},[]);return useMemo(()=>({onHostEventHashChange:a("hashchange"),onHostEventResize:a("resize"),onHostEventMessage:a("message"),onHostEventScroll:a("scroll")}),[])};

export { useHostEvents };
