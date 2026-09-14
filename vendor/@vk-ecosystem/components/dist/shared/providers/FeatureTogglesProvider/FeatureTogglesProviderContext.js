import { createContext, useContext } from 'react';
var FeatureTogglesProviderContext = createContext({
  features: {},
  fetchToggles: function fetchToggles() {
    return Promise.resolve();
  }
});
function useFeatureTogglesProviderContext() {
  return useContext(FeatureTogglesProviderContext);
}
export { FeatureTogglesProviderContext, useFeatureTogglesProviderContext };
