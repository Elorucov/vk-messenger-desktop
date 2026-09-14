import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import { localStorage } from './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { STORAGE_KEY, STORAGE_KEY_PART } from '../../constants/sessions.js';

class AppSessionsStorageLocal{load(){let s;try{s=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");}catch(t){s={};}return s}remove(s){const r=this.load();delete r[s];localStorage.setItem(STORAGE_KEY,JSON.stringify(r));}save(s){const r=this.load();r[s.sessionUuid]=s;localStorage.setItem(STORAGE_KEY,JSON.stringify(r));}loadPart(){let e;try{e=JSON.parse(localStorage.getItem(STORAGE_KEY_PART)||"{}");}catch(t){e={};}return e}removePart(e,r){const a=this.loadPart();delete a[this.buildPartKey(e,r)];localStorage.setItem(STORAGE_KEY_PART,JSON.stringify(a));}savePart(e){const r=this.loadPart();r[this.buildPartKey(e.sessionUuid,e.partId)]=e;localStorage.setItem(STORAGE_KEY_PART,JSON.stringify(r));}buildPartKey(t,e){return `${t}_${e}`}}

export { AppSessionsStorageLocal };
