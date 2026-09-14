import './../../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { copyTextToClipboard } from './../../deps/@vkontakte/vkjs/lib/es6/other/clipboard.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { MOTION_ADS_TYPE, dot } from '../../constants/ads.js';
import { errorLogger } from '../../modules/logger.js';

function sendStatistics(t){t?.forEach(t=>{new Image().src=t;});}function convertBannerAdTypeToBannerAdParams(t,e){return {bannerData:t,adChoices:{options:extractAdChoiceOptions(t.adChoices?.options??[],e)}}}function extractHeaderLabel(t,n){let i=t;const o=n?.ageRestrictions??n?.age_restrictions;if(o){i+=` ${dot} ${o}`;}return i}function extractMainImage(t){let e="";if(t.image){e=t.image;}if(t.image_600x600){e=t.image_600x600;}if(t.imageLink){e=t.imageLink;}return e}function extractPixelsOfType(t,e){return t?.statistics?.filter(t=>t.type===e).map(({url:t})=>t)}function extractAppHash(t){let e=null;try{e=t.split("#")[1];}catch(t){errorLogger("Failed to extract LeadAds hash",t);}return e}function extractAdChoiceOptions(e,n){return e.map(e=>({name:e.name,onClick:()=>{if(e.type==="default"){if(e.clickLink){window.open(e.clickLink,"_blank")?.focus();}else if(e.url){new Image().src=e.url;}}else if(e.type==="copy"){void copyTextToClipboard(e.copyText);}if(e.shouldCloseAd){n();}}}))}function extractSlots(t){return t.map(({slot:t})=>t)}function extractReasons(t){return t.map(({reason:t})=>t)}function isMotionAd(t){return t.data.type===MOTION_ADS_TYPE}function isMotionInterstitial(t){return t.type===MOTION_ADS_TYPE}function isMotionBannerAd(t){return t.bannerData.type===MOTION_ADS_TYPE}const o=1.5;function nativeAdShouldBeSticky(t){return t.clientHeight>document.documentElement.clientHeight*o}

export { convertBannerAdTypeToBannerAdParams, extractAdChoiceOptions, extractAppHash, extractHeaderLabel, extractMainImage, extractPixelsOfType, extractReasons, extractSlots, isMotionAd, isMotionBannerAd, isMotionInterstitial, nativeAdShouldBeSticky, sendStatistics };
