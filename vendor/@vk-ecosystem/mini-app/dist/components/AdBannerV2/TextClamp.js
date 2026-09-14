import { jsx } from 'react/jsx-runtime';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import o from './TextClamp.module.css.js';

const TextClamp=({lines:r,children:s,testLocator:m,className:i})=>{return jsx("div",{"data-testid":m,className:clsx(o.root,r===1&&o.rootSingleLine,i),style:{"--lines":r},children:s})};

export { TextClamp };
