import { createContext } from 'react';
import { DefaultBannerAvailability } from '../../constants/ads.js';

const AdsProviderContext=createContext({loadBannerAd:async()=>null,getBannerAdAutoUpdateInterval:()=>0,handleBannerAd:async()=>({banner_width:0,banner_height:0}),hideBannerAd:()=>false,getOpenedBannerAd:()=>null,handleBannerAdUserClose:()=>null,handleBannerAdClick:()=>null,preloadInterstitialAds:async()=>true,preloadRewardAds:async()=>true,showInterstitialAds:async()=>true,hideInterstitialAds:()=>null,handleInterstitialAdsClick:()=>null,showRewardAds:async()=>true,getBannerAdAvailability:()=>DefaultBannerAvailability});

export { AdsProviderContext };
