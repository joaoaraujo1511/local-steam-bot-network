import { router, apiKeyMiddleware } from "./src/api/config.mjs";
import {
  BOT_INSTANCES,
  SteamUser,
  SteamTotp,
  SteamCommunity,
  TradeOfferManager,
  BOTS_DATA,
} from "./src/utils/deps.mjs";
import { essentialEvents, tradingEvents } from "./src/core/events.mjs";
import { log, saveDataToJson } from "./src/utils/helpers.mjs";

import express from "express";

// Set up the Express application
const app = express();

app.use(express.json()); // Set up JSON parsing middleware
app.use(apiKeyMiddleware); // Set up API key middleware
app.use("/api.botnet", router); // Set the base route for the API

(async () => {
  try {
    console.clear();
    await initialize(BOTS_DATA); // Wait for initialization to complete

    // Start the server after initialization
    app.listen(3000, () => {
      log.info("API", "Listening on port '3000'");
    });
  } catch (err) {
    log.error(
      "APP",
      `Fatal error occurred during initialization - <${err.message || err}>`,
    );
    process.exit(1);
  }
})();

// - Initializes each bot instance
async function initialize(credentials) {
  const logonPromises = credentials.map((bot) => {
    return new Promise((resolve, reject) => {
      try {
        // Create a new Steam client instance
        let client = new SteamUser();

        // Create a new Steam community instance
        const community = new SteamCommunity();

        // Create a new trade offer manager instance
        const manager = new TradeOfferManager({
          steam: client,
          community: community,
          language: "en",
          pollInterval: bot.poll_interval,
          cancelTime: bot.cancel_time,
          pendingCancelTime: bot.pending_cancel_time,
        });

        const logOnOptions = {
          accountName: bot.username,
          password: bot.password,

          // Changes this object expected structure. This is our custom addition to easly access the 2FA code
          twoFactorCode: SteamTotp.generateAuthCode(
            bot.two_factor.shared_secret,
          ),
        };

        client.logOn(logOnOptions);

        BOT_INSTANCES.push({ bot, client, community, manager });

        const instance = BOT_INSTANCES[BOT_INSTANCES.length - 1];

        // Set up all events for the current bot instance
        essentialEvents(instance, resolve, reject);
        tradingEvents(instance);

        // Reject the promise after 120 seconds if not settled
        setTimeout(() => {
          reject(new Error("Initialization timed out"));
        }, 120000);
      } catch (err) {
        reject(err);
      }
    });
  });

  // Wait for all bots to settle (success or failure)
  const results = await Promise.allSettled(logonPromises);

  // Collect and log results
  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected");

  if (failed.length !== 0) {
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        log.error(
          "APP",
          `Failed to setup '${credentials[index].name}' - <${result.reason?.message || result.reason}>`,
        );
      }
    });
  }

  // Throw a fatal error if all bots failed to initialize
  if (successful === 0) {
    throw new Error("All bots failed to initialize");
  } else {
    log.info(
      "APP",
      `Completed initialization for ${successful}/${credentials.length} bots`,
    );
  }
}
