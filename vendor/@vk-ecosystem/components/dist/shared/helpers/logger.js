var createLogger = function createLogger(prefix, type) {
  var logger = function logger() {};
  return logger;
};
var errorLogger = createLogger();
export { errorLogger };
