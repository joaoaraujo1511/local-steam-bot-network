import { SteamUser, TradeOfferManager } from "../utils/deps.mjs";
import { declineOffer, log, saveDataToJson } from "../utils/helpers.mjs";
import { handleOfferState } from "./handleOffer.mjs";

// - Sets up essential events for the Steam client
export function essentialEvents(instance, resolve, reject) {
  // Set any flag to true to indicate that initialization won't depend on it anymore
  const initFlags = {
    loggedOn: false,
    webSession: false,
    accountLimitations: true,
    settled: false,
  };

  // Log client errors
  instance.client.on("error", (err) => {
    // Reject only if initialization is not yet settled
    if (!initFlags.settled) {
      reject(err);
    }

    // Otherwise, just log the error
    log.error(
      "APP",
      `Steam Client Error for '${instance.bot.name}' - <${err.message || err}>`,
    );
  });

  // Log when the bot is logged on
  instance.client.on("loggedOn", () => {
    try {
      if (instance.bot.change_name) {
        instance.client.setPersona(
          SteamUser.EPersonaState.Online,
          instance.bot.name,
        );
      } else {
        instance.client.setPersona(SteamUser.EPersonaState.Online);
      }

      initFlags.loggedOn = true;
      log.info("APP", `Logged in as '${instance.bot.name}'`);

      if (
        !initFlags.settled &&
        initFlags.loggedOn &&
        initFlags.webSession &&
        initFlags.accountLimitations
      ) {
        initFlags.settled = true;
        resolve();
      }
    } catch (err) {
      if (!initFlags.settled) {
        reject(err);
      }
    }
  });

  // Log account limitations
  instance.client.on(
    "accountLimitations",
    (limited, communityBanned, locked) => {
      try {
        if (limited) {
          instance.bot.limitations.push("LIMITED");
        }

        if (communityBanned) {
          instance.bot.limitations.push("COMMUNITY BANNED");
        }

        if (locked) {
          instance.bot.limitations.push("LOCKED");
        }

        if (instance.bot.limitations.length !== 0) {
          log.warn(
            "APP",
            `Limitation '${instance.bot.limitations.join(", ")}' detected on '${instance.bot.name}'`,
          );
        }

        initFlags.accountLimitations = true;

        if (
          !initFlags.settled &&
          initFlags.loggedOn &&
          initFlags.webSession &&
          initFlags.accountLimitations
        ) {
          initFlags.settled = true;
          resolve();
        }
      } catch (err) {
        if (!initFlags.settled) {
          reject(err);
        }
      }
    },
  );

  // Log when a web session is established
  instance.client.on("webSession", (sessionid, cookies) => {
    try {
      instance.manager.setCookies(cookies); // Set cookies for the trade offer manager

      instance.community.setCookies(cookies); // Set cookies for the community instance
      instance.community.startConfirmationChecker(
        5000,
        instance.bot.two_factor.identity_secret,
      ); // Check for confirmations every 5 seconds

      instance.bot.session_id = sessionid;
      log.info(
        "APP",
        `Established web session '${sessionid}' for '${instance.bot.name}'`,
      );

      initFlags.webSession = true;

      if (
        !initFlags.settled &&
        initFlags.loggedOn &&
        initFlags.webSession &&
        initFlags.accountLimitations
      ) {
        initFlags.settled = true;
        resolve();
      }
    } catch (err) {
      if (!initFlags.settled) {
        reject(err);
      }
    }
  });
}

// - Sets up secondary events for the Steam client
export function tradingEvents(instance) {
  // Log when a sent offer changes state
  instance.manager.on("sentOfferChanged", async (offer, oldState) => {
    try {
      saveDataToJson(`DEBUG-OFFER-${offer.id}.json`, offer);

      const oldStateString = TradeOfferManager.ETradeOfferState[oldState];
      const newStateString = TradeOfferManager.ETradeOfferState[offer.state];

      log.info(
        "OFFER",
        `The '${instance.bot.name}' offer '${offer.id}' changed from '${oldStateString}' to '${newStateString}'`,
      );

      await handleOfferState(instance, offer);

      // TODO: Update the entire offer info in the database to all offer types
    } catch (err) {
      log.error("OFFER", err);
    }
  });

  // Emitted whenever a getOffers call succeeds
  instance.manager.on("offerList", (filter, sent, received) => {});

  // Log when an unknown offer is sent or if created offers go through later
  instance.manager.on("unknownOfferSent", async (offer) => {
    try {
      const offerStateString = TradeOfferManager.ETradeOfferState[offer.state];

      // If the offer is still active, decline it
      if (offerStateString === "Active") {
        await declineOffer(offer);
        log.info(
          "OFFER",
          `Cancelled unknown offer '${offer.id}' sent by '${instance.bot.name}'`,
        );
      }
    } catch (err) {
      log.error("OFFER", err);
    }
  });

  // Log received trade offers
  instance.manager.on("newOffer", async (offer) => {
    try {
      await declineOffer(offer);
      log.info(
        "OFFER",
        `Declined countered/received offer '${offer.id}' sent to '${instance.bot.name}'`,
      );
    } catch (err) {
      log.error("OFFER", err);
    }
  });

  // Log when new items are received
  instance.client.on("newItems", (count) => {
    log.info("APP", `Received '${count}' new items on '${instance.bot.name}'`);
  });
}
