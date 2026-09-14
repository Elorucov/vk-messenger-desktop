import { _ as r } from '../../../../../@swc/helpers/esm/_object_spread.js';
import { _ as o } from '../../../../../@swc/helpers/esm/_type_of.js';

function n(e){if(typeof e!=="string"){return {}}var r=e.trim().replace(/^[?#&]/,"");if(!r){return {}}var n=r.substring(r.indexOf("?")+1);return n.split("&").reduce(function(e,r){var n=r.split("=");if(n[1]){e[decodeURIComponent(n[0])]=decodeURIComponent(n[1].replace(/\+/g," "));}return e},{})}function t(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};if((typeof n==="undefined"?"undefined":o(n))!=="object"||n===null){return ""}t=r({encode:true},t);var i=function(e){return t.encode?encodeURIComponent(e):String(e)};return Object.keys(n).reduce(function(e,r){var o=n[r];if(o===undefined){return e}if(o===null){if(!t.skipNull){e.push([i(r),""].join("="));}return e}if(Array.isArray(o)){o.map(function(n){e.push("".concat(i(r),"[]=").concat(i(n)));}).join();return e}e.push([i(r),i(o)].join("="));return e},[]).join("&")}var querystring={parse:n,stringify:t};

export { querystring };
