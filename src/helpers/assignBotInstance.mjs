import { BOT_INSTANCES } from "../utils/deps.mjs";

// - Assigns the bot instance that, in theory, is the least busy
export function assignInstance() {
  let leastBusyInstance = null;

  // Compare active offers to determine the least busy instance
  for (const inst of BOT_INSTANCES) {
    if (
      leastBusyInstance === null ||
      inst.bot.active_offers < leastBusyInstance.bot.active_offers
    ) {
      leastBusyInstance = inst;
    }
  }
  return leastBusyInstance;
}
