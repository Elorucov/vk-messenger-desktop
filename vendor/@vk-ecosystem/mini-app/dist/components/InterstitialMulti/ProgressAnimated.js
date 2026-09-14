import { jsx } from 'react/jsx-runtime';
import { Progress } from '@vkontakte/vkui';
import { useState, useEffect } from 'react';
import k from './InterstitialMulti.module.css.js';
import { startUpdateFillRate } from './utils.js';

const ProgressAnimated=({fixedValue:m,onHalfProgress:n,maxShowTimeSeconds:a,onCompleted:u,isPaused:c})=>{const[l,p]=useState(0);useEffect(()=>{if(m===undefined){const t=startUpdateFillRate(a,p,n,u,c);return ()=>t()}},[m]);return jsx(Progress,{value:m??l,className:k.progressItem})};

export { ProgressAnimated };
