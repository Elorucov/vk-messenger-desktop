import { _ as a$1 } from '../../../../../@swc/helpers/esm/_class_call_check.js';
import { _ as r } from '../../../../../@swc/helpers/esm/_create_class.js';
import { _ as e } from '../../../../../@swc/helpers/esm/_define_property.js';
import { _ as n } from '../../../../../@swc/helpers/esm/_instanceof.js';

var o=function(){function n(){var t=this;a$1(this,n);e(this,"data",{});e(this,"getItem",function(e){return t.data.hasOwnProperty(e)?t.data[e]:null});e(this,"keys",function(){return Object.keys(t.data)});}r(n,[{key:"setItem",value:function e(e,t){this.data[e]=String(t);}},{key:"removeItem",value:function e(e){delete this.data[e];}},{key:"clear",value:function e(){this.data={};}},{key:"length",get:function e(){return Object.keys(this.data).length}},{key:"key",value:function e(e){return Object.keys(this.data)[e]}}]);return n}();var s="vk-ls-dummy";var i="test";var a;function u(){if(a){return a}try{window.localStorage.setItem(s,i);if(i!==window.localStorage.getItem(s)){throw new Error("localStorage is broken")}window.localStorage.removeItem(s);a=window.localStorage;}catch(e){a=new o;}return a}var localStorage={setItem:function(e,t){return u().setItem(e,t)},getItem:function(e){return u().getItem(e)},removeItem:function(e){return u().removeItem(e)},clear:function(){return u().clear()},length:function(){return u().length},key:function(e){return u().key(e)},keys:function e(){var e=u();if(n(e,o)){return e.keys()}else {return Object.keys(e)}},getPrefixedKeys:function(e){return localStorage.keys().filter(function(t){return t.startsWith(e)})}};

export { localStorage };
