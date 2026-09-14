import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import { localStorage } from './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { MINI_APP_PERFORMANCE_STORAGE_KEY } from '../../constants/performance.js';

class PerformanceStorage{getStorage(){const r=localStorage.getItem(MINI_APP_PERFORMANCE_STORAGE_KEY);if(!r){return {}}const o=JSON.parse(r);return o||{}}setStorage(r){localStorage.setItem(MINI_APP_PERFORMANCE_STORAGE_KEY,JSON.stringify(r));}isStorageEmpty(){const t=this.getStorage();return Object.keys(t).length===0}getPerformance(t){const e=this.getStorage();return e[t]||{}}clearPerformance(t,e=false){const r=this.getStorage();if(e){delete r[t];}else {r[t]={sent:true};}this.setStorage(r);}writePerformance(t,e){const r=this.getStorage();const o={...r,[t]:{...this.getPerformance(t),...e}};this.setStorage(o);}writeStartPerformance(t,e){const r=this.getStorage();const o={...r,[t]:{...e}};this.setStorage(o);}}

export { PerformanceStorage };
