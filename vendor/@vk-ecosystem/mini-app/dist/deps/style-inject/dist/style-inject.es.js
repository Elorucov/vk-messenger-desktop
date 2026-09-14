function e(e,t){if(t===void 0)t={};var d=t.insertAt;if(!e||typeof document==="undefined"){return}var i=document.head||document.getElementsByTagName("head")[0];var n=document.createElement("style");n.type="text/css";if(d==="top"){if(i.firstChild){i.insertBefore(n,i.firstChild);}else {i.appendChild(n);}}else {i.appendChild(n);}if(n.styleSheet){n.styleSheet.cssText=e;}else {n.appendChild(document.createTextNode(e));}}

export { e as default };
