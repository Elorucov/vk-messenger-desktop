var withDotMask = function withDotMask(value) {
  if (value === void 0) {
    value = '';
  }
  return (value || '').replace(/\*/g, '•');
};
var removeLeftRightMark = function removeLeftRightMark(value) {
  if (value === void 0) {
    value = '';
  }
  return (value || '').replace(/&lrm;/g, '');
};
export { removeLeftRightMark, withDotMask };
