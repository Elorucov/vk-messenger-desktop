function debounce(n,e){var r=arguments.length>2&&arguments[2]!==void 0?arguments[2]:typeof window!=="undefined"?window:undefined;var o;var t;var i=function(){return n.apply(r,t)};var u=function(){for(var n=arguments.length,r=new Array(n),u=0;u<n;u++){r[u]=arguments[u];}t=r;clearTimeout(o);o=setTimeout(i,e);};u.cancel=function(){clearTimeout(o);};return u}

export { debounce };
