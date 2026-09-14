import { jsx } from 'react/jsx-runtime';
import { AdaptivityProvider } from '@vkontakte/vkui';
import { MiniAppIframe } from '../../components/MiniAppIframe/MiniAppIframe.js';
import { useMiniAppDefaultProps } from '../../hooks/useMiniAppDefaultProps.js';
import { useStatsProviderProps } from '../../hooks/useStatsProviderProps.js';
import { AdsProviderWithAdaptivity } from '../../providers/AdsProvider/AdsProvider.js';
import { HandlersProvider } from '../../providers/HandlersProvider/HandlersProvider.js';
import { HostServiceProvider } from '../../providers/HostServiceProvider/HostServiceProvider.js';
import { LangProvider } from '../../providers/LangProvider/LangProvider.js';
import { StatsProvider } from '../../providers/StatsProvider/StatsProvider.js';
import './../../deps/@vkontakte/vkui/dist/cssm/styles/themes.css.js';

const MiniAppBaseProvider=({children:o,...i})=>{const e=useStatsProviderProps(i);return jsx(StatsProvider,{...e,children:jsx(HostServiceProvider,{props:i,children:jsx(HandlersProvider,{children:o})})})};const MiniAppBase=s=>{const p=useMiniAppDefaultProps(s);return jsx(AdaptivityProvider,{children:jsx(LangProvider,{getLang:p.getLang,children:jsx(MiniAppBaseProvider,{...p,children:jsx(AdsProviderWithAdaptivity,{children:jsx(MiniAppIframe,{})})})})})};

export { MiniAppBase, MiniAppBaseProvider };
