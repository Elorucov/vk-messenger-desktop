import './../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import './../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import { noop } from './../deps/@vkontakte/vkjs/lib/es6/other/functions.js';
import './../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';

class PendingTask{constructor(){this.resolveHandler=noop;this.rejectHandler=noop;this.get=()=>{return this.promise};this.resolve=e=>{return this.resolveHandler(e)};this.reject=e=>{return this.rejectHandler(e)};this.promise=new Promise((e,r)=>{this.resolveHandler=e;this.rejectHandler=r;});}}

export { PendingTask };
