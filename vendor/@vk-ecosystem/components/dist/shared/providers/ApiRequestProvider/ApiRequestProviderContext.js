import { createContext, useContext } from 'react';
var ApiRequestProviderContext = createContext({
  fetchData: function fetchData() {
    return Promise.resolve();
  },
  appId: 0,
  apiRequest: function apiRequest() {
    return Promise.reject('ApiRequestProviderContext is undefined');
  }
});
function useApiRequestProviderContext() {
  return useContext(ApiRequestProviderContext);
}
export { ApiRequestProviderContext, useApiRequestProviderContext };
