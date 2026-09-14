import { jsxs, jsx } from 'react/jsx-runtime';
import { useAdaptivityWithJSMediaQueries, Placeholder, Div, Spacing } from '@vkontakte/vkui';
import { memo } from 'react';
import styles from './CuaBase.module.css.js';
var CuaBaseComponent = function CuaBaseComponent(_ref) {
  var icon = _ref.icon,
    header = _ref.header,
    description = _ref.description,
    content = _ref.content,
    footer = _ref.footer,
    onSubmit = _ref.onSubmit,
    headerSpacing = _ref.headerSpacing,
    contentSpacing = _ref.contentSpacing;
  var _useAdaptivityWithJSM = useAdaptivityWithJSMediaQueries(),
    isDesktop = _useAdaptivityWithJSM.isDesktop;
  var headerSpacingSize = headerSpacing ? headerSpacing : isDesktop ? 4 : 0;
  var contentSpacingSize = contentSpacing ? contentSpacing : isDesktop ? 8 : 12;
  var handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    onSubmit && onSubmit(e);
  };
  return jsxs("div", {
    className: styles.container,
    "data-platform": isDesktop ? 'desktop' : 'mobile',
    children: [jsx(Placeholder, {
      icon: icon,
      noPadding: true,
      title: jsxs(Div, {
        className: styles.header,
        children: [jsx(Spacing, {
          size: headerSpacingSize
        }), header]
      }),
      children: jsx(Div, {
        className: styles.description,
        children: description
      })
    }), jsx(Spacing, {
      size: contentSpacingSize
    }), jsx("form", {
      className: styles.form,
      onSubmit: handleSubmit,
      children: content
    }), footer]
  });
};
var CuaBase = memo(CuaBaseComponent);
export { CuaBase };
