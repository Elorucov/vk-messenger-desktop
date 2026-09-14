import { jsx } from 'react/jsx-runtime';
import { createContext, useState, useContext } from 'react';
import { MaxSessionStatus } from '../../hooks/useMaxInCua/constants.js';
var useInitCuaSendStatsService = function useInitCuaSendStatsService(_ref) {
  var sendStats = _ref.sendStats,
    fetchMethod = _ref.fetchMethod,
    flowService = _ref.flowService,
    appId = _ref.appId;
  var _useState = useState({}),
    appliedParams = _useState[0],
    setAppliedParams = _useState[1];
  var applyAnalyticsParams = function applyAnalyticsParams(params) {
    setAppliedParams(function (prev) {
      return Object.assign({}, prev, params);
    });
  };
  var sendStatsBase = function sendStatsBase(params) {
    if (sendStats) {
      sendStats({
        type: 'type_validation_events_item',
        type_validation_events_item: Object.assign({
          entry_point: fetchMethod,
          flow_service: flowService,
          app_id: appId
        }, appliedParams, params)
      });
    }
  };
  var sendStatsShowMethodList = function sendStatsShowMethodList(methods) {
    sendStatsBase({
      event_type: 'go',
      screen_to: 'choice-of-confirmation-method',
      fields: [{
        name: 'available_factors',
        str_value: Object.keys(methods).join(' ')
      }]
    });
  };
  var sendStatsConfirmationCode = function sendStatsConfirmationCode(factor, libverify) {
    sendStatsBase({
      event_type: 'go',
      screen_to: 'action-confirmation',
      fields: [{
        name: 'confirmation_method',
        str_value: libverify ? "libverify_" + factor : factor
      }]
    });
  };
  var sendStatsConfirmationCodeError = function sendStatsConfirmationCodeError(factor) {
    sendStatsBase({
      event_type: 'action_confirmation_incorrect_code',
      screen_to: 'action-confirmation',
      fields: [{
        name: 'confirmation_method',
        str_value: factor
      }]
    });
  };
  var sendStatsResetCode = function sendStatsResetCode(factor) {
    sendStatsBase({
      event_type: 'action_confirmation_reset_code',
      screen_to: 'action-confirmation',
      fields: [{
        name: 'confirmation_method',
        str_value: factor
      }]
    });
  };
  var sendStateLibverifyFallbackTo = function sendStateLibverifyFallbackTo(factor) {
    sendStatsBase({
      event_type: 'libverify_sms_reset_code_limit',
      screen_to: 'action-confirmation',
      fields: [{
        name: 'confirmation_method',
        str_value: factor
      }]
    });
  };
  var sendStateLibverifyMobileIdFail = function sendStateLibverifyMobileIdFail(factor) {
    sendStatsBase({
      event_type: 'libverify_mobile_id_failed',
      screen_to: 'action-confirmation',
      fields: [{
        name: 'confirmation_method',
        str_value: "libverify_" + factor
      }]
    });
  };
  var sendStatsPhoneChange = function sendStatsPhoneChange(factor) {
    sendStatsBase({
      event_type: 'action_confirmation_change_phone',
      screen_to: 'action-confirmation',
      fields: [{
        name: 'confirmation_method',
        str_value: factor
      }]
    });
  };
  var sendStatsPasswordRestore = function sendStatsPasswordRestore(factor) {
    sendStatsBase({
      event_type: 'action_confirmation_restore',
      screen_to: 'action-confirmation',
      fields: [{
        name: 'confirmation_method',
        str_value: factor
      }]
    });
  };
  var sendStatsShowBind = function sendStatsShowBind(factor) {
    sendStatsBase({
      event_type: 'go',
      screen_to: factor + "-create"
    });
  };
  var sendStatsSuccess = function sendStatsSuccess(factor, methods, wasTransitionToMethods, libverify) {
    var params = {
      event_type: 'successful_confirmation',
      screen: 'action-confirmation'
    };
    var fields = [{
      name: 'confirmation_method',
      str_value: libverify ? "libverify_" + factor : factor
    }];
    if (wasTransitionToMethods) {
      params.prev_screen = 'choice-of-confirmation-method';
      fields.unshift({
        name: 'available_factors',
        str_value: Object.keys(methods).join(' ')
      });
    }
    params.fields = fields;
    sendStatsBase(params);
  };
  var sendStatsShowBindSuccess = function sendStatsShowBindSuccess(factor, methods, wasTransitionToMethods) {
    sendStatsBase({
      event_type: "create_" + factor + "_success"
    });
    sendStatsSuccess(factor, methods, wasTransitionToMethods);
  };
  var sendStatsShowBindPasswordSuccess = function sendStatsShowBindPasswordSuccess() {
    sendStatsBase({
      event_type: "create_password_success",
      fields: [{
        name: 'reset_sessions',
        int_value: 1
      }]
    });
  };
  var sendStatsErrors = function sendStatsErrors(code) {
    sendStatsBase({
      event_type: 'error_display',
      fields: [{
        name: 'error_code',
        int_value: code
      }]
    });
  };
  var sendStatsPasswordGenerate = function sendStatsPasswordGenerate() {
    sendStatsBase({
      event_type: 'generate_password'
    });
  };
  var sendStatsPasswordGenerateIncorrect = function sendStatsPasswordGenerateIncorrect(isPasswordGenerated) {
    sendStatsBase({
      event_type: 'incorrect_password',
      fields: isPasswordGenerated ? [{
        name: 'password',
        str_value: 'generated'
      }] : undefined
    });
  };
  var sendStatsPasswordGenerateSuccess = function sendStatsPasswordGenerateSuccess(isPasswordGenerated) {
    sendStatsBase({
      event_type: 'success_new_password',
      fields: isPasswordGenerated ? [{
        name: 'password',
        str_value: 'generated'
      }] : undefined
    });
  };
  var sendStatsCheckMaxSessionErrorStatus = function sendStatsCheckMaxSessionErrorStatus(status) {
    sendStatsBase({
      event_type: status === MaxSessionStatus.Refused ? 'max_confirmation_failed' : 'max_confirmation_time_up'
    });
  };
  return {
    applyAnalyticsParams: applyAnalyticsParams,
    sendStatsShowMethodList: sendStatsShowMethodList,
    sendStatsConfirmationCode: sendStatsConfirmationCode,
    sendStateLibverifyFallbackTo: sendStateLibverifyFallbackTo,
    sendStateLibverifyMobileIdFail: sendStateLibverifyMobileIdFail,
    sendStatsResetCode: sendStatsResetCode,
    sendStatsPhoneChange: sendStatsPhoneChange,
    sendStatsPasswordRestore: sendStatsPasswordRestore,
    sendStatsConfirmationCodeError: sendStatsConfirmationCodeError,
    sendStatsShowBind: sendStatsShowBind,
    sendStatsErrors: sendStatsErrors,
    sendStatsShowBindSuccess: sendStatsShowBindSuccess,
    sendStatsShowBindPasswordSuccess: sendStatsShowBindPasswordSuccess,
    sendStatsSuccess: sendStatsSuccess,
    sendStatsPasswordGenerate: sendStatsPasswordGenerate,
    sendStatsPasswordGenerateIncorrect: sendStatsPasswordGenerateIncorrect,
    sendStatsPasswordGenerateSuccess: sendStatsPasswordGenerateSuccess,
    sendStatsCheckMaxSessionErrorStatus: sendStatsCheckMaxSessionErrorStatus
  };
};
var defaultValue = {};
var CuaSendStatsServiceContext = createContext(defaultValue);
var useCuaSendStatsService = function useCuaSendStatsService() {
  return useContext(CuaSendStatsServiceContext);
};
function CuaSendStatsServiceProvider(_ref2) {
  var sendStats = _ref2.sendStats,
    fetchMethod = _ref2.fetchMethod,
    flowService = _ref2.flowService,
    appId = _ref2.appId,
    children = _ref2.children;
  var store = useInitCuaSendStatsService({
    sendStats: sendStats,
    fetchMethod: fetchMethod,
    flowService: flowService,
    appId: appId
  });
  return jsx(CuaSendStatsServiceContext.Provider, {
    value: store,
    children: children
  });
}
export { CuaSendStatsServiceContext, CuaSendStatsServiceProvider, useCuaSendStatsService };
