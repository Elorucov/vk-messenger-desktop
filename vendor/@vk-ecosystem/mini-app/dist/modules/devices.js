function isMobileBrowser(){return /iphone|ipod|ipad|opera mini|opera mobi|iemobile|android/i.test(window.navigator.userAgent.toLowerCase())}function isIphone(){return /iphone/i.test(window.navigator.userAgent.toLowerCase())}function isIpad(){return /ipad/i.test(window.navigator.userAgent.toLowerCase())}function isIpod(){return /ipod/i.test(window.navigator.userAgent.toLowerCase())}

export { isIpad, isIphone, isIpod, isMobileBrowser };
