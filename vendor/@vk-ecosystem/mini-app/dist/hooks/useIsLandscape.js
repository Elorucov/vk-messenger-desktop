import { useState, useEffect } from 'react';

const t=[-90,90];const i=["landscape-secondary","landscape-primary"];const isLandscapeOrientation=()=>{if(typeof window.orientation!=="undefined"){return t.includes(Number(window.orientation))}const{screen:n}=window;const e=(n.orientation||{}).type||n.mozOrientation||n.msOrientation;return i.includes(e)};function o(n){if(window.screen?.orientation){window.screen.orientation.addEventListener("change",n);}else {window.addEventListener("orientationchange",n);}}function r(n){if(window.screen?.orientation){window.screen.orientation.removeEventListener("change",n);}else {window.removeEventListener("orientationchange",n);}}const useIsLandscape=()=>{const[t,i]=useState(isLandscapeOrientation());const a=()=>{i(isLandscapeOrientation());};useEffect(()=>{o(a);return ()=>r(a)},[]);return t};

export { isLandscapeOrientation, useIsLandscape };
