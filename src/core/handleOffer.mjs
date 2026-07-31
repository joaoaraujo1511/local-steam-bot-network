import { TradeOfferManager } from "../utils/deps.mjs";
import { log, saveDataToJson } from "../utils/helpers.mjs";

// - Handles different offer states
export async function handleOfferState(instance, offer) {
  try {
    switch (TradeOfferManager.ETradeOfferState[offer.state]) {
      case "invalid":
        throw new Error(`Offer '${offer.id}' is invalid\n`);
      case "Active":
        instance.bot.active_offers++;
        break;

      case "Accepted":
        instance.bot.active_offers--;
        break;

      // This state is canceling the offer via the 'newOffer' event as its considered a new incoming offer
      case "Countered":
        instance.bot.active_offers--;
        break;

      // This state should never happen dued to our implementation of auto-canceling offers after a set time
      case "Expired":
        throw new Error(`Offer '${offer.id}' unexpectedly expired\n`);

      case "Canceled":
        instance.bot.active_offers--;
        break;

      case "Declined":
        instance.bot.active_offers--;
        break;

      // This should never happen from our side, only the partner should mark items as invalid
      // This automatically cancels the offer when detected
      case "InvalidItems":
        instance.bot.active_offers--;
        break;

      // Only happends when the offer requires mobile confirmation (outgoing & mutual offers)
      case "CreatedNeedsConfirmation":
        log.info("APP", `Offer '${offer.id}' requires mobile confirmation`);
        break;

      case "CanceledBySecondFactor":
        instance.bot.active_offers--;
        break;

      case "InEscrow":
        throw new Error(`Offer '${offer.id}' is in escrow\n`);

      default:
        throw new Error(
          `Offer '${offer.id}' reached unexpected state '${offer.state}'\n`,
        );
    }
  } catch (err) {
    log.error("APP", err);
    return err;
  }
}
