import { jsx, Fragment } from 'react/jsx-runtime';
import { Link } from '@vkontakte/vkui';
import { isValidElement, cloneElement, createElement, Fragment as Fragment$1 } from 'react';
function _createForOfIteratorHelperLoose(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (t) return (t = t.call(r)).next.bind(t);
  if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
    t && (r = t);
    var o = 0;
    return function () {
      return o >= r.length ? {
        done: !0
      } : {
        done: !1,
        value: r[o++]
      };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
var DEFAULT_ALLOWED_HTML = {
  a: ['href', 'target', 'rel'],
  br: true,
  b: true,
  i: true,
  span: true
};
var COMPONENTS_BY_TAG = {
  a: Link
};
var getPropsFromAttributesString = function getPropsFromAttributesString(attributesString, allowedProps) {
  if (!attributesString || !Array.isArray(allowedProps) || !allowedProps.length) {
    return {};
  }
  var joinedAllowedProps = allowedProps.join('|');
  var stringProp = "(?<propname>" + joinedAllowedProps + ")=(?<quote>[\"'])(?<propvalue>.*?)(?<!\\\\)\\k<quote>";
  var booleanProp = "(?<propnamebool>" + joinedAllowedProps + ")";
  return Array.from(attributesString.matchAll(new RegExp(stringProp + "|" + booleanProp, 'g'))).reduce(function (res, match) {
    var _match$groups, _match$groups2, _match$groups3;
    var propName = ((_match$groups = match.groups) == null ? void 0 : _match$groups.propname) || ((_match$groups2 = match.groups) == null ? void 0 : _match$groups2.propnamebool);
    var propValue = ((_match$groups3 = match.groups) == null ? void 0 : _match$groups3.propvalue) || true;
    if (propName) {
      res[propName] = propValue;
    }
    return res;
  }, {});
};
var getRegExp = function getRegExp(keys) {
  var joinedKeys = keys.join('|');
  var htmlWithChildren = "<(?<keyhtml>" + joinedKeys + ")(?<propshtml> .*?)?>(?<childrenhtml>.*?)</\\k<keyhtml>>";
  var i18nWithChildren = "{(?<keyi18n>" + joinedKeys + ")}(?<childreni18n>.*?){/\\k<keyi18n>}";
  var htmlSelfClosing = "<(?<keyhtmlself>" + joinedKeys + ")(?<propshtmlself> .*?)?/?>";
  var i18nSelfClosing = "{(?<keyi18nself>" + joinedKeys + ")}";
  return new RegExp(htmlWithChildren + "|" + i18nWithChildren + "|" + htmlSelfClosing + "|" + i18nSelfClosing, 'g');
};
var joinReactNodes = function joinReactNodes(nodes) {
  return nodes.reduce(function (res, item) {
    if (!res && res !== 0) {
      return item;
    }
    if (!item && item !== 0) {
      return res;
    }
    if (typeof res !== 'object' && typeof item !== 'object') {
      return "" + res + item;
    }
    if (!Array.isArray(res)) {
      return [res, item];
    }
    if (typeof res[res.length - 1] !== 'object' && typeof item !== 'object') {
      res[res.length - 1] = "" + res[res.length - 1] + item;
      return res;
    }
    res.push(item);
    return res;
  });
};
var _interpolateMessage = function interpolateMessage(message, values, additionalAllowedHTML) {
  if (values === void 0) {
    values = {};
  }
  if (additionalAllowedHTML === void 0) {
    additionalAllowedHTML = {};
  }
  if (!message) {
    return message;
  }
  var allowedHTML = Object.assign({}, DEFAULT_ALLOWED_HTML, additionalAllowedHTML);
  var result = [];
  var keys = Object.keys(values).concat(Object.keys(allowedHTML).filter(function (key) {
    return allowedHTML[key];
  }));
  if (!keys.length) {
    return message;
  }
  var regExp = getRegExp(keys);
  var lastIndex = 0;
  for (var _iterator = _createForOfIteratorHelperLoose(message.matchAll(regExp)), _step; !(_step = _iterator()).done;) {
    var _match$groups4, _match$groups5, _match$groups6, _match$groups7, _match$groups8, _match$groups9, _match$groups10, _match$groups11;
    var match = _step.value;
    var matchedString = match[0];
    var key = ((_match$groups4 = match.groups) == null ? void 0 : _match$groups4.keyhtml) || ((_match$groups5 = match.groups) == null ? void 0 : _match$groups5.keyi18n) || ((_match$groups6 = match.groups) == null ? void 0 : _match$groups6.keyhtmlself) || ((_match$groups7 = match.groups) == null ? void 0 : _match$groups7.keyi18nself) || '';
    var attributesString = ((_match$groups8 = match.groups) == null ? void 0 : _match$groups8.propshtml) || ((_match$groups9 = match.groups) == null ? void 0 : _match$groups9.propshtmlself);
    var children = _interpolateMessage(((_match$groups10 = match.groups) == null ? void 0 : _match$groups10.childrenhtml) || ((_match$groups11 = match.groups) == null ? void 0 : _match$groups11.childreni18n), values, allowedHTML);
    var props = getPropsFromAttributesString(attributesString, allowedHTML[key]);
    var index = match.index;
    var value = values[key];
    var element = typeof value === 'function' ? value(Object.assign({
      key: index
    }, props, {
      children: children
    })) : isValidElement(value) ? cloneElement(value, Object.assign({
      key: index
    }, value.props, props), children) : !values.hasOwnProperty(key) && allowedHTML.hasOwnProperty(key) ? createElement(COMPONENTS_BY_TAG[key] || key, Object.assign({
      key: index
    }, props), children) : value;
    result.push(message.slice(lastIndex, index), Array.isArray(element) ? jsx(Fragment$1, {
      children: element
    }, index) : element);
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    lastIndex = index + matchedString.length;
  }
  if (lastIndex === 0) {
    return message;
  }
  result.push(message.slice(lastIndex));
  return joinReactNodes(result);
};
var Interpolate = function Interpolate(_ref) {
  var children = _ref.children,
    values = _ref.values,
    allowedHTML = _ref.allowedHTML;
  return jsx(Fragment, {
    children: _interpolateMessage(children, values, allowedHTML)
  });
};
export { DEFAULT_ALLOWED_HTML, Interpolate, _interpolateMessage as interpolateMessage };
