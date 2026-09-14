import { jsxs, jsx } from 'react/jsx-runtime';
import { Icon16LogoVkAds } from '@vkontakte/icons';
import { SimpleCell, Subhead, Title, Headline } from '@vkontakte/vkui';
import { TextClamp } from '../../../AdBannerV2/TextClamp.js';
import d from './BannerInfo.module.css.js';

const o={vertical:d.infoVertical,horizontal:undefined};const c={horizontal:10,vertical:4};const BannerInfo=({direction:m,headerLabel:h,iconAfterHeaderLabel:f,title:v,subtitle:u,closeIcon:I})=>{return jsxs("div",{className:o[m],children:[jsx(SimpleCell,{className:d.head,hasHover:false,hasActive:false,before:jsx(Icon16LogoVkAds,{className:d.adsIcon,"data-testid":"adsInterstitialIcon"}),after:I,children:jsxs("div",{className:d.subtitleBox,children:[jsx(Subhead,{"data-testid":"adsInterstitialHeaderLabel",children:h}),f&&jsx("div",{className:d.icon,children:f})]})}),jsx(SimpleCell,{multiline:true,hasHover:false,hasActive:false,subtitle:jsx(Headline,{level:"1",weight:"3","data-testid":"adsInterstitialSubtitle",children:jsx(TextClamp,{lines:c[m],children:u})}),children:jsx(Title,{level:"2","data-testid":"adsInterstitialTitle",children:jsx(TextClamp,{lines:2,children:v})})})]})};

export { BannerInfo };
