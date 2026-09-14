import { jsxs, jsx } from 'react/jsx-runtime';
import { Paragraph } from '@vkontakte/vkui';
import e from './ProgressCircle.module.css.js';

const ProgressCircle=({value:i,min:n,max:a,size:h})=>{const l=h/2-1;const d=h/2;const m=Math.round(i/(a-n)*100);const u=`${c(m,h)}px`;const g=`${o(h)}px`;return jsxs("div",{className:e.box,style:{width:h,height:h},"data-testid":"adsInterstitialCloseProgress",children:[jsx("div",{className:e.wrapper,children:jsx("svg",{className:e.svg,width:h,height:h,viewBox:`0 0 ${h} ${h}`,version:"1.1",xmlns:"http://www.w3.org/2000/svg",children:jsx("circle",{className:e.circle,r:l,cx:d,cy:d,strokeDashoffset:u,strokeDasharray:g})})}),jsx(Paragraph,{weight:"2",useAccentWeight:true,children:i})]})};function o(s){return Math.PI*s}function c(s,t){const r=o(t);const e=Math.round(r*((100-s)/100));return e}

export { ProgressCircle };
