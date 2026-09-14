import './../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import './../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import { querystring } from './../deps/@vkontakte/vkjs/lib/es6/other/querystring.js';
import './../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';

const getVKMethodQuery=(t,o)=>{delete o["callback"];Object.keys(o).forEach(e=>{if(typeof o[e]==="object"&&!Array.isArray(o[e])){o[e]=JSON.stringify(o[e]);}});const r={method:t,format:"json",...o};return querystring.stringify(r)};const invokeVKMethod=(e,t,o)=>{const r=getVKMethodQuery(t,o);return fetch(`${e}/${t}`,{method:"POST",mode:"cors",body:r,headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then(e=>e.json())};const isApiErrorResponse=e=>{return e.error};

export { getVKMethodQuery, invokeVKMethod, isApiErrorResponse };
