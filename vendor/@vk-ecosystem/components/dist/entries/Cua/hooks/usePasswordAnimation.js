import { useState, useEffect, useCallback } from 'react';
import { PasswordAnimationSegments, PasswordAnimationLevels } from '../constants/animation.js';
var usePasswordAnimation = function usePasswordAnimation(passwordSecurityLevel, password) {
  var _useState = useState(false),
    animated = _useState[0],
    setAnimated = _useState[1];
  var _useState2 = useState(PasswordAnimationSegments[PasswordAnimationLevels.INITIAL]),
    animationSegments = _useState2[0],
    setAnimationSegments = _useState2[1];
  useEffect(function () {
    var animationSegments = password.length > 0 ? PasswordAnimationSegments[passwordSecurityLevel] : PasswordAnimationSegments[PasswordAnimationLevels.INITIAL];
    setAnimationSegments(animationSegments);
  }, [password, passwordSecurityLevel]);
  useEffect(function () {
    setAnimated(true);
  }, [animationSegments]);
  var resetAnimation = useCallback(function () {
    setAnimated(false);
  }, []);
  return {
    animated: animated,
    animationSegments: animationSegments,
    resetAnimation: resetAnimation
  };
};
export { usePasswordAnimation };
