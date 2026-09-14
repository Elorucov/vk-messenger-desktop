import { jsx } from 'react/jsx-runtime';
import { createContext, useState, useRef, useContext } from 'react';
import { useCuaApiService } from '../CuaApiService/CuaApiService.js';
import { MessengerStatuses } from './types.js';
var REQ_INTERVAL = 1500;
var useInitCuaMessengerCheck = function useInitCuaMessengerCheck(session) {
  var _useCuaApiService = useCuaApiService(),
    apiRequest = _useCuaApiService.apiRequest;
  var _useState = useState(19),
    messengerStatus = _useState[0],
    setMessengerStatus = _useState[1];
  var intervalRef = useRef(null);
  var stopMessengerCheck = function stopMessengerCheck() {
    intervalRef.current && clearInterval(intervalRef.current);
  };
  var startMessengerCheck = function startMessengerCheck() {
    intervalRef.current = setInterval(function () {
      apiRequest('cua.checkMessengerSend', {
        session: session
      }).then(function (response) {
        setMessengerStatus(response.code);
        if ([MessengerStatuses.OK, MessengerStatuses.ERROR].includes(response.code)) {
          stopMessengerCheck();
        }
      })["catch"](function (e) {
        stopMessengerCheck();
        setMessengerStatus(3);
        console.error('CuaMessengerChecker: ', e);
      });
    }, REQ_INTERVAL);
  };
  return {
    messengerStatus: messengerStatus,
    startMessengerCheck: startMessengerCheck,
    stopMessengerCheck: stopMessengerCheck
  };
};
var defaultValue = {};
var CuaMessengerCheckContext = createContext(defaultValue);
var useCuaMessengerCheck = function useCuaMessengerCheck() {
  return useContext(CuaMessengerCheckContext);
};
function CuaMessengerCheckProvider(_ref) {
  var children = _ref.children,
    session = _ref.session;
  var store = useInitCuaMessengerCheck(session);
  return jsx(CuaMessengerCheckContext.Provider, {
    value: store,
    children: children
  });
}
export { CuaMessengerCheckContext, CuaMessengerCheckProvider, useCuaMessengerCheck };
