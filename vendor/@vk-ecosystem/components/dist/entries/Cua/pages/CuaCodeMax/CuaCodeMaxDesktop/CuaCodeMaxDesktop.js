import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { Icon28QrCodeOutline, Icon28LockOpenOutline } from '@vkontakte/icons';
import { Placeholder, Spacing, SimpleCell, Div, ButtonGroup, Button } from '@vkontakte/vkui';
import maxLogo from '../../../../../assets/cua/max/max_logo.png.js';
import { cuaCodeMax, cuaCodeBase } from '../../../constants/testIds.js';
import { useCuaStore } from '../../../services/CuaStore/CuaStore.js';
import { ValidationMethodsType } from '../../../services/CuaStore/types.js';
import { CuaPages } from '../../../types.js';
import Lang from '../../../../../shared/providers/LangProvider/Lang.js';
import styles from './CuaCodeMaxDesktop.module.css.js';
import { QRCode } from './QRCode/QRCode.js';
var CuaCodeMaxDesktop = function CuaCodeMaxDesktop() {
  var _useCuaStore = useCuaStore(),
    loading = _useCuaStore.loading,
    canChangeMethod = _useCuaStore.canChangeMethod,
    goToPage = _useCuaStore.goToPage,
    methods = _useCuaStore.methods;
  var data = methods[ValidationMethodsType.Max];
  var handleChangeMethodClick = function handleChangeMethodClick() {
    goToPage(CuaPages.MAIN);
  };
  return jsxs("div", {
    className: styles.container,
    children: [jsx(Placeholder, {
      icon: jsxs(Fragment, {
        children: [jsx(Spacing, {
          size: "xl"
        }), !!(data != null && data.verification_codes_url) && jsx(QRCode, {
          url: data.verification_codes_url,
          logo: maxLogo
        }), jsx(Spacing, {
          size: "xs"
        })]
      }),
      noPadding: true,
      title: jsx("div", {
        "data-test-id": cuaCodeMax.title,
        children: jsx(Lang, {
          lang: "vkconnect_sak_cua_code_max_title"
        })
      })
    }), jsxs("div", {
      className: styles.content,
      children: [jsx(SimpleCell, {
        multiline: true,
        before: jsx(Icon28QrCodeOutline, {}),
        children: jsx(Lang, {
          lang: "vkconnect_sak_cua_code_max_qr_info"
        })
      }), jsx(SimpleCell, {
        multiline: true,
        before: jsx(Icon28LockOpenOutline, {}),
        children: jsx(Lang, {
          lang: "vkconnect_sak_cua_code_max_messenger_info"
        })
      })]
    }), jsx(Div, {
      children: jsx(ButtonGroup, {
        mode: "vertical",
        gap: "m",
        stretched: true,
        children: canChangeMethod && jsx(Button, {
          size: "l",
          mode: "tertiary",
          onClick: handleChangeMethodClick,
          stretched: true,
          disabled: loading,
          "data-test-id": cuaCodeBase.changeMethodBtn,
          children: jsx(Lang, {
            lang: "vkconnect_sak_cua_change_method"
          })
        })
      })
    })]
  });
};
export { CuaCodeMaxDesktop };
