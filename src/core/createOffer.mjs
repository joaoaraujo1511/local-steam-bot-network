import { BOT_INSTANCES } from "../utils/deps.mjs";
import { log, saveDataToJson } from "../utils/helpers.mjs";

// - Creates and sends an incoming trade offer (User gives items)
export function incomingOffer(request) {
  const promises = [];

  for (const [botID, items] of Object.entries(request.incoming)) {
    const offerPromise = new Promise((resolve, reject) => {
      const missing = [];
      const found = [];

      const instance = BOT_INSTANCES.find((inst) => inst.bot.id === botID);

      instance.manager.getUserInventoryContents(
        request.partner,
        request.app_id,
        request.context_id,
        true,
        async (err, userInventory) => {
          if (err) {
            return reject(err);
          }

          // Double check for each requested item in the user's inventory
          for (const assetID of items) {
            const foundItem = userInventory.find(
              (inv) => inv.assetid === assetID,
            );
            if (foundItem) {
              found.push(foundItem);
            } else {
              missing.push(assetID);
            }
          }
          if (missing.length !== 0) {
            return reject(
              new Error("Requested items missing in user inventory"),
            );
          }

          // If all items are found, setup local offer
          const offer = instance.manager.createOffer(request.trade_url);
          for (const item of found) {
            offer.addTheirItem(item);
          }

          return resolve({ instance, offer });
        },
      );
    });

    promises.push(offerPromise);
  }

  return Promise.allSettled(promises);
}

// - Creates and sends an outgoing trade offer (bot gives items)
export function outgoingOffer(request) {
  const promises = [];

  for (const [botID, items] of Object.entries(request.outgoing)) {
    const offerPromise = new Promise((resolve, reject) => {
      const missing = [];
      const found = [];

      const instance = BOT_INSTANCES.find((inst) => inst.bot.id === botID);

      instance.manager.getInventoryContents(
        request.app_id,
        request.context_id,
        true,
        (err, botInventory) => {
          if (err) {
            return reject(err);
          }

          // Double check for each requested item in the bot's inventory
          for (const assetID of items) {
            const foundItem = botInventory.find(
              (inv) => inv.assetid === assetID,
            );
            if (foundItem) {
              found.push(foundItem);
            } else {
              missing.push(assetID);
            }
          }
          if (missing.length !== 0) {
            return reject(
              new Error("Requested items missing in bot inventory"),
            );
          }

          // If all items are found, setup local offer
          const offer = instance.manager.createOffer(request.trade_url);
          for (const item of found) {
            offer.addMyItem(item);
          }

          return resolve({ instance, offer });
        },
      );
    });

    promises.push(offerPromise);
  }

  return Promise.allSettled(promises);
}

// - Creates and sends a mutual trade offer (both parties give items)
export async function mutualOffer(request) {}
