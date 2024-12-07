"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputKeywords = void 0;
var chalk_1 = __importDefault(require("chalk"));
var inputKeywords = function (page, _a) {
    var SEARCH_FROM_DATE = _a.SEARCH_FROM_DATE, SEARCH_TO_DATE = _a.SEARCH_TO_DATE, SEARCH_KEYWORDS = _a.SEARCH_KEYWORDS, MODIFIED_SEARCH_KEYWORDS = _a.MODIFIED_SEARCH_KEYWORDS;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, day, month, year, _c, day, month, year;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: 
                // wait until it shown: input[name="allOfTheseWords"]
                return [4 /*yield*/, page.waitForSelector('input[name="allOfTheseWords"]', {
                        state: "visible",
                    })];
                case 1:
                    // wait until it shown: input[name="allOfTheseWords"]
                    _d.sent();
                    return [4 /*yield*/, page.click('input[name="allOfTheseWords"]')];
                case 2:
                    _d.sent();
                    if (SEARCH_FROM_DATE) {
                        _b = SEARCH_FROM_DATE.split(" ")[0].split("-"), day = _b[0], month = _b[1], year = _b[2];
                        MODIFIED_SEARCH_KEYWORDS += " since:".concat(year, "-").concat(month, "-").concat(day);
                    }
                    if (SEARCH_TO_DATE) {
                        _c = SEARCH_TO_DATE.split(" ")[0].split("-"), day = _c[0], month = _c[1], year = _c[2];
                        MODIFIED_SEARCH_KEYWORDS += " until:".concat(year, "-").concat(month, "-").concat(day);
                    }
                    console.info(chalk_1.default.yellow("\nFilling in keywords: ".concat(MODIFIED_SEARCH_KEYWORDS, "\n")));
                    return [4 /*yield*/, page.fill('input[name="allOfTheseWords"]', MODIFIED_SEARCH_KEYWORDS)];
                case 3:
                    _d.sent();
                    // Press Enter
                    return [4 /*yield*/, page.press('input[name="allOfTheseWords"]', "Enter")];
                case 4:
                    // Press Enter
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.inputKeywords = inputKeywords;
