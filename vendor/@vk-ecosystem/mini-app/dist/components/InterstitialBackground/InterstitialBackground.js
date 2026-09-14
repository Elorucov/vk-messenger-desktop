import { jsx } from 'react/jsx-runtime';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { useAdaptivityWithJSMediaQueries, ViewWidth } from '@vkontakte/vkui';
import { forwardRef } from 'react';
import e from './InterstitialBackground.module.css.js';

const InterstitialBackground=forwardRef(({children:a},n)=>{const{viewWidth:s}=useAdaptivityWithJSMediaQueries();const m=s<=ViewWidth.MOBILE;return jsx("div",{ref:n,className:clsx(e.background,m&&e.mobile),children:a})});InterstitialBackground.displayName="InterstitialBackground";

export { InterstitialBackground };
