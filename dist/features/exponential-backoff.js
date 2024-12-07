"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateForRateLimit = void 0;
var env_1 = require("../env");
// base timeout is 1 minute.
var baseTimeout = 60000;
// maximum timeout is 10 minutes.
var maximumTimeout = 600000;
// ratio of the exponent function.
// Set the ratio to 2 to achieve odd number of timeout multiplication
// e.g. baseTimeout, 3 * baseTimeout, 5 * baseTimeout, etc
var ratio = 2;
// calculateForRateLimit will return how long the apps should wait until try again
// when met a rate limit error.
// Attempt start with `0`
var calculateForRateLimit = function (attempt) {
    // return base timeout if disabled
    if (!env_1.ENABLE_EXPONENTIAL_BACKOFF) {
        return baseTimeout;
    }
    var timeout = ratio * attempt * baseTimeout + baseTimeout;
    // if timeout exceed maximum, return the maximum timeout
    return timeout > maximumTimeout
        ? maximumTimeout
        : timeout;
};
exports.calculateForRateLimit = calculateForRateLimit;
