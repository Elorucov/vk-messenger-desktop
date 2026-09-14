import { jsx } from 'react/jsx-runtime';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { useAdaptivityWithJSMediaQueries, ActionSheet, ActionSheetItem, Text } from '@vkontakte/vkui';
import i from './AdChoices.module.css.js';

const AdChoiceActionSheet=({fitParent:r,toggleRef:c,popupOffsetDistance:p,onClose:m,options:d})=>{const l=useAdaptivityWithJSMediaQueries();return jsx(ActionSheet,{"data-testid":"adsBannerAdChoicesContainer",className:clsx(r===false&&i.popup,i.popupFullscreen),popupOffsetDistance:p,onClickCapture:e=>{e.preventDefault();},onClose:m,toggleRef:c,iosCloseItem:jsx("div",{className:i.hidden}),children:d.map(({name:s,onClick:a})=>jsx(ActionSheetItem,{"data-testid":"adsBannerAdChoicesOption",className:clsx(l.isDesktop&&i.item),onImmediateClick:e=>{e.preventDefault();a();m();},children:jsx(Text,{weight:"1",className:clsx(l.isDesktop&&i.text),useAccentWeight:true,children:s})},s))})};

export { AdChoiceActionSheet };
