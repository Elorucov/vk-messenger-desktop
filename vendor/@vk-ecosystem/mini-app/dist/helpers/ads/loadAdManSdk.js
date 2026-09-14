import { ADMAN3_SCRIPT_URL } from '../../constants/ads.js';

function e(t,o,i=10,a=400){if(typeof window.AdManSDK==="function"){t();}else if(i){if(!document.getElementById("adman3-instance")&&typeof window.AdManSDK!=="function"){const e=document.createElement("script");e.src=ADMAN3_SCRIPT_URL;e.type="application/javascript";e.id="adman3-instance";e.async=true;e.onload=t;e.onerror=o;const i=document.getElementsByTagName("script")[0];i.parentNode?.insertBefore(e,i);}else {if(typeof window.AdManSDK!=="function"){setTimeout(()=>{e(t,o,--i,a+200);},a);}else {t();}}}}function loadAdManSdk(){return new Promise(e)}

export { loadAdManSdk };
