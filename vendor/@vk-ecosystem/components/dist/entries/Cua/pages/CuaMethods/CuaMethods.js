import { jsx, jsxs } from 'react/jsx-runtime';
import { Icon24Chevron } from '@vkontakte/icons';
import { useAdaptivityWithJSMediaQueries, SimpleCell, Div, Placeholder, Spacing } from '@vkontakte/vkui';
import { IconIllustrationConfirmationMethod120h } from '@vkontakte-internal/icons-private';
import { memo, useContext, useEffect, useMemo } from 'react';
import { cuaConfirmationMethods } from '../../constants/testIds.js';
import { useCuaSendStatsService } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { useCuaStore } from '../../services/CuaStore/CuaStore.js';
import { ValidationMethodsType } from '../../services/CuaStore/types.js';
import { getPageByMethod } from '../../utils.js';
import { withDotMask } from '../../../../shared/helpers/text.js';
import Lang from '../../../../shared/providers/LangProvider/Lang.js';
import { LangProviderContext } from '../../../../shared/providers/LangProvider/LangProviderContext.js';
import styles from './CuaMethods.module.css.js';
import { config } from './config.js';
var CuaMethodsComponent = function CuaMethodsComponent() {
  var _useContext = useContext(LangProviderContext),
    getLang = _useContext.getLang;
  var _useCuaSendStatsServi = useCuaSendStatsService(),
    sendStatsShowMethodList = _useCuaSendStatsServi.sendStatsShowMethodList;
  var _useCuaStore = useCuaStore(),
    loading = _useCuaStore.loading,
    methods = _useCuaStore.methods,
    goToPage = _useCuaStore.goToPage;
  var _useAdaptivityWithJSM = useAdaptivityWithJSMediaQueries(),
    isDesktop = _useAdaptivityWithJSM.isDesktop;
  useEffect(function () {
    sendStatsShowMethodList(methods);
  }, []);
  var content = useMemo(function () {
    return Object.keys(methods).map(function (item) {
      var method = config[item];
      if (!method) {
        return null;
      }
      var address = '';
      if (item === ValidationMethodsType.Phone) {
        var _methods$item;
        address = withDotMask((_methods$item = methods[item]) == null ? void 0 : _methods$item.phone);
      }
      if (item === ValidationMethodsType.Email) {
        var _methods$item2;
        address = withDotMask((_methods$item2 = methods[item]) == null ? void 0 : _methods$item2.email);
      }
      var onClick = function onClick() {
        var _info;
        if (loading) {
          return;
        }
        var info = (_info = {
          type: item
        }, _info[item + "_info"] = methods[item], _info);
        var page = getPageByMethod(info);
        goToPage(page);
      };
      return jsx(SimpleCell, {
        className: styles.cell,
        subtitle: getLang(method.description).replace('{value}', address),
        before: method.icon,
        after: jsx(Icon24Chevron, {
          className: styles.chevron
        }),
        multiline: true,
        onClick: onClick,
        disabled: loading,
        "data-test-id": method.dataTestId,
        children: jsx(Lang, {
          lang: method.title
        })
      }, item);
    });
  }, [methods, loading]);
  return jsxs(Div, {
    className: styles.container,
    "data-platform": isDesktop ? 'desktop' : 'mobile',
    children: [jsx(Placeholder, {
      noPadding: true,
      icon: jsx(IconIllustrationConfirmationMethod120h, {
        "data-test-id": cuaConfirmationMethods.icon
      }),
      title: jsxs("div", {
        "data-test-id": cuaConfirmationMethods.title,
        children: [jsx(Spacing, {
          size: 4
        }), isDesktop ? jsx(Lang, {
          lang: "vkconnect_sak_cua_methods_title_desktop"
        }) : jsx(Lang, {
          lang: "vkconnect_sak_cua_methods_title_mobile"
        })]
      }),
      children: isDesktop && jsx("div", {
        className: styles.description,
        children: jsx(Lang, {
          lang: "vkconnect_sak_cua_methods_description"
        })
      })
    }), jsxs("div", {
      children: [jsx(Spacing, {
        size: 16
      }), content]
    })]
  });
};
var CuaMethods = memo(CuaMethodsComponent);
export { CuaMethods };
