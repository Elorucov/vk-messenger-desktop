import { jsxs, jsx } from 'react/jsx-runtime';
import { Spinner, Title, Headline } from '@vkontakte/vkui';
import { memo, useContext } from 'react';
import { LangProviderContext } from '../../../../shared/providers/LangProvider/LangProviderContext.js';
import styles from './CuaMobileIdScreen.module.css.js';
var CuaMobileIdScreenComponent = function CuaMobileIdScreenComponent() {
  var _useContext = useContext(LangProviderContext),
    getLang = _useContext.getLang;
  return jsxs("div", {
    className: styles.layout,
    children: [jsx(Spinner, {
      size: "l",
      style: {
        height: 'auto',
        marginBottom: '12px'
      }
    }), jsxs("div", {
      className: styles.textLayout,
      children: [jsx(Title, {
        level: "2",
        className: styles.title,
        children: getLang('vkconnect_sak_cua_number_verification')
      }), jsx(Headline, {
        level: '1',
        className: styles.headline,
        children: getLang('vkconnect_sak_cua_number_verification_wait')
      })]
    })]
  });
};
var CuaMobileIdScreen = memo(CuaMobileIdScreenComponent);
export { CuaMobileIdScreen };
