import { jsx } from 'react/jsx-runtime';
import { Icon16ArrowRightOutline } from '@vkontakte/icons';
import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { clsx } from './../../deps/clsx/dist/clsx.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { Button } from '@vkontakte/vkui';
import { useLangProviderContext } from '../../providers/LangProvider/LangProvider.js';
import n from './BannerButton.module.css.js';

const BannerButton=({isDesktop:s,isBannerVertical:i,isBannerSlim:m,className:c,children:d})=>{const{getLang:p}=useLangProviderContext();return jsx(Button,{mode:"secondary",size:"s",stretched:i,appearance:"accent",className:clsx(!s&&!m&&n.buttonSmall,m&&n.buttonSlim,c),before:!s&&!m&&!i&&jsx(Icon16ArrowRightOutline,{}),"data-testid":"adsBannerCtaButton","aria-label":p("apps_ad_go_to_site"),children:d})};

export { BannerButton };
