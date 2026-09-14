var REPLACE_TOKEN = '%s';
var getLangNumericByRule1 = function getLangNumericByRule1(number, strings) {
  var result;
  if (number % 10 === 1 && number % 100 !== 11) {
    result = strings[0];
  } else if (number % 10 === 2 && number % 100 !== 12 || number % 10 === 3 && number % 100 !== 13 || number % 10 === 4 && number % 100 !== 14) {
    result = strings[1];
  } else {
    var _strings$;
    result = (_strings$ = strings[2]) != null ? _strings$ : strings[1];
  }
  return result != null ? result : REPLACE_TOKEN;
};
var getLangNumericByRule = function getLangNumericByRule(number, strings, rule) {
  if (rule === void 0) {
    rule = 'rule1';
  }
  switch (rule) {
    case 'rule1':
      return getLangNumericByRule1(number, strings).replace(REPLACE_TOKEN, number.toString());
    default:
      return number.toString();
  }
};
export { REPLACE_TOKEN, getLangNumericByRule };
