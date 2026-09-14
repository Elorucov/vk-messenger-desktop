var _PasswordAnimationSeg;
var PasswordAnimationLevels;
(function (PasswordAnimationLevels) {
  PasswordAnimationLevels[PasswordAnimationLevels["INITIAL"] = -100] = "INITIAL";
  PasswordAnimationLevels[PasswordAnimationLevels["ERROR"] = -1] = "ERROR";
  PasswordAnimationLevels[PasswordAnimationLevels["WEAK"] = 0] = "WEAK";
  PasswordAnimationLevels[PasswordAnimationLevels["FAIR"] = 1] = "FAIR";
  PasswordAnimationLevels[PasswordAnimationLevels["STRONG"] = 2] = "STRONG";
})(PasswordAnimationLevels || (PasswordAnimationLevels = {}));
var PasswordAnimationSegments = (_PasswordAnimationSeg = {}, _PasswordAnimationSeg[PasswordAnimationLevels.INITIAL] = [0, 10], _PasswordAnimationSeg[PasswordAnimationLevels.WEAK] = [15, 60], _PasswordAnimationSeg[PasswordAnimationLevels.FAIR] = [60, 120], _PasswordAnimationSeg[PasswordAnimationLevels.STRONG] = [120, 180], _PasswordAnimationSeg[PasswordAnimationLevels.ERROR] = [15, 60], _PasswordAnimationSeg);
export { PasswordAnimationLevels, PasswordAnimationSegments };
