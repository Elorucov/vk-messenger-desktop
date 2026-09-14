import { jsx } from 'react/jsx-runtime';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { getImageAttributes } from '../../helpers/ads/image.js';
import t from './BannerImageRich.module.css.js';

const BannerImageRich=({data:m,getRef:n})=>{const s=getImageAttributes(m);return jsx("div",{className:t.box,"data-testid":"adsBannerImageBox",children:jsx("div",{className:t.inner,children:s&&jsx("div",{ref:n,style:{backgroundImage:`url("${s.src}")`},className:clsx(t.animated,s.alternativeAnimation&&t.animatedAlt)},s.src)})})};

export { BannerImageRich };
