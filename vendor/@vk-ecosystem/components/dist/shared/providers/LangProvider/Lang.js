import _objectWithoutPropertiesLoose from './../../../deps/.pnpm/@babel_runtime@7.27.0/deps/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js';
import _inheritsLoose from './../../../deps/.pnpm/@babel_runtime@7.27.0/deps/@babel/runtime/helpers/esm/inheritsLoose.js';
import { jsxs, jsx } from 'react/jsx-runtime';
import { Fragment, createRef, Component } from 'react';
import { withLangProviderContext } from './withLangProviderContext.js';
var _excluded = ["langContext"];
var langReplaceVar = function langReplaceVar(string, variable, content) {
  var parts = string.split("{" + variable + "}");
  return jsxs(Fragment, {
    children: [parts[0], content, parts[1]]
  });
};
var Lang = /*#__PURE__*/function (_Component) {
  function Lang() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this.contentRef = createRef();
    return _this;
  }
  _inheritsLoose(Lang, _Component);
  var _proto = Lang.prototype;
  _proto.componentDidMount = function componentDidMount() {
    var _this$props = this.props,
      langContext = _this$props.langContext,
      props = _objectWithoutPropertiesLoose(_this$props, _excluded);
    var getLang = langContext.getLang;
    var init = Object.keys(props).reduce(function (result, key) {
      if (key === 'lang') {
        return result;
      }
      result[key] = "<span data-key=\"" + key + "\"></span>";
      return result;
    }, {});
    if (this.contentRef.current) {
      var lang = getLang(this.props.lang, Object.keys(init).length === 0 ? undefined : init);
      this.contentRef.current.innerHTML = this.props.replaceFn ? this.props.replaceFn(lang) : lang;
      this.updateKeys();
    }
  };
  _proto.componentDidUpdate = function componentDidUpdate() {
    this.updateKeys();
  };
  _proto.updateKeys = function updateKeys() {
    var _this2 = this;
    if (!this.contentRef.current) {
      return;
    }
    var elems = this.contentRef.current.querySelectorAll('[data-key]');
    if (!elems.length) {
      return;
    }
    [].slice.call(elems).map(function (elem) {
      return [elem, elem.getAttribute('data-key')];
    }).forEach(function (_ref) {
      var elem = _ref[0],
        key = _ref[1];
      elem.textContent = _this2.props[key];
    });
  };
  _proto.render = function render() {
    return jsx("span", {
      ref: this.contentRef
    });
  };
  return Lang;
}(Component);
var Lang$1 = withLangProviderContext(Lang);
export { Lang, Lang$1 as default, langReplaceVar };
