import { _ as e } from './_define_property.js';

function r(r){for(var t=1;t<arguments.length;t++){var o=arguments[t]!=null?arguments[t]:{};var n=Object.keys(o);if(typeof Object.getOwnPropertySymbols==="function"){n=n.concat(Object.getOwnPropertySymbols(o).filter(function(e){return Object.getOwnPropertyDescriptor(o,e).enumerable}));}n.forEach(function(t){e(r,t,o[t]);});}return r}

export { r as _ };
