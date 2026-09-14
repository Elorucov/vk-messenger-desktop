import { jsx } from 'react/jsx-runtime';
import { useModalRootContext, Spinner } from '@vkontakte/vkui';
import { memo, useEffect } from 'react';
import { CuaMobileIdScreen } from './components/CuaMobileIdScreen/CuaMobileIdScreen.js';
import { useCuaStore } from './services/CuaStore/CuaStore.js';
import { CuaLibverifyStates } from './services/CuaStore/types.js';
import { CuaWrapper } from './components/CuaWrapper/CuaWrapper.js';
import { CuaCodeCall } from './pages/CuaCodeCall/CuaCodeCall.js';
import { CuaCodeEmail } from './pages/CuaCodeEmail/CuaCodeEmail.js';
import { CuaCodeMax } from './pages/CuaCodeMax/CuaCodeMax.js';
import { CuaCodeMessenger } from './pages/CuaCodeMessenger/CuaCodeMessenger.js';
import { CuaCodePush } from './pages/CuaCodePush/CuaCodePush.js';
import { CuaCodeSms } from './pages/CuaCodeSms/CuaCodeSms.js';
import { CuaMethods } from './pages/CuaMethods/CuaMethods.js';
import { CuaPassword } from './pages/CuaPassword/CuaPassword.js';
import { CuaSetEmail } from './pages/CuaSetEmail/CuaSetEmail.js';
import { CuaSetPassword } from './pages/CuaSetPassword/CuaSetPassword.js';
import { CuaSetPhone } from './pages/CuaSetPhone/CuaSetPhone.js';
import { CuaPages } from './types.js';
var CuaComponent = function CuaComponent() {
  var _useCuaStore = useCuaStore(),
    globalLoading = _useCuaStore.globalLoading,
    page = _useCuaStore.page,
    errors = _useCuaStore.errors,
    getMethods = _useCuaStore.getMethods,
    currentState = _useCuaStore.currentState;
  var _useModalRootContext = useModalRootContext(),
    updateModalHeight = _useModalRootContext.updateModalHeight;
  useEffect(function () {
    void getMethods(true, true);
  }, []);
  useEffect(updateModalHeight, [page, errors, globalLoading]);
  if (currentState === CuaLibverifyStates.MOBILE_ID) {
    return jsx(CuaMobileIdScreen, {});
  }
  if (globalLoading) {
    return jsx(Spinner, {
      size: "l",
      style: {
        height: 280
      }
    });
  }
  switch (page) {
    case CuaPages.TELEGRAM:
    case CuaPages.VIBER:
    case CuaPages.WHATSAPP:
      return jsx(CuaCodeMessenger, {});
    case CuaPages.MAX:
      return jsx(CuaCodeMax, {});
    case CuaPages.SMS:
      return jsx(CuaCodeSms, {});
    case CuaPages.CALL:
      return jsx(CuaCodeCall, {});
    case CuaPages.PUSH:
      return jsx(CuaCodePush, {});
    case CuaPages.EMAIL:
      return jsx(CuaCodeEmail, {});
    case CuaPages.PASSWORD:
      return jsx(CuaPassword, {});
    case CuaPages.SET_PHONE:
      return jsx(CuaSetPhone, {});
    case CuaPages.SET_EMAIL:
      return jsx(CuaSetEmail, {});
    case CuaPages.SET_PASSWORD:
      return jsx(CuaSetPassword, {});
    case CuaPages.MAIN:
      return jsx(CuaMethods, {});
    default:
      return null;
  }
};
var Cua = memo(function (props) {
  return jsx(CuaWrapper, Object.assign({}, props, {
    children: jsx(CuaComponent, {})
  }));
});
export { Cua };
