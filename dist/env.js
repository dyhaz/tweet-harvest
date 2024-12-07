"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENABLE_EXPONENTIAL_BACKOFF = exports.HEADLESS_MODE = exports.ACCESS_TOKEN = void 0;
var dotenv_1 = require("dotenv");
var znv_1 = require("znv");
(0, dotenv_1.config)();
exports.ACCESS_TOKEN = (_a = (0, znv_1.parseEnv)(process.env, {
    DEV_ACCESS_TOKEN: znv_1.z.string().min(1).optional(),
    HEADLESS_MODE: znv_1.z.boolean().default(true),
    ENABLE_EXPONENTIAL_BACKOFF: znv_1.z.boolean().default(false),
}), _a.DEV_ACCESS_TOKEN), exports.HEADLESS_MODE = _a.HEADLESS_MODE, exports.ENABLE_EXPONENTIAL_BACKOFF = _a.ENABLE_EXPONENTIAL_BACKOFF;
