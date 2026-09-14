import { useRef, useEffect } from 'react';
import { CuaCheckMaxSessionAlertError, CuaMaxAlertError } from '../../constants/CuaAlertError.js';
import { CuaMaxErrorCode } from '../../constants/CuaCode.js';
import { useCuaSendStatsService } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { CuaPages } from '../../types.js';
import { useCuaApiService } from '../../services/CuaApiService/CuaApiService.js';
import { CHECK_MAX_SESSION_DELAY, MaxSessionStatus, MAX_RETRY_COUNT } from './constants.js';
var useMaxInCua = function useMaxInCua(currentPage) {
  var checkMaxSessionTimeoutId = useRef(null);
  var _useCuaSendStatsServi = useCuaSendStatsService(),
    sendStatsErrors = _useCuaSendStatsServi.sendStatsErrors,
    sendStatsCheckMaxSessionErrorStatus = _useCuaSendStatsServi.sendStatsCheckMaxSessionErrorStatus;
  var _useCuaApiService = useCuaApiService(),
    apiRequest = _useCuaApiService.apiRequest;
  var startCheckMaxSession = function startCheckMaxSession(maxHash, session, _ref) {
    var onVerify = _ref.onVerify,
      showAlertError = _ref.showAlertError;
    var retryCount = 0;
    // sid - cua_session обрезанная до 16 знака
    var sid = session.slice(0, 16);
    var _checkMaxSession = function checkMaxSession() {
      var fallbackToApiFunc = function fallbackToApiFunc() {
        void apiRequest('ecosystem.getMaxSessionStatus', {
          max_messenger_hash: maxHash,
          sid: sid
        }).then(function (response) {
          switch (response.status) {
            case MaxSessionStatus.Pending:
              _checkMaxSession();
              return;
            case MaxSessionStatus.Verified:
              onVerify(response.code);
              break;
            case MaxSessionStatus.TimedOut:
              sendStatsCheckMaxSessionErrorStatus(MaxSessionStatus.TimedOut);
              showAlertError(CuaCheckMaxSessionAlertError[MaxSessionStatus.TimedOut]);
              break;
            case MaxSessionStatus.Refused:
              sendStatsCheckMaxSessionErrorStatus(MaxSessionStatus.Refused);
              showAlertError(CuaCheckMaxSessionAlertError[MaxSessionStatus.Refused]);
              break;
          }
          checkMaxSessionTimeoutId.current = null;
        })["catch"](function (err) {
          if (retryCount < MAX_RETRY_COUNT) {
            retryCount++;
            _checkMaxSession();
          } else {
            sendStatsErrors(err == null ? void 0 : err.error_code);
            showAlertError(CuaMaxAlertError[CuaMaxErrorCode.INTERNAL_SERVER_ERROR]);
          }
          console.warn('[Cua] error:', err);
        });
      };
      checkMaxSessionTimeoutId.current = window.setTimeout(fallbackToApiFunc, CHECK_MAX_SESSION_DELAY);
    };
    _checkMaxSession();
  };
  useEffect(function () {
    if (checkMaxSessionTimeoutId.current && currentPage !== CuaPages.MAX) {
      window.clearTimeout(checkMaxSessionTimeoutId.current);
    }
  }, [currentPage]);
  useEffect(function () {
    return function () {
      if (checkMaxSessionTimeoutId.current) {
        window.clearTimeout(checkMaxSessionTimeoutId.current);
      }
    };
  }, []);
  return {
    startCheckMaxSession: startCheckMaxSession
  };
};
export { useMaxInCua };
