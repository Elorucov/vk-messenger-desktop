function startUpdateFillRate(t,e,i,n,r){let a=false;let u=false;let f=undefined;let l=0;function o(){requestAnimationFrame(d=>{f=f??d;if(document.visibilityState==="hidden"||r()){f=d;o();return}l+=d-f;f=d;const s=l/(t*1e3);const c=Math.round(Math.min(100*s,100));e(c);if(c>50&&!u){u=true;i();}if(c>=100&&!a){n();}if(c<100&&!a){o();}});}o();return ()=>{a=true;}}

export { startUpdateFillRate };
