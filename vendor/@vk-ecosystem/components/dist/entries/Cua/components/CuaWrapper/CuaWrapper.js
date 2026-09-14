import _objectWithoutPropertiesLoose from './../../../../deps/.pnpm/@babel_runtime@7.27.0/deps/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js';
import { jsx } from 'react/jsx-runtime';
import { memo } from 'react';
import { CuaApiServiceProvider } from '../../services/CuaApiService/CuaApiService.js';
import { CuaMessengerCheckProvider } from '../../services/CuaMessengerCheckService/CuaMessengerCheckService.js';
import { CuaSendStatsServiceProvider } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { CuaStoreProvider } from '../../services/CuaStore/CuaStore.js';
import { FeatureTogglesProvider } from '../../../../shared/providers/FeatureTogglesProvider/FeatureTogglesProvider.js';
import LangProvider from '../../../../shared/providers/LangProvider/LangProvider.js';
import { getCuaLangs, getCuaLangsNumeric } from '../../langs.js';
var _excluded = ["children", "getLang", "getLangNumeric", "fetchMethod", "flowService", "appId", "sendStats", "onApiRequest", "additionalApiParams", "disableToggles"];
var TOGGLES_LIST = ['vkc_account_pass_gen_web', 'vkc_account_pass_gen_android', 'vkc_account_pass_gen_ios'];
var CuaWrapper = memo(function (_ref) {
  var children = _ref.children,
    getLang = _ref.getLang,
    getLangNumeric = _ref.getLangNumeric,
    fetchMethod = _ref.fetchMethod,
    flowService = _ref.flowService,
    appId = _ref.appId,
    sendStats = _ref.sendStats,
    onApiRequest = _ref.onApiRequest,
    additionalApiParams = _ref.additionalApiParams,
    disableToggles = _ref.disableToggles,
    props = _objectWithoutPropertiesLoose(_ref, _excluded);
  return jsx(LangProvider, {
    getLang: getLang || getCuaLangs,
    getLangNumeric: getLangNumeric || getCuaLangsNumeric,
    children: jsx(CuaApiServiceProvider, {
      onApiRequest: onApiRequest,
      additionalApiParams: additionalApiParams,
      children: jsx(CuaSendStatsServiceProvider, {
        fetchMethod: fetchMethod,
        flowService: flowService,
        appId: appId,
        sendStats: sendStats,
        children: jsx(CuaMessengerCheckProvider, {
          session: props.session,
          children: !disableToggles ? jsx(FeatureTogglesProvider, {
            toggles: TOGGLES_LIST,
            onApiRequest: onApiRequest,
            children: jsx(CuaStoreProvider, Object.assign({}, props, {
              children: children
            }))
          }) : jsx(CuaStoreProvider, Object.assign({}, props, {
            children: children
          }))
        })
      })
    })
  });
});
export { CuaWrapper };
