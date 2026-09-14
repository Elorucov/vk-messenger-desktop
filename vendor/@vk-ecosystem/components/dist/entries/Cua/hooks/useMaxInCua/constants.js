var CHECK_MAX_SESSION_DELAY = 3000;
var MaxSessionStatus = {
  Pending: 0,
  Verified: 1,
  TimedOut: 2,
  Refused: 3
};
var MAX_RETRY_COUNT = 5;
export { CHECK_MAX_SESSION_DELAY, MAX_RETRY_COUNT, MaxSessionStatus };
