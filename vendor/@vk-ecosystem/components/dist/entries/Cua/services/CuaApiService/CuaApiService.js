import { jsx } from 'react/jsx-runtime';
import { createContext, useState, useContext } from 'react';
var timeoutId = null;
var useInitCuaApiService = function useInitCuaApiService(_ref) {
  var api = _ref.onApiRequest,
    additionalApiParams = _ref.additionalApiParams;
  var _useState = useState(true),
    globalLoading = _useState[0],
    setGlobalLoading = _useState[1];
  var _useState2 = useState(false),
    loading = _useState2[0],
    setLoading = _useState2[1];
  var setLoaderWithTimeout = function setLoaderWithTimeout(value) {
    timeoutId = window.setTimeout(function () {
      return setGlobalLoading(value);
    }, 0);
  };
  var apiRequest = function apiRequest(method, params, loader) {
    if (loader === void 0) {
      loader = {
        global: false,
        local: false
      };
    }
    var finalParams = Object.assign({}, params, additionalApiParams);
    timeoutId && window.clearTimeout(timeoutId);
    loader.local && setLoading(true);
    loader.global && setGlobalLoading(true);
    return api(method, finalParams)["finally"](function () {
      loader.local && setLoading(false);
      loader.global && setLoaderWithTimeout(false);
    });
  };
  return {
    loading: loading,
    globalLoading: globalLoading,
    apiRequest: apiRequest,
    setLoading: setLoaderWithTimeout
  };
};
var defaultValue = {};
var CuaApiServiceContext = createContext(defaultValue);
var useCuaApiService = function useCuaApiService() {
  return useContext(CuaApiServiceContext);
};
function CuaApiServiceProvider(_ref2) {
  var onApiRequest = _ref2.onApiRequest,
    children = _ref2.children,
    additionalApiParams = _ref2.additionalApiParams;
  var store = useInitCuaApiService({
    onApiRequest: onApiRequest,
    additionalApiParams: additionalApiParams
  });
  return jsx(CuaApiServiceContext.Provider, {
    value: store,
    children: children
  });
}
export { CuaApiServiceContext, CuaApiServiceProvider, useCuaApiService };
