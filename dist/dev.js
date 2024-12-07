"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crawl_1 = require("./crawl");
var env_1 = require("./env");
(0, crawl_1.crawl)({
    ACCESS_TOKEN: env_1.ACCESS_TOKEN,
    SEARCH_KEYWORDS: "gibran lang:id",
    TWEET_THREAD_URL: "https://twitter.com/pangeransiahaan/status/1690590234009112576/retweets",
    TARGET_TWEET_COUNT: 100000,
    OUTPUT_FILENAME: "gibran.csv",
    DELAY_EACH_TWEET_SECONDS: 0.1,
    DELAY_EVERY_100_TWEETS_SECONDS: 0,
    SEARCH_TAB: "TOP",
});
