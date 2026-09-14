import { jsx } from 'react/jsx-runtime';
import { useState, useCallback, useEffect } from 'react';
import { VK_API_VERSION } from '../../constants/index.js';
import { errorLogger } from '../../helpers/logger.js';
import { useApiRequestProviderContext } from '../ApiRequestProvider/ApiRequestProviderContext.js';
import { FeatureTogglesProviderContext } from './FeatureTogglesProviderContext.js';
var isVkResponseError = function isVkResponseError(response) {
  return response.error;
};
var FeatureTogglesProvider = function FeatureTogglesProvider(_ref) {
  var children = _ref.children,
    toggles = _ref.toggles,
    onApiRequest = _ref.onApiRequest;
  var _useState = useState({}),
    data = _useState[0],
    setData = _useState[1];
  var apiRequest = onApiRequest != null ? onApiRequest : useApiRequestProviderContext().apiRequest;
  var fetchToggles = useCallback(function (toggles) {
    return apiRequest('account.getToggles', {
      version: 0,
      toggles: toggles.join(','),
      v: VK_API_VERSION
    }).then(function (response) {
      if (isVkResponseError(response)) {
        throw new Error(response.error);
      } else {
        var result = {};
        response.toggles.map(function (toggle) {
          result[toggle.name] = toggle;
        });
        setData(result);
        return result;
      }
    })["catch"](errorLogger);
  }, []);
  useEffect(function () {
    toggles && fetchToggles(toggles)["catch"](errorLogger);
  }, [toggles]);
  return jsx(FeatureTogglesProviderContext.Provider, {
    value: {
      fetchToggles: fetchToggles,
      features: data
    },
    children: children
  });
};
export { FeatureTogglesProvider };
