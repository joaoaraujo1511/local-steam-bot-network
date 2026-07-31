import { log, sendOffer, saveDataToJson } from "../../utils/helpers.mjs";
import {
  incomingOffer,
  outgoingOffer,
  mutualOffer,
} from "../../core/createOffer.mjs";
import express from "express";

export const tradeOffersRouter = express.Router();

// - Creates a new trade offer
tradeOffersRouter.post("/trade_offers", async (req, res) => {
  try {
    let results = null;

    switch (req.body.offer_type) {
      case "incoming":
        results = await incomingOffer(req.body);

        // Validate each promise result (and consequently each offer)
        for (const promise of results) {
          if (promise.status !== "fulfilled") {
            throw new Error("Failed to create one or more incoming offers");
          }
        }

        // Send each offer
        for (const promise of results) {
          await sendOffer(promise.value.offer);
          log.info(
            "API",
            `POST | Sent incoming offer '${promise.value.offer.id}' to '${req.body.partner}'`,
          );
        }
        break;

      case "outgoing":
        results = await outgoingOffer(req.body);

        // Validate each promise result (and consequently each offer)
        for (const promise of results) {
          if (promise.status !== "fulfilled") {
            throw new Error("Failed to create one or more outgoing offers");
          }
        }

        // Send each offer
        for (const promise of results) {
          await sendOffer(promise.value.offer);
          log.info(
            "API",
            `POST | Sent outgoing offer '${promise.value.offer.id}' to '${req.body.partner}'`,
          );
        }
        break;

      case "mutual":
        results = await mutualOffer(req.body);

        // Validate each promise result (and consequently each offer)
        for (const promise of results) {
          if (promise.status !== "fulfilled") {
            throw new Error("Failed to create one or more outgoing offers");
          }
        }

        // Send each offer
        for (const promise of results) {
          await sendOffer(promise.value.offer);
          log.info(
            "API",
            `POST | Sent mutual offer '${promise.value.offer.id}' to '${req.body.partner}'`,
          );
        }
        break;

      default:
        throw new Error("Invalid offer type specified");
    }

    // Extract offers from each promise result
    const offers = [];
    for (const res of results) {
      offers.push(res.value.offer);
    }

    return res.status(200).json({ success: true, offers: offers });
  } catch (err) {
    let errorMsg = err.message || err || "An unknown error occurred";

    // Simply remove trailing period for log consistency
    if (typeof errorMsg === "string" && errorMsg.endsWith(".")) {
      errorMsg = errorMsg.slice(0, -1);
    }

    log.error(
      "API",
      `POST | Failed to create offer to '${req.body.partner}' - <${errorMsg}>`,
    );
    return res.status(500).json({ success: false, error: errorMsg });
  }
});
