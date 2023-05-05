import { chromium } from "playwright-chromium";
import * as fs from "fs";
import dayjs from "dayjs";
import { pick } from "lodash";
import { config } from "dotenv";
import chalk from "chalk";
import path from "path";

config();

const NOW = dayjs().format("DD-MM-YYYY HH:mm:ss");

const filteredFields = [
  "created_at",
  "id",
  "id_str",
  "full_text",
  "quote_count",
  "reply_count",
  "retweet_count",
  "favorite_count",
  "geo",
  "lang",
  "user_id_str",
  "conversation_id",
  "conversation_id_str",
  "media_url_https",
  "media_type",
];

export async function crawl({
  ACCESS_TOKEN,
  SEARCH_KEYWORDS,
  SEARCH_FROM_DATE,
  SEARCH_TO_DATE,
  TARGET_TWEET_COUNT,
}: {
  ACCESS_TOKEN: string;
  SEARCH_KEYWORDS?: string;
  SEARCH_FROM_DATE?: string;
  SEARCH_TO_DATE?: string;
  TARGET_TWEET_COUNT?: number;
}) {
  // change spaces to _
  const FOLDER_DESTINATION = "./output";
  const FILE_NAME =
    `${FOLDER_DESTINATION}/${SEARCH_KEYWORDS} ${NOW}.csv`.replace(/ /g, "_");
  console.info(chalk.blue("\nOpening twitter search page...\n"));

  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext({
    storageState: {
      cookies: [
        {
          name: "auth_token",
          value: ACCESS_TOKEN,
          domain: "twitter.com",
          path: "/",
          expires: -1,
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
        },
      ],
      origins: [],
    },
  });

  const page = await context.newPage();

  // Listen to network requests
  await page.route("**/*", (route) => {
    const url = route.request().url();
    // only log requests that includes adaptive.json
    if (url.includes("adaptive.json")) {
      console.info(chalk.blue(`\nGot some tweets, saving to file...`));
    }

    route.continue();
  });

  // await page.goto("https://twitter.com/search-advanced");
  await page.goto("https://twitter.com/search-advanced?f=live", {
    waitUntil: "networkidle",
  });

  // check is current page url is twitter login page (have /login in the url)
  const isLoggedIn = !page.url().includes("/login");

  if (!isLoggedIn) {
    console.error("Invalid twitter auth token. Please check your auth token");
    return browser.close();
  }

  await page.click('input[name="allOfTheseWords"]');

  console.info(`Filling in keywords: ${SEARCH_KEYWORDS}`);
  await page.fill('input[name="allOfTheseWords"]', SEARCH_KEYWORDS);

  if (SEARCH_FROM_DATE) {
    await page.click('div[aria-label="From"]');
    const selects = await page.$$('div[aria-label="From"] select');
    const monthSelect = selects[0];
    const daySelect = selects[1];
    const yearSelect = selects[2];

    // expect value to be in this format: 2023-01-01 00:00:00
    const [day, month, year] = SEARCH_FROM_DATE.split(" ")[0].split("-");
    const monthName = dayjs()
      .month(parseInt(month) - 1)
      .format("MMMM");

    await monthSelect.selectOption(monthName);
    await daySelect.selectOption(Number(day).toString());
    await yearSelect.selectOption(Number(year).toString());
  }

  if (SEARCH_TO_DATE) {
    await page.click('div[aria-label="To"]');
    const selectsTo = await page.$$('div[aria-label="To"] select');

    const monthSelectTo = selectsTo[0];
    const daySelectTo = selectsTo[1];
    const yearSelectTo = selectsTo[2];

    // expect value to be in this format: 2023-01-01 00:00:00
    const [day, month, year] = SEARCH_TO_DATE.split(" ")[0].split("-");
    // month is still number, not string. convert it first to month name
    const monthName = dayjs()
      .month(parseInt(month) - 1)
      .format("MMMM");

    await monthSelectTo.selectOption(monthName);
    await daySelectTo.selectOption(Number(day).toString());
    await yearSelectTo.selectOption(Number(year).toString());
  }

  // Press Enter
  await page.press('input[name="allOfTheseWords"]', "Enter");

  let timeoutCount = 0;
  let lastScrollId;
  let lastTweetCreatedAt;
  let additionalTweetsCount = 0;

  const allData = {
    tweets: [],
    users: [],
  };

  async function scrollAndSave() {
    timeoutCount = 0;

    while (allData.tweets.length < TARGET_TWEET_COUNT) {
      // Wait for the next response or 10 seconds, whichever comes first
      const response = await Promise.race([
        page.waitForResponse((response) =>
          response.url().includes("adaptive.json")
        ),
        page.waitForTimeout(3000),
      ]);

      if (response) {
        const responseBody = await response.json();

        const tweets = responseBody.globalObjects.tweets;
        const users = responseBody.globalObjects.users;

        if (!Object.keys(tweets).length) {
          // found text "not found" on the page
          if (await page.getByText("No results for").count()) {
            console.info("No tweets found for the search criteria");
            break;
          }
        }

        const tweetCreatedAt = Object.values(tweets)?.[0]?.["created_at"];
        if (!tweetCreatedAt) {
          console.info("No tweet created_at found");
          console.warn("tweets -->", tweets);
          return;
        }

        lastTweetCreatedAt = tweetCreatedAt;

        // console.info("tweet posted at -->", tweetCreatedAt);

        lastScrollId =
          responseBody?.timeline?.instructions?.[1]?.replaceEntry?.entry
            ?.content?.operation?.cursor?.value;

        // add tweets and users to allData
        allData.tweets.push(...Object.values(tweets));
        allData.users.push(...Object.values(users));

        // write tweets to CSV file
        const comingTweets = Object.values(tweets);

        if (!fs.existsSync(FOLDER_DESTINATION)) {
          const dir = fs.mkdirSync(FOLDER_DESTINATION, { recursive: true });
          const dirFullPath = path.resolve(dir);

          console.info(chalk.green(`Created new directory: ${dirFullPath}`));
        }

        const headerRow = filteredFields.join(";") + "\n";

        if (allData.tweets.length === 0) {
          fs.appendFileSync(FILE_NAME, headerRow);
        }

        const rows = comingTweets.reduce((prev: [], current: any) => {
          const tweet = pick(current, filteredFields);
          tweet["full_text"] = `"${tweet["full_text"].replace(/\n/g, "\\n")}"`;
          tweet["media_url_https"] =
            `"${current?.entities?.media?.[0]?.media_url_https ?? ""}"` || "";
          tweet["media_type"] = `"${
            current?.entities?.media?.[0]?.type ?? ""
          }"`;

          const row = Object.values(tweet).join(";");

          return [...prev, row];
        }, []);

        const csv = (rows as []).join("\n") + "\n";
        fs.appendFileSync(FILE_NAME, csv);

        const fullPathFilename = fs.realpathSync(FILE_NAME);
        console.info(chalk.blue(`Your tweets saved to: ${fullPathFilename}`));

        // progress:
        console.info(
          chalk.yellow(`Total tweets saved: ${allData.tweets.length}`)
        );
        additionalTweetsCount += comingTweets.length;

        // for every multiple of 100, wait for 5 seconds
        if (additionalTweetsCount > 100) {
          additionalTweetsCount = 0;
          console.info("Taking a break, waiting for 10 seconds...");
          await page.waitForTimeout(10_000);
        } else if (additionalTweetsCount > 20) {
          // for every multiple of 20, wait for 3 seconds
          // console.info("Taking a break, waiting for 3 seconds...");
          await page.waitForTimeout(3_000);
        }
      } else {
        console.info("Timed out waiting for response");
        timeoutCount++;
        if (timeoutCount > 3) {
          console.info(
            "Timed out waiting for response too many times, clicking last tweet and going back"
          );

          const lastTweet = await page.$(
            "article[data-testid='tweet']:last-child div[data-testid='tweetText'] span"
          );

          await lastTweet.click();
          await page.goBack();
          await page.waitForURL("https://twitter.com/search**");
          await scrollAndSave(); // call the function again to resume scrolling
          break;
        }
      }

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }
  }

  await scrollAndSave();

  console.info("Done scrolling...");
  await browser.close();
}