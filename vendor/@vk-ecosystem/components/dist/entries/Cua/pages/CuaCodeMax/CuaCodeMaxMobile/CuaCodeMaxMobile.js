import { jsxs, jsx } from 'react/jsx-runtime';
import { Placeholder, Div, ButtonGroup, Button } from '@vkontakte/vkui';
import { RasterIcon56LogoMaxColor } from '@vkontakte-internal/icons-private';
import { useContext } from 'react';
import { cuaCodeMax, cuaCodeBase } from '../../../constants/testIds.js';
import { useCuaStore } from '../../../services/CuaStore/CuaStore.js';
import { ValidationMethodsType } from '../../../services/CuaStore/types.js';
import { CuaPages } from '../../../types.js';
import { withDotMask } from '../../../../../shared/helpers/text.js';
import Lang from '../../../../../shared/providers/LangProvider/Lang.js';
import { LangProviderContext } from '../../../../../shared/providers/LangProvider/LangProviderContext.js';
import styles from './CuaCodeMaxMobile.module.css.js';
var CuaCodeMaxMobile = function CuaCodeMaxMobile() {
  var _useCuaStore = useCuaStore(),
    loading = _useCuaStore.loading,
    canChangeMethod = _useCuaStore.canChangeMethod,
    goToPage = _useCuaStore.goToPage,
    methods = _useCuaStore.methods;
  var _useContext = useContext(LangProviderContext),
    getLang = _useContext.getLang;
  var data = methods[ValidationMethodsType.Max];
  var phoneNumberBegin = data != null && data.phone ? data == null ? void 0 : data.phone.slice(0, 2) : '';
  var phoneNumberEnd = data != null && data.phone ? data == null ? void 0 : data.phone.slice(-2) : '';
  var descriptionAriaLabel = "\n    " + getLang('vkconnect_sak_cua_code_max_description') + " " + getLang('vkconnect_sak_cua_phone_aria_label').replace('{begin}', phoneNumberBegin).replace('{end}', phoneNumberEnd) + "\n  ";
  var handleChangeMethodClick = function handleChangeMethodClick() {
    goToPage(CuaPages.MAIN);
  };
  return jsxs("div", {
    className: styles.container,
    children: [jsx(Placeholder, {
      icon: jsx(RasterIcon56LogoMaxColor, {}),
      noPadding: true,
      title: jsx("div", {
        "data-test-id": cuaCodeMax.title,
        children: jsx(Lang, {
          lang: "vkconnect_sak_cua_code_max_title"
        })
      }),
      children: jsx(Div, {
        className: styles.description,
        children: jsx("div", {
          "aria-label": descriptionAriaLabel,
          role: "heading",
          children: jsxs("div", {
            "aria-hidden": true,
            children: [jsx(Lang, {
              lang: 'vkconnect_sak_cua_code_max_description'
            }), jsx("div", {
              "data-test-id": cuaCodeMax.phone,
              className: styles.phoneNumber,
              children: withDotMask(data == null ? void 0 : data.phone)
            })]
          })
        })
      })
    }), jsx(Div, {
      children: jsxs(ButtonGroup, {
        mode: "vertical",
        gap: "m",
        stretched: true,
        align: "center",
        children: [jsx(Button, {
          href: data == null ? void 0 : data.verification_codes_url,
          target: "_blank",
          appearance: "negative",
          mode: "primary",
          size: "l",
          hasHover: false,
          className: styles.button,
          "data-test-id": cuaCodeMax.button,
          children: getLang('vkconnect_sak_cua_code_max_button')
        }), canChangeMethod && jsx(Button, {
          size: "l",
          mode: "tertiary",
          onClick: handleChangeMethodClick,
          stretched: true,
          disabled: loading,
          "data-test-id": cuaCodeBase.changeMethodBtn,
          children: jsx(Lang, {
            lang: "vkconnect_sak_cua_change_method"
          })
        })]
      })
    })]
  });
};
export { CuaCodeMaxMobile };
